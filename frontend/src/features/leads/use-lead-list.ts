import { listLeads } from "@/lib/api/leads";
import type { LeadListResponse } from "@/types/lead";
import { useEffect, useState } from "react";

type LeadListState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; result: LeadListResponse };

export function useLeadList(page: number, limit: number) {
  const [state, setState] = useState<LeadListState>({ status: "loading" });
  const [requestId, setRequestId] = useState(0);

  useEffect(() => {
    let active = true;
    setState({ status: "loading" });

    listLeads(page, limit)
      .then((result) => {
        if (active) {
          setState({ status: "ready", result });
        }
      })
      .catch((error: unknown) => {
        if (!active) {
          return;
        }

        const message = error instanceof Error ? error.message : "Unable to load leads";
        setState({ status: "error", message });
      });

    return () => {
      active = false;
    };
  }, [page, limit, requestId]);

  function retry() {
    setState({ status: "loading" });
    setRequestId((current) => current + 1);
  }

  return { state, retry };
}
