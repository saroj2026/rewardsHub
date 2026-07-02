import { Controller, Get, Param, Query } from "@nestjs/common";
import { OffersService } from "./offers.service";

@Controller("offers")
export class OffersController {
  constructor(private readonly offers: OffersService) {}

  @Get()
  findLive(@Query("category") category?: string) {
    return this.offers.findLive(category);
  }

  @Get("merchant/:merchantId")
  findForMerchant(@Param("merchantId") merchantId: string) {
    return this.offers.findForMerchant(merchantId);
  }

  @Get("users/:userId/expiring-points")
  expiringPoints(@Param("userId") userId: string, @Query("withinDays") withinDays?: string) {
    return this.offers.findExpiringPointBalances(userId, withinDays ? Number(withinDays) : undefined);
  }

  // Must stay last among GET handlers — a bare ":id" would otherwise shadow
  // the more specific "merchant/:merchantId" and "users/:userId/..." routes above.
  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.offers.findOne(id);
  }
}
