import "../styles/error-page.css";

export default function ErrorPage() {
  return (
    <div className="access-denied-page">
      <div className="access-denied-container">
        <div className="access-denied-icon">
          <svg
            width="60"
            height="60"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#dc2626"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
          </svg>
        </div>
        <div className="access-denied-code">403 Forbidden</div>
        <h1 className="access-denied-title">Unauthorized Access</h1>
        <p className="access-denied-msg">
          You do not have permission to access this page.
        </p>
      </div>
    </div>
  );
}
