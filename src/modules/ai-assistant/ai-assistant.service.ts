import { Injectable, Logger } from "@nestjs/common";
import { GoogleGenAI, type Content, type FunctionDeclaration, type Part } from "@google/genai";
import { PrismaService } from "../../prisma/prisma.service";
import { CardsService } from "../cards/cards.service";
import { RecommendationService } from "../recommendation/recommendation.service";

const MODEL = "gemini-2.5-flash";

// RAG-lite per TRD §5.4: the model never gets a static knowledge dump — every
// fact about the user's cards/rewards comes back through a tool call against
// the real DB, so answers are grounded rather than guessed.
const SYSTEM_PROMPT = `You are RewardsHub's AI assistant. You help users pick the best card for a
purchase and understand their reward balances, using ONLY the tools provided — never invent
card names, reward rates, or balances from your own knowledge.

Scope: card and reward questions only. If asked for general financial, tax, or investment
advice, decline and say this is outside what you can help with.

When a recommendation is based on estimated or incomplete data, say so explicitly rather than
stating it as certain.`;

const functionDeclarations: FunctionDeclaration[] = [
  {
    name: "get_user_cards",
    description: "Get every card in the user's wallet, with reward rules and point balances.",
    parametersJsonSchema: {
      type: "object",
      properties: {},
      required: [],
    },
  },
  {
    name: "get_best_card_recommendation",
    description:
      "Given a merchant and a spend amount, rank the user's cards by expected reward value for that purchase.",
    parametersJsonSchema: {
      type: "object",
      properties: {
        merchantId: { type: "string", description: "The merchant's UUID" },
        amount: { type: "number", description: "Spend amount in INR" },
      },
      required: ["merchantId", "amount"],
    },
  },
];

@Injectable()
export class AiAssistantService {
  private readonly logger = new Logger(AiAssistantService.name);
  private readonly client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  constructor(
    private readonly prisma: PrismaService,
    private readonly cards: CardsService,
    private readonly recommendation: RecommendationService,
  ) {}

  private async runTool(userId: string, name: string, args: Record<string, unknown>) {
    switch (name) {
      case "get_user_cards":
        return this.cards.findAllForUser(userId);
      case "get_best_card_recommendation":
        return this.recommendation.recommendBestCard(
          userId,
          args.merchantId as string,
          args.amount as number,
        );
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  }

  async chat(userId: string, message: string): Promise<{ reply: string }> {
    const contents: Content[] = [{ role: "user", parts: [{ text: message }] }];

    // Manual agentic loop, ported from the Anthropic tool_use/tool_result
    // pattern to Gemini's functionCall/functionResponse turn shape. Gemini has
    // no separate "assistant"/"tool" role — model turns use role "model" and
    // function results are sent back as role "user".
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const response = await this.client.models.generateContent({
        model: MODEL,
        contents,
        config: {
          systemInstruction: SYSTEM_PROMPT,
          tools: [{ functionDeclarations }],
        },
      });

      const modelContent = response.candidates?.[0]?.content;
      if (modelContent) contents.push(modelContent);

      const calls = response.functionCalls;
      if (!calls || calls.length === 0) {
        await this.persistConversation(userId, contents);
        return { reply: response.text ?? "" };
      }

      const responseParts: Part[] = [];
      for (const call of calls) {
        try {
          const result = await this.runTool(userId, call.name!, call.args ?? {});
          responseParts.push({
            functionResponse: { id: call.id, name: call.name, response: { output: result } },
          });
        } catch (err) {
          this.logger.error(`Tool ${call.name} failed`, err as Error);
          responseParts.push({
            functionResponse: {
              id: call.id,
              name: call.name,
              response: { error: (err as Error).message },
            },
          });
        }
      }

      contents.push({ role: "user", parts: responseParts });
    }
  }

  private async persistConversation(userId: string, contents: Content[]) {
    await this.prisma.aIConversation.create({
      data: { userId, messages: contents as unknown as object },
    });
  }
}
