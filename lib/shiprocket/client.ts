import "server-only";

const BASE_URL = "https://apiv2.shiprocket.in/v1/external";

let cachedToken: string | null = null;
let tokenExpiresAt = 0;

export class ShiprocketError extends Error {
  public readonly statusCode: number;
  constructor(message: string, statusCode = 0) {
    super(message);
    this.name = "ShiprocketError";
    this.statusCode = statusCode;
  }
}

function getCredentials() {
  const email = process.env.SHIPROCKET_EMAIL;
  const password = process.env.SHIPROCKET_PASSWORD;
  if (!email || !password) {
    throw new ShiprocketError(
      "Shiprocket credentials missing. Set SHIPROCKET_EMAIL and SHIPROCKET_PASSWORD environment variables."
    );
  }
  return { email, password };
}

async function getToken(): Promise<string> {
  if (cachedToken && Date.now() < tokenExpiresAt) return cachedToken;

  const { email, password } = getCredentials();

  const response = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new ShiprocketError(
      `Shiprocket auth failed: HTTP ${response.status}`,
      response.status
    );
  }

  const body = await response.json();

  if (!body.token) {
    throw new ShiprocketError("Shiprocket auth did not return a token.");
  }

  cachedToken = body.token;
  tokenExpiresAt = Date.now() + 9 * 24 * 60 * 60 * 1000;
  return cachedToken!;
}

export async function shiprocketPost<T>(
  endpoint: string,
  data: object
): Promise<T> {
  const token = await getToken();

  const response = await fetch(`${BASE_URL}/${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  const body = await response.json();

  if (!response.ok) {
    throw new ShiprocketError(
      body?.message ?? `HTTP ${response.status}`,
      response.status
    );
  }

  return body as T;
}
