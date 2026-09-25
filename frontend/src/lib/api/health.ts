import { apiGet } from "@/lib/api/client";
import type { HealthResponse, ReadinessResponse } from "@/types/health";

export function getHealth(): Promise<HealthResponse> {
  return apiGet<HealthResponse>("/health");
}

export function getReadiness(): Promise<ReadinessResponse> {
  return apiGet<ReadinessResponse>("/health/ready", 503);
}
