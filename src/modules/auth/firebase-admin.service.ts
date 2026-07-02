import { Injectable, InternalServerErrorException, Logger } from "@nestjs/common";
import { App, cert, getApp, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

// Verifies phone numbers via Firebase Phone Auth: the client verifies the
// number with the Firebase Web SDK and hands us the resulting ID token; we
// verify that token server-side (never trusting a client-supplied phone
// number directly) and read the verified `phone_number` claim off it.
@Injectable()
export class FirebaseAdminService {
  private readonly logger = new Logger(FirebaseAdminService.name);
  private app: App | null = null;

  private getApp(): App {
    if (this.app) return this.app;

    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

    if (!projectId || !clientEmail || !privateKey) {
      throw new InternalServerErrorException(
        "Firebase Admin isn't configured — set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY (see .env.example).",
      );
    }

    this.app = getApps().length
      ? getApp()
      : initializeApp({
          credential: cert({ projectId, clientEmail, privateKey }),
        });
    return this.app;
  }

  async verifyIdToken(idToken: string) {
    try {
      return await getAuth(this.getApp()).verifyIdToken(idToken);
    } catch (err) {
      this.logger.error("Firebase ID token verification failed", err as Error);
      throw err;
    }
  }
}
