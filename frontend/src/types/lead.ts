export const leadStatuses = [
  "NEW",
  "CONTACTED",
  "QUALIFIED",
  "UNQUALIFIED",
  "CONVERTED",
  "LOST",
] as const;

export type LeadStatus = (typeof leadStatuses)[number];

export const activityTypes = [
  "LEAD_CREATED",
  "CALL",
  "EMAIL",
  "MEETING",
  "NOTE",
  "STATUS_CHANGE",
  "STATUS_CHANGED",
  "LEAD_UPDATED",
] as const;

export type ActivityType = (typeof activityTypes)[number];

export type Lead = {
  id: string;
  externalLeadId: string;
  name: string;
  email: string | null;
  phone: string | null;
  source: string;
  status: LeadStatus;
  createdAt: string;
  updatedAt: string;
};

export type Activity = {
  id: string;
  leadId: string;
  type: ActivityType;
  description: string;
  metadata: Record<string, unknown> | null;
  createdAt: string;
};

export type LeadDetail = Lead & {
  activities: Activity[];
};

export type LeadListResponse = {
  data: Lead[];
  page: number;
  limit: number;
  total: number;
};
