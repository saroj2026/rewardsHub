import { Module } from "@nestjs/common";
import { AiAssistantController } from "./ai-assistant.controller";
import { AiAssistantService } from "./ai-assistant.service";
import { CardsModule } from "../cards/cards.module";
import { RecommendationModule } from "../recommendation/recommendation.module";

@Module({
  imports: [CardsModule, RecommendationModule],
  controllers: [AiAssistantController],
  providers: [AiAssistantService],
})
export class AiAssistantModule {}
