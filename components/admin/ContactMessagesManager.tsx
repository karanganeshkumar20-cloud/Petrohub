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

  status:
    MessageStatus;

  createdAt?: string;
  updatedAt?: string;
};

type StatusFilter =
  | "All"
  | MessageStatus;

type Props = {
  initialMessages:
    ContactMessage[];
};

export default function ContactMessagesManager({
  initialMessages,
}: Props) {
  const [
    messages,
    setMessages,
  ] =
    useState<
      ContactMessage[]
    >(
      initialMessages
    );

  const [
    search,
    setSearch,
  ] =
    useState("");

  const [
    statusFilter,
    setStatusFilter,
  ] =
    useState<StatusFilter>(
      "All"
    );

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

  /* =======================================================
     COUNTS
  ======================================================= */

  const counts =
    useMemo(() => {
      return {
        total:
          messages.length,

        unread:
          messages.filter(
            (
              item
            ) =>
              item.status ===
              "Unread"
          ).length,

        read:
          messages.filter(
            (
              item
            ) =>
              item.status ===
              "Read"
          ).length,

        resolved:
          messages.filter(
            (
              item
            ) =>
              item.status ===
              "Resolved"
          ).length,
      };
    }, [messages]);

  /* =======================================================
     FILTER
  ======================================================= */

  const filteredMessages =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      return messages.filter(
        (
          item
        ) => {
          const searchText =
            [
              item.name,
              item.email,
              item.subject,
              item.message,
            ]
              .join(" ")
              .toLowerCase();

          const matchesSearch =
            !query ||
            searchText.includes(
              query
            );

          const matchesStatus =
            statusFilter ===
              "All" ||
            item.status ===
              statusFilter;

          return (
            matchesSearch &&
            matchesStatus
          );
        }
      );
    }, [
      messages,
      search,
      statusFilter,
    ]);

  /* =======================================================
     UPDATE LOCAL MESSAGE
  ======================================================= */

  function updateLocalMessage(
    id: string,
    status:
      MessageStatus
  ) {
    setMessages(
      (
        current
      ) =>
        current.map(
          (
            item
          ) =>
            item._id === id
              ? {
                  ...item,
                  status,
                }
              : item
        )
    );

    setSelectedMessage(
      (
        current
      ) =>
        current?._id ===
        id
          ? {
              ...current,
              status,
            }
          : current
    );
  }

  /* =======================================================
     UPDATE STATUS
  ======================================================= */

  async function updateStatus(
    message:
      ContactMessage,
    status:
      MessageStatus,
    showSuccess = true
  ) {
    if (
      message.status ===
      status
    ) {
      return;
    }

    setProcessingId(
      message._id
    );

    setError("");

    if (showSuccess) {
      setSuccess("");
    }

    try {
      const response =
        await fetch(
          `/api/admin/contact/${message._id}`,
          {
            method:
              "PATCH",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                status,
              }),
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
            "Unable to update message"
        );
      }

      updateLocalMessage(
        message._id,
        status
      );

      if (showSuccess) {
        setSuccess(
          `Message marked as ${status}.`
        );
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update message"
      );
    } finally {
      setProcessingId(
        null
      );
    }
  }

  /* =======================================================
     OPEN MESSAGE
  ======================================================= */

  async function openMessage(
    message:
      ContactMessage
  ) {
    setSelectedMessage(
      message
    );

    setError("");
    setSuccess("");

    if (
      message.status ===
      "Unread"
    ) {
      await updateStatus(
        message,
        "Read",
        false
      );
    }
  }

  /* =======================================================
     DELETE MESSAGE
  ======================================================= */

  async function deleteMessage(
    message:
      ContactMessage
  ) {
    const confirmed =
      window.confirm(
        `Delete the message from ${message.name}?\n\nThis action cannot be undone.`
      );

    if (!confirmed) {
      return;
    }

    setProcessingId(
      message._id
    );

    setError("");
    setSuccess("");

    try {
      const response =
        await fetch(
          `/api/admin/contact/${message._id}`,
          {
            method:
              "DELETE",
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
            "Unable to delete message"
        );
      }

      setMessages(
        (
          current
        ) =>
          current.filter(
            (
              item
            ) =>
              item._id !==
              message._id
          )
      );

      if (
        selectedMessage?._id ===
        message._id
      ) {
        setSelectedMessage(
          null
        );
      }

      setSuccess(
        "Contact message deleted successfully."
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to delete message"
      );
    } finally {
      setProcessingId(
        null
      );
    }
  }

  /* =======================================================
     REPLY LINK
  ======================================================= */

  function getReplyLink(
    message:
      ContactMessage
  ) {
    const subject =
      message.subject
        .toLowerCase()
        .startsWith("re:")
        ? message.subject
        : `Re: ${message.subject}`;

    return (
      `mailto:${message.email}` +
      `?subject=${encodeURIComponent(
        subject
      )}`
    );
  }

  return (
    <div>
      {/* ===================================================
          STATISTICS
      =================================================== */}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Messages"
          value={
            counts.total
          }
        />

        <StatCard
          label="Unread"
          value={
            counts.unread
          }
          highlight={
            counts.unread >
            0
          }
        />

        <StatCard
          label="Read"
          value={
            counts.read
          }
        />

        <StatCard
          label="Resolved"
          value={
            counts.resolved
          }
        />
      </div>

      {/* ===================================================
          FILTERS
      =================================================== */}

      <div className="mt-8 grid gap-4 rounded-2xl border border-slate-800 bg-slate-900 p-5 md:grid-cols-[1fr_240px]">
        <input
          type="search"
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
          placeholder="Search name, email, subject or message..."
          className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none placeholder:text-slate-600 focus:border-orange-500"
        />

        <select
          value={
            statusFilter
          }
          onChange={(
            event
          ) =>
            setStatusFilter(
              event.target
                .value as StatusFilter
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

      <p className="mt-4 text-sm text-slate-500">
        Showing{" "}
        <span className="font-semibold text-slate-300">
          {
            filteredMessages.length
          }
        </span>{" "}
        of{" "}
        <span className="font-semibold text-slate-300">
          {
            messages.length
          }
        </span>{" "}
        messages.
      </p>

      {/* ===================================================
          ALERTS
      =================================================== */}

      {error && (
        <Alert
          type="error"
          message={
            error
          }
          onClose={() =>
            setError("")
          }
        />
      )}

      {success && (
        <Alert
          type="success"
          message={
            success
          }
          onClose={() =>
            setSuccess("")
          }
        />
      )}

      {/* ===================================================
          INBOX LAYOUT
      =================================================== */}

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(360px,0.6fr)]">
        {/* MESSAGE LIST */}

        <div>
          {filteredMessages.length ===
          0 ? (
            <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/60 p-10 text-center">
              <h2 className="text-xl font-bold">
                No messages
                found
              </h2>

              <p className="mt-3 text-sm text-slate-500">
                No contact
                messages match
                the selected
                search and
                filters.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
              {filteredMessages.map(
                (
                  message
                ) => {
                  const selected =
                    selectedMessage?._id ===
                    message._id;

                  const processing =
                    processingId ===
                    message._id;

                  return (
                    <button
                      key={
                        message._id
                      }
                      type="button"
                      disabled={
                        processing
                      }
                      onClick={() =>
                        openMessage(
                          message
                        )
                      }
                      className={`block w-full border-b border-slate-800 p-5 text-left transition last:border-b-0 ${
                        selected
                          ? "bg-orange-500/10"
                          : message.status ===
                              "Unread"
                            ? "bg-orange-500/[0.04] hover:bg-slate-800/70"
                            : "hover:bg-slate-800/50"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p
                              className={
                                message.status ===
                                "Unread"
                                  ? "font-bold text-white"
                                  : "font-semibold text-slate-200"
                              }
                            >
                              {
                                message.name
                              }
                            </p>

                            <StatusBadge
                              status={
                                message.status
                              }
                            />
                          </div>

                          <p className="mt-1 truncate text-sm text-slate-500">
                            {
                              message.email
                            }
                          </p>

                          <p className="mt-4 truncate font-semibold text-slate-300">
                            {
                              message.subject
                            }
                          </p>

                          <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">
                            {
                              message.message
                            }
                          </p>
                        </div>

                        <div className="shrink-0 text-right text-xs text-slate-600">
                          {formatDate(
                            message.createdAt
                          )}
                        </div>
                      </div>
                    </button>
                  );
                }
              )}
            </div>
          )}
        </div>

        {/* MESSAGE DETAILS */}

        <div>
          {selectedMessage ? (
            <div className="sticky top-28 rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-500">
                    Message Details
                  </p>

                  <h2 className="mt-3 text-2xl font-black">
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
                  className="rounded-lg border border-slate-700 px-3 py-2 text-sm font-bold text-slate-400 transition hover:text-white"
                >
                  X
                </button>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-2">
                <StatusBadge
                  status={
                    selectedMessage.status
                  }
                />

                <span className="text-xs text-slate-500">
                  {formatDateTime(
                    selectedMessage.createdAt
                  )}
                </span>
              </div>

              {/* SENDER */}

              <div className="mt-6 rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  From
                </p>

                <p className="mt-2 font-bold">
                  {
                    selectedMessage.name
                  }
                </p>

                <a
                  href={`mailto:${selectedMessage.email}`}
                  className="mt-1 block break-all text-sm text-orange-400 hover:text-orange-300"
                >
                  {
                    selectedMessage.email
                  }
                </a>
              </div>

              {/* MESSAGE */}

              <div className="mt-6">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Message
                </p>

                <div className="mt-3 whitespace-pre-wrap rounded-xl border border-slate-800 bg-slate-950/50 p-5 text-sm leading-7 text-slate-300">
                  {
                    selectedMessage.message
                  }
                </div>
              </div>

              {/* STATUS ACTIONS */}

              <div className="mt-6">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Update Status
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                  <StatusButton
                    label="Unread"
                    active={
                      selectedMessage.status ===
                      "Unread"
                    }
                    disabled={
                      processingId ===
                      selectedMessage._id
                    }
                    onClick={() =>
                      updateStatus(
                        selectedMessage,
                        "Unread"
                      )
                    }
                  />

                  <StatusButton
                    label="Read"
                    active={
                      selectedMessage.status ===
                      "Read"
                    }
                    disabled={
                      processingId ===
                      selectedMessage._id
                    }
                    onClick={() =>
                      updateStatus(
                        selectedMessage,
                        "Read"
                      )
                    }
                  />

                  <StatusButton
                    label="Resolved"
                    active={
                      selectedMessage.status ===
                      "Resolved"
                    }
                    disabled={
                      processingId ===
                      selectedMessage._id
                    }
                    onClick={() =>
                      updateStatus(
                        selectedMessage,
                        "Resolved"
                      )
                    }
                  />
                </div>
              </div>

              {/* ACTIONS */}

              <div className="mt-6 flex flex-wrap gap-3 border-t border-slate-800 pt-6">
                <a
                  href={getReplyLink(
                    selectedMessage
                  )}
                  className="rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-orange-600"
                >
                  Reply by Email
                </a>

                <button
                  type="button"
                  disabled={
                    processingId ===
                    selectedMessage._id
                  }
                  onClick={() =>
                    deleteMessage(
                      selectedMessage
                    )
                  }
                  className="rounded-xl border border-red-900/80 px-5 py-3 text-sm font-bold text-red-400 transition hover:bg-red-500/10 disabled:opacity-50"
                >
                  {processingId ===
                  selectedMessage._id
                    ? "Processing..."
                    : "Delete"}
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/50 p-8 text-center">
              <p className="font-bold text-slate-300">
                Select a message
              </p>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Choose a message
                from the inbox to
                read the full
                enquiry and manage
                its status.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   STAT
========================================================= */

function StatCard({
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
          ? "rounded-2xl border border-orange-500/40 bg-orange-500/10 p-5"
          : "rounded-2xl border border-slate-800 bg-slate-900 p-5"
      }
    >
      <p className="text-sm text-slate-500">
        {label}
      </p>

      <p
        className={
          highlight
            ? "mt-3 text-3xl font-black text-orange-400"
            : "mt-3 text-3xl font-black text-white"
        }
      >
        {value.toLocaleString()}
      </p>
    </div>
  );
}

/* =========================================================
   STATUS
========================================================= */

function StatusBadge({
  status,
}: {
  status:
    MessageStatus;
}) {
  const className =
    status ===
    "Unread"
      ? "bg-orange-500/10 text-orange-400"
      : status ===
          "Resolved"
        ? "bg-emerald-500/10 text-emerald-400"
        : "bg-blue-500/10 text-blue-400";

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-bold ${className}`}
    >
      {status}
    </span>
  );
}

/* =========================================================
   STATUS BUTTON
========================================================= */

function StatusButton({
  label,
  active,
  disabled,
  onClick,
}: {
  label:
    MessageStatus;
  active: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={
        disabled ||
        active
      }
      onClick={
        onClick
      }
      className={
        active
          ? "rounded-lg border border-orange-500 bg-orange-500/10 px-4 py-2 text-sm font-bold text-orange-400 disabled:opacity-100"
          : "rounded-lg border border-slate-700 bg-slate-950 px-4 py-2 text-sm font-semibold text-slate-400 transition hover:border-orange-500 hover:text-white disabled:opacity-40"
      }
    >
      {label}
    </button>
  );
}

/* =========================================================
   ALERT
========================================================= */

function Alert({
  type,
  message,
  onClose,
}: {
  type:
    | "error"
    | "success";
  message: string;
  onClose: () => void;
}) {
  return (
    <div
      className={
        type ===
        "error"
          ? "mt-5 flex items-start justify-between gap-4 rounded-xl border border-red-900 bg-red-500/10 p-4 text-red-300"
          : "mt-5 flex items-start justify-between gap-4 rounded-xl border border-emerald-800 bg-emerald-500/10 p-4 text-emerald-300"
      }
    >
      <p>
        {message}
      </p>

      <button
        type="button"
        onClick={
          onClose
        }
        className="font-bold"
      >
        X
      </button>
    </div>
  );
}

/* =========================================================
   DATE
========================================================= */

function formatDate(
  value?: string
) {
  if (!value) {
    return "-";
  }

  const date =
    new Date(
      value
    );

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
      day:
        "2-digit",

      month:
        "short",

      year:
        "numeric",
    }
  );
}

function formatDateTime(
  value?: string
) {
  if (!value) {
    return "-";
  }

  const date =
    new Date(
      value
    );

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "-";
  }

  return date.toLocaleString(
    "en-IN",
    {
      day:
        "2-digit",

      month:
        "short",

      year:
        "numeric",

      hour:
        "2-digit",

      minute:
        "2-digit",
    }
  );
}