// HomeDashboardCard_NEW.jsx
// Premium dashboard card for the Home page – matches the _NEW design language.
// Props:
//   title       – card title (e.g. "RTS")
//   icon        – JSX element for the header icon
//   color       – accent color key: navy | blue | green | orange | red | purple | teal
//   onClick     – optional click handler
//   clickable   – boolean, adds pointer cursor + hover effect
//   children    – metric rows rendered inside the body

function HomeDashboardCard_NEW({
  title,
  icon,
  color = "navy",
  onClick,
  clickable = false,
  children,
}) {
  const accentMap = {
    navy:   { bg: "#e8ebf5", fg: "#102a6b", border: "#c5cfe8" },
    blue:   { bg: "#e8f0ff", fg: "#2f6fed", border: "#bfd1f9" },
    green:  { bg: "#e6f7ec", fg: "#1fa854", border: "#b3e5c5" },
    orange: { bg: "#fef0e2", fg: "#f5891f", border: "#fad4a2" },
    red:    { bg: "#fdeceb", fg: "#e6453c", border: "#f5b8b5" },
    purple: { bg: "#f0ecfe", fg: "#7c5cf0", border: "#d5c9fb" },
    teal:   { bg: "#e0f7fc", fg: "#0ea5c4", border: "#9ee5f4" },
  };

  const accent = accentMap[color] || accentMap.navy;

  return (
    <div
      onClick={onClick}
      style={{
        background: "#ffffff",
        borderRadius: "16px",
        overflow: "hidden",
        boxShadow: "0 4px 16px rgba(16, 42, 107, 0.08)",
        border: `1px solid ${accent.border}`,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        cursor: clickable ? "pointer" : "default",
        transition: "transform 0.18s ease, box-shadow 0.18s ease",
      }}
      onMouseEnter={(e) => {
        if (clickable) {
          e.currentTarget.style.transform = "translateY(-4px)";
          e.currentTarget.style.boxShadow = `0 10px 28px rgba(16, 42, 107, 0.14)`;
        }
      }}
      onMouseLeave={(e) => {
        if (clickable) {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "0 4px 16px rgba(16, 42, 107, 0.08)";
        }
      }}
    >
      {/* ── Card Header ── */}
      <div
        style={{
          background: accent.fg,
          padding: "14px 18px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
        }}
      >
        {icon && (
          <div
            style={{
              width: "38px",
              height: "38px",
              borderRadius: "10px",
              background: "rgba(255,255,255,0.18)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              color: "#fff",
            }}
          >
            {icon}
          </div>
        )}

        <div style={{ flex: 1, minWidth: 0 }}>
          <h3
            style={{
              margin: 0,
              fontSize: "17px",
              fontWeight: "700",
              color: "#ffffff",
              letterSpacing: "0.3px",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {title}
          </h3>
        </div>

        {clickable && (
          <div
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "50%",
              background: "rgba(255,255,255,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              color: "#fff",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path
                d="M9 18l6-6-6-6"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        )}
      </div>

      {/* ── Card Body ── */}
      <div
        style={{
          padding: "14px 18px",
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: "0",
        }}
      >
        {children}
      </div>

      {/* ── Clickable footer hint ── */}
      {clickable && (
        <div
          style={{
            padding: "8px 18px",
            background: accent.bg,
            borderTop: `1px solid ${accent.border}`,
            display: "flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "12px",
            fontWeight: "600",
            color: accent.fg,
          }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
            <path
              d="M5 12h14M12 5l7 7-7 7"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          View Dashboard
        </div>
      )}
    </div>
  );
}

export default HomeDashboardCard_NEW;
