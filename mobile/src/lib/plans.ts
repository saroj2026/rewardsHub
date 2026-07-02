export type PlanTierKey = "basic" | "moderate" | "premium";
export type PlanDurationMonths = 3 | 6 | 12;

export type PlanTier = {
  key: PlanTierKey;
  name: string;
  tagline: string;
  popular: boolean;
  features: string[];
  prices: Record<PlanDurationMonths, number>;
};

export type PlanDuration = {
  months: PlanDurationMonths;
  label: string;
  shortLabel: string;
  savePct: number | null;
};

export const planDurations: PlanDuration[] = [
  { months: 3, label: "3 Months", shortLabel: "3 Mo", savePct: null },
  { months: 6, label: "6 Months", shortLabel: "6 Mo", savePct: 13 },
  { months: 12, label: "1 Year", shortLabel: "1 Yr", savePct: 28 },
];

export const planTiers: PlanTier[] = [
  {
    key: "basic",
    name: "Basic",
    tagline: "Track your cards, keep it simple",
    popular: false,
    features: [
      "Track up to 3 cards",
      "Manual transaction entry",
      "Basic reward calculator",
      "Email support",
    ],
    prices: { 3: 447, 6: 774, 12: 1308 },
  },
  {
    key: "moderate",
    name: "Moderate",
    tagline: "The AI-powered sweet spot",
    popular: true,
    features: [
      "Everything in Basic",
      "Track up to 10 cards",
      "AI best-card recommendations",
      "Statement OCR auto-sync",
      "Point expiry alerts",
    ],
    prices: { 3: 897, 6: 1554, 12: 2628 },
  },
  {
    key: "premium",
    name: "Premium",
    tagline: "Full power, zero limits",
    popular: false,
    features: [
      "Everything in Moderate",
      "Unlimited cards",
      "AI spending coach",
      "Family plan · 5 members",
      "Priority support",
    ],
    prices: { 3: 1497, 6: 2574, 12: 4308 },
  },
];

export function getPlanTier(key: string | undefined): PlanTier {
  return planTiers.find((t) => t.key === key) ?? planTiers[1];
}

export function getPlanDuration(months: number | undefined): PlanDuration {
  return planDurations.find((d) => d.months === months) ?? planDurations[0];
}

export function monthlyEquivalent(tier: PlanTier, months: PlanDurationMonths) {
  return Math.round(tier.prices[months] / months);
}
