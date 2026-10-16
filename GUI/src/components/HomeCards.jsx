import HomedashboardCard from "./HomedashboardCard";

export default function HomeCards({
  cards = [],
  onCardClick,
}) {
  return (
    <div className="row g-3">
      {cards.map((card, index) => (
        <div
          key={`${card.code}-${index}`}
          className="col-xl-3 col-lg-4 col-md-6 col-sm-12"
          onClick={() => onCardClick?.(card.title)}
          style={{
            cursor:
              card.title === "RTS" || card.title === "Property Tax"
                ? "pointer"
                : "default",
          }}
        >
          <HomedashboardCard title={card.title}>
            {card.metrics?.map((metric, idx) => (
              <div
                key={idx}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "6px 0",
                  borderBottom:
                    idx !== card.metrics.length - 1
                      ? "1px solid #f1f5f9"
                      : "none",
                  fontSize: "14px",
                }}
              >
                <span style={{ color: "#64748b" }}>
                  {metric.label}
                </span>

                <strong style={{ color: "#1e293b" }}>
                  {metric.value}
                </strong>
              </div>
            ))}
          </HomedashboardCard>
        </div>
      ))}
    </div>
  );
}