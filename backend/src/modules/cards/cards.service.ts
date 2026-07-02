import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class CardsService {
  constructor(private readonly prisma: PrismaService) {}

  findAllForUser(userId: string) {
    return this.prisma.card.findMany({
      where: { userId },
      include: { cardProduct: { include: { rewardRules: true } }, pointBalances: true },
    });
  }

  addCard(userId: string, cardProductId: string, nickname?: string) {
    return this.prisma.card.create({
      data: { userId, cardProductId, nickname },
    });
  }

  removeCard(cardId: string) {
    return this.prisma.card.delete({ where: { id: cardId } });
  }

  pointBalance(cardId: string) {
    return this.prisma.pointBalance.findMany({
      where: { cardId, status: "active" },
      orderBy: { expiresAt: "asc" },
    });
  }

  findAllCardProducts() {
    return this.prisma.cardProduct.findMany({
      include: { rewardRules: true },
      orderBy: { name: "asc" },
    });
  }

  findTransactions(cardId: string) {
    return this.prisma.transaction.findMany({
      where: { cardId },
      include: { merchant: true },
      orderBy: { enteredAt: "desc" },
    });
  }

  findTransactionsForUser(userId: string, take = 10) {
    return this.prisma.transaction.findMany({
      where: { userId },
      include: { merchant: true, card: { include: { cardProduct: true } } },
      orderBy: { enteredAt: "desc" },
      take,
    });
  }

  async addTransaction(
    userId: string,
    cardId: string,
    data: { amount: number; category: string; merchantId?: string; gstEligible?: boolean },
  ) {
    const card = await this.prisma.card.findUnique({
      where: { id: cardId },
      include: { cardProduct: { include: { rewardRules: true } } },
    });
    const rules = card?.cardProduct.rewardRules ?? [];
    const rule =
      rules.find((r) => r.category === data.category) ?? rules.find((r) => r.category === "general");
    const earnedPoints = rule ? Math.round(data.amount * (Number(rule.rateValue) / 100)) : 0;

    const [transaction] = await this.prisma.$transaction([
      this.prisma.transaction.create({
        data: {
          userId,
          cardId,
          amount: data.amount,
          category: data.category,
          merchantId: data.merchantId,
          gstEligible: data.gstEligible ?? false,
        },
      }),
      ...(earnedPoints > 0
        ? [
            this.prisma.pointBalance.create({
              data: {
                cardId,
                pointsBatchId: crypto.randomUUID(),
                amount: earnedPoints,
                earnedAt: new Date(),
              },
            }),
          ]
        : []),
    ]);

    return transaction;
  }
}
