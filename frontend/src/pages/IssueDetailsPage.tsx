import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  MessageSquare,
  Pencil,
  Trash2,
  UserRound,
} from "lucide-react";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import {
  addIssueComment,
  assignIssue,
  deleteIssue,
  getIssue,
  getIssueComments,
  getIssueHistory,
  resolveIssue,
  updateIssue,
  updateIssuePriority,
  updateIssueStatus,
} from "../api/issueApi";
import { getCurrentUser } from "../auth/authStorage";
import StatusBadge from "../components/common/StatusBadge";
import DeleteIssueDialog from "../components/issues/DeleteIssueDialog";
import EditIssueDialog from "../components/issues/EditIssueDialog";
import ResolutionCard from "../components/issues/ResolutionCard";
import type {
  CommentType,
  IssueComment,
  IssuePriority,
  IssueStatus,
  ServiceIssue,
  StatusHistory,
  UpdateIssueRequest,
} from "../types/issue";

const statuses: IssueStatus[] = [
  "OPEN",
  "ASSIGNED",
  "IN_PROGRESS",
  "ON_HOLD",
  "RESOLVED",
  "CLOSED",
  "REOPENED",
];

const priorities: IssuePriority[] = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

export default function IssueDetailsPage() {
  const navigate = useNavigate();

  const { issueNumber } = useParams<{
    issueNumber: string;
  }>();

  const currentUser = getCurrentUser();
  const currentUserId = currentUser?.userId ?? null;

  const isAdmin = currentUser?.role === "ADMIN";

  const canManageIssues =
    currentUser?.role === "SUPPORT_AGENT" ||
    currentUser?.role === "MANAGER" ||
    currentUser?.role === "ADMIN";

  const availableCommentTypes: CommentType[] = canManageIssues
    ? ["COMMENT", "INTERNAL_NOTE"]
    : ["COMMENT"];

  const [issue, setIssue] = useState<ServiceIssue | null>(null);

  const [comments, setComments] = useState<IssueComment[]>([]);

  const [history, setHistory] = useState<StatusHistory[]>([]);

  const [assignedToId, setAssignedToId] = useState(1);

  const [selectedStatus, setSelectedStatus] = useState<IssueStatus>("OPEN");

  const [selectedPriority, setSelectedPriority] =
    useState<IssuePriority>("MEDIUM");

  const [statusReason, setStatusReason] = useState("");

  const [commentText, setCommentText] = useState("");

  const [commentType, setCommentType] = useState<CommentType>("COMMENT");

  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [deleting, setDeleting] = useState(false);

  const [error, setError] = useState("");

  useEffect(() => {
    if (!issueNumber) {
      return;
    }

    let cancelled = false;

    Promise.all([
      getIssue(issueNumber),
      getIssueComments(issueNumber),
      getIssueHistory(issueNumber),
    ])
      .then(([issueData, commentData, historyData]) => {
        if (cancelled) {
          return;
        }

        setIssue(issueData);
        setComments(commentData);
        setHistory(historyData);
        setSelectedStatus(issueData.status);
        setSelectedPriority(issueData.priority);
        setAssignedToId(issueData.assignedToId ?? 1);
        setError("");
      })
      .catch((requestError: unknown) => {
        if (cancelled) {
          return;
        }

        setError(
          getErrorMessage(requestError, "Unable to load issue details."),
        );
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [issueNumber]);

  async function handleEditIssue(request: UpdateIssueRequest) {
    if (!issueNumber) {
      return;
    }

    try {
      setSaving(true);
      setError("");

      const updatedIssue = await updateIssue(issueNumber, request);

      setIssue(updatedIssue);
      setSelectedPriority(updatedIssue.priority);
      setEditDialogOpen(false);
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Unable to update issue."));
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteIssue() {
    if (!issueNumber) {
      return;
    }

    if (!isAdmin) {
      setError("Only administrators can delete issues.");
      setDeleteDialogOpen(false);
      return;
    }

    try {
      setDeleting(true);
      setError("");

      await deleteIssue(issueNumber);

      navigate("/issues", {
        replace: true,
      });
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Unable to delete issue."));

      setDeleteDialogOpen(false);
    } finally {
      setDeleting(false);
    }
  }

  async function handleAssignment() {
    if (!canManageIssues) {
      setError(
        "Only support agents, managers and administrators can assign issues.",
      );
      return;
    }

    if (!issueNumber || assignedToId < 1) {
      setError("Enter a valid assigned user ID.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const updatedIssue = await assignIssue(issueNumber, assignedToId);

      setIssue(updatedIssue);
      setSelectedStatus(updatedIssue.status);
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Unable to assign issue."));
    } finally {
      setSaving(false);
    }
  }

  async function handlePriorityUpdate() {
    if (!canManageIssues) {
      setError(
        "Only support agents, managers and administrators can update priority.",
      );
      return;
    }

    if (!issueNumber) {
      return;
    }

    try {
      setSaving(true);
      setError("");

      const updatedIssue = await updateIssuePriority(
        issueNumber,
        selectedPriority,
      );

      setIssue(updatedIssue);
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Unable to update priority."));
    } finally {
      setSaving(false);
    }
  }

  async function handleStatusUpdate() {
    if (!issueNumber) {
      return;
    }

    if (!currentUserId) {
      setError(
        "Your session does not contain a valid user ID. Please log out and log in again.",
      );
      return;
    }

    if (!canManageIssues) {
      setError(
        "Only support agents, managers and administrators can update status.",
      );
      return;
    }

    try {
      setSaving(true);
      setError("");

      const updatedIssue = await updateIssueStatus(issueNumber, {
        status: selectedStatus,
        reason: statusReason.trim(),
        changedById: currentUserId,
      });

      const updatedHistory = await getIssueHistory(issueNumber);

      setIssue(updatedIssue);
      setHistory(updatedHistory);
      setStatusReason("");
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Unable to update status."));
    } finally {
      setSaving(false);
    }
  }

  async function handleResolveIssue(resolutionNotes: string) {
    if (!issueNumber) {
      return;
    }

    if (!currentUserId) {
      setError(
        "Your session does not contain a valid user ID. Please log out and log in again.",
      );
      return;
    }

    if (!canManageIssues) {
      setError(
        "Only support agents, managers and administrators can resolve issues.",
      );
      return;
    }

    try {
      setSaving(true);
      setError("");

      const updatedIssue = await resolveIssue(issueNumber, {
        resolutionNotes,
        resolvedById: currentUserId,
      });

      const [updatedComments, updatedHistory] = await Promise.all([
        getIssueComments(issueNumber),
        getIssueHistory(issueNumber),
      ]);

      setIssue(updatedIssue);
      setSelectedStatus(updatedIssue.status);
      setComments(updatedComments);
      setHistory(updatedHistory);
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Unable to resolve issue."));
    } finally {
      setSaving(false);
    }
  }

  async function handleAddComment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!currentUserId) {
      setError(
        "Your session does not contain a valid user ID. Please log out and log in again.",
      );
      return;
    }

    if (!issueNumber || !commentText.trim()) {
      return;
    }

    try {
      setSaving(true);
      setError("");

      const newComment = await addIssueComment(issueNumber, {
        commentText: commentText.trim(),
        commentType,
        authorId: currentUserId,
      });

      setComments((current) => [...current, newComment]);

      setCommentText("");
      setCommentType("COMMENT");
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Unable to add comment."));
    } finally {
      setSaving(false);
    }
  }

  if (!issueNumber) {
    return <ErrorPanel message="Issue number was not provided." />;
  }

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        Loading issue details...
      </div>
    );
  }

  if (!issue) {
    return <ErrorPanel message={error || "Issue was not found."} />;
  }

  return (
    <section className="space-y-6">
      <Link
        to="/issues"
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-blue-600"
      >
        <ArrowLeft size={18} />
        Back to issues
      </Link>

      {error && <ErrorPanel message={error} />}

      <header className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-semibold text-blue-600">
              {issue.issueNumber}
            </span>

            <StatusBadge status={issue.status} />
          </div>

          <h1 className="mt-3 text-3xl font-bold text-slate-950">
            {issue.title}
          </h1>

          <p className="mt-3 max-w-3xl whitespace-pre-wrap leading-7 text-slate-600">
            {issue.description}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="rounded-xl bg-slate-100 px-4 py-3 text-sm">
            <span className="text-slate-500">Priority: </span>

            <span className="font-bold text-slate-900">{issue.priority}</span>
          </div>

          <button
            type="button"
            disabled={saving || deleting || issue.status === "CLOSED"}
            onClick={() => setEditDialogOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-blue-300 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Pencil size={17} />
            Edit issue
          </button>

          {isAdmin && (
            <button
              type="button"
              disabled={saving || deleting}
              onClick={() => setDeleteDialogOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Trash2 size={17} />
              Delete
            </button>
          )}
        </div>
      </header>

      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <main className="space-y-6">
          <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-950">
              Issue information
            </h2>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <DetailItem
                icon={<Calendar size={18} />}
                label="Created"
                value={formatDate(issue.createdAt)}
              />

              <DetailItem
                icon={<UserRound size={18} />}
                label="Reporter"
                value={
                  issue.reportedByName ??
                  issue.reportedByUsername ??
                  `User ${issue.reportedById}`
                }
              />

              <DetailItem
                icon={<UserRound size={18} />}
                label="Assigned user"
                value={
                  issue.assignedToName ??
                  issue.assignedToUsername ??
                  (issue.assignedToId
                    ? `User ${issue.assignedToId}`
                    : "Unassigned")
                }
              />

              <DetailItem
                icon={<CheckCircle2 size={18} />}
                label="Category"
                value={formatLabel(issue.category)}
              />

              <DetailItem
                icon={<Calendar size={18} />}
                label="Last updated"
                value={formatDate(issue.updatedAt)}
              />

              <DetailItem
                icon={<CheckCircle2 size={18} />}
                label="Current status"
                value={formatLabel(issue.status)}
              />
            </div>

            {issue.resolutionNotes && (
              <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                <p className="text-sm font-semibold text-emerald-800">
                  Resolution
                </p>

                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-emerald-700">
                  {issue.resolutionNotes}
                </p>
              </div>
            )}
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2">
              <MessageSquare size={20} />

              <h2 className="text-lg font-semibold text-slate-950">Comments</h2>
            </div>

            <div className="mt-6 space-y-4">
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  className="rounded-xl border border-slate-200 p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900">
                        {comment.authorName ??
                          comment.authorUsername ??
                          `User ${comment.authorId}`}
                      </span>

                      <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
                        {formatLabel(comment.commentType)}
                      </span>
                    </div>

                    <span className="text-xs text-slate-400">
                      {formatDate(comment.createdAt)}
                    </span>
                  </div>

                  <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                    {comment.commentText}
                  </p>
                </div>
              ))}

              {comments.length === 0 && (
                <p className="text-sm text-slate-500">
                  No comments have been added.
                </p>
              )}
            </div>

            <form
              onSubmit={handleAddComment}
              className="mt-6 border-t border-slate-100 pt-6"
            >
              <div className="grid gap-4 md:grid-cols-[1fr_200px]">
                <textarea
                  required
                  rows={4}
                  maxLength={5000}
                  value={commentText}
                  onChange={(event) => setCommentText(event.target.value)}
                  placeholder="Add a comment or internal note..."
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />

                <select
                  value={commentType}
                  onChange={(event) =>
                    setCommentType(event.target.value as CommentType)
                  }
                  className="h-fit rounded-xl border border-slate-300 bg-white px-4 py-3"
                >
                  {availableCommentTypes.map((type) => (
                    <option key={type} value={type}>
                      {formatLabel(type)}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={
                  saving || deleting || !currentUserId || !commentText.trim()
                }
                className="mt-4 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? "Saving..." : "Add comment"}
              </button>
            </form>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-950">
              Status history
            </h2>

            <div className="mt-6 space-y-5">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="relative border-l-2 border-blue-200 pl-5"
                >
                  <span className="absolute -left-[7px] top-1 h-3 w-3 rounded-full bg-blue-600" />

                  <p className="text-sm font-semibold text-slate-900">
                    {item.previousStatus
                      ? formatLabel(item.previousStatus)
                      : "Created"}

                    {" → "}

                    {formatLabel(item.newStatus)}
                  </p>

                  {item.reason && (
                    <p className="mt-1 text-sm text-slate-600">{item.reason}</p>
                  )}

                  <p className="mt-1 text-xs text-slate-400">
                    Changed by{" "}
                    {item.changedByName ??
                      item.changedByUsername ??
                      `user ${item.changedById}`}
                    {" · "}
                    {formatDate(item.changedAt)}
                  </p>
                </div>
              ))}

              {history.length === 0 && (
                <p className="text-sm text-slate-500">
                  No status changes recorded.
                </p>
              )}
            </div>
          </article>
        </main>

        <aside className="space-y-6">
          {canManageIssues ? (
            <>
              <ControlCard title="Assign issue">
                <label
                  htmlFor="assigned-user-id"
                  className="text-sm font-medium text-slate-600"
                >
                  Assigned user ID
                </label>

                <input
                  id="assigned-user-id"
                  type="number"
                  min={1}
                  value={assignedToId}
                  onChange={(event) =>
                    setAssignedToId(Number(event.target.value))
                  }
                  className="w-full rounded-xl border border-slate-300 px-4 py-3"
                />

                <ActionButton
                  disabled={saving || deleting || issue.status === "CLOSED"}
                  onClick={handleAssignment}
                >
                  Assign user
                </ActionButton>
              </ControlCard>

              <ControlCard title="Update priority">
                <select
                  value={selectedPriority}
                  onChange={(event) =>
                    setSelectedPriority(event.target.value as IssuePriority)
                  }
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3"
                >
                  {priorities.map((priority) => (
                    <option key={priority} value={priority}>
                      {priority}
                    </option>
                  ))}
                </select>

                <ActionButton
                  disabled={saving || deleting || issue.status === "CLOSED"}
                  onClick={handlePriorityUpdate}
                >
                  Save priority
                </ActionButton>
              </ControlCard>

              <ControlCard title="Update status">
                <select
                  value={selectedStatus}
                  onChange={(event) =>
                    setSelectedStatus(event.target.value as IssueStatus)
                  }
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3"
                >
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {formatLabel(status)}
                    </option>
                  ))}
                </select>

                <textarea
                  rows={3}
                  maxLength={500}
                  value={statusReason}
                  onChange={(event) => setStatusReason(event.target.value)}
                  placeholder="Reason for status change"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3"
                />

                <ActionButton
                  disabled={
                    saving ||
                    deleting ||
                    !currentUserId ||
                    selectedStatus === issue.status
                  }
                  onClick={handleStatusUpdate}
                >
                  Update status
                </ActionButton>
              </ControlCard>

              <ResolutionCard
                disabled={saving || deleting || issue.status === "CLOSED"}
                resolved={
                  issue.status === "RESOLVED" || Boolean(issue.resolutionNotes)
                }
                resolutionNotes={issue.resolutionNotes}
                onResolve={handleResolveIssue}
              />
            </>
          ) : (
            <article className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-600 shadow-sm">
              You have read-only access to issue assignment, priority, status
              and resolution controls.
            </article>
          )}
        </aside>
      </div>

      {editDialogOpen && (
        <EditIssueDialog
          key={`${issue.id}-${issue.updatedAt}`}
          issue={issue}
          open
          saving={saving}
          onClose={() => setEditDialogOpen(false)}
          onSave={handleEditIssue}
        />
      )}

      {isAdmin && deleteDialogOpen && (
        <DeleteIssueDialog
          issueNumber={issue.issueNumber}
          issueTitle={issue.title}
          open
          deleting={deleting}
          onClose={() => setDeleteDialogOpen(false)}
          onConfirm={handleDeleteIssue}
        />
      )}
    </section>
  );
}

interface DetailItemProps {
  icon: ReactNode;
  label: string;
  value: string;
}

function DetailItem({ icon, label, value }: DetailItemProps) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 text-blue-600">{icon}</span>

      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
          {label}
        </p>

        <p className="mt-1 text-sm font-semibold text-slate-800">{value}</p>
      </div>
    </div>
  );
}

interface ControlCardProps {
  title: string;
  children: ReactNode;
}

function ControlCard({ title, children }: ControlCardProps) {
  return (
    <article className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="font-semibold text-slate-950">{title}</h2>

      {children}
    </article>
  );
}

interface ActionButtonProps {
  children: ReactNode;
  disabled: boolean;
  onClick: () => void;
}

function ActionButton({ children, disabled, onClick }: ActionButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {children}
    </button>
  );
}

function ErrorPanel({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">
      {message}
    </div>
  );
}

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

function formatLabel(value: string): string {
  return value.replaceAll("_", " ");
}

function formatDate(value: string): string {
  return new Date(value).toLocaleString("en-AU", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}
