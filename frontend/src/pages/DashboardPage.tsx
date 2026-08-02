import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Timer,
  TicketCheck,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  getDashboardSummary,
  getIssuesByCategory,
  getIssuesByPriority,
  getMonthlyTrend,
} from "../api/dashboardApi";
import { getIssues } from "../api/issueApi";
import type {
  DashboardCount,
  DashboardSummary,
  MonthlyTrend,
} from "../types/dashboard";
import type { ServiceIssue } from "../types/issue";

const summaryCards = [
  {
    title: "Total issues",
    key: "totalIssues",
    icon: TicketCheck,
  },
  {
    title: "Open issues",
    key: "openIssues",
    icon: Clock3,
  },
  {
    title: "Critical issues",
    key: "criticalIssues",
    icon: AlertTriangle,
  },
  {
    title: "Resolved issues",
    key: "resolvedIssues",
    icon: CheckCircle2,
  },
] as const;

const emptySummary: DashboardSummary = {
  totalIssues: 0,
  openIssues: 0,
  criticalIssues: 0,
  resolvedIssues: 0,
  averageResolutionHours: 0,
};

const priorityColours: Record<string, string> = {
  LOW: "#22c55e",
  MEDIUM: "#eab308",
  HIGH: "#f97316",
  CRITICAL: "#dc2626",
};

export default function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary>(emptySummary);

  const [issues, setIssues] = useState<ServiceIssue[]>([]);

  const [priorityData, setPriorityData] = useState<DashboardCount[]>([]);

  const [categoryData, setCategoryData] = useState<DashboardCount[]>([]);

  const [monthlyTrend, setMonthlyTrend] = useState<MonthlyTrend[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      try {
        setLoading(true);
        setError("");

        const [
          summaryData,
          issueData,
          priorityCounts,
          categoryCounts,
          monthlyTrendData,
        ] = await Promise.all([
          getDashboardSummary(),
          getIssues(),
          getIssuesByPriority(),
          getIssuesByCategory(),
          getMonthlyTrend(),
        ]);

        if (cancelled) {
          return;
        }

        setSummary(summaryData);
        setIssues(issueData);

        setPriorityData(priorityCounts.filter((item) => item.count > 0));

        setCategoryData(categoryCounts.filter((item) => item.count > 0));

        setMonthlyTrend(monthlyTrendData);
      } catch (requestError) {
        if (cancelled) {
          return;
        }

        setError(
          requestError instanceof Error
            ? requestError.message
            : "Unable to load dashboard.",
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadDashboard();

    return () => {
      cancelled = true;
    };
  }, []);

  const statusData = useMemo(() => {
    const statuses = [
      "OPEN",
      "ASSIGNED",
      "IN_PROGRESS",
      "ON_HOLD",
      "RESOLVED",
      "CLOSED",
      "REOPENED",
    ] as const;

    return statuses.map((status) => ({
      status: formatLabel(status),
      count: issues.filter((issue) => issue.status === status).length,
    }));
  }, [issues]);

  const recentIssues = useMemo(
    () =>
      [...issues]
        .sort(
          (firstIssue, secondIssue) =>
            new Date(secondIssue.createdAt).getTime() -
            new Date(firstIssue.createdAt).getTime(),
        )
        .slice(0, 5),
    [issues],
  );

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        Loading dashboard...
      </div>
    );
  }

  return (
    <section className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold text-slate-950">
          Operations dashboard
        </h1>

        <p className="mt-1 text-slate-500">
          Monitor transport service issues and resolution progress.
        </p>
      </header>

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
                  {summary[card.key]}
                </span>
              </div>

              <p className="mt-5 text-sm font-medium text-slate-500">
                {card.title}
              </p>
            </article>
          );
        })}
      </div>

      <article className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
            <Timer size={22} />
          </span>

          <div>
            <h2 className="font-semibold text-slate-950">
              Average resolution time
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Average time from issue creation to resolution.
            </p>
          </div>
        </div>

        <p className="text-2xl font-bold text-slate-950">
          {formatResolutionTime(summary.averageResolutionHours)}
        </p>
      </article>

      <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <h2 className="font-semibold text-slate-950">Monthly issue trend</h2>

          <p className="mt-1 text-sm text-slate-500">
            Number of service issues created each month.
          </p>
        </div>

        <div className="mt-6 h-80">
          {monthlyTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={monthlyTrend}
                margin={{
                  top: 10,
                  right: 20,
                  left: 0,
                  bottom: 10,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />

                <XAxis
                  dataKey="month"
                  tick={{
                    fontSize: 12,
                  }}
                />

                <YAxis allowDecimals={false} />

                <Tooltip />

                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#2563eb"
                  strokeWidth={3}
                  dot={{
                    r: 5,
                  }}
                  activeDot={{
                    r: 7,
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChartMessage />
          )}
        </div>
      </article>

      <div className="grid gap-6 xl:grid-cols-2">
        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div>
            <h2 className="font-semibold text-slate-950">Issues by priority</h2>

            <p className="mt-1 text-sm text-slate-500">
              Distribution of issues by operational priority.
            </p>
          </div>

          <div className="mt-6 h-80">
            {priorityData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={priorityData}
                    dataKey="count"
                    nameKey="label"
                    cx="50%"
                    cy="50%"
                    outerRadius={105}
                    innerRadius={55}
                    paddingAngle={3}
                    label={({ name, value }) =>
                      `${formatLabel(String(name))}: ${value}`
                    }
                  >
                    {priorityData.map((item) => (
                      <Cell
                        key={item.label}
                        fill={priorityColours[item.label] ?? "#64748b"}
                      />
                    ))}
                  </Pie>

                  <Tooltip formatter={(value) => [value, "Issues"]} />

                  <Legend formatter={(value) => formatLabel(String(value))} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChartMessage />
            )}
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div>
            <h2 className="font-semibold text-slate-950">Issues by category</h2>

            <p className="mt-1 text-sm text-slate-500">
              Service areas generating the most reported issues.
            </p>
          </div>

          <div className="mt-6 h-80">
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={categoryData.map((item) => ({
                    ...item,
                    displayLabel: formatLabel(item.label),
                  }))}
                  margin={{
                    top: 10,
                    right: 10,
                    left: 0,
                    bottom: 40,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />

                  <XAxis
                    dataKey="displayLabel"
                    angle={-25}
                    textAnchor="end"
                    height={70}
                    tick={{
                      fontSize: 11,
                    }}
                  />

                  <YAxis allowDecimals={false} />

                  <Tooltip />

                  <Bar dataKey="count" fill="#7c3aed" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChartMessage />
            )}
          </div>
        </article>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div>
            <h2 className="font-semibold text-slate-950">Issues by status</h2>

            <p className="mt-1 text-sm text-slate-500">
              Current issue distribution across the workflow.
            </p>
          </div>

          <div className="mt-6 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={statusData}
                margin={{
                  top: 10,
                  right: 10,
                  left: 0,
                  bottom: 40,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />

                <XAxis
                  dataKey="status"
                  angle={-25}
                  textAnchor="end"
                  height={70}
                  tick={{
                    fontSize: 11,
                  }}
                />

                <YAxis allowDecimals={false} />

                <Tooltip />

                <Bar dataKey="count" fill="#2563eb" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="font-semibold text-slate-950">Recent issues</h2>

          <div className="mt-5 space-y-4">
            {recentIssues.map((issue) => (
              <div
                key={issue.id}
                className="border-b border-slate-100 pb-4 last:border-none"
              >
                <p className="text-sm font-semibold text-slate-900">
                  {issue.title}
                </p>

                <div className="mt-1 flex justify-between gap-3 text-xs text-slate-500">
                  <span>{issue.issueNumber}</span>

                  <span>{formatLabel(issue.status)}</span>
                </div>
              </div>
            ))}

            {recentIssues.length === 0 && (
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

function EmptyChartMessage() {
  return (
    <div className="flex h-full items-center justify-center text-sm text-slate-500">
      No chart data available.
    </div>
  );
}

function formatLabel(value: string): string {
  return value.replaceAll("_", " ");
}

function formatResolutionTime(hours: number): string {
  if (!Number.isFinite(hours) || hours <= 0) {
    return "No data";
  }

  if (hours < 1) {
    return `${Math.round(hours * 60)} min`;
  }

  if (hours < 24) {
    return `${hours.toFixed(1)} hrs`;
  }

  const days = hours / 24;

  return `${days.toFixed(1)} days`;
}
