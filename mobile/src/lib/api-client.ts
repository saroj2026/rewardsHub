// Thin fetch wrapper over the RewardsHub NestJS backend — mirrors
// rewards-recommender-ai-main/src/lib/api-client.ts. No mock data.

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`${res.status} ${path}: ${body}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

// --- Types (mirror the Prisma schema; Decimal fields arrive as strings) ---

export type RewardRule = {
  id: string;
  category: string;
  rateType: "flat" | "tiered";
  rateValue: string;
  capAmount: string | null;
  capPeriod: "monthly" | "annual" | null;
  exclusions: string[];
  validFrom: string;
  validTo: string | null;
};

export type CardProduct = {
  id: string;
  issuer: string;
  name: string;
  network: "visa" | "mastercard" | "rupay" | "amex";
  cardType: string;
  annualFee: string | null;
  benefits: string[];
  rewardRules: RewardRule[];
};

export type PointBalance = {
  id: string;
  amount: number;
  earnedAt: string;
  expiresAt: string | null;
  status: "active" | "redeemed" | "expired";
};

export type Card = {
  id: string;
  userId: string;
  cardProductId: string;
  nickname: string | null;
  addedAt: string;
  isPrimary: boolean;
  cardProduct: CardProduct;
  pointBalances: PointBalance[];
};

export type Merchant = {
  id: string;
  name: string;
  category: string;
  mccCode: string | null;
  aliases: string[];
};

export type Offer = {
  id: string;
  cardProductId: string | null;
  merchantId: string;
  description: string;
  discountType: "percentage" | "flat_amount" | "cashback";
  discountValue: string;
  minTransaction: string | null;
  requiresEnrollment: boolean;
  startsAt: string;
  expiresAt: string;
  source: string | null;
  merchant?: Merchant;
  cardProduct?: CardProduct | null;
};

export type Transaction = {
  id: string;
  userId: string;
  cardId: string;
  merchantId: string | null;
  amount: string;
  category: string;
  gstEligible: boolean;
  enteredAt: string;
  merchant?: Merchant | null;
};

export type User = {
  id: string;
  phone: string | null;
  email: string | null;
  authProvider: "otp" | "google" | "apple" | "guest";
  householdId: string | null;
};

export type RankedCard = { card: Card; rate: number; value: number; eligible: boolean; category: string };

export type RecommendationResult = {
  merchant: Merchant;
  amount: number;
  ranked: RankedCard[];
  best?: RankedCard;
  runnerUp?: RankedCard;
  diff: number;
};

// --- Auth ---

export function verifyFirebaseIdToken(idToken: string) {
  return apiFetch<{ accessToken: string; refreshToken: string; user: User }>(
    "/auth/firebase/verify",
    { method: "POST", body: JSON.stringify({ idToken }) },
  );
}

// --- Cards ---

export function getUserCards(userId: string) {
  return apiFetch<Card[]>(`/users/${userId}/cards`);
}

export function addCard(userId: string, cardProductId: string, nickname?: string) {
  return apiFetch<Card>(`/users/${userId}/cards`, {
    method: "POST",
    body: JSON.stringify({ cardProductId, nickname }),
  });
}

export function removeCard(userId: string, cardId: string) {
  return apiFetch<Card>(`/users/${userId}/cards/${cardId}`, { method: "DELETE" });
}

export function getCardPointBalance(userId: string, cardId: string) {
  return apiFetch<PointBalance[]>(`/users/${userId}/cards/${cardId}/points`);
}

export function getCardTransactions(userId: string, cardId: string) {
  return apiFetch<Transaction[]>(`/users/${userId}/cards/${cardId}/transactions`);
}

export function addTransaction(
  userId: string,
  cardId: string,
  data: { amount: number; category: string; merchantId?: string; gstEligible?: boolean },
) {
  return apiFetch<Transaction>(`/users/${userId}/cards/${cardId}/transactions`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function getCardProducts() {
  return apiFetch<CardProduct[]>("/card-products");
}

export function getUserTransactions(userId: string, take?: number) {
  const qs = take ? `?take=${take}` : "";
  return apiFetch<(Transaction & { card: Card })[]>(`/users/${userId}/transactions${qs}`);
}

// --- Merchants & Offers ---

export function getMerchants() {
  return apiFetch<Merchant[]>("/merchants");
}

export function getMerchant(id: string) {
  return apiFetch<Merchant>(`/merchants/${id}`);
}

export function getLiveOffers(category?: string) {
  const qs = category ? `?category=${encodeURIComponent(category)}` : "";
  return apiFetch<Offer[]>(`/offers${qs}`);
}

export function getOffersForMerchant(merchantId: string) {
  return apiFetch<Offer[]>(`/offers/merchant/${merchantId}`);
}

export function getOffer(id: string) {
  return apiFetch<Offer>(`/offers/${id}`);
}

export function getExpiringPoints(userId: string, withinDays?: number) {
  const qs = withinDays ? `?withinDays=${withinDays}` : "";
  return apiFetch<(PointBalance & { card: Card })[]>(
    `/offers/users/${userId}/expiring-points${qs}`,
  );
}

// --- Recommendation ---

export function getBestCardRecommendation(userId: string, merchantId: string, amount: number) {
  const qs = new URLSearchParams({ userId, merchantId, amount: String(amount) });
  return apiFetch<RecommendationResult>(`/recommendation/best-card?${qs}`);
}

// --- AI Assistant ---

export function chatWithAssistant(userId: string, message: string) {
  return apiFetch<{ reply: string }>("/ai-assistant/chat", {
    method: "POST",
    body: JSON.stringify({ userId, message }),
  });
}
