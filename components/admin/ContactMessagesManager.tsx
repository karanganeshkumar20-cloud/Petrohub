"use client";

import {
  useMemo,
  useState,
} from "react";

type MessageStatus =
  | "Unread"
  | "Read"
  | "Resolved";

type ContactMessage = {
  _id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: MessageStatus;
  createdAt: string;
};

type Props = {
  initialMessages: ContactMessage[];
};

export default function ContactMessagesManager({
  initialMessages,
}: Props) {
  const [messages, setMessages] =
    useState<ContactMessage[]>(
      initialMessages
    );

  const [
    statusFilter,
    setStatusFilter,
  ] = useState("All");

  const [search, setSearch] =
    useState("");

  const [
    selectedMessage,
    setSelectedMessage,
  ] =
    useState<ContactMessage | null>(
      null
    );

  const [
    processingId,
    setProcessingId,
  ] =
    useState<string | null>(
      null
    );

  const [error, setError] =
    useState("");

  const counts = useMemo(() => {
    return {
      total: messages.length,

      unread:
        messages.filter(
          (message) =>
            message.status ===
            "Unread"
        ).length,

      read:
        messages.filter(
          (message) =>
            message.status ===
            "Read"
        ).length,

      resolved:
        messages.filter(
          (message) =>
            message.status ===
            "Resolved"
        ).length,
    };
  }, [messages]);

  const filteredMessages =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      return messages.filter(
        (message) => {
          const matchesStatus =
            statusFilter ===
              "All" ||
            message.status ===
              statusFilter;

          const matchesSearch =
            !query ||
            message.name
              .toLowerCase()
              .includes(query) ||
            message.email
              .toLowerCase()
              .includes(query) ||
            message.subject
              .toLowerCase()
              .includes(query) ||
            message.message
              .toLowerCase()
              .includes(query);

          return (
            matchesStatus &&
            matchesSearch
          );
        }
      );
    }, [
      messages,
      search,
      statusFilter,
    ]);

  async function updateStatus(
    id: string,
    status: MessageStatus
  ) {
    setProcessingId(id);
    setError("");

    try {
      const response =
        await fetch(
          `/api/admin/contact/${id}`,
          {
            method: "PATCH",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              status,
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
            "Unable to update message"
        );
      }

      setMessages((current) =>
        current.map((message) =>
          message._id === id
            ? {
                ...message,
                status,
              }
            : message
        )
      );

      setSelectedMessage(
        (current) =>
          current?._id === id
            ? {
                ...current,
                status,
              }
            : current
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to update message"
      );
    } finally {
      setProcessingId(null);
    }
  }

  async function deleteMessage(
    id: string
  ) {
    const confirmed =
      window.confirm(
        "Delete this contact message permanently?"
      );

    if (!confirmed) {
      return;
    }

    setProcessingId(id);
    setError("");

    try {
      const response =
        await fetch(
          `/api/admin/contact/${id}`,
          {
            method: "DELETE",
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
            "Unable to delete message"
        );
      }

      setMessages((current) =>
        current.filter(
          (message) =>
            message._id !== id
        )
      );

      if (
        selectedMessage?._id ===
        id
      ) {
        setSelectedMessage(null);
      }
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to delete message"
      );
    } finally {
      setProcessingId(null);
    }
  }

  async function openMessage(
    message: ContactMessage
  ) {
    setSelectedMessage(message);

    if (
      message.status ===
      "Unread"
    ) {
      await updateStatus(
        message._id,
        "Read"
      );
    }
  }

  return (
    <div>
      {/* COUNTERS */}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Counter
          label="Total"
          value={counts.total}
        />

        <Counter
          label="Unread"
          value={counts.unread}
          highlight={
            counts.unread > 0
          }
        />

        <Counter
          label="Read"
          value={counts.read}
        />

        <Counter
          label="Resolved"
          value={
            counts.resolved
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
          placeholder="Search name, email, subject or message..."
          className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none placeholder:text-slate-600 focus:border-orange-500"
        />

        <select
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(
              event.target.value
            )
          }
          className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-orange-500"
        >
          <option value="All">
            All Statuses
          </option>

          <option value="Unread">
            Unread
          </option>

          <option value="Read">
            Read
          </option>

          <option value="Resolved">
            Resolved
          </option>
        </select>
      </div>

      {error && (
        <div className="mt-5 rounded-xl border border-red-900 bg-red-950/40 p-4 text-red-300">
          {error}
        </div>
      )}

      {/* MESSAGE LIST */}

      {filteredMessages.length ===
      0 ? (
        <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-10 text-center">
          <h2 className="text-xl font-bold">
            No messages found
          </h2>

          <p className="mt-3 text-slate-400">
            No contact messages
            match the current
            filter.
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {filteredMessages.map(
            (message) => (
              <div
                key={message._id}
                className={
                  message.status ===
                  "Unread"
                    ? "rounded-2xl border border-orange-500/40 bg-orange-500/5 p-6"
                    : "rounded-2xl border border-slate-800 bg-slate-900 p-6"
                }
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <button
                    type="button"
                    onClick={() =>
                      openMessage(
                        message
                      )
                    }
                    className="min-w-0 flex-1 text-left"
                  >
                    <div className="flex flex-wrap items-center gap-3">
                      <StatusBadge
                        status={
                          message.status
                        }
                      />

                      <span className="text-xs text-slate-500">
                        {formatDate(
                          message.createdAt
                        )}
                      </span>
                    </div>

                    <h2 className="mt-4 text-xl font-bold">
                      {
                        message.subject
                      }
                    </h2>

                    <p className="mt-2 font-medium text-slate-300">
                      {message.name}
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      {message.email}
                    </p>

                    <p className="mt-4 line-clamp-2 leading-7 text-slate-400">
                      {
                        message.message
                      }
                    </p>
                  </button>

                  <div className="flex shrink-0 flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        openMessage(
                          message
                        )
                      }
                      className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:border-orange-500 hover:text-orange-400"
                    >
                      View
                    </button>

                    {message.status !==
                      "Resolved" && (
                      <button
                        type="button"
                        disabled={
                          processingId ===
                          message._id
                        }
                        onClick={() =>
                          updateStatus(
                            message._id,
                            "Resolved"
                          )
                        }
                        className="rounded-lg border border-green-800 px-4 py-2 text-sm font-semibold text-green-400 transition hover:bg-green-500/10 disabled:opacity-50"
                      >
                        Resolve
                      </button>
                    )}

                    <button
                      type="button"
                      disabled={
                        processingId ===
                        message._id
                      }
                      onClick={() =>
                        deleteMessage(
                          message._id
                        )
                      }
                      className="rounded-lg border border-red-900 px-4 py-2 text-sm font-semibold text-red-400 transition hover:bg-red-500/10 disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      )}

      {/* MODAL */}

      {selectedMessage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-slate-700 bg-slate-950 shadow-2xl">
            <div className="flex items-start justify-between gap-5 border-b border-slate-800 p-6">
              <div>
                <StatusBadge
                  status={
                    selectedMessage.status
                  }
                />

                <h2 className="mt-4 text-2xl font-bold">
                  {
                    selectedMessage.subject
                  }
                </h2>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedMessage(
                    null
                  )
                }
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-700 text-xl text-slate-400 hover:border-orange-500 hover:text-orange-400"
              >
                ×
              </button>
            </div>

            <div className="p-6">
              <div className="grid gap-5 sm:grid-cols-2">
                <Info
                  label="Name"
                  value={
                    selectedMessage.name
                  }
                />

                <Info
                  label="Email"
                  value={
                    selectedMessage.email
                  }
                />

                <Info
                  label="Received"
                  value={formatDate(
                    selectedMessage.createdAt
                  )}
                />

                <Info
                  label="Status"
                  value={
                    selectedMessage.status
                  }
                />
              </div>

              <div className="mt-7">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Message
                </p>

                <div className="mt-3 whitespace-pre-wrap rounded-2xl border border-slate-800 bg-slate-900 p-5 leading-7 text-slate-300">
                  {
                    selectedMessage.message
                  }
                </div>
              </div>

              <div className="mt-7 flex flex-wrap gap-3">
                <a
                  href={`mailto:${selectedMessage.email}?subject=${encodeURIComponent(
                    `Re: ${selectedMessage.subject}`
                  )}`}
                  className="rounded-xl bg-orange-500 px-5 py-3 font-bold text-white transition hover:bg-orange-600"
                >
                  Reply by Email
                </a>

                {selectedMessage.status !==
                  "Resolved" && (
                  <button
                    type="button"
                    onClick={() =>
                      updateStatus(
                        selectedMessage._id,
                        "Resolved"
                      )
                    }
                    className="rounded-xl border border-green-800 px-5 py-3 font-bold text-green-400 hover:bg-green-500/10"
                  >
                    Mark Resolved
                  </button>
                )}

                {selectedMessage.status ===
                  "Resolved" && (
                  <button
                    type="button"
                    onClick={() =>
                      updateStatus(
                        selectedMessage._id,
                        "Read"
                      )
                    }
                    className="rounded-xl border border-slate-700 px-5 py-3 font-semibold text-slate-300 hover:border-orange-500"
                  >
                    Reopen
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Counter({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: number;
  highlight?: boolean;
}) {
  return (
    <div
      className={
        highlight
          ? "rounded-2xl border border-orange-500/50 bg-orange-500/10 p-5"
          : "rounded-2xl border border-slate-800 bg-slate-900 p-5"
      }
    >
      <p className="text-sm text-slate-500">
        {label}
      </p>

      <p
        className={
          highlight
            ? "mt-2 text-3xl font-bold text-orange-400"
            : "mt-2 text-3xl font-bold"
        }
      >
        {value}
      </p>
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: MessageStatus;
}) {
  const style =
    status === "Unread"
      ? "bg-orange-500/10 text-orange-400"
      : status ===
          "Resolved"
        ? "bg-green-500/10 text-green-400"
        : "bg-blue-500/10 text-blue-400";

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${style}`}
    >
      {status}
    </span>
  );
}

function Info({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </p>

      <p className="mt-2 break-words font-medium text-slate-300">
        {value}
      </p>
    </div>
  );
}

function formatDate(
  value: string
) {
  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "-";
  }

  return new Intl.DateTimeFormat(
    "en-IN",
    {
      dateStyle: "medium",
      timeStyle: "short",
    }
  ).format(date);
}