import { updateLead, updateLeadStatus } from "@/lib/api/leads";
import { leadStatuses, type LeadDetail, type LeadStatus } from "@/types/lead";
import { useState, type FormEvent } from "react";

type LeadActionsProps = {
  lead: LeadDetail;
  onUpdated: () => void;
};

export function LeadActions({ lead, onUpdated }: LeadActionsProps) {
  const [status, setStatus] = useState<LeadStatus>(lead.status);
  const [name, setName] = useState(lead.name);
  const [email, setEmail] = useState(lead.email ?? "");
  const [phone, setPhone] = useState(lead.phone ?? "");
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function saveStatus() {
    setPending(true);
    setMessage(null);
    try {
      await updateLeadStatus(lead.id, status);
      onUpdated();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to update status");
    } finally {
      setPending(false);
    }
  }

  async function saveDetails(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setMessage(null);
    try {
      await updateLead(lead.id, {
        name,
        email: email.length > 0 ? email : null,
        phone: phone.length > 0 ? phone : null,
      });
      onUpdated();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to update lead");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="grid gap-8">
      <form className="flex flex-wrap items-end gap-3" onSubmit={(event) => event.preventDefault()}>
        <label className="text-sm">
          Status
          <select
            className="mt-1 block rounded-md border border-stone-300 bg-white px-2 py-1.5"
            value={status}
            onChange={(event) => setStatus(event.target.value as LeadStatus)}
          >
            {leadStatuses.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          disabled={pending || status === lead.status}
          onClick={() => void saveStatus()}
          className="rounded-md bg-stone-900 px-3 py-1.5 text-sm text-white disabled:opacity-40"
        >
          Save status
        </button>
      </form>
      <form className="grid max-w-md gap-3" onSubmit={(event) => void saveDetails(event)}>
        <label className="text-sm">
          Name
          <input
            className="mt-1 block w-full rounded-md border border-stone-300 px-2 py-1.5"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </label>
        <label className="text-sm">
          Email
          <input
            className="mt-1 block w-full rounded-md border border-stone-300 px-2 py-1.5"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>
        <label className="text-sm">
          Phone
          <input
            className="mt-1 block w-full rounded-md border border-stone-300 px-2 py-1.5"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
          />
        </label>
        <button
          type="submit"
          disabled={pending}
          className="w-fit rounded-md bg-stone-900 px-3 py-1.5 text-sm text-white disabled:opacity-40"
        >
          Save details
        </button>
      </form>
      {message ? <p className="text-sm text-red-700">{message}</p> : null}
    </div>
  );
}
