import { Body, Controller, Post } from "@nestjs/common";
import { IsString, IsUUID, MinLength } from "class-validator";
import { AiAssistantService } from "./ai-assistant.service";

class ChatDto {
  @IsUUID()
  userId!: string;

  @IsString()
  @MinLength(1)
  message!: string;
}

@Controller("ai-assistant")
export class AiAssistantController {
  constructor(private readonly aiAssistant: AiAssistantService) {}

  @Post("chat")
  chat(@Body() dto: ChatDto) {
    return this.aiAssistant.chat(dto.userId, dto.message);
  }
}
