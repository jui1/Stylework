import { apiGet, apiSend } from "@/lib/api/client";
import type { Lead, LeadDetail, LeadListResponse, LeadStatus } from "@/types/lead";

const defaultPageSize = 20;

export function listLeads(page = 1, limit = defaultPageSize): Promise<LeadListResponse> {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  return apiGet<LeadListResponse>(`/leads?${params.toString()}`);
}

export function getLead(id: string): Promise<LeadDetail> {
  return apiGet<LeadDetail>(`/leads/${id}`);
}

export function updateLeadStatus(id: string, status: LeadStatus): Promise<Lead> {
  return apiSend<Lead>(`/leads/${id}/status`, "PATCH", { status });
}

export function updateLead(
  id: string,
  input: { name?: string; email?: string | null; phone?: string | null },
): Promise<Lead> {
  return apiSend<Lead>(`/leads/${id}`, "PATCH", input);
}
