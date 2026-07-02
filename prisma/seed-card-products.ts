// Seeds the card_products catalog only — reference data, not user data.
// Run with: npx tsx prisma/seed-card-products.ts
import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const now = new Date("2024-01-01T00:00:00.000Z");

type Rule = {
  category: string;
  rateType: "flat" | "tiered";
  rateValue: number;
  capAmount?: number;
  capPeriod?: "monthly" | "annual";
};

type Product = {
  issuer: string;
  name: string;
  network: "visa" | "mastercard" | "rupay" | "amex";
  cardType: string;
  annualFee: number;
  benefits: string[];
  rules: Rule[];
};

const products: Product[] = [
  {
    issuer: "HDFC Bank",
    name: "Millennia",
    network: "visa",
    cardType: "cashback",
    annualFee: 1000,
    benefits: ["5% cashback on Amazon, Flipkart, Swiggy", "1% cashback on other spends", "Airport lounge access"],
    rules: [
      { category: "online_shopping", rateType: "flat", rateValue: 5, capAmount: 1000, capPeriod: "monthly" },
      { category: "food_delivery", rateType: "flat", rateValue: 5, capAmount: 1000, capPeriod: "monthly" },
      { category: "general", rateType: "flat", rateValue: 1 },
    ],
  },
  {
    issuer: "ICICI Bank",
    name: "Amazon Pay",
    network: "visa",
    cardType: "rewards",
    annualFee: 0,
    benefits: ["5% back on Amazon for Prime members", "2% back on partner merchants", "1% back on other spends"],
    rules: [
      { category: "online_shopping", rateType: "flat", rateValue: 5, capAmount: 2000, capPeriod: "monthly" },
      { category: "general", rateType: "flat", rateValue: 1 },
    ],
  },
  {
    issuer: "SBI Card",
    name: "Cashback",
    network: "mastercard",
    cardType: "cashback",
    annualFee: 999,
    benefits: ["5% cashback on all online spends", "1% cashback on offline spends"],
    rules: [
      { category: "online_shopping", rateType: "flat", rateValue: 5, capAmount: 5000, capPeriod: "monthly" },
      { category: "general", rateType: "flat", rateValue: 1 },
    ],
  },
  {
    issuer: "Axis Bank",
    name: "Flipkart",
    network: "rupay",
    cardType: "rewards",
    annualFee: 500,
    benefits: ["5% unlimited cashback on Flipkart & Myntra", "4% cashback on preferred partners", "1.5% on other spends"],
    rules: [
      { category: "online_shopping", rateType: "flat", rateValue: 5 },
      { category: "travel", rateType: "flat", rateValue: 4 },
      { category: "general", rateType: "flat", rateValue: 1.5 },
    ],
  },
  {
    issuer: "Kotak Mahindra Bank",
    name: "League Platinum",
    network: "mastercard",
    cardType: "rewards",
    annualFee: 0,
    benefits: ["4x reward points on dining & movies", "1x reward points on other spends"],
    rules: [
      { category: "dining", rateType: "flat", rateValue: 4 },
      { category: "entertainment", rateType: "flat", rateValue: 4 },
      { category: "general", rateType: "flat", rateValue: 1 },
    ],
  },
  {
    issuer: "American Express",
    name: "SmartEarn",
    network: "amex",
    cardType: "rewards",
    annualFee: 495,
    benefits: ["5x reward points on fuel, groceries, movies", "1x reward points on other spends"],
    rules: [
      { category: "fuel", rateType: "flat", rateValue: 5 },
      { category: "groceries", rateType: "flat", rateValue: 5 },
      { category: "entertainment", rateType: "flat", rateValue: 5 },
      { category: "general", rateType: "flat", rateValue: 1 },
    ],
  },
  {
    issuer: "Yes Bank",
    name: "Paisabazaar PaisaSave",
    network: "rupay",
    cardType: "cashback",
    annualFee: 0,
    benefits: ["2% cashback on all spends", "5% cashback on top 2 categories monthly"],
    rules: [
      { category: "general", rateType: "flat", rateValue: 2 },
      { category: "top_category", rateType: "flat", rateValue: 5, capAmount: 1000, capPeriod: "monthly" },
    ],
  },
  {
    issuer: "IDFC First Bank",
    name: "Millennia",
    network: "visa",
    cardType: "rewards",
    annualFee: 0,
    benefits: ["10x reward points on online spends", "Lifetime free, no annual fee", "6 reward points per ₹150 on offline"],
    rules: [
      { category: "online_shopping", rateType: "flat", rateValue: 10, capAmount: 10000, capPeriod: "monthly" },
      { category: "general", rateType: "flat", rateValue: 1 },
    ],
  },
];

async function main() {
  for (const p of products) {
    const created = await prisma.cardProduct.create({
      data: {
        issuer: p.issuer,
        name: p.name,
        network: p.network,
        cardType: p.cardType,
        annualFee: p.annualFee,
        benefits: p.benefits,
        lastVerifiedAt: now,
        sourceConfidence: 0.95,
        rewardRules: {
          create: p.rules.map((r) => ({
            category: r.category,
            rateType: r.rateType,
            rateValue: r.rateValue,
            capAmount: r.capAmount,
            capPeriod: r.capPeriod,
            validFrom: now,
          })),
        },
      },
    });
    console.log(`Created ${created.issuer} ${created.name} (${p.rules.length} reward rules)`);
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
