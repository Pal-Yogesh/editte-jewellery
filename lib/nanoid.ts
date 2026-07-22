import crypto from "crypto";
export function nanoid(size = 12): string {
  return crypto.randomBytes(size).toString("base64url").slice(0, size);
}
