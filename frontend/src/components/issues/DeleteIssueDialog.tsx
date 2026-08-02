import { AlertTriangle, Trash2, X } from "lucide-react";

interface DeleteIssueDialogProps {
  issueNumber: string;
  issueTitle: string;
  open: boolean;
  deleting: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export default function DeleteIssueDialog({
  issueNumber,
  issueTitle,
  open,
  deleting,
  onClose,
  onConfirm,
}: DeleteIssueDialogProps) {
  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-issue-title"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !deleting) {
          onClose();
        }
      }}
    >
      <section className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
        <header className="flex items-start justify-between border-b border-slate-200 px-6 py-5">
          <div className="flex items-start gap-3">
            <span className="rounded-full bg-red-100 p-2 text-red-600">
              <AlertTriangle size={20} />
            </span>

            <div>
              <p className="text-sm font-semibold text-red-600">
                {issueNumber}
              </p>

              <h2
                id="delete-issue-title"
                className="mt-1 text-xl font-bold text-slate-950"
              >
                Delete issue
              </h2>
            </div>
          </div>

          <button
            type="button"
            disabled={deleting}
            onClick={onClose}
            aria-label="Close delete dialog"
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </header>

        <div className="p-6">
          <p className="text-sm leading-6 text-slate-600">
            You are about to permanently delete:
          </p>

          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4">
            <p className="font-semibold text-slate-900">{issueTitle}</p>
          </div>

          <p className="mt-4 text-sm font-medium text-red-700">
            This action cannot be undone.
          </p>
        </div>

        <footer className="flex flex-col-reverse gap-3 border-t border-slate-200 px-6 py-5 sm:flex-row sm:justify-end">
          <button
            type="button"
            disabled={deleting}
            onClick={onClose}
            className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={deleting}
            onClick={() => void onConfirm()}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Trash2 size={17} />
            {deleting ? "Deleting..." : "Delete issue"}
          </button>
        </footer>
      </section>
    </div>
  );
}
