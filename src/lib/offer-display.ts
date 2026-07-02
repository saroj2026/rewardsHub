import type { Offer } from "./api-client";

export function describeDiscount(offer: Offer): string {
  const value = Number(offer.discountValue);
  const min = offer.minTransaction ? Number(offer.minTransaction) : null;
  const base =
    offer.discountType === "percentage"
      ? `${value}% off`
      : offer.discountType === "cashback"
        ? `₹${value.toLocaleString("en-IN")} cashback`
        : `₹${value.toLocaleString("en-IN")} off`;
  return min ? `${base} · min ₹${min.toLocaleString("en-IN")}` : base;
}

export function expiresInLabel(expiresAt: string): string {
  const diffMs = new Date(expiresAt).getTime() - Date.now();
  if (diffMs <= 0) return "expired";
  const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  if (days === 1) return "1 day";
  if (days < 30) return `${days} days`;
  const months = Math.round(days / 30);
  return `${months} month${months === 1 ? "" : "s"}`;
}
