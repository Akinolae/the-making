import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import { existsSync, readFileSync } from "fs";
import { join } from "path";
import env from "./env";

export const initializeFirestore = () => {
  const apps = getApps();

  if (apps.length === 0) {
    // 1. Try loading from a local service account JSON file if it exists
    const serviceAccountPath = join(
      process.cwd(),
      "firebase-service-account.json",
    );

    if (existsSync(serviceAccountPath)) {
      try {
        const serviceAccount = JSON.parse(
          readFileSync(serviceAccountPath, "utf8"),
        );
        initializeApp({
          credential: cert(serviceAccount),
        });
        return getFirestore();
      } catch (err: any) {
        console.error(
          "⚠️ Failed to load local firebase-service-account.json:",
          err.message,
        );
      }
    }

    // 2. Fallback to env credentials
    const hasCredentials =
      env.FIREBASE_CLIENT_EMAIL &&
      env.FIREBASE_PRIVATE_KEY &&
      !env.FIREBASE_PRIVATE_KEY.includes("...");

    if (hasCredentials) {
      initializeApp({
        credential: cert({
          projectId: env.FIREBASE_PROJECT_ID,
          clientEmail: env.FIREBASE_CLIENT_EMAIL,
          privateKey: env.FIREBASE_PRIVATE_KEY,
        }),
      });
    } else {
      // 3. Emulator / default credential fallback
      initializeApp({
        projectId: env.FIREBASE_PROJECT_ID,
      });
    }
  }
  return getFirestore();
};

const db = initializeFirestore();

/** Firebase Authentication SDK (uses the same initialized app) */
const firebaseAuth = getAuth();

export { firebaseAuth };
export default db;
