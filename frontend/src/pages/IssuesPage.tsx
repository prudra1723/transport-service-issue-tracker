import { Plus, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { getIssues } from "../api/issueApi";
import StatusBadge from "../components/common/StatusBadge";
import type { ServiceIssue } from "../types/issue";

export default function IssuesPage() {
  const [issues, setIssues] = useState<ServiceIssue[]>([]);
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadIssues(searchKeyword = "") {
    try {
      setLoading(true);
      setError("");

      const data = await getIssues({
        keyword: searchKeyword,
      });

      setIssues(data);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to load issues.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadIssues();
  }, []);

  function handleSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void loadIssues(keyword);
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-950">Service issues</h2>
          <p className="mt-1 text-slate-500">
            Search, review and manage reported issues.
          </p>
        </div>

        <Link
          to="/issues/new"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700"
        >
          <Plus size={18} />
          Create issue
        </Link>
      </div>

      <form onSubmit={handleSearch} className="flex max-w-xl gap-3">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="Search by issue title or description"
            className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-10 pr-4 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <button
          type="submit"
          className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          Search
        </button>
      </form>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-slate-50">
              <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
                <th className="px-5 py-4">Issue</th>
                <th className="px-5 py-4">Category</th>
                <th className="px-5 py-4">Priority</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Created</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-10 text-center text-slate-500"
                  >
                    Loading issues...
                  </td>
                </tr>
              )}

              {!loading &&
                issues.map((issue) => (
                  <tr key={issue.id} className="hover:bg-slate-50">
                    <td className="px-5 py-4">
                      <Link
                        to={`/issues/${issue.issueNumber}`}
                        className="font-semibold text-slate-900 hover:text-blue-600"
                      >
                        {issue.title}
                      </Link>
                      <p className="mt-1 text-xs text-slate-500">
                        {issue.issueNumber}
                      </p>
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-600">
                      {issue.category}
                    </td>

                    <td className="px-5 py-4 text-sm font-medium text-slate-700">
                      {issue.priority}
                    </td>

                    <td className="px-5 py-4">
                      <StatusBadge status={issue.status} />
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-500">
                      {new Date(issue.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}

              {!loading && issues.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-12 text-center text-slate-500"
                  >
                    No service issues found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
