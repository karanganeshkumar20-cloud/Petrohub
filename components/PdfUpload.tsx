"use client";

import {
  ChangeEvent,
  useState,
} from "react";

type PdfUploadProps = {
  value: string;

  onChange: (
    url: string,
    publicId: string
  ) => void;
};

export default function PdfUpload({
  value,
  onChange,
}: PdfUploadProps) {
  const [uploading, setUploading] =
    useState(false);

  const [error, setError] =
    useState("");

  async function handleUpload(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file =
      event.target.files?.[0];

    if (!file) return;

    setUploading(true);
    setError("");

    try {
      const formData =
        new FormData();

      formData.append(
        "file",
        file
      );

      const response =
        await fetch(
          "/api/upload/pdf",
          {
            method: "POST",
            body: formData,
          }
        );

      const data =
        await response.json();

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
            "PDF upload failed"
        );
      }

      onChange(
        data.url,
        data.publicId
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Upload failed"
      );
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-300">
        PDF File
      </label>

      <input
        type="file"
        accept="application/pdf"
        onChange={handleUpload}
        disabled={uploading}
        className="block w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-sm text-slate-300"
      />

      {uploading && (
        <p className="mt-3 text-sm text-orange-400">
          Uploading PDF...
        </p>
      )}

      {error && (
        <p className="mt-3 text-sm text-red-400">
          {error}
        </p>
      )}

      {value && (
        <div className="mt-4 rounded-xl border border-green-800 bg-green-500/10 p-4 text-sm text-green-400">
          PDF uploaded successfully.
        </div>
      )}
    </div>
  );
}