// Adapts a real API `Card` (backend/Prisma shape — no PAN/last4 stored, no
// curated visual theme) into the shape `CreditCardVisual` renders.
import type { Card } from "./api-client";
import type { CardFace } from "../components/CreditCardVisual";

const NETWORK_TINTS: Record<string, string> = {
  visa: "#26262c",
  mastercard: "#3a0016",
  rupay: "#1c2530",
  amex: "#3d3d3d",
};

export function sumActivePoints(card: Card): number {
  return card.pointBalances
    .filter((b) => b.status === "active")
    .reduce((sum, b) => sum + b.amount, 0);
}

export function bestRewardRate(card: Card): number {
  const rates = card.cardProduct.rewardRules.map((r) => Number(r.rateValue));
  return rates.length ? Math.max(...rates) : 1;
}

export function bestRewardCategory(card: Card): string {
  const rules = card.cardProduct.rewardRules;
  if (!rules.length) return "—";
  const best = rules.reduce((a, b) => (Number(b.rateValue) > Number(a.rateValue) ? b : a));
  return formatCategory(best.category);
}

export function formatCategory(category: string): string {
  return category
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function toCardFace(card: Card): CardFace {
  return {
    name: card.nickname ?? card.cardProduct.name,
    bank: card.cardProduct.issuer.toUpperCase(),
    tier: card.cardProduct.cardType.toUpperCase(),
    last4: card.id.slice(-4).toUpperCase(),
    points: sumActivePoints(card),
    tint: NETWORK_TINTS[card.cardProduct.network] ?? NETWORK_TINTS.visa,
  };
}
