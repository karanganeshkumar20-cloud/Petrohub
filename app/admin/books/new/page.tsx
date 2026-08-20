"use client";

import { useState } from "react";

import ImageUpload from "@/components/ImageUpload";
import PdfUpload from "@/components/PdfUpload";

type ResourceType =
  | "hosted"
  | "external";

type StatusType =
  | "Published"
  | "Draft";

type ContentType =
  | "book"
  | "manual"
  | "standard"
  | "note"
  | "download";

export default function NewBookPage() {
  const [loading, setLoading] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [form, setForm] =
    useState({
      title: "",
      author: "",
      description: "",
      category: "",

      contentType:
        "book" as ContentType,

      coverImage: "",

      resourceType:
        "hosted" as ResourceType,

      fileUrl: "",
      filePublicId: "",
      externalUrl: "",

      pages: "",
      edition: "",
      publisher: "",
      year: "",

      license: "",
      source: "PetroHub",
      sourceUrl: "",

      status:
        "Published" as StatusType,

      featured: false,
    });

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setMessage("");

    if (!form.title.trim()) {
      setMessage("Title is required");
      return;
    }

    if (!form.category) {
      setMessage(
        "Please select a category"
      );
      return;
    }

    if (
      form.resourceType ===
        "hosted" &&
      !form.fileUrl
    ) {
      setMessage(
        "Please upload a PDF"
      );
      return;
    }

    if (
      form.resourceType ===
        "external" &&
      !form.externalUrl.trim()
    ) {
      setMessage(
        "Official resource URL is required"
      );
      return;
    }

    setLoading(true);

    try {
      const response =
        await fetch("/api/books", {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body:
            JSON.stringify(form),
        });

      const data =
        await response.json();

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
            "Unable to create resource"
        );
      }

      setMessage(
        "Library resource created successfully ✅"
      );

      setForm({
        title: "",
        author: "",
        description: "",
        category: "",

        contentType: "book",

        coverImage: "",

        resourceType:
          "hosted",

        fileUrl: "",
        filePublicId: "",
        externalUrl: "",

        pages: "",
        edition: "",
        publisher: "",
        year: "",

        license: "",
        source: "PetroHub",
        sourceUrl: "",

        status: "Published",
        featured: false,
      });
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-white">
      <div className="mx-auto max-w-5xl">

        <p className="font-semibold uppercase tracking-widest text-orange-500">
          PetroHub Library
        </p>

        <h1 className="mt-3 text-4xl font-bold">
          Add Library Resource
        </h1>

        <p className="mt-3 text-slate-400">
          Add books, manuals,
          standards, notes and
          downloadable engineering
          resources.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-10 space-y-7 rounded-2xl border border-slate-800 bg-slate-900 p-6 md:p-8"
        >
          <Field
            label="Title"
            value={form.title}
            onChange={(value) =>
              setForm({
                ...form,
                title: value,
              })
            }
          />

          <Field
            label="Author"
            value={form.author}
            onChange={(value) =>
              setForm({
                ...form,
                author: value,
              })
            }
          />

          <div className="grid gap-5 md:grid-cols-2">

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-300">
                Category
              </label>

              <select
                value={
                  form.category
                }
                onChange={(event) =>
                  setForm({
                    ...form,
                    category:
                      event.target
                        .value,
                  })
                }
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3"
              >
                <option value="">
                  Select category
                </option>

                <option value="HSE">
                  HSE
                </option>

                <option value="Oil & Gas">
                  Oil & Gas
                </option>

                <option value="Mechanical">
                  Mechanical
                </option>

                <option value="Electrical">
                  Electrical
                </option>

                <option value="Instrumentation">
                  Instrumentation
                </option>

                <option value="Process">
                  Process
                </option>

                <option value="Geology">
                  Geology
                </option>

                <option value="Civil">
                  Civil
                </option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-300">
                Content Type
              </label>

              <select
                value={
                  form.contentType
                }
                onChange={(event) =>
                  setForm({
                    ...form,
                    contentType:
                      event.target
                        .value as ContentType,
                  })
                }
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3"
              >
                <option value="book">
                  Book
                </option>

                <option value="manual">
                  Manual
                </option>

                <option value="standard">
                  Standard
                </option>

                <option value="note">
                  Note
                </option>

                <option value="download">
                  Download
                </option>
              </select>
            </div>

          </div>

          <ImageUpload
            value={
              form.coverImage
            }
            onChange={(url) =>
              setForm({
                ...form,
                coverImage: url,
              })
            }
          />

          <div>
            <label className="mb-3 block text-sm font-semibold text-slate-300">
              Resource Location
            </label>

            <div className="grid gap-4 md:grid-cols-2">

              <button
                type="button"
                onClick={() =>
                  setForm({
                    ...form,
                    resourceType:
                      "hosted",
                    externalUrl: "",
                  })
                }
                className={`rounded-xl border p-5 text-left ${
                  form.resourceType ===
                  "hosted"
                    ? "border-orange-500 bg-orange-500/10"
                    : "border-slate-700 bg-slate-950"
                }`}
              >
                <p className="font-bold">
                  Hosted PDF
                </p>

                <p className="mt-2 text-sm text-slate-400">
                  PetroHub stores and
                  displays the PDF.
                </p>
              </button>

              <button
                type="button"
                onClick={() =>
                  setForm({
                    ...form,
                    resourceType:
                      "external",
                    fileUrl: "",
                    filePublicId:
                      "",
                  })
                }
                className={`rounded-xl border p-5 text-left ${
                  form.resourceType ===
                  "external"
                    ? "border-orange-500 bg-orange-500/10"
                    : "border-slate-700 bg-slate-950"
                }`}
              >
                <p className="font-bold">
                  Official External
                  Resource
                </p>

                <p className="mt-2 text-sm text-slate-400">
                  Users are sent to
                  the official source.
                </p>
              </button>

            </div>
          </div>

          {form.resourceType ===
            "hosted" && (
            <PdfUpload
              value={form.fileUrl}
              onChange={(
                url,
                publicId
              ) =>
                setForm({
                  ...form,
                  fileUrl: url,
                  filePublicId:
                    publicId,
                })
              }
            />
          )}

          {form.resourceType ===
            "external" && (
            <Field
              label="Official Resource URL"
              value={
                form.externalUrl
              }
              onChange={(value) =>
                setForm({
                  ...form,
                  externalUrl: value,
                })
              }
              placeholder="https://..."
            />
          )}

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-300">
              Description
            </label>

            <textarea
              rows={6}
              value={
                form.description
              }
              onChange={(event) =>
                setForm({
                  ...form,
                  description:
                    event.target
                      .value,
                })
              }
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3"
            />
          </div>

          <div className="grid gap-5 md:grid-cols-2">

            <Field
              label="Edition"
              value={form.edition}
              onChange={(value) =>
                setForm({
                  ...form,
                  edition: value,
                })
              }
            />

            <Field
              label="Publisher"
              value={
                form.publisher
              }
              onChange={(value) =>
                setForm({
                  ...form,
                  publisher: value,
                })
              }
            />

            <Field
              label="Pages"
              value={form.pages}
              onChange={(value) =>
                setForm({
                  ...form,
                  pages: value,
                })
              }
            />

            <Field
              label="Year"
              value={form.year}
              onChange={(value) =>
                setForm({
                  ...form,
                  year: value,
                })
              }
            />

          </div>

          <Field
            label="License / Rights"
            value={form.license}
            onChange={(value) =>
              setForm({
                ...form,
                license: value,
              })
            }
          />

          <Field
            label="Source"
            value={form.source}
            onChange={(value) =>
              setForm({
                ...form,
                source: value,
              })
            }
          />

          <Field
            label="Source URL"
            value={form.sourceUrl}
            onChange={(value) =>
              setForm({
                ...form,
                sourceUrl: value,
              })
            }
          />

          <div>
            <label className="mb-2 block text-sm font-semibold">
              Status
            </label>

            <select
              value={form.status}
              onChange={(event) =>
                setForm({
                  ...form,
                  status:
                    event.target
                      .value as StatusType,
                })
              }
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3"
            >
              <option value="Published">
                Published
              </option>

              <option value="Draft">
                Draft
              </option>
            </select>
          </div>

          <label className="flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-950 p-4">
            <input
              type="checkbox"
              checked={
                form.featured
              }
              onChange={(event) =>
                setForm({
                  ...form,
                  featured:
                    event.target
                      .checked,
                })
              }
            />

            <span className="font-semibold">
              Featured Resource
            </span>
          </label>

          {message && (
            <div className="rounded-xl border border-slate-700 bg-slate-950 p-4 text-orange-400">
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-orange-500 px-6 py-3 font-bold hover:bg-orange-600 disabled:opacity-50"
          >
            {loading
              ? "Saving..."
              : "Publish Resource"}
          </button>
        </form>
      </div>
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder = "",
}: {
  label: string;
  value: string;
  onChange: (
    value: string
  ) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-300">
        {label}
      </label>

      <input
        value={value}
        placeholder={placeholder}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3"
      />
    </div>
  );
}