"use client";

import { ChangeEvent, useState } from "react";

type ImageUploadProps = {
  value: string;
  onChange: (url: string) => void;
};

export default function ImageUpload({
  value,
  onChange,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleFileChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    setUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to upload image"
        );
      }

      onChange(data.url);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Image upload failed"
      );
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-300">
        Cover Image
      </label>

      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        disabled={uploading}
        className="block w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-sm text-slate-300"
      />

      {uploading && (
        <p className="mt-3 text-sm text-orange-400">
          Uploading image...
        </p>
      )}

      {error && (
        <p className="mt-3 text-sm text-red-400">
          {error}
        </p>
      )}

      {value && (
        <div className="mt-5">
          <img
            src={value}
            alt="Article cover preview"
            className="max-h-80 w-full rounded-xl object-cover"
          />

          <button
            type="button"
            onClick={() => onChange("")}
            className="mt-3 text-sm font-semibold text-red-400 hover:text-red-300"
          >
            Remove image
          </button>
        </div>
      )}
    </div>
  );
}