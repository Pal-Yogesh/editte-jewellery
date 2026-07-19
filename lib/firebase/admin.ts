import "server-only";
import { initializeApp, getApps, getApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

/**
 * Vercel (and most CI) stores private keys with literal \n (two chars).
 * We handle BOTH cases:
 *   1. Already has real newlines (local .env with quotes)
 *   2. Has escaped \n (Vercel env, GitHub Actions)
 */
function parsePrivateKey(raw: string): string {
  // If it already contains real newlines it's fine; otherwise replace escaped ones
  return raw.includes("\n") ? raw : raw.replace(/\\n/g, "\n");
}

function createAdminApp() {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKeyRaw = process.env.FIREBASE_PRIVATE_KEY;
  const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;

  if (!projectId || !clientEmail || !privateKeyRaw) {
    throw new Error(
      `Firebase Admin: missing env vars. ` +
      `projectId=${!!projectId}, clientEmail=${!!clientEmail}, privateKey=${!!privateKeyRaw}`
    );
  }

  return initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey: parsePrivateKey(privateKeyRaw),
    }),
    storageBucket,
  });
}

// Reuse existing app in hot-reload / serverless warm instances
const adminApp = getApps().length ? getApp() : createAdminApp();

export const adminAuth = getAuth(adminApp);
export const adminDb = getFirestore(adminApp);
export const adminStorage = getStorage(adminApp);
