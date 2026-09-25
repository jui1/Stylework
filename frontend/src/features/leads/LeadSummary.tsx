import type { Lead } from "@/types/lead";
import { Link } from "react-router";

type LeadSummaryProps = {
  lead: Lead;
};

export function LeadSummary({ lead }: LeadSummaryProps) {
  return (
    <article className="grid gap-2 border-b border-stone-200 py-4 sm:grid-cols-[1fr_8rem_1fr]">
      <div>
        <h2 className="font-medium">
          <Link to={`/leads/${lead.id}`} className="underline-offset-2 hover:underline">
            {lead.name}
          </Link>
        </h2>
        <p className="text-sm text-stone-600">{lead.email ?? "No email"}</p>
      </div>
      <p className="text-sm">{lead.status}</p>
      <p className="text-sm text-stone-600">
        {lead.phone ?? "No phone"} · {lead.source}
      </p>
    </article>
  );
}
