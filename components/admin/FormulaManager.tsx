"use client";

import {
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";

type VerificationStatus =
  | "unverified"
  | "under_review"
  | "verified"
  | "rejected";

type PublicationStatus =
  | "Draft"
  | "Published";

type FormulaRecord = {
  _id: string;
  name: string;
  slug: string;
  domain: string;
  subDomain?: string;
  description?: string;
  formulaText: string;
  formulaLatex?: string;
  calculationKey?: string;
  verificationStatus:
    VerificationStatus;
  status:
    PublicationStatus;
  generatedByAI?: boolean;
  featured?: boolean;
  updatedAt?: string;
};

type APIResponse = {
  success: boolean;
  message?: string;
  formulas?: FormulaRecord[];
  formula?: FormulaRecord;
};

type FormState = {
  name: string;
  slug: string;
  domain: string;
  subDomain: string;
  description: string;
  formulaText: string;
  formulaLatex: string;
  calculationKey: string;
  verificationStatus:
    VerificationStatus;
  status:
    PublicationStatus;
  generatedByAI: boolean;
  featured: boolean;
};

const emptyForm: FormState = {
  name: "",
  slug: "",
  domain: "Fluid Mechanics",
  subDomain: "",
  description: "",
  formulaText: "",
  formulaLatex: "",
  calculationKey: "",
  verificationStatus:
    "unverified",
  status: "Draft",
  generatedByAI: false,
  featured: false,
};

export default function FormulaManager() {
  const [
    formulas,
    setFormulas,
  ] =
    useState<
      FormulaRecord[]
    >([]);

  const [
    form,
    setForm,
  ] =
    useState<FormState>(
      emptyForm
    );

  const [
    editingId,
    setEditingId,
  ] =
    useState("");

  const [
    search,
    setSearch,
  ] =
    useState("");

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

  const [
    message,
    setMessage,
  ] =
    useState("");

  async function loadFormulas() {
    try {
      setLoading(true);
      setError("");

      const response =
        await fetch(
          "/api/admin/formulas",
          {
            cache:
              "no-store",
          }
        );

      const data =
        (await response.json()) as APIResponse;

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
            "Unable to load formulas"
        );
      }

      setFormulas(
        data.formulas ||
          []
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load formulas"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadFormulas();
  }, []);

  function updateField<
    K extends keyof FormState
  >(
    key: K,
    value: FormState[K]
  ) {
    setForm(
      (
        current
      ) => ({
        ...current,
        [key]: value,
      })
    );
  }

  function resetForm() {
    setEditingId("");
    setForm(
      emptyForm
    );
    setError("");
    setMessage("");
  }

  function editFormula(
    formula: FormulaRecord
  ) {
    setEditingId(
      formula._id
    );

    setForm({
      name:
        formula.name ||
        "",

      slug:
        formula.slug ||
        "",

      domain:
        formula.domain ||
        "",

      subDomain:
        formula.subDomain ||
        "",

      description:
        formula.description ||
        "",

      formulaText:
        formula.formulaText ||
        "",

      formulaLatex:
        formula.formulaLatex ||
        "",

      calculationKey:
        formula.calculationKey ||
        "",

      verificationStatus:
        formula.verificationStatus ||
        "unverified",

      status:
        formula.status ||
        "Draft",

      generatedByAI:
        Boolean(
          formula.generatedByAI
        ),

      featured:
        Boolean(
          formula.featured
        ),
    });

    window.scrollTo({
      top: 0,
      behavior:
        "smooth",
    });
  }

  async function handleSubmit(
    event:
      FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const url =
        editingId
          ? `/api/admin/formulas/${editingId}`
          : "/api/admin/formulas";

      const method =
        editingId
          ? "PUT"
          : "POST";

      const response =
        await fetch(
          url,
          {
            method,

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                ...form,

                variables:
                  [],

                supportedUnits:
                  [],

                assumptions:
                  [],

                limitations:
                  [],

                sources:
                  [],
              }),
          }
        );

      const data =
        (await response.json()) as APIResponse;

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
            "Unable to save formula"
        );
      }

      setMessage(
        data.message ||
          "Formula saved successfully"
      );

      setEditingId("");
      setForm(
        emptyForm
      );

      await loadFormulas();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to save formula"
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteFormula(
    formula:
      FormulaRecord
  ) {
    const confirmed =
      window.confirm(
        `Delete "${formula.name}"?`
      );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setMessage("");

      const response =
        await fetch(
          `/api/admin/formulas/${formula._id}`,
          {
            method:
              "DELETE",
          }
        );

      const data =
        (await response.json()) as APIResponse;

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
            "Unable to delete formula"
        );
      }

      if (
        editingId ===
        formula._id
      ) {
        resetForm();
      }

      await loadFormulas();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to delete formula"
      );
    }
  }

  const filteredFormulas =
    useMemo(
      () => {
        const query =
          search
            .trim()
            .toLowerCase();

        if (!query) {
          return formulas;
        }

        return formulas.filter(
          (
            formula
          ) =>
            [
              formula.name,
              formula.slug,
              formula.domain,
              formula.subDomain,
              formula.calculationKey,
            ]
              .filter(Boolean)
              .join(" ")
              .toLowerCase()
              .includes(
                query
              )
        );
      },
      [
        formulas,
        search,
      ]
    );

  const verifiedCount =
    formulas.filter(
      (
        formula
      ) =>
        formula.verificationStatus ===
        "verified"
    ).length;

  const publishedCount =
    formulas.filter(
      (
        formula
      ) =>
        formula.status ===
        "Published"
    ).length;

  return (
    <div className="space-y-10">
      {/* STATS */}

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat
          label="Total Formulas"
          value={
            formulas.length
          }
        />

        <Stat
          label="Verified"
          value={
            verifiedCount
          }
        />

        <Stat
          label="Published"
          value={
            publishedCount
          }
        />
      </div>

      {/* EDITOR */}

      <form
        onSubmit={
          handleSubmit
        }
        className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6"
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-400">
              Formula Editor
            </p>

            <h2 className="mt-2 text-2xl font-bold">
              {editingId
                ? "Edit Formula"
                : "Create Formula"}
            </h2>
          </div>

          {editingId && (
            <button
              type="button"
              onClick={
                resetForm
              }
              className="rounded-xl border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-300 hover:border-orange-500"
            >
              New Formula
            </button>
          )}
        </div>

        <div className="mt-7 grid gap-5 md:grid-cols-2">
          <TextField
            label="Formula Name"
            value={
              form.name
            }
            onChange={(
              value
            ) =>
              updateField(
                "name",
                value
              )
            }
            required
          />

          <TextField
            label="Slug"
            value={
              form.slug
            }
            onChange={(
              value
            ) =>
              updateField(
                "slug",
                value
              )
            }
            placeholder="Auto-generated if blank"
          />

          <TextField
            label="Domain"
            value={
              form.domain
            }
            onChange={(
              value
            ) =>
              updateField(
                "domain",
                value
              )
            }
            required
          />

          <TextField
            label="Sub-domain"
            value={
              form.subDomain
            }
            onChange={(
              value
            ) =>
              updateField(
                "subDomain",
                value
              )
            }
          />

          <TextField
            label="Formula Expression"
            value={
              form.formulaText
            }
            onChange={(
              value
            ) =>
              updateField(
                "formulaText",
                value
              )
            }
            required
          />

          <TextField
            label="LaTeX"
            value={
              form.formulaLatex
            }
            onChange={(
              value
            ) =>
              updateField(
                "formulaLatex",
                value
              )
            }
          />

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-300">
              Trusted Calculation Engine
            </span>

            <select
              value={
                form.calculationKey
              }
              onChange={(
                event
              ) =>
                updateField(
                  "calculationKey",
                  event.target.value
                )
              }
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-orange-500"
            >
              <option value="">
                No executable engine
              </option>

              <option value="bernoulli">
                Bernoulli
              </option>

              <option value="darcy-weisbach">
                Darcy-Weisbach
              </option>

              <option value="hydrostatic-pressure">
                Hydrostatic Pressure
              </option>

              <option value="ecd">
                Equivalent Circulating Density
              </option>

              <option value="annular-velocity">
                Annular Velocity
              </option>

              <option value="initial-circulating-pressure">
                Initial Circulating Pressure
              </option>
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-300">
              Verification Status
            </span>

            <select
              value={
                form.verificationStatus
              }
              onChange={(
                event
              ) =>
                updateField(
                  "verificationStatus",
                  event.target.value as VerificationStatus
                )
              }
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-orange-500"
            >
              <option value="unverified">
                Unverified
              </option>

              <option value="under_review">
                Under Review
              </option>

              <option value="verified">
                Verified
              </option>

              <option value="rejected">
                Rejected
              </option>
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-300">
              Publication Status
            </span>

            <select
              value={
                form.status
              }
              onChange={(
                event
              ) =>
                updateField(
                  "status",
                  event.target.value as PublicationStatus
                )
              }
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-orange-500"
            >
              <option value="Draft">
                Draft
              </option>

              <option value="Published">
                Published
              </option>
            </select>
          </label>
        </div>

        <label className="mt-5 block">
          <span className="mb-2 block text-sm font-semibold text-slate-300">
            Description
          </span>

          <textarea
            rows={
              4
            }
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
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-orange-500"
          />
        </label>

        <div className="mt-5 flex flex-wrap gap-5">
          <label className="flex items-center gap-3 text-sm text-slate-300">
            <input
              type="checkbox"
              checked={
                form.generatedByAI
              }
              onChange={(
                event
              ) =>
                updateField(
                  "generatedByAI",
                  event.target.checked
                )
              }
            />

            AI-assisted draft
          </label>

          <label className="flex items-center gap-3 text-sm text-slate-300">
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
            />

            Featured
          </label>
        </div>

        {error && (
          <div className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
            {error}
          </div>
        )}

        {message && (
          <div className="mt-6 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-300">
            {message}
          </div>
        )}

        <button
          type="submit"
          disabled={
            saving
          }
          className="mt-7 rounded-xl bg-orange-500 px-6 py-3 font-bold text-white transition hover:bg-orange-600 disabled:opacity-50"
        >
          {saving
            ? "Saving..."
            : editingId
            ? "Update Formula"
            : "Create Formula"}
        </button>
      </form>

      {/* LIST */}

      <section>
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-2xl font-bold">
              Formula Registry
            </h2>

            <p className="mt-2 text-sm text-slate-400">
              Review formula verification and publication state.
            </p>
          </div>

          <input
            type="search"
            placeholder="Search formulas..."
            value={
              search
            }
            onChange={(
              event
            ) =>
              setSearch(
                event.target.value
              )
            }
            className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-orange-500"
          />
        </div>

        {loading ? (
          <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-8 text-slate-400">
            Loading formulas...
          </div>
        ) : filteredFormulas.length ===
          0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-slate-700 p-10 text-center text-slate-500">
            No formulas available.
          </div>
        ) : (
          <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-800">
            <table className="min-w-full bg-slate-900">
              <thead className="border-b border-slate-800">
                <tr className="text-left text-sm text-slate-400">
                  <th className="px-5 py-4">
                    Formula
                  </th>

                  <th className="px-5 py-4">
                    Domain
                  </th>

                  <th className="px-5 py-4">
                    Verification
                  </th>

                  <th className="px-5 py-4">
                    Publication
                  </th>

                  <th className="px-5 py-4">
                    Engine
                  </th>

                  <th className="px-5 py-4">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredFormulas.map(
                  (
                    formula
                  ) => (
                    <tr
                      key={
                        formula._id
                      }
                      className="border-b border-slate-800 last:border-0"
                    >
                      <td className="px-5 py-4">
                        <p className="font-semibold text-white">
                          {
                            formula.name
                          }
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {
                            formula.slug
                          }
                        </p>
                      </td>

                      <td className="px-5 py-4 text-slate-300">
                        {
                          formula.domain
                        }
                      </td>

                      <td className="px-5 py-4">
                        <VerificationBadge
                          value={
                            formula.verificationStatus
                          }
                        />
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={
                            formula.status ===
                            "Published"
                              ? "rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300"
                              : "rounded-full bg-yellow-500/10 px-3 py-1 text-xs font-semibold text-yellow-300"
                          }
                        >
                          {
                            formula.status
                          }
                        </span>
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-400">
                        {formula.calculationKey ||
                          "None"}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex gap-3">
                          <button
                            type="button"
                            onClick={() =>
                              editFormula(
                                formula
                              )
                            }
                            className="font-semibold text-orange-400 hover:text-orange-300"
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              deleteFormula(
                                formula
                              )
                            }
                            className="font-semibold text-red-400 hover:text-red-300"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

/* =========================================================
   FIELD
========================================================= */

function TextField({
  label,
  value,
  onChange,
  required = false,
  placeholder = "",
}: {
  label: string;
  value: string;
  onChange:
    (
      value: string
    ) => void;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-300">
        {label}
      </span>

      <input
        type="text"
        required={
          required
        }
        value={
          value
        }
        placeholder={
          placeholder
        }
        onChange={(
          event
        ) =>
          onChange(
            event.target.value
          )
        }
        className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none placeholder:text-slate-600 focus:border-orange-500"
      />
    </label>
  );
}

/* =========================================================
   STAT
========================================================= */

function Stat({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <p className="text-sm text-slate-500">
        {label}
      </p>

      <p className="mt-3 text-3xl font-bold">
        {value}
      </p>
    </div>
  );
}

/* =========================================================
   VERIFICATION BADGE
========================================================= */

function VerificationBadge({
  value,
}: {
  value:
    VerificationStatus;
}) {
  const styles = {
    unverified:
      "bg-slate-700/40 text-slate-300",

    under_review:
      "bg-blue-500/10 text-blue-300",

    verified:
      "bg-emerald-500/10 text-emerald-300",

    rejected:
      "bg-red-500/10 text-red-300",
  };

  const labels = {
    unverified:
      "Unverified",

    under_review:
      "Under Review",

    verified:
      "Verified",

    rejected:
      "Rejected",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${styles[value]}`}
    >
      {labels[value]}
    </span>
  );
}
