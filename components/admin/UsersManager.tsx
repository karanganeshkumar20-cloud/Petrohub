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

type PetroHubUser = {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  image?: string;
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

  const [search, setSearch] =
    useState("");

  const [
    roleFilter,
    setRoleFilter,
  ] = useState("All");

  const [
    processingId,
    setProcessingId,
  ] =
    useState<string | null>(
      null
    );

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const currentUserEmail =
    session?.user?.email
      ?.toLowerCase() || "";

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

        users:
          users.filter(
            (user) =>
              user.role ===
              "user"
          ).length,
      };
    }, [users]);

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
              .includes(query) ||
            user.email
              .toLowerCase()
              .includes(query);

          return (
            matchesRole &&
            matchesSearch
          );
        }
      );
    }, [
      users,
      search,
      roleFilter,
    ]);

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

    const confirmed =
      window.confirm(
        `Change ${user.name}'s role to ${role}?`
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
            method: "PATCH",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              role,
            }),
          }
        );

      const text =
        await response.text();

      let data: any = {};

      try {
        data = text
          ? JSON.parse(text)
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
            "Unable to update user"
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
        `${user.name}'s role changed to ${role}.`
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to update user"
      );
    } finally {
      setProcessingId(null);
    }
  }

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
        `Delete ${user.name}'s account permanently?`
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

      let data: any = {};

      try {
        data = text
          ? JSON.parse(text)
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
        `${user.name}'s account was deleted.`
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to delete user"
      );
    } finally {
      setProcessingId(null);
    }
  }

  return (
    <div>
      {/* STATS */}

      <div className="grid gap-4 sm:grid-cols-3">
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
          label="Standard Users"
          value={
            counts.users
          }
        />
      </div>

      {/* FILTERS */}

      <div className="mt-8 grid gap-4 rounded-2xl border border-slate-800 bg-slate-900 p-5 md:grid-cols-[1fr_220px]">
        <input
          type="search"
          value={search}
          onChange={(event) =>
            setSearch(
              event.target.value
            )
          }
          placeholder="Search name or email..."
          className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none placeholder:text-slate-600 focus:border-orange-500"
        />

        <select
          value={
            roleFilter
          }
          onChange={(event) =>
            setRoleFilter(
              event.target.value
            )
          }
          className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-orange-500"
        >
          <option value="All">
            All Roles
          </option>

          <option value="admin">
            Admin
          </option>

          <option value="user">
            User
          </option>
        </select>
      </div>

      {error && (
        <div className="mt-5 rounded-xl border border-red-900 bg-red-950/40 p-4 text-red-300">
          {error}
        </div>
      )}

      {success && (
        <div className="mt-5 rounded-xl border border-green-800 bg-green-500/10 p-4 text-green-400">
          {success}
        </div>
      )}

      {/* USERS */}

      {filteredUsers.length ===
      0 ? (
        <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-10 text-center">
          <h2 className="text-xl font-bold">
            No users found
          </h2>

          <p className="mt-3 text-slate-400">
            No PetroHub users
            match the current
            search or role filter.
          </p>
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-400">
                    User
                  </th>

                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-400">
                    Role
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

                    return (
                      <tr
                        key={
                          user._id
                        }
                        className="border-b border-slate-800 last:border-b-0"
                      >
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-4">
                            {user.image ? (
                              <img
                                src={
                                  user.image
                                }
                                alt={
                                  user.name
                                }
                                className="h-11 w-11 rounded-full object-cover"
                              />
                            ) : (
                              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-orange-500/10 font-bold text-orange-400">
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
                                  <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-xs font-semibold text-blue-400">
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

                        <td className="px-6 py-5">
                          <RoleBadge
                            role={
                              user.role
                            }
                          />
                        </td>

                        <td className="px-6 py-5 text-sm text-slate-500">
                          {formatDate(
                            user.createdAt
                          )}
                        </td>

                        <td className="px-6 py-5">
                          <div className="flex flex-wrap gap-2">
                            <select
                              value={
                                user.role
                              }
                              disabled={
                                isSelf ||
                                processingId ===
                                  user._id
                              }
                              onChange={(event) =>
                                changeRole(
                                  user,
                                  event
                                    .target
                                    .value as UserRole
                                )
                              }
                              className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <option value="user">
                                User
                              </option>

                              <option value="admin">
                                Admin
                              </option>
                            </select>

                            <button
                              type="button"
                              disabled={
                                isSelf ||
                                processingId ===
                                  user._id
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

function UserStat({
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

      <p className="mt-2 text-3xl font-bold">
        {value}
      </p>
    </div>
  );
}

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