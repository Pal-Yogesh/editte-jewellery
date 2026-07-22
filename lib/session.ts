import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);
const COOKIE = "editte_session";
const EXPIRES_DAYS = 7;

export type UserRole = "admin" | "customer";

export interface SessionPayload {
  uid: string;
  email: string;
  emailVerified: boolean;
  role: UserRole;
  expiresAt: number;
}

export async function encrypt(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${EXPIRES_DAYS}d`)
    .sign(SECRET);
}

export async function decrypt(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET, { algorithms: ["HS256"] });
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export async function createSession(payload: SessionPayload) {
  const expiresAt = new Date(Date.now() + EXPIRES_DAYS * 24 * 60 * 60 * 1000);
  const token = await encrypt({ ...payload, expiresAt: expiresAt.getTime() });
  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
    path: "/",
  });
}

export async function getSession(): Promise<SessionPayload | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;
  return decrypt(token);
}

export async function deleteSession() {
  const jar = await cookies();
  jar.delete(COOKIE);
}

export async function updateSession() {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return;
  const payload = await decrypt(token);
  if (!payload) return;
  await createSession(payload);
}
