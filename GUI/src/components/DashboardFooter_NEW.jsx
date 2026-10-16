// DashboardFooter_NEW.jsx
// Bottom footer bar: note on left, "Data as on" timestamp on right.

function DashboardFooter_NEW({
  note = "Amounts are in Lakhs for Today's Collection & in Crores for Others",
  dataAsOn = new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }),
}) {
  return (
    <div className="dma-footer">
      <span className="dma-footer-note">
        <strong>Note:</strong> {note}
      </span>
      <span className="dma-footer-date">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="2" />
          <path
            d="M3 9h18M8 3v4M16 3v4"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
        Data as on: {dataAsOn}
      </span>
    </div>
  );
}

export default DashboardFooter_NEW;
