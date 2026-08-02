import { CheckCircle2 } from "lucide-react";
import { useState, type FormEvent } from "react";

interface ResolutionCardProps {
  disabled: boolean;
  resolved: boolean;
  resolutionNotes: string | null;
  onResolve: (resolutionNotes: string) => Promise<void>;
}

export default function ResolutionCard({
  disabled,
  resolved,
  resolutionNotes,
  onResolve,
}: ResolutionCardProps) {
  const [notes, setNotes] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedNotes = notes.trim();

    if (!trimmedNotes) {
      return;
    }

    await onResolve(trimmedNotes);
    setNotes("");
  }

  if (resolved) {
    return (
      <article className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
        <div className="flex items-center gap-2 text-emerald-800">
          <CheckCircle2 size={20} />

          <h2 className="font-semibold">Resolution</h2>
        </div>

        <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-emerald-700">
          {resolutionNotes || "This issue has been resolved."}
        </p>
      </article>
    );
  }

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2">
        <CheckCircle2 size={20} className="text-emerald-600" />

        <h2 className="font-semibold text-slate-950">Resolve issue</h2>
      </div>

      <p className="mt-2 text-sm text-slate-500">
        Explain what was done to resolve this issue.
      </p>

      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <textarea
          required
          rows={5}
          maxLength={5000}
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          placeholder="Enter resolution notes..."
          className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
        />

        <button
          type="submit"
          disabled={disabled || !notes.trim()}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <CheckCircle2 size={17} />
          Resolve issue
        </button>
      </form>
    </article>
  );
}
