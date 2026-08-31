"use client";

import {
  ChangeEvent,
  useState,
} from "react";

type ImageUploadProps = {
  value: string;

  onChange:
    (url: string) => void;

  label?: string;

  signatureEndpoint?: string;

  profileMode?: boolean;
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

export default function ImageUpload({
  value,
  onChange,

  label = "Cover Image",

  signatureEndpoint =
    "/api/cloudinary/sign-image",

  profileMode = false,
}: ImageUploadProps) {
  const [
    uploading,
    setUploading,
  ] =
    useState(false);

  const [
    error,
    setError,
  ] =
    useState("");

  const [
    progressText,
    setProgressText,
  ] =
    useState("");

  async function handleFileChange(
    event:
      ChangeEvent<HTMLInputElement>
  ) {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    setUploading(true);
    setError("");
    setProgressText("");

    try {
      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
      ];

      if (
        !allowedTypes.includes(
          file.type
        )
      ) {
        throw new Error(
          "Only JPG, PNG and WEBP images are allowed"
        );
      }

      const maxSize =
        5 *
        1024 *
        1024;

      if (
        file.size >
        maxSize
      ) {
        throw new Error(
          "Image must be smaller than 5 MB"
        );
      }

      setProgressText(
        "Preparing secure upload..."
      );

      const signatureResponse =
        await fetch(
          signatureEndpoint,
          {
            method: "GET",
            cache: "no-store",
          }
        );

      const signatureText =
        await signatureResponse.text();

      let signatureData:
        SignatureResponse;

      try {
        signatureData =
          signatureText
            ? JSON.parse(
                signatureText
              )
            : {
                success: false,
              };
      } catch {
        throw new Error(
          `Unable to prepare image upload (${signatureResponse.status})`
        );
      }

      if (
        !signatureResponse.ok ||
        !signatureData.success
      ) {
        throw new Error(
          signatureData.message ||
            "Unable to prepare image upload"
        );
      }

      const {
        cloudName,
        apiKey,
        timestamp,
        folder,
        signature,
      } =
        signatureData;

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
        "Uploading image directly to Cloudinary..."
      );

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
        String(
          timestamp
        )
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
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

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

      let uploadData:
        any;

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

      if (
        !uploadResponse.ok
      ) {
        throw new Error(
          uploadData?.error
            ?.message ||
            `Cloudinary image upload failed (${uploadResponse.status})`
        );
      }

      if (
        !uploadData
          .secure_url
      ) {
        throw new Error(
          "Cloudinary upload completed but returned no image URL"
        );
      }

      onChange(
        uploadData
          .secure_url
      );

      setProgressText(
        "Image uploaded successfully."
      );
    } catch (err) {
      console.error(
        "Image upload error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Image upload failed"
      );

      setProgressText("");
    } finally {
      setUploading(false);

      event.target.value =
        "";
    }
  }

  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-300">
        {label}
      </label>

      <input
        type="file"
        accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
        onChange={
          handleFileChange
        }
        disabled={
          uploading
        }
        className="block w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-sm text-slate-300 disabled:cursor-not-allowed disabled:opacity-60"
      />

      <p className="mt-2 text-xs text-slate-500">
        JPG, PNG or WEBP.
        Maximum size: 5 MB.
      </p>

      {uploading && (
        <div className="mt-4 rounded-xl border border-orange-500/20 bg-orange-500/10 p-4">
          <p className="font-semibold text-orange-400">
            Uploading image...
          </p>

          {progressText && (
            <p className="mt-2 text-sm text-slate-400">
              {
                progressText
              }
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

      {value && (
        <div className="mt-5">
          <img
            src={value}
            alt={
              profileMode
                ? "Profile preview"
                : "Cover preview"
            }
            className={
              profileMode
                ? "h-32 w-32 rounded-full border border-slate-700 object-cover"
                : "max-h-80 w-full rounded-xl object-cover"
            }
          />

          {!uploading &&
            !error && (
              <p className="mt-2 text-sm font-medium text-green-400">
                Image uploaded
                successfully ✓
              </p>
            )}

          <button
            type="button"
            onClick={() =>
              onChange("")
            }
            disabled={
              uploading
            }
            className="mt-3 text-sm font-semibold text-red-400 hover:text-red-300 disabled:opacity-50"
          >
            Remove image
          </button>
        </div>
      )}
    </div>
  );
}