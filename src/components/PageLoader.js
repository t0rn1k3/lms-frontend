import LoadingSpinner from "./LoadingSpinner";

/**
 * Full-page loading state.
 * @param {object} props
 * @param {string} [props.message] - Optional loading message
 */
function PageLoader({ message = "Loading..." }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4">
      <LoadingSpinner size="lg" />
      <p className="text-slate-600">{message}</p>
    </div>
  );
}

export default PageLoader;
