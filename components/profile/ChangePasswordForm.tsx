"use client";

import {
  FormEvent,
  useState,
} from "react";

export default function ChangePasswordForm() {
  const [
    currentPassword,
    setCurrentPassword,
  ] =
    useState("");

  const [
    newPassword,
    setNewPassword,
  ] =
    useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] =
    useState("");

  const [
    showPasswords,
    setShowPasswords,
  ] =
    useState(false);

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

    setError("");
    setSuccess("");

    if (
      newPassword !==
      confirmPassword
    ) {
      setError(
        "New passwords do not match."
      );

      return;
    }

    if (
      newPassword.length <
      8
    ) {
      setError(
        "New password must be at least 8 characters."
      );

      return;
    }

    setSaving(true);

    try {
      const response =
        await fetch(
          "/api/profile/password",
          {
            method:
              "PATCH",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                currentPassword,
                newPassword,
                confirmPassword,
              }),
          }
        );

      const text =
        await response.text();

      let data: {
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
            "Unable to change password"
        );
      }

      setSuccess(
        "Password changed successfully."
      );

      setCurrentPassword(
        ""
      );

      setNewPassword(
        ""
      );

      setConfirmPassword(
        ""
      );
    } catch (error) {
      setError(
        error instanceof
          Error
          ? error.message
          : "Unable to change password"
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6 md:p-8">

      <p className="font-semibold uppercase tracking-[0.2em] text-orange-500">
        Security
      </p>

      <h2 className="mt-3 text-2xl font-bold">
        Change Password
      </h2>

      <p className="mt-3 max-w-2xl text-slate-400">
        Use a strong password
        that you do not use on
        other websites.
      </p>

      <form
        onSubmit={
          handleSubmit
        }
        className="mt-8 max-w-2xl space-y-6"
      >

        {/* CURRENT PASSWORD */}

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-300">
            Current Password
          </label>

          <input
            type={
              showPasswords
                ? "text"
                : "password"
            }
            value={
              currentPassword
            }
            onChange={(
              event
            ) =>
              setCurrentPassword(
                event.target.value
              )
            }
            required
            autoComplete="current-password"
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-orange-500"
          />
        </div>

        {/* NEW PASSWORD */}

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-300">
            New Password
          </label>

          <input
            type={
              showPasswords
                ? "text"
                : "password"
            }
            value={
              newPassword
            }
            onChange={(
              event
            ) =>
              setNewPassword(
                event.target.value
              )
            }
            required
            minLength={8}
            maxLength={128}
            autoComplete="new-password"
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-orange-500"
          />

          <p className="mt-2 text-xs text-slate-500">
            Minimum 8
            characters.
          </p>
        </div>

        {/* CONFIRM */}

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-300">
            Confirm New
            Password
          </label>

          <input
            type={
              showPasswords
                ? "text"
                : "password"
            }
            value={
              confirmPassword
            }
            onChange={(
              event
            ) =>
              setConfirmPassword(
                event.target.value
              )
            }
            required
            minLength={8}
            maxLength={128}
            autoComplete="new-password"
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-orange-500"
          />
        </div>

        {/* SHOW PASSWORD */}

        <label className="flex cursor-pointer items-center gap-3 text-sm text-slate-400">

          <input
            type="checkbox"
            checked={
              showPasswords
            }
            onChange={(
              event
            ) =>
              setShowPasswords(
                event.target.checked
              )
            }
            className="h-4 w-4 accent-orange-500"
          />

          Show passwords
        </label>

        {/* ERROR */}

        {error && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-red-300">
            {error}
          </div>
        )}

        {/* SUCCESS */}

        {success && (
          <div className="rounded-xl border border-green-500/20 bg-green-500/10 p-4 text-green-400">
            {success}
          </div>
        )}

        {/* SUBMIT */}

        <button
          type="submit"
          disabled={
            saving
          }
          className="rounded-xl bg-orange-500 px-6 py-3 font-bold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving
            ? "Changing Password..."
            : "Change Password"}
        </button>
      </form>
    </section>
  );
}