import { getHealth, getReadiness } from "@/lib/api/health";
import type { HealthResponse, ReadinessResponse } from "@/types/health";
import { useEffect, useState } from "react";

type Status =
  | { state: "loading" }
  | { state: "ready"; health: HealthResponse; readiness: ReadinessResponse }
  | { state: "error"; message: string };

export function HealthStatus() {
  const [status, setStatus] = useState<Status>({ state: "loading" });

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const [health, readiness] = await Promise.all([getHealth(), getReadiness()]);
        if (active) {
          setStatus({ state: "ready", health, readiness });
        }
      } catch (error) {
        if (!active) {
          return;
        }

        const message = error instanceof Error ? error.message : "Unable to reach the API";
        setStatus({ state: "error", message });
      }
    }

    void load();

    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="mt-10 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-sm font-medium text-slate-500">API status</h2>
      {status.state === "loading" ? <p className="mt-3 text-slate-700">Checking the API…</p> : null}
      {status.state === "error" ? (
        <p className="mt-3 text-red-700">API unreachable. {status.message}</p>
      ) : null}
      {status.state === "ready" ? (
        <dl className="mt-4 grid gap-3 text-sm text-slate-700 sm:grid-cols-2">
          <div>
            <dt className="text-slate-500">Liveness</dt>
            <dd className="font-medium text-slate-900">{status.health.status}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Database</dt>
            <dd className="font-medium text-slate-900">{status.readiness.database}</dd>
          </div>
        </dl>
      ) : null}
    </section>
  );
}
