import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

const FALLBACK_RATE_PERCENT = 1;

// Merchant.category is the coarse label used for the Merchant Search tabs
// (Shopping/Dining/Travel/Entertainment/Fuel) and doesn't share a vocabulary
// with RewardRule.category, which is the granular taxonomy card products are
// actually written in (online_shopping/food_delivery/dining/groceries/...).
// MCC code is the real-world identifier both sides can agree on, so it's the
// join key here rather than the coarse category label.
const MCC_REWARD_CATEGORIES: Record<string, string[]> = {
  "5942": ["online_shopping"],
  "5311": ["online_shopping"],
  "5812": ["food_delivery", "dining"],
  "5411": ["groceries"],
  "4722": ["travel"],
  "7832": ["entertainment"],
  "5541": ["fuel"],
};

@Injectable()
export class RecommendationService {
  constructor(private readonly prisma: PrismaService) {}

  // Best-card recommendation per TRD §7 (P95 < 2s target). Ranks every card
  // in the user's wallet by the reward rule that matches the merchant's MCC
  // category (falling back to the card's own "general" rate if none match),
  // applying any cap_amount/cap_period limit, and returns them ranked with a
  // diff against the runner-up — same shape as the RewardIQ AI web
  // prototype's deterministic recommendation.ts engine, now against real DB
  // data.
  async recommendBestCard(userId: string, merchantId: string, amount: number) {
    const merchant = await this.prisma.merchant.findUnique({ where: { id: merchantId } });
    if (!merchant) throw new NotFoundException("Merchant not found");

    const cards = await this.prisma.card.findMany({
      where: { userId },
      include: { cardProduct: { include: { rewardRules: true } } },
    });

    const now = new Date();
    const matchCategories = merchant.mccCode ? MCC_REWARD_CATEGORIES[merchant.mccCode] ?? [] : [];
    const isCurrentlyValid = (r: { validFrom: Date; validTo: Date | null }) =>
      r.validFrom <= now && (!r.validTo || r.validTo >= now);

    const ranked = cards
      .map((card) => {
        const rules = card.cardProduct.rewardRules;
        const bonusRule = rules.find(
          (r) => matchCategories.includes(r.category.toLowerCase()) && isCurrentlyValid(r),
        );
        const rule = bonusRule ?? rules.find((r) => r.category.toLowerCase() === "general" && isCurrentlyValid(r));

        // rateValue is stored (and displayed everywhere else in the app) as
        // a whole percentage number, e.g. 5 means 5% — not a 0-1 fraction.
        const rate = rule ? Number(rule.rateValue) : FALLBACK_RATE_PERCENT;
        let value = amount * (rate / 100);
        if (rule?.capAmount && value > Number(rule.capAmount)) {
          value = Number(rule.capAmount);
        }

        return {
          card,
          rate,
          value: Math.round(value),
          eligible: !!bonusRule,
          category: rule?.category ?? "general",
        };
      })
      .sort((a, b) => b.value - a.value);

    const [best, runnerUp] = ranked;
    return {
      merchant,
      amount,
      ranked,
      best,
      runnerUp,
      diff: runnerUp ? best.value - runnerUp.value : 0,
    };
  }
}
