import { createHash, randomBytes } from "crypto";

export function generateApplicationToken() {
  return randomBytes(32).toString("base64url");
}

export function hashApplicationToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function getApplicationLink(token: string) {
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
    "http://localhost:3000";

  return `${appUrl}/apply/${token}`;
}

export function getTokenExpiryDate() {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 14);
  return expiresAt;
}
