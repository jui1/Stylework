import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { LeadSummary } from "@/features/leads/LeadSummary";
import { useLeadList } from "@/features/leads/use-lead-list";
import { useState } from "react";

const pageSize = 20;

export function LeadListPage() {
  const [page, setPage] = useState(1);
  const { state, retry } = useLeadList(page, pageSize);

  return (
    <section>
      <h1 className="text-3xl font-semibold">Leads</h1>
      <div className="mt-6">
      {state.status === "loading" ? <LoadingState label="Loading leads" /> : null}
      {state.status === "error" ? <ErrorState message={state.message} onRetry={retry} /> : null}
      {state.status === "ready" && state.result.data.length === 0 ? (
        <EmptyState title="No leads" description="Leads created from the webhook will appear here." />
      ) : null}
      {state.status === "ready" && state.result.data.length > 0 ? (
        <>
          <div>
            {state.result.data.map((lead) => (
              <LeadSummary key={lead.id} lead={lead} />
            ))}
          </div>
          <nav className="mt-6 flex items-center gap-3 text-sm" aria-label="Lead pages">
            <button
              type="button"
              className="rounded-md border border-stone-300 px-3 py-1.5 disabled:opacity-40"
              disabled={page <= 1}
              onClick={() => setPage((current) => current - 1)}
            >
              Previous
            </button>
            <span>
              Page {state.result.page} of {Math.max(1, Math.ceil(state.result.total / state.result.limit))}
            </span>
            <button
              type="button"
              className="rounded-md border border-stone-300 px-3 py-1.5 disabled:opacity-40"
              disabled={page * state.result.limit >= state.result.total}
              onClick={() => setPage((current) => current + 1)}
            >
              Next
            </button>
          </nav>
        </>
      ) : null}
      </div>
    </section>
  );
}
