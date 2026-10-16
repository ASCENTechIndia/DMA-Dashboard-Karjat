// SummaryCard_NEW.jsx
// Individual stat card used in the RTS Dashboard top strip.
// Props:
//   icon       – JSX element
//   label      – top label text (e.g. "Corporations")
//   value      – main big number
//   sub        – bottom sub-label (e.g. "Total Corporations")
//   color      – one of: navy | blue | green | orange | red | purple | teal

function SummaryCard_NEW({ icon, label, value, sub, color = "blue" }) {
  return (
    <div className={`rts-stat-card rts-stat-card--${color}`}>
      <div className="rts-stat-icon-wrap">
        {icon}
      </div>
      <div className="rts-stat-content">
        <p className="rts-stat-label">{label}</p>
        <p className={`rts-stat-value rts-stat-value--${color}`}>{value}</p>
        <p className="rts-stat-sub">{sub}</p>
      </div>
    </div>
  );
}

export default SummaryCard_NEW;
