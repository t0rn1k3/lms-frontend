/**
 * Reusable loading spinner.
 * @param {object} props
 * @param {string} [props.size] - "sm" | "md" | "lg"
 * @param {string} [props.className]
 */
function LoadingSpinner({ size = "md", className = "" }) {
  const sizeClass =
    size === "sm" ? "w-5 h-5" : size === "lg" ? "w-12 h-12" : "w-8 h-8";

  return (
    <div
      className={`inline-block animate-spin rounded-full border-2 border-slate-200 border-t-slate-700 ${sizeClass} ${className}`}
      role="status"
      aria-label="Loading"
    />
  );
}

export default LoadingSpinner;
