/**
 * Reusable error display.
 * @param {object} props
 * @param {string} props.message
 * @param {boolean} [props.dismissible] - Show dismiss button
 * @param {function} [props.onDismiss]
 * @param {string} [props.className]
 */
function ErrorMessage({
  message,
  dismissible = false,
  onDismiss,
  className = "",
}) {
  return (
    <div
      className={`p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-start justify-between gap-3 ${className}`}
      role="alert"
    >
      <span className="flex-1">{message}</span>
      {dismissible && onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="flex-shrink-0 text-red-600 hover:text-red-800 font-medium"
          aria-label="Dismiss"
        >
          ×
        </button>
      )}
    </div>
  );
}

export default ErrorMessage;
