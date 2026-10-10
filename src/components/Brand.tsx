import { Link } from "react-router-dom";
function Brand() {
  return (
  <Link to="/" className="brand" aria-label="Social، الرئيسية">
    <span className="brand-mark">
      <svg viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <path
          d="M7 9h12a6 6 0 0 1 0 12h-3l-6 5v-5H7a6 6 0 0 1 0-12Z"
          stroke="currentColor"
          strokeWidth="2.4"
        />
        <path
          d="M13 6h10a5 5 0 0 1 5 5v8"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
      </svg>
    </span>
    <span>
      social<span className="brand-dot">.</span>
    </span>
  </Link>
);
}
export default Brand;
