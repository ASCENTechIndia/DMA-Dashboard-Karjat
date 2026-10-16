function HomeDashboardCard({
  title,
  children,
  className = "",
}) {
  return (
    <div
      className={className}
      style={{
        background: "#fff",
        borderRadius: "16px",
        overflow: "hidden",
        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
        border: "1px solid #e5e7eb",
        height: "100%",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "14px 18px",
          borderBottom: "1px solid #e5e7eb",
          background: "#f8fafc",
        }}
      >
        <h3
          style={{
            margin: 0,
            fontSize: "20px",
            fontWeight: "600",
            color: "#ef4444", // screenshot sarkha red title
          }}
        >
          {title}
        </h3>
      </div>

      <div
        style={{
          padding: "14px 18px",
        }}
      >
        {children}
      </div>
    </div>
  );
}

export default HomeDashboardCard;