const ICONS = {
  calendar: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <rect
        x="3"
        y="5"
        width="18"
        height="16"
        rx="2"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M3 9h18M8 3v4M16 3v4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  ),
  building: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <rect
        x="4"
        y="3"
        width="10"
        height="18"
        rx="1"
        stroke="currentColor"
        strokeWidth="2"
      />
      <rect
        x="14"
        y="9"
        width="6"
        height="12"
        rx="1"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M7 7h1M10 7h1M7 11h1M10 11h1M7 15h1M10 15h1"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  ),
  pie: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 2v10l8.5 5A10 10 0 1 0 12 2Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  ),
  status: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path
        d="M12 7v5l3 3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  ),
  bars: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path
        d="M4 20V10M12 20V4M20 20v-7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  ),
  donut: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="2" />
      <path
        d="M12 4a8 8 0 0 1 8 8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  ),
  trophy: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path
        d="M8 4h8v4a4 4 0 0 1-8 0V4Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M8 5H5a1 1 0 0 0-1 1v1a4 4 0 0 0 4 4M16 5h3a1 1 0 0 1 1 1v1a4 4 0 0 1-4 4"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M9 17h6M12 12v5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  ),
};

const COLOR_VARS = {
  blue: { bg: "var(--dma-blue-light)", fg: "var(--dma-blue)" },
  green: { bg: "var(--dma-green-light)", fg: "var(--dma-green)" },
  orange: { bg: "var(--dma-orange-light)", fg: "var(--dma-orange)" },
  red: { bg: "var(--dma-red-light)", fg: "var(--dma-red)" },
  purple: { bg: "var(--dma-purple-light)", fg: "var(--dma-purple)" },
};

function DashboardCard({
  title,
  icon = "pie",
  color = "blue",
  split = false,
  className = "",
  children,
}) {
  const palette = COLOR_VARS[color] || COLOR_VARS.blue;

  return (
    <div className={`dma-card ${className}`}>
      <div className="dma-card-header">
        <span
          className="dma-card-icon"
          style={{ background: palette.bg, color: palette.fg }}
        >
          {ICONS[icon] || ICONS.pie}
        </span>
        <h3 className="dma-card-title">{title}</h3>
      </div>
      <div className={`dma-card-body${split ? " dma-card-body--split" : ""}`}>
        {children}
      </div>
    </div>
  );
}

export default DashboardCard;
