import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class OffersService {
  constructor(private readonly prisma: PrismaService) {}

  findLive(category?: string) {
    const now = new Date();
    return this.prisma.offer.findMany({
      where: {
        startsAt: { lte: now },
        expiresAt: { gte: now },
        ...(category ? { merchant: { category } } : {}),
      },
      include: { merchant: true, cardProduct: true },
      orderBy: { expiresAt: "asc" },
    });
  }

  findForMerchant(merchantId: string) {
    return this.prisma.offer.findMany({
      where: { merchantId },
      include: { cardProduct: true },
    });
  }

  findOne(id: string) {
    return this.prisma.offer.findUnique({
      where: { id },
      include: { merchant: true, cardProduct: true },
    });
  }

  findAllMerchants() {
    return this.prisma.merchant.findMany({ orderBy: { name: "asc" } });
  }

  findMerchant(id: string) {
    return this.prisma.merchant.findUnique({ where: { id } });
  }

  // Expiry-alert candidates: point balances expiring soon, for the
  // notifications side of this module (TRD §4's "Offers & Notifications" box).
  findExpiringPointBalances(userId: string, withinDays = 7) {
    const cutoff = new Date(Date.now() + withinDays * 24 * 60 * 60 * 1000);
    return this.prisma.pointBalance.findMany({
      where: {
        status: "active",
        expiresAt: { not: null, lte: cutoff },
        card: { userId },
      },
      include: { card: { include: { cardProduct: true } } },
    });
  }
}
