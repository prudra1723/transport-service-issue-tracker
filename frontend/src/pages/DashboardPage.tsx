import { AlertTriangle, CheckCircle2, Clock3, TicketCheck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { getIssues } from "../api/issueApi";
import type { ServiceIssue } from "../types/issue";

const summaryCards = [
  {
    title: "Total issues",
    key: "total",
    icon: TicketCheck,
  },
  {
    title: "Open issues",
    key: "open",
    icon: Clock3,
  },
  {
    title: "Critical issues",
    key: "critical",
    icon: AlertTriangle,
  },
  {
    title: "Resolved issues",
    key: "resolved",
    icon: CheckCircle2,
  },
] as const;

export default function DashboardPage() {
  const [issues, setIssues] = useState<ServiceIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        setError("");

        const data = await getIssues();
        setIssues(data);
      } catch (requestError) {
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Unable to load dashboard.",
        );
      } finally {
        setLoading(false);
      }
    }

    void loadDashboard();
  }, []);

  const statistics = useMemo(
    () => ({
      total: issues.length,
      open: issues.filter((issue) => issue.status === "OPEN").length,
      critical: issues.filter((issue) => issue.priority === "CRITICAL").length,
      resolved: issues.filter((issue) => issue.status === "RESOLVED").length,
    }),
    [issues],
  );

  const statusData = useMemo(() => {
    const statuses = [
      "OPEN",
      "ASSIGNED",
      "IN_PROGRESS",
      "RESOLVED",
      "CLOSED",
    ] as const;

    return statuses.map((status) => ({
      status: status.replaceAll("_", " "),
      count: issues.filter((issue) => issue.status === status).length,
    }));
  }, [issues]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8">
        Loading dashboard...
      </div>
    );
  }

  return (
    <section className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-950">
          Operations dashboard
        </h2>
        <p className="mt-1 text-slate-500">
          Monitor transport service issues and resolution progress.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => {
          const Icon = card.icon;

          return (
            <article
              key={card.key}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                  <Icon size={22} />
                </span>

                <span className="text-3xl font-bold text-slate-950">
                  {statistics[card.key]}
                </span>
              </div>

              <p className="mt-5 text-sm font-medium text-slate-500">
                {card.title}
              </p>
            </article>
          );
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div>
            <h3 className="font-semibold text-slate-950">Issues by status</h3>
            <p className="mt-1 text-sm text-slate-500">
              Current issue distribution across the workflow.
            </p>
          </div>

          <div className="mt-6 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="status" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#2563eb" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="font-semibold text-slate-950">Recent issues</h3>

          <div className="mt-5 space-y-4">
            {issues.slice(0, 5).map((issue) => (
              <div
                key={issue.id}
                className="border-b border-slate-100 pb-4 last:border-none"
              >
                <p className="text-sm font-semibold text-slate-900">
                  {issue.title}
                </p>
                <div className="mt-1 flex justify-between text-xs text-slate-500">
                  <span>{issue.issueNumber}</span>
                  <span>{issue.status.replaceAll("_", " ")}</span>
                </div>
              </div>
            ))}

            {issues.length === 0 && (
              <p className="text-sm text-slate-500">
                No issues have been created yet.
              </p>
            )}
          </div>
        </article>
      </div>
    </section>
  );
}
