import { FileUp, Upload, X } from "lucide-react";
import { useRef, useState, type ChangeEvent, type FormEvent } from "react";

interface AttachmentUploaderProps {
  uploading: boolean;
  onUpload: (file: File) => Promise<void>;
}

const maximumFileSize = 10 * 1024 * 1024;

const acceptedFileTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
  "text/plain",
  "text/csv",
  "application/json",
  "application/zip",
];

export default function AttachmentUploader({
  uploading,
  onUpload,
}: AttachmentUploaderProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [error, setError] = useState("");

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;

    setError("");

    if (!file) {
      setSelectedFile(null);
      return;
    }

    if (file.size > maximumFileSize) {
      setError("File size must not exceed 10 MB.");
      event.target.value = "";
      return;
    }

    if (!acceptedFileTypes.includes(file.type)) {
      setError(
        "Unsupported file type. Use images, PDFs, text, CSV, JSON or ZIP files.",
      );
      event.target.value = "";
      return;
    }

    setSelectedFile(file);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedFile) {
      setError("Please select a file.");
      return;
    }

    try {
      setError("");
      await onUpload(selectedFile);
      clearSelection();
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "Unable to upload attachment.",
      );
    }
  }

  function clearSelection() {
    setSelectedFile(null);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
            <FileUp size={21} />
          </span>

          <div>
            <h3 className="font-semibold text-slate-900">Upload attachment</h3>

            <p className="mt-1 text-sm text-slate-500">
              Images, PDFs, logs, CSV, JSON or ZIP. Maximum size 10 MB.
            </p>
          </div>
        </div>

        <label className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100">
          Select file
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            accept=".jpg,.jpeg,.png,.webp,.pdf,.txt,.log,.csv,.json,.zip"
            onChange={handleFileChange}
          />
        </label>
      </div>

      {selectedFile && (
        <div className="mt-4 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900">
              {selectedFile.name}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              {formatFileSize(selectedFile.size)}
            </p>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              disabled={uploading}
              onClick={clearSelection}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 disabled:opacity-50"
            >
              <X size={15} />
              Remove
            </button>

            <button
              type="submit"
              disabled={uploading}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
            >
              <Upload size={15} />

              {uploading ? "Uploading..." : "Upload"}
            </button>
          </div>
        </div>
      )}

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
    </form>
  );
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
