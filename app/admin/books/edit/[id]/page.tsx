"use client";

import { useEffect, useState } from "react";
import {
  useParams,
  useRouter,
} from "next/navigation";

import ImageUpload from "@/components/ImageUpload";
import PdfUpload from "@/components/PdfUpload";

export default function EditBookPage() {
  const params = useParams();
  const router = useRouter();

  const id = params.id as string;

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [form, setForm] = useState({
    title: "",
    author: "",
    description: "",
    category: "",
    coverImage: "",

    resourceType: "hosted",

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

  useEffect(() => {
    async function loadBook() {
      try {
        const response = await fetch(
          `/api/books/${id}`
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || "Unable to load resource"
          );
        }

        const book = data.book;

        setForm({
          title: book.title || "",
          author: book.author || "",
          description: book.description || "",
          category: book.category || "",
          coverImage: book.coverImage || "",

          resourceType:
            book.resourceType || "hosted",

          fileUrl: book.fileUrl || "",
          filePublicId:
            book.filePublicId || "",
          externalUrl:
            book.externalUrl || "",

          pages:
            book.pages?.toString() || "",
          edition: book.edition || "",
          publisher:
            book.publisher || "",
          year:
            book.year?.toString() || "",
          license: book.license || "",
          source:
            book.source || "PetroHub",
          sourceUrl:
            book.sourceUrl || "",
          status:
            book.status || "Published",
          featured:
            Boolean(book.featured),
        });
      } catch (error) {
        setMessage(
          error instanceof Error
            ? error.message
            : "Unable to load resource"
        );
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadBook();
    }
  }, [id]);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setSaving(true);
    setMessage("");

    try {
      const response = await fetch(
        `/api/books/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify(form),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to update resource"
        );
      }

      setMessage(
        "Resource updated successfully ✅"
      );
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Update failed"
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 p-10 text-white">
        Loading resource...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-white">
      <div className="mx-auto max-w-5xl">
        <button
          type="button"
          onClick={() =>
            router.push("/admin/books")
          }
          className="text-sm font-semibold text-orange-400"
        >
          ← Back to Library Manager
        </button>

        <p className="mt-8 font-semibold uppercase tracking-widest text-orange-500">
          PetroHub Library
        </p>

        <h1 className="mt-3 text-4xl font-bold">
          Edit Resource
        </h1>

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

          <div>
            <label className="mb-2 block text-sm font-semibold">
              Category
            </label>

            <select
              value={form.category}
              onChange={(event) =>
                setForm({
                  ...form,
                  category: event.target.value,
                })
              }
              className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3"
            >
              <option value="">Select category</option>
              <option value="HSE">HSE</option>
              <option value="Oil & Gas">Oil & Gas</option>
              <option value="Mechanical">Mechanical</option>
              <option value="Electrical">Electrical</option>
              <option value="Instrumentation">
                Instrumentation
              </option>
              <option value="Process">Process</option>
              <option value="Geology">Geology</option>
            </select>
          </div>

          <ImageUpload
            value={form.coverImage}
            onChange={(url) =>
              setForm({
                ...form,
                coverImage: url,
              })
            }
          />

          <div>
            <label className="mb-3 block text-sm font-semibold">
              Resource Type
            </label>

            <div className="grid gap-4 md:grid-cols-2">
              <label
                className={`cursor-pointer rounded-xl border p-5 ${
                  form.resourceType === "hosted"
                    ? "border-orange-500 bg-orange-500/10"
                    : "border-slate-700 bg-slate-950"
                }`}
              >
                <input
                  type="radio"
                  checked={
                    form.resourceType === "hosted"
                  }
                  onChange={() =>
                    setForm({
                      ...form,
                      resourceType: "hosted",
                      externalUrl: "",
                    })
                  }
                  className="mr-3"
                />

                <span className="font-semibold">
                  Hosted PDF
                </span>
              </label>

              <label
                className={`cursor-pointer rounded-xl border p-5 ${
                  form.resourceType === "external"
                    ? "border-orange-500 bg-orange-500/10"
                    : "border-slate-700 bg-slate-950"
                }`}
              >
                <input
                  type="radio"
                  checked={
                    form.resourceType === "external"
                  }
                  onChange={() =>
                    setForm({
                      ...form,
                      resourceType: "external",
                      fileUrl: "",
                      filePublicId: "",
                    })
                  }
                  className="mr-3"
                />

                <span className="font-semibold">
                  Official External Resource
                </span>
              </label>
            </div>
          </div>

          {form.resourceType === "hosted" && (
            <PdfUpload
              value={form.fileUrl}
              onChange={(url, publicId) =>
                setForm({
                  ...form,
                  fileUrl: url,
                  filePublicId: publicId,
                })
              }
            />
          )}

          {form.resourceType === "external" && (
            <Field
              label="Official Resource URL"
              value={form.externalUrl}
              onChange={(value) =>
                setForm({
                  ...form,
                  externalUrl: value,
                })
              }
            />
          )}

          <div>
            <label className="mb-2 block text-sm font-semibold">
              Description
            </label>

            <textarea
              rows={6}
              value={form.description}
              onChange={(event) =>
                setForm({
                  ...form,
                  description:
                    event.target.value,
                })
              }
              className="w-full rounded-xl border border-slate-700 bg-slate-950 p-4"
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
              value={form.publisher}
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
                  status: event.target.value,
                })
              }
              className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3"
            >
              <option value="Published">
                Published
              </option>

              <option value="Draft">
                Draft
              </option>
            </select>
          </div>

          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-700 bg-slate-950 p-4">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(event) =>
                setForm({
                  ...form,
                  featured:
                    event.target.checked,
                })
              }
            />

            <span>Featured Resource</span>
          </label>

          {message && (
            <div className="rounded-xl border border-slate-700 bg-slate-950 p-4 text-orange-400">
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-orange-500 px-6 py-3 font-bold hover:bg-orange-600 disabled:opacity-50"
          >
            {saving
              ? "Saving..."
              : "Save Changes"}
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
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold">
        {label}
      </label>

      <input
        type="text"
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3"
      />
    </div>
  );
}