// HomeCard_NEW.jsx
// Individual dashboard card – matches the screenshot design exactly.
// White background, colored circle icon + colored title + arrow, metric rows.
//
// Props:
//   title       – card title (e.g. "Property Tax")
//   color       – accent key: blue|teal|green|orange|red|purple|pink|gold|indigo|navy
//   icon        – SVG JSX for the icon inside the circle
//   clickable   – boolean, enables pointer + hover lift
//   onClick     – click handler
//   metrics     – array of { label, value }

function HomeCard_NEW({
  title,
  color = "blue",
  icon,
  clickable = false,
  onClick,
  metrics = [],
}) {
  return (
    <div
      className={`hn-card${clickable ? " hn-card--clickable" : ""}`}
      onClick={clickable ? onClick : undefined}
    >
      {/* ── Header ── */}
      <div className="hn-card-header">
        {/* Solid colored icon circle */}
        <div className={`hn-card-icon hn-icon-${color}`}>
          {icon}
        </div>

        {/* Title */}
        <h3 className={`hn-card-title hn-txt-${color}`}>
          {title}
        </h3>

        {/* Arrow */}
        <span className={`hn-card-arrow hn-txt-${color}`}>
          →
        </span>
      </div>

      {/* ── Body – metric rows ── */}
      <div className="hn-card-body">
        {metrics.map((m, idx) => (
          <div className="hn-metric-row" key={idx}>
            <span className="hn-metric-label">{m.label}</span>
            <span className="hn-metric-value">{m.value}</span>
          </div>
        ))}

        {metrics.length === 0 && (
          <div className="hn-metric-row">
            <span className="hn-metric-label" style={{ color: "#aab0bc", fontStyle: "italic" }}>
              No data available
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default HomeCard_NEW;
