import bcrypt from "bcryptjs";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { db } from "@/lib/firebase-admin";

type AdminJwtPayload = JwtPayload & {
  role: "admin";
  adminId: string;
};

const TOKEN_EXPIRES_IN = "12h";
const ADMIN_COOKIE_NAME = "admin_token";
const ADMIN_COLLECTION = "admin_credentials";

export function getAdminCookieName(): string {
  return ADMIN_COOKIE_NAME;
}

export function getJwtSecret(): string {
  const value = process.env.JWT_SECRET;
  if (!value) {
    throw new Error("Missing required environment variable: JWT_SECRET");
  }
  return value;
}

export async function getAdminFromDb(
  adminId: string
): Promise<{ adminId: string; passwordHash: string; email?: string } | null> {
  const doc = await db.collection(ADMIN_COLLECTION).doc(adminId).get();
  if (!doc.exists) return null;
  const data = doc.data();
  if (!data?.passwordHash) return null;
  return {
    adminId: doc.id,
    passwordHash: data.passwordHash as string,
    email: data.email as string | undefined,
  };
}

export async function verifyAdminPassword(
  plainPassword: string,
  passwordHash: string
): Promise<boolean> {
  return bcrypt.compare(plainPassword, passwordHash);
}

export function signAdminToken(adminId: string): string {
  const secret = getJwtSecret();
  return jwt.sign({ role: "admin", adminId }, secret, {
    expiresIn: TOKEN_EXPIRES_IN,
  });
}

export async function getAdminSession(): Promise<AdminJwtPayload | null> {
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyAdminToken(token);
}

export function verifyAdminToken(token: string): AdminJwtPayload | null {
  try {
    const secret = getJwtSecret();
    const decoded = jwt.verify(token, secret);

    if (
      typeof decoded === "object" &&
      decoded !== null &&
      decoded.role === "admin" &&
      typeof decoded.adminId === "string"
    ) {
      return decoded as AdminJwtPayload;
    }
    return null;
  } catch {
    return null;
  }
}
