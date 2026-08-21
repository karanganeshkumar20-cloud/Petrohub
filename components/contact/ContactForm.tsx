"use client";

import {
  FormEvent,
  useState,
} from "react";

export default function ContactForm() {
  const [name, setName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [subject, setSubject] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response =
        await fetch(
          "/api/contact",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              name,
              email,
              subject,
              message,
              website: "",
            }),
          }
        );

      const responseText =
        await response.text();

      let data: any;

      try {
        data =
          responseText
            ? JSON.parse(
                responseText
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
            "Unable to send message"
        );
      }

      setSuccess(
        data.message ||
          "Message sent successfully."
      );

      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to send message"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-3xl border border-slate-800 bg-slate-900 p-6 md:p-8"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label="Name"
          required
        >
          <input
            type="text"
            value={name}
            onChange={(event) =>
              setName(
                event.target.value
              )
            }
            maxLength={100}
            required
            placeholder="Your name"
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3.5 text-white outline-none placeholder:text-slate-600 focus:border-orange-500"
          />
        </Field>

        <Field
          label="Email"
          required
        >
          <input
            type="email"
            value={email}
            onChange={(event) =>
              setEmail(
                event.target.value
              )
            }
            maxLength={150}
            required
            placeholder="you@example.com"
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3.5 text-white outline-none placeholder:text-slate-600 focus:border-orange-500"
          />
        </Field>
      </div>

      <div className="mt-5">
        <Field
          label="Subject"
          required
        >
          <input
            type="text"
            value={subject}
            onChange={(event) =>
              setSubject(
                event.target.value
              )
            }
            maxLength={150}
            required
            placeholder="How can we help?"
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3.5 text-white outline-none placeholder:text-slate-600 focus:border-orange-500"
          />
        </Field>
      </div>

      <div className="mt-5">
        <Field
          label="Message"
          required
        >
          <textarea
            value={message}
            onChange={(event) =>
              setMessage(
                event.target.value
              )
            }
            required
            minLength={10}
            maxLength={5000}
            rows={7}
            placeholder="Write your message..."
            className="w-full resize-y rounded-xl border border-slate-700 bg-slate-950 px-4 py-3.5 text-white outline-none placeholder:text-slate-600 focus:border-orange-500"
          />
        </Field>
      </div>

      {/* HONEYPOT */}

      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
      />

      {error && (
        <div className="mt-5 rounded-xl border border-red-900 bg-red-950/40 p-4 text-sm text-red-300">
          {error}
        </div>
      )}

      {success && (
        <div className="mt-5 rounded-xl border border-green-800 bg-green-500/10 p-4 text-sm font-medium text-green-400">
          {success}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="mt-6 w-full rounded-xl bg-orange-500 px-6 py-4 font-bold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
      >
        {loading
          ? "Sending..."
          : "Send Message"}
      </button>
    </form>
  );
}

function Field({
  label,
  required = false,
  children,
}: {
  label: string;
  required?: boolean;
  children:
    React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-300">
        {label}

        {required && (
          <span className="ml-1 text-orange-500">
            *
          </span>
        )}
      </span>

      {children}
    </label>
  );
}