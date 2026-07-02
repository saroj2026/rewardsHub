import { Controller, Query } from "@nestjs/common";
import { Get } from "@nestjs/common";
import { IsNumber, IsUUID, Min } from "class-validator";
import { Type } from "class-transformer";
import { RecommendationService } from "./recommendation.service";

class RecommendQuery {
  @IsUUID()
  userId!: string;

  @IsUUID()
  merchantId!: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  amount!: number;
}

@Controller("recommendation")
export class RecommendationController {
  constructor(private readonly recommendation: RecommendationService) {}

  @Get("best-card")
  bestCard(@Query() query: RecommendQuery) {
    return this.recommendation.recommendBestCard(query.userId, query.merchantId, query.amount);
  }
}
