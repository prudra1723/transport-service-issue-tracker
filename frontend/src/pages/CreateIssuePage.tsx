import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { createIssue } from "../api/issueApi";
import type {
  CreateIssueRequest,
  IssueCategory,
  IssuePriority,
} from "../types/issue";

const categories: IssueCategory[] = ["APPLICATION", "NETWORK", "OTHER"];

const priorities: IssuePriority[] = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

const initialForm: CreateIssueRequest = {
  title: "",
  description: "",
  category: "APPLICATION",
  priority: "MEDIUM",
  reportedById: 1,
};

export default function CreateIssuePage() {
  const navigate = useNavigate();

  const [form, setForm] = useState<CreateIssueRequest>(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  function updateField<K extends keyof CreateIssueRequest>(
    field: K,
    value: CreateIssueRequest[K],
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setSubmitting(true);
      setError("");

      const issue = await createIssue(form);
      navigate(`/issues/${issue.issueNumber}`);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to create issue.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="mx-auto max-w-3xl">
      <div>
        <h2 className="text-2xl font-bold text-slate-950">
          Create service issue
        </h2>
        <p className="mt-1 text-slate-500">
          Report a transport application, equipment or service issue.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mt-7 space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8"
      >
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        <div>
          <label
            htmlFor="title"
            className="mb-2 block text-sm font-semibold text-slate-700"
          >
            Issue title
          </label>

          <input
            id="title"
            required
            maxLength={200}
            value={form.title}
            onChange={(event) => updateField("title", event.target.value)}
            placeholder="Example: Passenger display unavailable"
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div>
          <label
            htmlFor="description"
            className="mb-2 block text-sm font-semibold text-slate-700"
          >
            Description
          </label>

          <textarea
            id="description"
            required
            rows={6}
            value={form.description}
            onChange={(event) => updateField("description", event.target.value)}
            placeholder="Describe what happened and how it affects the service."
            className="w-full resize-y rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label
              htmlFor="category"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Category
            </label>

            <select
              id="category"
              value={form.category}
              onChange={(event) =>
                updateField("category", event.target.value as IssueCategory)
              }
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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
              htmlFor="priority"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Priority
            </label>

            <select
              id="priority"
              value={form.priority}
              onChange={(event) =>
                updateField("priority", event.target.value as IssuePriority)
              }
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              {priorities.map((priority) => (
                <option key={priority} value={priority}>
                  {priority}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label
            htmlFor="reportedById"
            className="mb-2 block text-sm font-semibold text-slate-700"
          >
            Reporter ID
          </label>

          <input
            id="reportedById"
            required
            min={1}
            type="number"
            value={form.reportedById}
            onChange={(event) =>
              updateField("reportedById", Number(event.target.value))
            }
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />

          <p className="mt-2 text-xs text-slate-500">
            We will replace this field with the authenticated user later.
          </p>
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-100 pt-6">
          <button
            type="button"
            onClick={() => navigate("/issues")}
            className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={submitting}
            className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Creating..." : "Create issue"}
          </button>
        </div>
      </form>
    </section>
  );
}
