import { Body, Controller, Post } from "@nestjs/common";
import { IsString, MinLength } from "class-validator";
import { AuthService } from "./auth.service";

class VerifyFirebaseTokenDto {
  @IsString()
  @MinLength(1)
  idToken!: string;
}

@Controller("auth")
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post("firebase/verify")
  verifyFirebase(@Body() dto: VerifyFirebaseTokenDto) {
    return this.auth.verifyFirebaseToken(dto.idToken);
  }
}
