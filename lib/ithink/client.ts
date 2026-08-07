import "server-only";

import { IthinkError, type IthinkResponse } from "./types";

function getBaseUrl(): string {
  return process.env.NODE_ENV === "production"
    ? "https://my.ithinklogistics.com/api_v3/"
    : "https://pre-alpha.ithinklogistics.com/api_v3/";
}

function getCredentials() {
  const access_token = process.env.ITHINK_ACCESS_TOKEN;
  const secret_key = process.env.ITHINK_SECRET_KEY;

  if (!access_token || !secret_key) {
    throw new Error(
      "iThink API credentials missing. Set ITHINK_ACCESS_TOKEN and ITHINK_SECRET_KEY environment variables.",
    );
  }

  return { access_token, secret_key };
}

export async function thinkPost<T>(
  endpoint: string,
  data: object,
): Promise<IthinkResponse<T>> {
  const baseUrl = getBaseUrl();
  const credentials = getCredentials();

  const response = await fetch(`${baseUrl}${endpoint}.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      data: {
        ...data,
        access_token: credentials.access_token,
        secret_key: credentials.secret_key,
      },
    }),
  });

  if (!response.ok) {
    throw new IthinkError(`HTTP ${response.status}: ${response.statusText}`, "error");
  }

  const body: IthinkResponse<T> = await response.json();

  if (body.status === "error") {
    throw new IthinkError(
      body.html_message ?? "Unknown iThink API error",
      body.status,
    );
  }

  return body;
}
