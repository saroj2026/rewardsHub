import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { FirebaseAdminService } from "./firebase-admin.service";

@Module({
  imports: [JwtModule.register({})],
  controllers: [AuthController],
  providers: [AuthService, FirebaseAdminService],
  exports: [AuthService],
})
export class AuthModule {}
