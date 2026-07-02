import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "../../prisma/prisma.service";
import { FirebaseAdminService } from "./firebase-admin.service";

// Phone auth per TRD §5.2, backed by Firebase Phone Auth: the client verifies
// the number via the Firebase Web SDK and sends us the resulting ID token.
// We verify that token server-side, read the verified phone_number claim off
// it, and provision/find the matching User — never trusting a client-supplied
// phone number directly.
@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly firebase: FirebaseAdminService,
  ) {}

  async verifyFirebaseToken(idToken: string) {
    const decoded = await this.firebase.verifyIdToken(idToken);
    const phone = decoded.phone_number;
    if (!phone) {
      throw new UnauthorizedException("Firebase token has no verified phone number");
    }

    const user = await this.prisma.user.upsert({
      where: { phone },
      update: {},
      create: { phone, authProvider: "otp" },
    });

    return {
      accessToken: await this.jwt.signAsync(
        { sub: user.id },
        { secret: process.env.JWT_ACCESS_SECRET, expiresIn: Number(process.env.JWT_ACCESS_TTL_SECONDS) || 900 },
      ),
      refreshToken: await this.jwt.signAsync(
        { sub: user.id },
        { secret: process.env.JWT_REFRESH_SECRET, expiresIn: Number(process.env.JWT_REFRESH_TTL_SECONDS) || 2_592_000 },
      ),
      user,
    };
  }
}
