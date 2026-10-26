"use client";

import Link from "next/link";

import {
  useEffect,
  useState,
} from "react";

import {
  useParams,
  useRouter,
} from "next/navigation";

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

type ResourceForm = {
  title: string;
  author: string;
  description: string;
  category: string;

  contentType:
    ContentType;

  coverImage: string;

  resourceType:
    ResourceType;

  fileUrl: string;
  filePublicId: string;
  externalUrl: string;

  pages: string;
  edition: string;
  publisher: string;
  year: string;

  license: string;
  source: string;
  sourceUrl: string;

  status:
    StatusType;

  featured: boolean;
};

const categories = [
  "HSE",
  "Oil & Gas",
  "Mechanical",
  "Civil",
  "Electrical",
  "Instrumentation",
  "Process",
  "Geology",
];

const initialForm: ResourceForm = {
  title: "",
  author: "",
  description: "",
  category: "",

  contentType:
    "book",

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

  status:
    "Draft",

  featured: false,
};

export default function EditBookPage() {
  const params =
    useParams();

  const router =
    useRouter();

  const rawId =
    params.id;

  const id =
    Array.isArray(
      rawId
    )
      ? rawId[0]
      : String(
          rawId ||
            ""
        );

  const [
    form,
    setForm,
  ] =
    useState<ResourceForm>(
      initialForm
    );

  const [
    loading,
    setLoading,
  ] =
    useState(true);

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

  useEffect(() => {
    async function loadResource() {
      try {
        setLoading(true);
        setError("");

        const response =
          await fetch(
            `/api/books/${id}`,
            {
              cache:
                "no-store",
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
              "Unable to load resource"
          );
        }

        const resource =
          data.book;

        setForm({
          title:
            resource.title ||
            "",

          author:
            resource.author ||
            "",

          description:
            resource.description ||
            "",

          category:
            resource.category ||
            "",

          contentType:
            [
              "book",
              "manual",
              "standard",
              "note",
              "download",
            ].includes(
              resource.contentType
            )
              ? resource.contentType
              : "book",

          coverImage:
            resource.coverImage ||
            "",

          resourceType:
            resource.resourceType ===
            "external"
              ? "external"
              : "hosted",

          fileUrl:
            resource.fileUrl ||
            "",

          filePublicId:
            resource.filePublicId ||
            "",

          externalUrl:
            resource.externalUrl ||
            "",

          pages:
            resource.pages?.toString() ||
            "",

          edition:
            resource.edition ||
            "",

          publisher:
            resource.publisher ||
            "",

          year:
            resource.year?.toString() ||
            "",

          license:
            resource.license ||
            "",

          source:
            resource.source ||
            "PetroHub",

          sourceUrl:
            resource.sourceUrl ||
            "",

          status:
            resource.status ===
            "Published"
              ? "Published"
              : "Draft",

          featured:
            Boolean(
              resource.featured
            ),
        });
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load resource"
        );
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      void loadResource();
    }
  }, [id]);

  function updateField<
    K extends keyof ResourceForm
  >(
    field: K,
    value:
      ResourceForm[K]
  ) {
    setForm(
      (
        current
      ) => ({
        ...current,
        [field]:
          value,
      })
    );
  }

  function validate() {
    if (
      !form.title.trim()
    ) {
      return "Title is required.";
    }

    if (
      !form.category
    ) {
      return "Category is required.";
    }

    if (
      form.resourceType ===
        "hosted" &&
      !form.fileUrl
    ) {
      return "Please upload a PDF.";
    }

    if (
      form.resourceType ===
        "external" &&
      !form.externalUrl.trim()
    ) {
      return "Official resource URL is required.";
    }

    return "";
  }

  async function updateResource(
    event:
      React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const validationError =
      validate();

    if (
      validationError
    ) {
      setError(
        validationError
      );
      return;
    }

    setSaving(true);
    setError("");

    try {
      const response =
        await fetch(
          `/api/books/${id}`,
          {
            method:
              "PUT",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify(
                form
              ),
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
            "Unable to update resource"
        );
      }

      router.push(
        "/admin/books"
      );

      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update resource"
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 px-6 py-12 text-white">
        <div className="mx-auto max-w-6xl rounded-2xl border border-slate-800 bg-slate-900 p-8 text-slate-400">
          Loading resource...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-white">
      <div className="mx-auto max-w-6xl">
        {/* HEADER */}

        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.22em] text-orange-500">
              PetroHub Library
            </p>

            <h1 className="mt-3 text-4xl font-black">
              Edit Library Resource
            </h1>

            <p className="mt-3 max-w-2xl text-slate-400">
              Update resource
              metadata, files,
              attribution and
              publication status.
            </p>
          </div>

          <Link
            href="/admin/books"
            className="rounded-xl border border-slate-700 px-5 py-3 text-sm font-bold text-slate-300 transition hover:border-orange-500 hover:text-white"
          >
            Back to Library
          </Link>
        </div>

        {error &&
        !form.title ? (
          <div className="mt-8 rounded-2xl border border-red-500/30 bg-red-500/10 p-8">
            <p className="font-bold text-red-300">
              Unable to load
              resource
            </p>

            <p className="mt-2 text-sm text-red-200">
              {error}
            </p>
          </div>
        ) : (
          <form
            onSubmit={
              updateResource
            }
            className="mt-10 space-y-8 rounded-3xl border border-slate-800 bg-slate-900/70 p-6 md:p-8"
          >
            <SectionTitle
              title="Resource Information"
              description="Update the resource title, category and library classification."
            />

            <div className="grid gap-6 md:grid-cols-2">
              <TextField
                label="Title"
                value={
                  form.title
                }
                onChange={(
                  value
                ) =>
                  updateField(
                    "title",
                    value
                  )
                }
              />

              <TextField
                label="Author"
                value={
                  form.author
                }
                onChange={(
                  value
                ) =>
                  updateField(
                    "author",
                    value
                  )
                }
              />

              <Field>
                <FieldLabel>
                  Category
                </FieldLabel>

                <select
                  value={
                    form.category
                  }
                  onChange={(
                    event
                  ) =>
                    updateField(
                      "category",
                      event.target.value
                    )
                  }
                  className={
                    inputClass
                  }
                >
                  <option value="">
                    Select category
                  </option>

                  {categories.map(
                    (
                      category
                    ) => (
                      <option
                        key={
                          category
                        }
                        value={
                          category
                        }
                      >
                        {
                          category
                        }
                      </option>
                    )
                  )}
                </select>
              </Field>

              <Field>
                <FieldLabel>
                  Content Type
                </FieldLabel>

                <select
                  value={
                    form.contentType
                  }
                  onChange={(
                    event
                  ) =>
                    updateField(
                      "contentType",
                      event.target.value as ContentType
                    )
                  }
                  className={
                    inputClass
                  }
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
              </Field>
            </div>

            <Field>
              <FieldLabel>
                Description
              </FieldLabel>

              <textarea
                rows={6}
                value={
                  form.description
                }
                onChange={(
                  event
                ) =>
                  updateField(
                    "description",
                    event.target.value
                  )
                }
                className={`${inputClass} resize-none`}
              />
            </Field>

            <div>
              <SectionTitle
                title="Cover Image"
                description="Update the resource cover or preview image."
              />

              <div className="mt-5">
                <ImageUpload
                  value={
                    form.coverImage
                  }
                  onChange={(
                    url
                  ) =>
                    updateField(
                      "coverImage",
                      url
                    )
                  }
                />
              </div>
            </div>

            {/* RESOURCE LOCATION */}

            <div>
              <SectionTitle
                title="Resource Location"
                description="Choose between a hosted PDF and an official external resource."
              />

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <button
                  type="button"
                  onClick={() =>
                    setForm(
                      (
                        current
                      ) => ({
                        ...current,

                        resourceType:
                          "hosted",

                        externalUrl:
                          "",
                      })
                    )
                  }
                  className={`rounded-2xl border p-5 text-left ${
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
                    PetroHub stores
                    the resource PDF.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setForm(
                      (
                        current
                      ) => ({
                        ...current,

                        resourceType:
                          "external",

                        fileUrl:
                          "",

                        filePublicId:
                          "",
                      })
                    )
                  }
                  className={`rounded-2xl border p-5 text-left ${
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
                    Users are sent
                    to the official
                    source.
                  </p>
                </button>
              </div>
            </div>

            {form.resourceType ===
              "hosted" && (
              <PdfUpload
                value={
                  form.fileUrl
                }
                onChange={(
                  url,
                  publicId
                ) =>
                  setForm(
                    (
                      current
                    ) => ({
                      ...current,

                      fileUrl:
                        url,

                      filePublicId:
                        publicId,
                    })
                  )
                }
              />
            )}

            {form.resourceType ===
              "external" && (
              <Field>
                <FieldLabel>
                  Official Resource
                  URL
                </FieldLabel>

                <input
                  type="url"
                  value={
                    form.externalUrl
                  }
                  onChange={(
                    event
                  ) =>
                    updateField(
                      "externalUrl",
                      event.target.value
                    )
                  }
                  className={
                    inputClass
                  }
                />
              </Field>
            )}

            {/* DETAILS */}

            <SectionTitle
              title="Publication Details"
              description="Bibliographic information and resource attribution."
            />

            <div className="grid gap-6 md:grid-cols-2">
              <TextField
                label="Edition"
                value={
                  form.edition
                }
                onChange={(
                  value
                ) =>
                  updateField(
                    "edition",
                    value
                  )
                }
              />

              <TextField
                label="Publisher"
                value={
                  form.publisher
                }
                onChange={(
                  value
                ) =>
                  updateField(
                    "publisher",
                    value
                  )
                }
              />

              <TextField
                label="Pages"
                value={
                  form.pages
                }
                onChange={(
                  value
                ) =>
                  updateField(
                    "pages",
                    value
                  )
                }
              />

              <TextField
                label="Year"
                value={
                  form.year
                }
                onChange={(
                  value
                ) =>
                  updateField(
                    "year",
                    value
                  )
                }
              />

              <TextField
                label="License / Rights"
                value={
                  form.license
                }
                onChange={(
                  value
                ) =>
                  updateField(
                    "license",
                    value
                  )
                }
              />

              <TextField
                label="Source"
                value={
                  form.source
                }
                onChange={(
                  value
                ) =>
                  updateField(
                    "source",
                    value
                  )
                }
              />
            </div>

            <Field>
              <FieldLabel>
                Source URL
              </FieldLabel>

              <input
                type="url"
                value={
                  form.sourceUrl
                }
                onChange={(
                  event
                ) =>
                  updateField(
                    "sourceUrl",
                    event.target.value
                  )
                }
                className={
                  inputClass
                }
              />
            </Field>

            <Field>
              <FieldLabel>
                Publication Status
              </FieldLabel>

              <select
                value={
                  form.status
                }
                onChange={(
                  event
                ) =>
                  updateField(
                    "status",
                    event.target.value as StatusType
                  )
                }
                className={
                  inputClass
                }
              >
                <option value="Draft">
                  Draft
                </option>

                <option value="Published">
                  Published
                </option>
              </select>
            </Field>

            <label className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-950/50 p-4">
              <input
                type="checkbox"
                checked={
                  form.featured
                }
                onChange={(
                  event
                ) =>
                  updateField(
                    "featured",
                    event.target.checked
                  )
                }
                className="h-5 w-5"
              />

              <div>
                <p className="font-semibold">
                  Featured Resource
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Highlight this
                  resource in PetroHub.
                </p>
              </div>
            </label>

            {error && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
                {error}
              </div>
            )}

            <div className="flex flex-wrap gap-4 border-t border-slate-800 pt-6">
              <button
                type="submit"
                disabled={
                  saving
                }
                className="rounded-xl bg-orange-500 px-6 py-3 font-bold text-white transition hover:bg-orange-600 disabled:opacity-50"
              >
                {saving
                  ? "Updating..."
                  : "Update Resource"}
              </button>

              <button
                type="button"
                disabled={
                  saving
                }
                onClick={() =>
                  router.push(
                    "/admin/books"
                  )
                }
                className="rounded-xl border border-slate-700 px-6 py-3 font-semibold text-slate-300 transition hover:bg-slate-800 disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}

const inputClass =
  "w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none placeholder:text-slate-600 focus:border-orange-500";

function Field({
  children,
}: {
  children:
    React.ReactNode;
}) {
  return <div>{children}</div>;
}

function FieldLabel({
  children,
}: {
  children:
    React.ReactNode;
}) {
  return (
    <label className="mb-2 block text-sm font-semibold text-slate-300">
      {children}
    </label>
  );
}

function TextField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange:
    (
      value: string
    ) => void;
}) {
  return (
    <Field>
      <FieldLabel>
        {label}
      </FieldLabel>

      <input
        value={
          value
        }
        onChange={(
          event
        ) =>
          onChange(
            event.target.value
          )
        }
        className={
          inputClass
        }
      />
    </Field>
  );
}

function SectionTitle({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div>
      <h2 className="text-xl font-bold">
        {title}
      </h2>

      <p className="mt-2 text-sm text-slate-500">
        {description}
      </p>
    </div>
  );
}