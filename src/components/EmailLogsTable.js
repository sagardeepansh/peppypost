"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export default function EmailLogsTable() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [open, setOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);

  useEffect(() => {
    fetch("/api/email/logs")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setLogs(data.data);
      })
      .finally(() => setLoading(false));
  }, []);

  // Prevent background scroll when modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    // Cleanup on unmount
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [open]);

  if (loading) return <p>Loading logs...</p>;
  if (!logs.length) return <p>No email logs found.</p>;

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-900 text-gray-300">
            <tr>
              <th className="p-3 text-left">Date</th>
              <th className="p-3 text-left">To</th>
              <th className="p-3 text-left">Subject</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Provider</th>
              <th className="p-3 text-left">Body</th>
              <th className="p-3 text-left">Error</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr
                key={log._id}
                className="border-t border-gray-800 hover:bg-gray-900"
              >
                <td className="p-3">{formatDate(log.createdAt)}</td>
                <td className="p-3">{log.to.join(", ")}</td>
                <td className="p-3">{log.subject || "-"}</td>
                <td className="p-3">
                  <StatusBadge status={log.status} />
                </td>
                <td className="p-3">{log.provider}</td>
                <td className="p-3">
                  <button
                    onClick={() => {
                      setSelectedLog(log?.body);
                      setOpen(true);
                    }}
                    className="text-blue-400 hover:underline"
                  >
                    View
                  </button>
                </td>
                <td className="p-3 text-red-400">
                  <button
                    onClick={() => {
                      setSelectedLog(log?.error || "No error found");
                      setOpen(true);
                    }}
                    className="text-blue-400 hover:underline"
                  >
                    View Error
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {open && (
        <EmailBodyModal
          log={selectedLog}
          onClose={() => {
            setOpen(false);
            setSelectedLog(null);
          }}
        />
      )}
    </>
  );
}

function formatDate(date) {
  return new Date(date).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function StatusBadge({ status }) {
  const isSent = status === "SENT";
  return (
    <span
      className={`px-2 py-1 rounded text-xs font-medium ${
        isSent ? "bg-green-900 text-green-300" : "bg-red-900 text-red-300"
      }`}
    >
      {status}
    </span>
  );
}

function EmailBodyModal({ log, onClose }) {
  // Render nothing if no log data
  if (!log) return null;

  // Use React Portal to render modal at document.body
  return createPortal(
    <div
      className="fixed inset-0 z-[9999] bg-black/70 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="email-modal-title"
    >
      <div className="bg-gray-900 w-full max-w-3xl rounded-lg border border-gray-800 shadow-lg overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center px-4 py-3 border-b border-gray-800">
          <h2
            id="email-modal-title"
            className="text-sm font-medium text-gray-200"
          >
            Email Body
          </h2>
          <button
            onClick={onClose}
            aria-label="Close email body modal"
            className="text-gray-400 hover:text-white text-lg font-bold"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-4 max-h-[70vh] overflow-y-auto text-sm text-gray-300">
          <div
            className="prose prose-invert max-w-none break-words"
            dangerouslySetInnerHTML={{ __html: log }}
          />
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-gray-800 text-right">
          <button
            onClick={onClose}
            className="px-3 py-1 text-sm bg-gray-800 rounded hover:bg-gray-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
