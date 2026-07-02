import { Module } from "@nestjs/common";
import { CardsController } from "./cards.controller";
import { CardProductsController } from "./card-products.controller";
import { UserTransactionsController } from "./user-transactions.controller";
import { CardsService } from "./cards.service";

@Module({
  controllers: [CardsController, CardProductsController, UserTransactionsController],
  providers: [CardsService],
  exports: [CardsService],
})
export class CardsModule {}
