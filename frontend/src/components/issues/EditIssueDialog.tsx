import { Save, X } from "lucide-react";
import { useState, type FormEvent } from "react";

import type {
  IssueCategory,
  IssuePriority,
  ServiceIssue,
  UpdateIssueRequest,
} from "../../types/issue";

const categories: IssueCategory[] = [
  "APPLICATION",
  "DATABASE",
  "NETWORK",
  "ACCESS",
  "PERFORMANCE",
  "INTEGRATION",
  "OTHER",
];

const priorities: IssuePriority[] = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

interface EditIssueDialogProps {
  issue: ServiceIssue;
  open: boolean;
  saving: boolean;
  onClose: () => void;
  onSave: (request: UpdateIssueRequest) => Promise<void>;
}

export default function EditIssueDialog({
  issue,
  open,
  saving,
  onClose,
  onSave,
}: EditIssueDialogProps) {
  const [form, setForm] = useState<UpdateIssueRequest>({
    title: issue.title,
    description: issue.description,
    category: issue.category,
    priority: issue.priority,
  });

  if (!open) {
    return null;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.title.trim() || !form.description.trim()) {
      return;
    }

    await onSave({
      ...form,
      title: form.title.trim(),
      description: form.description.trim(),
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-issue-title"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !saving) {
          onClose();
        }
      }}
    >
      <section className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <header className="flex items-start justify-between border-b border-slate-200 px-6 py-5">
          <div>
            <p className="text-sm font-semibold text-blue-600">
              {issue.issueNumber}
            </p>

            <h2
              id="edit-issue-title"
              className="mt-1 text-2xl font-bold text-slate-950"
            >
              Edit issue
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Update the issue title, description, category and priority.
            </p>
          </div>

          <button
            type="button"
            disabled={saving}
            onClick={onClose}
            aria-label="Close edit dialog"
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="space-y-5 p-6">
          <div>
            <label
              htmlFor="edit-title"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Title
            </label>

            <input
              id="edit-title"
              type="text"
              required
              maxLength={200}
              value={form.title}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  title: event.target.value,
                }))
              }
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label
              htmlFor="edit-description"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Description
            </label>

            <textarea
              id="edit-description"
              required
              rows={7}
              value={form.description}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  description: event.target.value,
                }))
              }
              className="w-full resize-y rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="edit-category"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Category
              </label>

              <select
                id="edit-category"
                value={form.category}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    category: event.target.value as IssueCategory,
                  }))
                }
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category.replaceAll("_", " ")}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="edit-priority"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Priority
              </label>

              <select
                id="edit-priority"
                value={form.priority}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    priority: event.target.value as IssuePriority,
                  }))
                }
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3"
              >
                {priorities.map((priority) => (
                  <option key={priority} value={priority}>
                    {priority}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <footer className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              disabled={saving}
              onClick={onClose}
              className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={
                saving || !form.title.trim() || !form.description.trim()
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Save size={17} />

              {saving ? "Saving changes..." : "Save changes"}
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
}
