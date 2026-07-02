import { Module } from "@nestjs/common";
import { OffersController } from "./offers.controller";
import { MerchantsController } from "./merchants.controller";
import { OffersService } from "./offers.service";

@Module({
  controllers: [OffersController, MerchantsController],
  providers: [OffersService],
  exports: [OffersService],
})
export class OffersModule {}
