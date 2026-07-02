import { Body, Controller, Delete, Get, Param, Post } from "@nestjs/common";
import { IsBoolean, IsNumber, IsOptional, IsString, IsUUID, Min } from "class-validator";
import { CardsService } from "./cards.service";

class AddCardDto {
  @IsUUID()
  cardProductId!: string;

  @IsOptional()
  @IsString()
  nickname?: string;
}

class AddTransactionDto {
  @IsNumber()
  @Min(0)
  amount!: number;

  @IsString()
  category!: string;

  @IsOptional()
  @IsUUID()
  merchantId?: string;

  @IsOptional()
  @IsBoolean()
  gstEligible?: boolean;
}

@Controller("users/:userId/cards")
export class CardsController {
  constructor(private readonly cards: CardsService) {}

  @Get()
  findAll(@Param("userId") userId: string) {
    return this.cards.findAllForUser(userId);
  }

  @Post()
  add(@Param("userId") userId: string, @Body() dto: AddCardDto) {
    return this.cards.addCard(userId, dto.cardProductId, dto.nickname);
  }

  @Delete(":cardId")
  remove(@Param("cardId") cardId: string) {
    return this.cards.removeCard(cardId);
  }

  @Get(":cardId/points")
  points(@Param("cardId") cardId: string) {
    return this.cards.pointBalance(cardId);
  }

  @Get(":cardId/transactions")
  transactions(@Param("cardId") cardId: string) {
    return this.cards.findTransactions(cardId);
  }

  @Post(":cardId/transactions")
  addTransaction(
    @Param("userId") userId: string,
    @Param("cardId") cardId: string,
    @Body() dto: AddTransactionDto,
  ) {
    return this.cards.addTransaction(userId, cardId, dto);
  }
}
