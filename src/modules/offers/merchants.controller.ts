import { Controller, Get, Param } from "@nestjs/common";
import { OffersService } from "./offers.service";

@Controller("merchants")
export class MerchantsController {
  constructor(private readonly offers: OffersService) {}

  @Get()
  findAll() {
    return this.offers.findAllMerchants();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.offers.findMerchant(id);
  }
}
