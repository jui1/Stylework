import { HealthStatus } from "@/components/HealthStatus";

export function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-6 py-16">
      <p className="text-sm font-medium tracking-wide text-slate-500 uppercase">Stylework</p>
      <h1 className="mt-2 text-4xl font-semibold tracking-tight text-slate-900">
        Senior Full Stack Engineer
      </h1>
      <p className="mt-4 text-lg text-slate-600">
        Application scaffold. The frontend, API, and database connection are in place. Feature work
        is not included yet.
      </p>
      <HealthStatus />
    </main>
  );
}
