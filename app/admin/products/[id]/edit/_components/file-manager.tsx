"use client";

import { useRouter } from "next/navigation";
import { useCallback, useRef, useState, useTransition } from "react";
import type { ProductFile } from "@/lib/db/schema";

type UploadItem = {
  id: string;
  file: File;
  progress: number; // 0..100
  status: "queued" | "uploading" | "done" | "error";
  error?: string;
};

export function FileManager({
  productId,
  files,
}: {
  productId: number;
  files: ProductFile[];
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploads, setUploads] = useState<UploadItem[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [, startTransition] = useTransition();

  const beginUpload = useCallback(
    async (file: File) => {
      const id = crypto.randomUUID();
      setUploads((u) => [
        ...u,
        { id, file, progress: 0, status: "queued" },
      ]);

      try {
        // 1. Ask the server for a presigned PUT URL.
        const presignRes = await fetch("/api/admin/upload/presign", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            productId,
            filename: file.name,
            fileSize: file.size,
            contentType: file.type || "application/octet-stream",
          }),
        });
        if (!presignRes.ok) {
          const { error } = await presignRes.json().catch(() => ({
            error: `Server responded ${presignRes.status}`,
          }));
          throw new Error(error || "Failed to presign");
        }
        const { uploadUrl, storageKey } = (await presignRes.json()) as {
          uploadUrl: string;
          storageKey: string;
        };

        // 2. Upload directly to R2 via XHR (so we get progress events).
        setUploads((u) =>
          u.map((it) =>
            it.id === id ? { ...it, status: "uploading" } : it,
          ),
        );

        await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open("PUT", uploadUrl);
          xhr.setRequestHeader(
            "Content-Type",
            file.type || "application/octet-stream",
          );
          xhr.upload.onprogress = (evt) => {
            if (!evt.lengthComputable) return;
            const pct = Math.round((evt.loaded / evt.total) * 100);
            setUploads((u) =>
              u.map((it) =>
                it.id === id ? { ...it, progress: pct } : it,
              ),
            );
          };
          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) resolve();
            else
              reject(
                new Error(
                  `R2 upload failed (${xhr.status}). Check the bucket's CORS configuration.`,
                ),
              );
          };
          xhr.onerror = () =>
            reject(
              new Error(
                "Network error during upload. If this is local dev against a real R2 bucket, confirm CORS allows your origin.",
              ),
            );
          xhr.send(file);
        });

        // 3. Tell the server to record the upload.
        const finRes = await fetch("/api/admin/upload/finalize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            productId,
            storageKey,
            originalFilename: file.name,
            fileSize: file.size,
          }),
        });
        if (!finRes.ok) {
          const { error } = await finRes.json().catch(() => ({
            error: `Server responded ${finRes.status}`,
          }));
          throw new Error(error || "Failed to finalize");
        }

        setUploads((u) =>
          u.map((it) =>
            it.id === id ? { ...it, status: "done", progress: 100 } : it,
          ),
        );
        startTransition(() => router.refresh());
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        setUploads((u) =>
          u.map((it) =>
            it.id === id ? { ...it, status: "error", error: msg } : it,
          ),
        );
      }
    },
    [productId, router],
  );

  const handleFiles = useCallback(
    (list: FileList | null) => {
      if (!list || list.length === 0) return;
      for (const f of Array.from(list)) void beginUpload(f);
    },
    [beginUpload],
  );

  const onDelete = useCallback(
    async (id: number) => {
      if (!confirm("Delete this file from storage? This cannot be undone."))
        return;
      const res = await fetch(`/api/admin/files/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const { error } = await res.json().catch(() => ({
          error: `Server responded ${res.status}`,
        }));
        alert(`Delete failed: ${error || "unknown error"}`);
        return;
      }
      startTransition(() => router.refresh());
    },
    [router],
  );

  return (
    <section className="space-y-5">
      <div>
        <h2 className="font-bold text-midnight-900 text-lg">Files</h2>
        <p className="text-sm text-steel-600">
          Upload the tuning file(s) for this product. Stored privately in R2
          and only handed out via short-lived signed URLs after payment.
        </p>
      </div>

      {/* Drop zone */}
      <label
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFiles(e.dataTransfer.files);
        }}
        className={
          "block cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-colors " +
          (dragOver
            ? "border-blaze-500 bg-blaze-50"
            : "border-steel-300 bg-paper-50 hover:border-steel-400 hover:bg-paper-100")
        }
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          className="sr-only"
          onChange={(e) => {
            handleFiles(e.target.files);
            e.target.value = ""; // allow re-selecting the same file
          }}
        />
        <div className="font-bold text-midnight-900 text-base">
          Drop files here, or{" "}
          <span className="text-blaze-600 underline">click to browse</span>
        </div>
        <div className="mt-1 text-xs text-steel-500">
          Up to 200MB per file.
        </div>
      </label>

      {/* Active uploads */}
      {uploads.length > 0 ? (
        <ul className="space-y-2">
          {uploads.map((up) => (
            <li
              key={up.id}
              className="card p-4 flex items-center gap-4"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3 mb-1.5">
                  <div className="font-semibold text-midnight-900 text-sm truncate">
                    {up.file.name}
                  </div>
                  <div className="text-xs font-bold text-steel-600 shrink-0 tabular-nums">
                    {up.status === "error" ? (
                      <span className="text-danger">Failed</span>
                    ) : up.status === "done" ? (
                      <span className="text-success">Uploaded</span>
                    ) : (
                      `${up.progress}%`
                    )}
                  </div>
                </div>
                <div className="h-1.5 rounded-full bg-steel-200 overflow-hidden">
                  <div
                    className={
                      up.status === "error"
                        ? "h-full bg-danger transition-all"
                        : up.status === "done"
                          ? "h-full bg-success transition-all"
                          : "h-full bg-blaze-500 transition-all"
                    }
                    style={{ width: `${up.progress}%` }}
                  />
                </div>
                {up.error ? (
                  <div className="mt-1.5 text-xs text-danger break-words">
                    {up.error}
                  </div>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      ) : null}

      {/* Existing files */}
      <div>
        <h3 className="text-xs uppercase tracking-wider font-bold text-steel-500 mb-2">
          Stored files
        </h3>
        {files.length === 0 ? (
          <div className="card p-5 text-center text-sm text-steel-600">
            No files uploaded yet.
          </div>
        ) : (
          <ul className="space-y-2">
            {files.map((f) => (
              <li
                key={f.id}
                className="card p-4 flex items-center gap-4 flex-wrap"
              >
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-midnight-900 text-sm break-all">
                    {f.originalFilename || f.storageKey}
                  </div>
                  <div className="mt-0.5 text-xs text-steel-500 flex flex-wrap gap-x-3">
                    <span>v{f.version}</span>
                    <span>{formatBytes(f.fileSize)}</span>
                    <span>uploaded {fmtRelative(f.uploadedAt)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <a
                    href={`/api/admin/files/${f.id}/download`}
                    className="text-sm font-semibold text-blaze-600 hover:text-blaze-700"
                  >
                    Download
                  </a>
                  <button
                    type="button"
                    onClick={() => onDelete(f.id)}
                    className="text-sm font-semibold text-danger hover:text-red-700"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}

function fmtRelative(d: Date | number): string {
  const date = d instanceof Date ? d : new Date(d * 1000);
  const sec = Math.round((Date.now() - date.getTime()) / 1000);
  if (sec < 60) return "just now";
  const min = Math.round(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.round(min / 60);
  if (hr < 48) return `${hr}h ago`;
  const day = Math.round(hr / 24);
  return `${day}d ago`;
}
