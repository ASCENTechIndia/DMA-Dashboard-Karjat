// DashboardCard_NEW.jsx
// A generic white card container with a colored icon + title header.
// Used in RTSDashboared_NEW to wrap content sections.

const ICONS = {
  table: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M3 9h18M3 15h18M9 3v18M15 3v18" stroke="currentColor" strokeWidth="2" />
    </svg>
  ),
  chart: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M4 20V10M12 20V4M20 20v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  pie: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M12 2v10l8.5 5A10 10 0 1 0 12 2Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  ),
  building: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <rect x="4" y="3" width="10" height="18" rx="1" stroke="currentColor" strokeWidth="2" />
      <rect x="14" y="9" width="6" height="12" rx="1" stroke="currentColor" strokeWidth="2" />
    </svg>
  ),
};

const COLOR_MAP = {
  blue:   { bg: "var(--dma-blue-light)",   fg: "var(--dma-blue)" },
  green:  { bg: "var(--dma-green-light)",  fg: "var(--dma-green)" },
  orange: { bg: "var(--dma-orange-light)", fg: "var(--dma-orange)" },
  red:    { bg: "var(--dma-red-light)",    fg: "var(--dma-red)" },
  purple: { bg: "var(--dma-purple-light)", fg: "var(--dma-purple)" },
  navy:   { bg: "var(--dma-navy)",         fg: "#ffffff" },
};

function DashboardCard_NEW({
  title,
  icon = "table",
  color = "blue",
  className = "",
  children,
  headerExtra = null,
}) {
  const palette = COLOR_MAP[color] || COLOR_MAP.blue;

  return (
    <div className={`dma-card ${className}`}>
      {title && (
        <div className="dma-card-header">
          <span
            className="dma-card-icon"
            style={{ background: palette.bg, color: palette.fg }}
          >
            {ICONS[icon] || ICONS.table}
          </span>
          <h3 className="dma-card-title">{title}</h3>
          {headerExtra && <div className="rts-card-header-extra">{headerExtra}</div>}
        </div>
      )}
      <div className="dma-card-body">{children}</div>
    </div>
  );
}

export default DashboardCard_NEW;
