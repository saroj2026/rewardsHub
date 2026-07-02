export type CardMilestone = {
  current: number;
  target: number;
  reward: string;
};

export type CardData = {
  id: string;
  name: string;
  bank: string;
  tier: string;
  last4: string;
  points: number;
  rewardMultiplier: string;
  tint: string;
  network: "VISA" | "MASTERCARD" | "AMEX" | "RUPAY";
  categories: string[];
  annualFee: number;
  milestone: CardMilestone;
  benefits: string[];
  history: { merchant: string; amount: number; date: string; pointsEarned: number }[];
};

export const cards: CardData[] = [
  {
    id: "hdfc-infinia",
    name: "HDFC Infinia",
    bank: "HDFC BANK",
    tier: "METAL",
    last4: "4412",
    points: 62400,
    rewardMultiplier: "3.3X",
    tint: "#2a2a2a",
    network: "VISA",
    categories: ["Travel", "Dining"],
    annualFee: 12500,
    milestone: { current: 380000, target: 500000, reward: "₹10,000 travel voucher" },
    benefits: [
      "Unlimited airport lounge access, worldwide",
      "Complimentary golf rounds every month",
      "5X reward points on SmartBuy travel bookings",
      "Zero forex markup on international spends",
    ],
    history: [
      { merchant: "MakeMyTrip", amount: 42300, date: "28 Jun", pointsEarned: 1395 },
      { merchant: "The Leela", amount: 18900, date: "22 Jun", pointsEarned: 624 },
      { merchant: "BPCL", amount: 4200, date: "17 Jun", pointsEarned: 139 },
    ],
  },
  {
    id: "axis-magnus",
    name: "Axis Magnus",
    bank: "AXIS BANK",
    tier: "BURGUNDY",
    last4: "8821",
    points: 42100,
    rewardMultiplier: "5X",
    tint: "#3a0016",
    network: "MASTERCARD",
    categories: ["Flights", "Luxury"],
    annualFee: 12500,
    milestone: { current: 210000, target: 250000, reward: "25,000 bonus EDGE points" },
    benefits: [
      "4 complimentary domestic lounge visits / quarter",
      "1:5 point transfer to airline & hotel partners",
      "Milestone benefit worth ₹15,000 every year",
      "Dedicated concierge for luxury bookings",
    ],
    history: [
      { merchant: "Zomato", amount: 2450, date: "29 Jun", pointsEarned: 122 },
      { merchant: "IndiGo", amount: 15600, date: "24 Jun", pointsEarned: 780 },
      { merchant: "Swiggy", amount: 1180, date: "20 Jun", pointsEarned: 59 },
    ],
  },
  {
    id: "icici-amazon-pay",
    name: "ICICI Amazon Pay",
    bank: "ICICI BANK",
    tier: "SIGNATURE",
    last4: "1029",
    points: 8320,
    rewardMultiplier: "5%",
    tint: "#1c2530",
    network: "VISA",
    categories: ["Shopping", "Bills"],
    annualFee: 0,
    milestone: { current: 32000, target: 50000, reward: "₹500 Amazon voucher" },
    benefits: [
      "5% back on Amazon for Prime members",
      "3% back on Amazon for non-Prime members",
      "1% back on all other spends",
      "Zero annual & joining fee, for life",
    ],
    history: [
      { merchant: "Amazon", amount: 6500, date: "30 Jun", pointsEarned: 325 },
      { merchant: "Amazon", amount: 2100, date: "19 Jun", pointsEarned: 105 },
      { merchant: "Electricity Board", amount: 3400, date: "12 Jun", pointsEarned: 34 },
    ],
  },
  {
    id: "amex-platinum",
    name: "American Express Platinum",
    bank: "AMERICAN EXPRESS",
    tier: "PLATINUM",
    last4: "1005",
    points: 128400,
    rewardMultiplier: "10X",
    tint: "#3d3d3d",
    network: "AMEX",
    categories: ["Travel", "Lounge"],
    annualFee: 66000,
    milestone: { current: 1450000, target: 1900000, reward: "1,00,000 bonus MR points" },
    benefits: [
      "Unlimited global lounge access via Priority Pass",
      "Taj Epicure & EazyDiner Prime memberships",
      "Complimentary companion airfare, twice a year",
      "Concierge, travel insurance, and hotel elite status",
    ],
    history: [
      { merchant: "Taj Hotels", amount: 58200, date: "26 Jun", pointsEarned: 5820 },
      { merchant: "IndiGo", amount: 24800, date: "15 Jun", pointsEarned: 2480 },
      { merchant: "The Oberoi", amount: 31500, date: "6 Jun", pointsEarned: 3150 },
    ],
  },
];

export type Merchant = {
  name: string;
  category: string;
  bestCard: string;
  multiplier: string;
  tip: string;
};

export const merchants: Merchant[] = [
  { name: "Zomato", category: "Dining", bestCard: "Axis Magnus", multiplier: "5X", tip: "5X EDGE points on every order." },
  { name: "Amazon", category: "Shopping", bestCard: "ICICI Amazon Pay", multiplier: "5%", tip: "5% back for Prime members, no cap." },
  { name: "MakeMyTrip", category: "Travel", bestCard: "HDFC Infinia", multiplier: "10X", tip: "10X points via SmartBuy on flights & hotels." },
  { name: "Swiggy", category: "Dining", bestCard: "Axis Magnus", multiplier: "5X", tip: "5X EDGE points, redeemable for vouchers." },
  { name: "IndiGo", category: "Flights", bestCard: "Amex Platinum", multiplier: "10X", tip: "10X MR points plus lounge access on travel day." },
  { name: "BPCL", category: "Fuel", bestCard: "HDFC Infinia", multiplier: "3.3X", tip: "3.3X points, no fuel surcharge." },
];

export type Offer = {
  id: string;
  merchant: string;
  title: string;
  category: string;
  cap: string;
  card: string;
  expiresIn: string;
  accent: "highlight" | "accent";
  description: string;
  terms: string[];
  couponCode?: string;
};

export const offers: Offer[] = [
  {
    id: "amazon-instant-discount",
    merchant: "Amazon",
    title: "10% Instant Discount",
    category: "Shopping",
    cap: "Upto ₹1,500",
    card: "ICICI Amazon Pay",
    expiresIn: "3 days",
    accent: "highlight",
    description:
      "Get an instant 10% discount on your Amazon cart when you pay with your ICICI Amazon Pay card during the Great Sale.",
    terms: [
      "Valid on a minimum transaction of ₹1,000",
      "Maximum discount capped at ₹1,500 per card",
      "Discount applied instantly at checkout, no coupon needed",
      "Valid once per card during the sale period",
    ],
  },
  {
    id: "taj-two-nights",
    merchant: "Taj Hotels",
    title: "2 Nights on 1 booking",
    category: "Travel",
    cap: "Weekends only",
    card: "Amex Platinum",
    expiresIn: "12 days",
    accent: "accent",
    description:
      "Book any 2 nights at a Taj property over a weekend and get the value of 1 night back as a statement credit.",
    terms: [
      "Applicable at participating Taj properties in India",
      "Booking must be made directly via Taj or via Amex Travel",
      "Statement credit reflects within 6-8 weeks of stay",
      "Cannot be combined with other Taj promotions",
    ],
    couponCode: "TAJAMEX2",
  },
  {
    id: "bookmyshow-bogo",
    merchant: "BookMyShow",
    title: "Buy 1 Get 1 Free",
    category: "Entertainment",
    cap: "Max ₹500 off",
    card: "HDFC Infinia",
    expiresIn: "7 days",
    accent: "highlight",
    description:
      "Buy one movie ticket and get a second ticket free on all shows when paying with HDFC Infinia.",
    terms: [
      "Valid on a maximum of 2 tickets per transaction",
      "Discount value capped at ₹500",
      "Not valid on premiere or special screenings",
      "Offer valid every Friday-Sunday",
    ],
    couponCode: "INFINIA2X",
  },
  {
    id: "zomato-gold-half-off",
    merchant: "Zomato Gold",
    title: "50% off first order",
    category: "Dining",
    cap: "New users",
    card: "Axis Magnus",
    expiresIn: "2 days",
    accent: "accent",
    description:
      "New Zomato Gold members get 50% off their first order when paying with Axis Magnus, on top of Gold benefits.",
    terms: [
      "Valid for first-time Zomato Gold subscribers only",
      "Maximum discount of ₹200 on the order",
      "Valid at all Zomato Gold partner restaurants",
      "Cannot be clubbed with other Zomato promo codes",
    ],
  },
];

export const recentSpend = [
  { id: "1", merchant: "Amazon", card: "ICICI Amazon Pay", date: "30 Jun", amount: 6500 },
  { id: "2", merchant: "Zomato", card: "Axis Magnus", date: "29 Jun", amount: 2450 },
  { id: "3", merchant: "MakeMyTrip", card: "HDFC Infinia", date: "28 Jun", amount: 42300 },
  { id: "4", merchant: "IndiGo", card: "Amex Platinum", date: "24 Jun", amount: 15600 },
];

export function totalPoints() {
  return cards.reduce((s, c) => s + c.points, 0);
}

export function totalWalletValue() {
  return Math.round(totalPoints() * 0.35);
}

export function findCard(id: string) {
  return cards.find((c) => c.id === id);
}

export function findOffer(id: string) {
  return offers.find((o) => o.id === id);
}

export function redeemableValue(card: CardData) {
  return Math.round(card.points * 0.35);
}

export function bestRewardRate(card: CardData) {
  const n = parseFloat(card.rewardMultiplier);
  return Number.isFinite(n) ? n : 1;
}

export function bestRewardCategory(card: CardData) {
  return card.categories[0] ?? "General";
}

export const offerCategories = ["All", "Dining", "Travel", "Shopping", "Entertainment", "Fuel"] as const;

export function recommendCard(query: string): { card: CardData; merchant: Merchant } | null {
  const q = query.trim().toLowerCase();
  if (!q) return null;
  const merchant =
    merchants.find((m) => m.name.toLowerCase().includes(q) || q.includes(m.name.toLowerCase())) ??
    merchants.find((m) => m.category.toLowerCase().includes(q) || q.includes(m.category.toLowerCase()));
  if (!merchant) return null;
  const card = cards.find((c) => c.name === merchant.bestCard);
  if (!card) return null;
  return { card, merchant };
}
