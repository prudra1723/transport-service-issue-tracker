import {
  Download,
  FileArchive,
  FileImage,
  FileJson,
  FileText,
  Trash2,
} from "lucide-react";

import type { IssueAttachment } from "../../types/attachment";

interface AttachmentListProps {
  attachments: IssueAttachment[];
  downloadingId: number | null;
  deletingId: number | null;
  canDelete: boolean;
  onDownload: (attachment: IssueAttachment) => Promise<void>;
  onDelete: (attachment: IssueAttachment) => Promise<void>;
}

export default function AttachmentList({
  attachments,
  downloadingId,
  deletingId,
  canDelete,
  onDownload,
  onDelete,
}: AttachmentListProps) {
  if (attachments.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500">
        No attachments have been uploaded.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {attachments.map((attachment) => {
        const FileIcon = getFileIcon(attachment.contentType);

        return (
          <article
            key={attachment.id}
            className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                <FileIcon size={21} />
              </span>

              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-900">
                  {attachment.originalFilename}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  {formatFileSize(attachment.fileSize)} · Uploaded by{" "}
                  {attachment.uploadedByUsername} ·{" "}
                  {formatDate(attachment.uploadedAt)}
                </p>
              </div>
            </div>

            <div className="flex shrink-0 gap-2">
              <button
                type="button"
                disabled={downloadingId === attachment.id}
                onClick={() => void onDownload(attachment)}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-100 px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-200 disabled:opacity-50"
              >
                <Download size={15} />

                {downloadingId === attachment.id
                  ? "Downloading..."
                  : "Download"}
              </button>

              {canDelete && (
                <button
                  type="button"
                  disabled={deletingId === attachment.id}
                  onClick={() => void onDelete(attachment)}
                  className="inline-flex items-center gap-2 rounded-lg bg-red-100 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-200 disabled:opacity-50"
                >
                  <Trash2 size={15} />

                  {deletingId === attachment.id ? "Deleting..." : "Delete"}
                </button>
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
}

function getFileIcon(contentType: string | null) {
  if (contentType?.startsWith("image/")) {
    return FileImage;
  }

  if (contentType === "application/zip") {
    return FileArchive;
  }

  if (contentType === "application/json") {
    return FileJson;
  }

  return FileText;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-AU", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}
