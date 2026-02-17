import { Link } from "react-router-dom";
import ErrorMessage from "./ErrorMessage";

/**
 * Full-page error state with optional back link.
 * @param {object} props
 * @param {string} props.message
 * @param {string} [props.backTo] - Path for back link
 * @param {string} [props.backLabel] - Label for back link
 */
function PageError({ message, backTo = "/", backLabel = "Go back" }) {
  return (
    <div className="flex flex-col gap-4 max-w-md">
      <ErrorMessage message={message} />
      {backTo && (
        <Link
          to={backTo}
          className="text-lms-primary/90 hover:text-lms-primary font-medium"
        >
          ← {backLabel}
        </Link>
      )}
    </div>
  );
}

export default PageError;
