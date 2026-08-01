import type { IssueStatus } from "../../types/issue";

interface StatusBadgeProps {
  status: IssueStatus;
}

const statusClasses: Record<IssueStatus, string> = {
  OPEN: "bg-blue-100 text-blue-700",
  ASSIGNED: "bg-purple-100 text-purple-700",
  IN_PROGRESS: "bg-amber-100 text-amber-700",
  RESOLVED: "bg-emerald-100 text-emerald-700",
  CLOSED: "bg-slate-200 text-slate-700",
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={[
        "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
        statusClasses[status] ?? "bg-slate-100 text-slate-700",
      ].join(" ")}
    >
      {status.replaceAll("_", " ")}
    </span>
  );
}
