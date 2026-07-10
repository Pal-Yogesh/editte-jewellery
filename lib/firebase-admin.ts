import { getApps, initializeApp, cert, type App } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import type { Bucket } from "@google-cloud/storage";

function getAdminApp(): App {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  return initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  });
}

const adminApp = getAdminApp();
const db: Firestore = getFirestore(adminApp);

let cachedBucket: Bucket | null = null;

/** Returns the default Firebase Storage bucket (lazy so imports don't fail without config). */
export function getBucket(): Bucket {
  if (!cachedBucket) {
    cachedBucket = getStorage(adminApp).bucket();
  }
  return cachedBucket;
}

export { adminApp, db };
