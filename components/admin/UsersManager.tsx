"use client";

import {
  useMemo,
  useState,
} from "react";

import {
  useSession,
} from "next-auth/react";

type UserRole =
  | "user"
  | "admin";

type StatusFilter =
  | "All"
  | "Active"
  | "Blocked";

type PetroHubUser = {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  image?: string;
  isBlocked?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

type Props = {
  initialUsers:
    PetroHubUser[];
};

export default function UsersManager({
  initialUsers,
}: Props) {
  const {
    data: session,
  } = useSession();

  const [
    users,
    setUsers,
  ] =
    useState<PetroHubUser[]>(
      initialUsers
    );

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    roleFilter,
    setRoleFilter,
  ] = useState("All");

  const [
    statusFilter,
    setStatusFilter,
  ] =
    useState<StatusFilter>(
      "All"
    );

  const [
    processingId,
    setProcessingId,
  ] =
    useState<string | null>(
      null
    );

  const [
    error,
    setError,
  ] = useState("");

  const [
    success,
    setSuccess,
  ] = useState("");

  const currentUserEmail =
    session?.user?.email
      ?.toLowerCase() || "";

  /* =========================
     COUNTERS
  ========================= */

  const counts =
    useMemo(() => {
      return {
        total:
          users.length,

        admins:
          users.filter(
            (user) =>
              user.role ===
              "admin"
          ).length,

        active:
          users.filter(
            (user) =>
              user.isBlocked !==
              true
          ).length,

        blocked:
          users.filter(
            (user) =>
              user.isBlocked ===
              true
          ).length,
      };
    }, [users]);

  /* =========================
     FILTER USERS
  ========================= */

  const filteredUsers =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      return users.filter(
        (user) => {
          const matchesRole =
            roleFilter ===
              "All" ||
            user.role ===
              roleFilter;

          const matchesSearch =
            !query ||
            user.name
              ?.toLowerCase()
              .includes(
                query
              ) ||
            user.email
              .toLowerCase()
              .includes(
                query
              );

          const matchesStatus =
            statusFilter ===
              "All" ||
            (statusFilter ===
              "Active" &&
              user.isBlocked !==
                true) ||
            (statusFilter ===
              "Blocked" &&
              user.isBlocked ===
                true);

          return (
            matchesRole &&
            matchesSearch &&
            matchesStatus
          );
        }
      );
    }, [
      users,
      search,
      roleFilter,
      statusFilter,
    ]);

  /* =========================
     CHANGE ROLE
  ========================= */

  async function changeRole(
    user: PetroHubUser,
    role: UserRole
  ) {
    if (
      user.email.toLowerCase() ===
      currentUserEmail
    ) {
      setError(
        "You cannot change your own role."
      );

      return;
    }

    if (
      user.role === role
    ) {
      return;
    }

    const confirmed =
      window.confirm(
        `Change ${user.name}'s role from ${user.role} to ${role}?`
      );

    if (!confirmed) {
      return;
    }

    setProcessingId(
      user._id
    );

    setError("");
    setSuccess("");

    try {
      const response =
        await fetch(
          `/api/admin/users/${user._id}`,
          {
            method:
              "PATCH",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                role,
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
        data = text
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
            "Unable to update user role"
        );
      }

      setUsers(
        (current) =>
          current.map(
            (item) =>
              item._id ===
              user._id
                ? {
                    ...item,
                    role,
                  }
                : item
          )
      );

      setSuccess(
        `${user.name}'s role was changed to ${role}.`
      );
    } catch (error) {
      setError(
        error instanceof
          Error
          ? error.message
          : "Unable to update user role"
      );
    } finally {
      setProcessingId(
        null
      );
    }
  }

  /* =========================
     BLOCK / UNBLOCK
  ========================= */

  async function toggleBlock(
    user: PetroHubUser
  ) {
    if (
      user.email.toLowerCase() ===
      currentUserEmail
    ) {
      setError(
        "You cannot block your own account."
      );

      return;
    }

    const currentlyBlocked =
      user.isBlocked ===
      true;

    const nextBlocked =
      !currentlyBlocked;

    const action =
      nextBlocked
        ? "block"
        : "unblock";

    const confirmed =
      window.confirm(
        `${
          nextBlocked
            ? "Block"
            : "Unblock"
        } ${user.name}'s account?`
      );

    if (!confirmed) {
      return;
    }

    setProcessingId(
      user._id
    );

    setError("");
    setSuccess("");

    try {
      const response =
        await fetch(
          `/api/admin/users/${user._id}`,
          {
            method:
              "PATCH",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                isBlocked:
                  nextBlocked,
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
        data = text
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
            `Unable to ${action} user`
        );
      }

      setUsers(
        (current) =>
          current.map(
            (item) =>
              item._id ===
              user._id
                ? {
                    ...item,
                    isBlocked:
                      nextBlocked,
                  }
                : item
          )
      );

      setSuccess(
        `${user.name}'s account was ${
          nextBlocked
            ? "blocked"
            : "unblocked"
        }.`
      );
    } catch (error) {
      setError(
        error instanceof
          Error
          ? error.message
          : `Unable to ${action} user`
      );
    } finally {
      setProcessingId(
        null
      );
    }
  }

  /* =========================
     DELETE USER
  ========================= */

  async function deleteUser(
    user: PetroHubUser
  ) {
    if (
      user.email.toLowerCase() ===
      currentUserEmail
    ) {
      setError(
        "You cannot delete your own account from the admin panel."
      );

      return;
    }

    const confirmed =
      window.confirm(
        `Delete ${user.name}'s account permanently?\n\nThis action cannot be undone.`
      );

    if (!confirmed) {
      return;
    }

    setProcessingId(
      user._id
    );

    setError("");
    setSuccess("");

    try {
      const response =
        await fetch(
          `/api/admin/users/${user._id}`,
          {
            method:
              "DELETE",
          }
        );

      const text =
        await response.text();

      let data: {
        success?: boolean;
        message?: string;
      } = {};

      try {
        data = text
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
            "Unable to delete user"
        );
      }

      setUsers(
        (current) =>
          current.filter(
            (item) =>
              item._id !==
              user._id
          )
      );

      setSuccess(
        `${user.name}'s account was deleted successfully.`
      );
    } catch (error) {
      setError(
        error instanceof
          Error
          ? error.message
          : "Unable to delete user"
      );
    } finally {
      setProcessingId(
        null
      );
    }
  }

  /* =========================
     UI
  ========================= */

  return (
    <div>
      {/* STATISTICS */}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <UserStat
          label="Total Users"
          value={
            counts.total
          }
        />

        <UserStat
          label="Administrators"
          value={
            counts.admins
          }
        />

        <UserStat
          label="Active Accounts"
          value={
            counts.active
          }
        />

        <UserStat
          label="Blocked Accounts"
          value={
            counts.blocked
          }
          danger={
            counts.blocked > 0
          }
        />
      </div>

      {/* FILTERS */}

      <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-5">
        <div className="grid gap-4 lg:grid-cols-[1fr_200px_200px]">

          <input
            type="search"
            value={
              search
            }
            onChange={(
              event
            ) =>
              setSearch(
                event
                  .target
                  .value
              )
            }
            placeholder="Search by name or email..."
            className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none placeholder:text-slate-600 focus:border-orange-500"
          />

          <select
            value={
              roleFilter
            }
            onChange={(
              event
            ) =>
              setRoleFilter(
                event
                  .target
                  .value
              )
            }
            className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-orange-500"
          >
            <option value="All">
              All Roles
            </option>

            <option value="admin">
              Administrator
            </option>

            <option value="user">
              User
            </option>
          </select>

          <select
            value={
              statusFilter
            }
            onChange={(
              event
            ) =>
              setStatusFilter(
                event
                  .target
                  .value as StatusFilter
              )
            }
            className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-orange-500"
          >
            <option value="All">
              All Status
            </option>

            <option value="Active">
              Active
            </option>

            <option value="Blocked">
              Blocked
            </option>
          </select>
        </div>

        <p className="mt-4 text-sm text-slate-500">
          Showing{" "}
          <span className="font-semibold text-slate-300">
            {
              filteredUsers.length
            }
          </span>{" "}
          of{" "}
          <span className="font-semibold text-slate-300">
            {
              users.length
            }
          </span>{" "}
          registered users.
        </p>
      </div>

      {/* ERROR */}

      {error && (
        <div className="mt-5 flex items-start justify-between gap-4 rounded-xl border border-red-900 bg-red-950/40 p-4 text-red-300">
          <p>
            {error}
          </p>

          <button
            type="button"
            onClick={() =>
              setError("")
            }
            className="text-sm font-bold"
          >
            ×
          </button>
        </div>
      )}

      {/* SUCCESS */}

      {success && (
        <div className="mt-5 flex items-start justify-between gap-4 rounded-xl border border-green-800 bg-green-500/10 p-4 text-green-400">
          <p>
            {success}
          </p>

          <button
            type="button"
            onClick={() =>
              setSuccess("")
            }
            className="text-sm font-bold"
          >
            ×
          </button>
        </div>
      )}

      {/* EMPTY */}

      {filteredUsers.length ===
      0 ? (
        <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-10 text-center">
          <h2 className="text-xl font-bold">
            No users found
          </h2>

          <p className="mt-3 text-slate-400">
            No PetroHub
            accounts match
            the selected search
            and filters.
          </p>
        </div>
      ) : (
        /* USERS TABLE */

        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
          <div className="overflow-x-auto">
            <table className="min-w-full">

              <thead className="border-b border-slate-800 bg-slate-950/50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-400">
                    User
                  </th>

                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-400">
                    Role
                  </th>

                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-400">
                    Status
                  </th>

                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-400">
                    Joined
                  </th>

                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-400">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredUsers.map(
                  (user) => {
                    const isSelf =
                      user.email.toLowerCase() ===
                      currentUserEmail;

                    const isBlocked =
                      user.isBlocked ===
                      true;

                    const processing =
                      processingId ===
                      user._id;

                    return (
                      <tr
                        key={
                          user._id
                        }
                        className={
                          isBlocked
                            ? "border-b border-slate-800 bg-red-500/[0.03] last:border-b-0"
                            : "border-b border-slate-800 last:border-b-0"
                        }
                      >

                        {/* USER */}

                        <td className="px-6 py-5">
                          <div className="flex min-w-[250px] items-center gap-4">

                            {user.image ? (
                              <img
                                src={
                                  user.image
                                }
                                alt={
                                  user.name
                                }
                                className="h-12 w-12 rounded-full object-cover"
                              />
                            ) : (
                              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-orange-500/10 text-lg font-bold text-orange-400">
                                {user.name
                                  ?.charAt(
                                    0
                                  )
                                  .toUpperCase() ||
                                  "U"}
                              </div>
                            )}

                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="font-semibold">
                                  {
                                    user.name
                                  }
                                </p>

                                {isSelf && (
                                  <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-xs font-bold text-blue-400">
                                    You
                                  </span>
                                )}
                              </div>

                              <p className="mt-1 text-sm text-slate-500">
                                {
                                  user.email
                                }
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* ROLE */}

                        <td className="px-6 py-5">
                          <RoleBadge
                            role={
                              user.role
                            }
                          />
                        </td>

                        {/* STATUS */}

                        <td className="px-6 py-5">
                          <StatusBadge
                            blocked={
                              isBlocked
                            }
                          />
                        </td>

                        {/* JOINED */}

                        <td className="whitespace-nowrap px-6 py-5 text-sm text-slate-500">
                          {formatDate(
                            user.createdAt
                          )}
                        </td>

                        {/* ACTIONS */}

                        <td className="px-6 py-5">
                          <div className="flex min-w-[340px] flex-wrap gap-2">

                            {/* ROLE */}

                            <select
                              value={
                                user.role
                              }
                              disabled={
                                isSelf ||
                                processing
                              }
                              onChange={(
                                event
                              ) =>
                                changeRole(
                                  user,
                                  event
                                    .target
                                    .value as UserRole
                                )
                              }
                              className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-orange-500 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              <option value="user">
                                User
                              </option>

                              <option value="admin">
                                Admin
                              </option>
                            </select>

                            {/* BLOCK */}

                            <button
                              type="button"
                              disabled={
                                isSelf ||
                                processing
                              }
                              onClick={() =>
                                toggleBlock(
                                  user
                                )
                              }
                              className={
                                isBlocked
                                  ? "rounded-lg border border-green-800 px-4 py-2 text-sm font-semibold text-green-400 transition hover:bg-green-500/10 disabled:cursor-not-allowed disabled:opacity-40"
                                  : "rounded-lg border border-yellow-800 px-4 py-2 text-sm font-semibold text-yellow-400 transition hover:bg-yellow-500/10 disabled:cursor-not-allowed disabled:opacity-40"
                              }
                            >
                              {processing
                                ? "Please wait..."
                                : isBlocked
                                  ? "Unblock"
                                  : "Block"}
                            </button>

                            {/* DELETE */}

                            <button
                              type="button"
                              disabled={
                                isSelf ||
                                processing
                              }
                              onClick={() =>
                                deleteUser(
                                  user
                                )
                              }
                              className="rounded-lg border border-red-900 px-4 py-2 text-sm font-semibold text-red-400 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              Delete
                            </button>
                          </div>

                          {isSelf && (
                            <p className="mt-2 text-xs text-slate-600">
                              Your own
                              administrator
                              account is
                              protected.
                            </p>
                          )}
                        </td>
                      </tr>
                    );
                  }
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

/* =========================
   STAT CARD
========================= */

function UserStat({
  label,
  value,
  danger = false,
}: {
  label: string;
  value: number;
  danger?: boolean;
}) {
  return (
    <div
      className={
        danger
          ? "rounded-2xl border border-red-900/80 bg-red-500/10 p-5"
          : "rounded-2xl border border-slate-800 bg-slate-900 p-5"
      }
    >
      <p className="text-sm text-slate-500">
        {label}
      </p>

      <p
        className={
          danger
            ? "mt-2 text-3xl font-bold text-red-400"
            : "mt-2 text-3xl font-bold"
        }
      >
        {value}
      </p>
    </div>
  );
}

/* =========================
   ROLE BADGE
========================= */

function RoleBadge({
  role,
}: {
  role: UserRole;
}) {
  return (
    <span
      className={
        role === "admin"
          ? "rounded-full bg-orange-500/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-orange-400"
          : "rounded-full bg-slate-800 px-3 py-1 text-xs font-bold uppercase tracking-wider text-slate-400"
      }
    >
      {role}
    </span>
  );
}

/* =========================
   STATUS BADGE
========================= */

function StatusBadge({
  blocked,
}: {
  blocked: boolean;
}) {
  return (
    <span
      className={
        blocked
          ? "rounded-full bg-red-500/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-red-400"
          : "rounded-full bg-green-500/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-green-400"
      }
    >
      {blocked
        ? "Blocked"
        : "Active"}
    </span>
  );
}

/* =========================
   DATE FORMAT
========================= */

function formatDate(
  value?: string
) {
  if (!value) {
    return "-";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "-";
  }

  return date.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
}