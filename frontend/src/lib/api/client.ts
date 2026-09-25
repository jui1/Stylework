import { apiBaseUrl } from "@/lib/config";

export function joinUrl(base: string, path: string): string {
  const normalizedBase = base.endsWith("/") ? base.slice(0, -1) : base;
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${normalizedBase}${normalizedPath}`;
}

export async function apiGet<T>(path: string, acceptedErrorStatus?: number): Promise<T> {
  const response = await fetch(joinUrl(apiBaseUrl, path));

  if (!response.ok && response.status !== acceptedErrorStatus) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return (await response.json()) as T;
}
