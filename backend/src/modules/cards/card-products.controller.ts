import { Controller, Get } from "@nestjs/common";
import { CardsService } from "./cards.service";

@Controller("card-products")
export class CardProductsController {
  constructor(private readonly cards: CardsService) {}

  @Get()
  findAll() {
    return this.cards.findAllCardProducts();
  }
}
