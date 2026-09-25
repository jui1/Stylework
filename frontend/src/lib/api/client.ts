import { apiBaseUrl } from "@/lib/config";

export function joinUrl(base: string, path: string): string {
  const normalizedBase = base.endsWith("/") ? base.slice(0, -1) : base;
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${normalizedBase}${normalizedPath}`;
}

export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function errorMessage(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { error?: unknown };
    if (typeof body.error === "string" && body.error.length > 0) {
      return body.error;
    }
  } catch {
    return `Request failed with status ${response.status}`;
  }

  return `Request failed with status ${response.status}`;
}

export async function apiSend<T>(path: string, method: "PATCH", body: unknown): Promise<T> {
  const response = await fetch(joinUrl(apiBaseUrl, path), {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new ApiError(response.status, await errorMessage(response));
  }

  return (await response.json()) as T;
}

export async function apiGet<T>(path: string, acceptedErrorStatus?: number): Promise<T> {
  const response = await fetch(joinUrl(apiBaseUrl, path));

  if (!response.ok && response.status !== acceptedErrorStatus) {
    throw new ApiError(response.status, await errorMessage(response));
  }

  return (await response.json()) as T;
}
