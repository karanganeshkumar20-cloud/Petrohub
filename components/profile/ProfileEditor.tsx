"use client";

import {
  FormEvent,
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

import ImageUpload from "@/components/ImageUpload";

type Props = {
  initialName: string;
  email: string;
  initialImage: string;
};

export default function ProfileEditor({
  initialName,
  email,
  initialImage,
}: Props) {
  const router =
    useRouter();

  const [
    name,
    setName,
  ] =
    useState(
      initialName
    );

  const [
    image,
    setImage,
  ] =
    useState(
      initialImage
    );

  const [
    saving,
    setSaving,
  ] =
    useState(false);

  const [
    error,
    setError,
  ] =
    useState("");

  const [
    success,
    setSuccess,
  ] =
    useState("");

  async function handleSubmit(
    event:
      FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response =
        await fetch(
          "/api/profile",
          {
            method: "PATCH",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                name,
                image,
              }),
          }
        );

      const text =
        await response.text();

      let data:
        {
          success?: boolean;
          message?: string;
        } = {};

      try {
        data =
          text
            ? JSON.parse(
                text
              )
            : {};
      } catch {
        throw new Error(
          `Invalid server response (${response.status})`
        );
      }

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
            "Unable to update profile"
        );
      }

      setSuccess(
        "Profile updated successfully."
      );

      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to update profile"
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="mt-14 rounded-2xl border border-slate-800 bg-slate-900 p-6 md:p-8">
      <p className="font-semibold uppercase tracking-[0.2em] text-orange-500">
        Account Settings
      </p>

      <h2 className="mt-3 text-2xl font-bold">
        Edit Profile
      </h2>

      <p className="mt-3 text-slate-400">
        Update your PetroHub
        display name and profile
        photo.
      </p>

      <form
        onSubmit={
          handleSubmit
        }
        className="mt-8 grid gap-8 lg:grid-cols-2"
      >
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-300">
            Display Name
          </label>

          <input
            type="text"
            value={name}
            onChange={(
              event
            ) =>
              setName(
                event.target
                  .value
              )
            }
            required
            minLength={2}
            maxLength={100}
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-orange-500"
          />

          <label className="mb-2 mt-6 block text-sm font-semibold text-slate-300">
            Email Address
          </label>

          <input
            type="email"
            value={email}
            disabled
            className="w-full cursor-not-allowed rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-slate-500"
          />

          <p className="mt-2 text-xs text-slate-500">
            Email change is not
            enabled yet.
          </p>
        </div>

        <div>
          <ImageUpload
            value={image}
            onChange={
              setImage
            }
            label="Profile Photo"
            signatureEndpoint="/api/cloudinary/sign-profile-image"
            profileMode
          />
        </div>

        <div className="lg:col-span-2">
          {error && (
            <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-red-300">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 rounded-xl border border-green-500/20 bg-green-500/10 p-4 text-green-400">
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={
              saving
            }
            className="rounded-xl bg-orange-500 px-6 py-3 font-bold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving
              ? "Saving..."
              : "Save Changes"}
          </button>
        </div>
      </form>
    </section>
  );
}