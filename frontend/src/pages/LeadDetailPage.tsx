import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { ActivityTimeline } from "@/features/leads/ActivityTimeline";
import { LeadActions } from "@/features/leads/LeadActions";
import { useLeadDetail } from "@/features/leads/use-lead-detail";
import { Link, useParams } from "react-router";

export function LeadDetailPage() {
  const { id } = useParams();
  const leadId = id ?? "";
  const { state, retry } = useLeadDetail(leadId);

  return (
    <section>
      <p className="mb-6">
        <Link to="/" className="text-sm text-stone-600">
          Back to leads
        </Link>
      </p>
      {state.status === "loading" ? <LoadingState label="Loading lead" /> : null}
      {state.status === "error" ? <ErrorState message={state.message} onRetry={retry} /> : null}
      {state.status === "ready" ? (
        <div className="grid gap-10">
          <header>
            <h1 className="text-3xl font-semibold">{state.lead.name}</h1>
            <p className="mt-2 text-sm text-stone-600">
              {state.lead.status} · {state.lead.source} · {state.lead.externalLeadId}
            </p>
          </header>
          <LeadActions key={state.lead.updatedAt} lead={state.lead} onUpdated={retry} />
          <ActivityTimeline activities={state.lead.activities} />
        </div>
      ) : null}
    </section>
  );
}
