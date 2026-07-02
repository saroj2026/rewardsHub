import { Controller, Get, Param, Query } from "@nestjs/common";
import { CardsService } from "./cards.service";

@Controller("users/:userId/transactions")
export class UserTransactionsController {
  constructor(private readonly cards: CardsService) {}

  @Get()
  findAll(@Param("userId") userId: string, @Query("take") take?: string) {
    return this.cards.findTransactionsForUser(userId, take ? Number(take) : undefined);
  }
}
