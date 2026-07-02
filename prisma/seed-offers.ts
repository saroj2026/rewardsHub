// Seeds merchants + live offers only — reference/catalog data, not user data.
// Run with: npx tsx prisma/seed-offers.ts
// Assumes prisma/seed-card-products.ts has already been run (offers link to
// those card products by issuer + name; falls back to "any card" if not found).
import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const startsAt = new Date("2025-01-01T00:00:00.000Z");
const expiresAt = new Date("2026-12-31T23:59:59.000Z");

type MerchantSeed = {
  name: string;
  category: "Dining" | "Travel" | "Shopping" | "Entertainment" | "Fuel";
  mccCode?: string;
  aliases?: string[];
};

const merchants: MerchantSeed[] = [
  { name: "Amazon", category: "Shopping", mccCode: "5942", aliases: ["amazon.in"] },
  { name: "Flipkart", category: "Shopping", mccCode: "5311" },
  { name: "Swiggy", category: "Dining", mccCode: "5812" },
  { name: "Zomato", category: "Dining", mccCode: "5812" },
  { name: "BigBasket", category: "Shopping", mccCode: "5411" },
  { name: "MakeMyTrip", category: "Travel", mccCode: "4722" },
  { name: "BookMyShow", category: "Entertainment", mccCode: "7832" },
  { name: "Indian Oil", category: "Fuel", mccCode: "5541" },
];

type OfferSeed = {
  merchant: string;
  cardIssuer?: string;
  cardName?: string;
  description: string;
  discountType: "percentage" | "flat_amount" | "cashback";
  discountValue: number;
  minTransaction?: number;
};

const offers: OfferSeed[] = [
  {
    merchant: "Amazon",
    cardIssuer: "ICICI Bank",
    cardName: "Amazon Pay",
    description: "5% cashback on Amazon for Prime members",
    discountType: "cashback",
    discountValue: 5,
    minTransaction: 500,
  },
  {
    merchant: "Flipkart",
    cardIssuer: "Axis Bank",
    cardName: "Flipkart",
    description: "Unlimited 5% cashback on Flipkart & Myntra",
    discountType: "cashback",
    discountValue: 5,
    minTransaction: 500,
  },
  {
    merchant: "Swiggy",
    cardIssuer: "HDFC Bank",
    cardName: "Millennia",
    description: "5% cashback on Swiggy orders",
    discountType: "cashback",
    discountValue: 5,
    minTransaction: 200,
  },
  {
    merchant: "Zomato",
    cardIssuer: "HDFC Bank",
    cardName: "Millennia",
    description: "5% cashback on Zomato orders",
    discountType: "cashback",
    discountValue: 5,
    minTransaction: 200,
  },
  {
    merchant: "BigBasket",
    cardIssuer: "SBI Card",
    cardName: "Cashback",
    description: "5% cashback on BigBasket grocery orders",
    discountType: "cashback",
    discountValue: 5,
    minTransaction: 1000,
  },
  {
    merchant: "MakeMyTrip",
    cardIssuer: "Axis Bank",
    cardName: "Flipkart",
    description: "4% cashback on flight & hotel bookings",
    discountType: "cashback",
    discountValue: 4,
    minTransaction: 3000,
  },
  {
    merchant: "BookMyShow",
    cardIssuer: "Kotak Mahindra Bank",
    cardName: "League Platinum",
    description: "Buy 1 Get 1 on movie tickets, up to ₹150",
    discountType: "flat_amount",
    discountValue: 150,
    minTransaction: 300,
  },
  {
    merchant: "Indian Oil",
    cardIssuer: "American Express",
    cardName: "SmartEarn",
    description: "5x reward points + 1% fuel surcharge waiver",
    discountType: "percentage",
    discountValue: 1,
    minTransaction: 400,
  },
  {
    merchant: "BigBasket",
    description: "2% cashback on your top spend category this month",
    discountType: "cashback",
    discountValue: 2,
    minTransaction: 500,
  },
];

async function main() {
  const merchantIdByName = new Map<string, string>();
  for (const m of merchants) {
    const created = await prisma.merchant.create({
      data: {
        name: m.name,
        category: m.category,
        mccCode: m.mccCode,
        aliases: m.aliases ?? [],
      },
    });
    merchantIdByName.set(m.name, created.id);
    console.log(`Created merchant ${created.name} (${created.category})`);
  }

  for (const o of offers) {
    const merchantId = merchantIdByName.get(o.merchant);
    if (!merchantId) {
      console.warn(`Skipping offer — unknown merchant ${o.merchant}`);
      continue;
    }
    const cardProduct = o.cardIssuer
      ? await prisma.cardProduct.findFirst({ where: { issuer: o.cardIssuer, name: o.cardName } })
      : null;

    await prisma.offer.create({
      data: {
        merchantId,
        cardProductId: cardProduct?.id,
        description: o.description,
        discountType: o.discountType,
        discountValue: o.discountValue,
        minTransaction: o.minTransaction,
        startsAt,
        expiresAt,
        source: "seed",
        lastVerifiedAt: startsAt,
      },
    });
    console.log(`Created offer: ${o.merchant} — ${o.description}`);
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
