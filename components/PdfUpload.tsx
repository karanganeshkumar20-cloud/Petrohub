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

type SignatureResponse = {
  success: boolean;

  message?: string;

  cloudName?: string;

  apiKey?: string;

  timestamp?: number;

  folder?: string;

  signature?: string;
};

export default function PdfUpload({
  value,
  onChange,
}: PdfUploadProps) {
  const [uploading, setUploading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [progressText, setProgressText] =
    useState("");

  async function handleUpload(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    setError("");
    setProgressText("");

    if (
      file.type !== "application/pdf" &&
      !file.name
        .toLowerCase()
        .endsWith(".pdf")
    ) {
      setError(
        "Only PDF files are allowed"
      );

      event.target.value = "";

      return;
    }

    const maxSize =
      25 * 1024 * 1024;

    if (file.size > maxSize) {
      setError(
        "PDF must be smaller than 25 MB"
      );

      event.target.value = "";

      return;
    }

    setUploading(true);

    try {
      setProgressText(
        "Preparing secure upload..."
      );

      /*
       * Get signed parameters
       * from PetroHub server.
       *
       * API secret never goes
       * to the browser.
       */

      const signatureResponse =
        await fetch(
          "/api/cloudinary/sign-pdf",
          {
            method: "GET",
            cache: "no-store",
          }
        );

      const signatureData: SignatureResponse =
        await signatureResponse.json();

      if (
        !signatureResponse.ok ||
        !signatureData.success
      ) {
        throw new Error(
          signatureData.message ||
            "Unable to prepare PDF upload"
        );
      }

      const {
        cloudName,
        apiKey,
        timestamp,
        folder,
        signature,
      } = signatureData;

      if (
        !cloudName ||
        !apiKey ||
        !timestamp ||
        !folder ||
        !signature
      ) {
        throw new Error(
          "Cloudinary upload configuration is incomplete"
        );
      }

      setProgressText(
        "Uploading PDF directly to Cloudinary..."
      );

      /*
       * IMPORTANT:
       *
       * The PDF now goes directly
       * from browser → Cloudinary.
       *
       * It DOES NOT travel through
       * a Vercel Function.
       */

      const formData =
        new FormData();

      formData.append(
        "file",
        file
      );

      formData.append(
        "api_key",
        apiKey
      );

      formData.append(
        "timestamp",
        String(timestamp)
      );

      formData.append(
        "folder",
        folder
      );

      formData.append(
        "signature",
        signature
      );

      const cloudinaryUrl =
        `https://api.cloudinary.com/v1_1/${cloudName}/raw/upload`;

      const uploadResponse =
        await fetch(
          cloudinaryUrl,
          {
            method: "POST",
            body: formData,
          }
        );

      const responseText =
        await uploadResponse.text();

      let uploadData: any;

      try {
        uploadData =
          responseText
            ? JSON.parse(
                responseText
              )
            : {};
      } catch {
        throw new Error(
          `Cloudinary returned an invalid response (${uploadResponse.status})`
        );
      }

      if (!uploadResponse.ok) {
        throw new Error(
          uploadData?.error
            ?.message ||
            `Cloudinary upload failed (${uploadResponse.status})`
        );
      }

      if (
        !uploadData.secure_url ||
        !uploadData.public_id
      ) {
        throw new Error(
          "Cloudinary upload completed but returned no PDF URL"
        );
      }

      onChange(
        uploadData.secure_url,
        uploadData.public_id
      );

      setProgressText(
        "PDF uploaded successfully."
      );
    } catch (error) {
      console.error(
        "PDF upload error:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "PDF upload failed"
      );

      setProgressText("");
    } finally {
      setUploading(false);

      event.target.value = "";
    }
  }

  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-300">
        PDF File
      </label>

      <input
        type="file"
        accept=".pdf,application/pdf"
        onChange={handleUpload}
        disabled={uploading}
        className="block w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-sm text-slate-300 disabled:cursor-not-allowed disabled:opacity-60"
      />

      <p className="mt-2 text-xs text-slate-500">
        PDF only. Maximum PetroHub
        upload size: 25 MB.
      </p>

      {uploading && (
        <div className="mt-4 rounded-xl border border-orange-500/20 bg-orange-500/10 p-4">
          <p className="font-semibold text-orange-400">
            Uploading PDF...
          </p>

          {progressText && (
            <p className="mt-2 text-sm text-slate-400">
              {progressText}
            </p>
          )}
        </div>
      )}

      {error && (
        <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 p-4">
          <p className="font-semibold text-red-400">
            Upload failed
          </p>

          <p className="mt-2 text-sm text-red-300">
            {error}
          </p>
        </div>
      )}

      {value &&
        !uploading &&
        !error && (
          <div className="mt-4 rounded-xl border border-green-800 bg-green-500/10 p-4">
            <p className="font-semibold text-green-400">
              PDF uploaded
              successfully ✓
            </p>
          </div>
        )}
    </div>
  );
}