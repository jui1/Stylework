import { getLead } from "@/lib/api/leads";
import type { LeadDetail } from "@/types/lead";
import { useEffect, useState } from "react";

type LeadDetailState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; lead: LeadDetail };

export function useLeadDetail(id: string) {
  const [state, setState] = useState<LeadDetailState>({ status: "loading" });
  const [requestId, setRequestId] = useState(0);

  useEffect(() => {
    let active = true;
    setState({ status: "loading" });

    getLead(id)
      .then((lead) => {
        if (active) {
          setState({ status: "ready", lead });
        }
      })
      .catch((error: unknown) => {
        if (!active) {
          return;
        }

        const message = error instanceof Error ? error.message : "Unable to load lead";
        setState({ status: "error", message });
      });

    return () => {
      active = false;
    };
  }, [id, requestId]);

  function retry() {
    setState({ status: "loading" });
    setRequestId((current) => current + 1);
  }

  return { state, retry };
}
