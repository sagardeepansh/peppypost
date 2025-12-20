function EmailBodyModal({ log, onClose }) {
  if (!log) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center">
      <div className="bg-gray-900 w-full max-w-3xl rounded-lg border border-gray-800">
        {/* Header */}
        <div className="flex justify-between items-center px-4 py-3 border-b border-gray-800">
          <h2 className="text-sm font-medium text-gray-200">
            Email Body
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-4 max-h-[70vh] overflow-y-auto text-sm text-gray-300">
          {log.html ? (
            <div
              className="prose prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: log.html }}
            />
          ) : (
            <pre className="whitespace-pre-wrap">
              {log.body || "No body available"}
            </pre>
          )}
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
    </div>
  );
}
