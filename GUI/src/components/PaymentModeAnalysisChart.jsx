import { useEffect, useState, memo } from "react";
import axios from "axios";
import { useEChart } from "../hooks/useEChart";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const COLOR_MAP = {
  blue: "#2f6fed",
  orange: "#f5891f",
  red: "#e6453c",
};

function PaymentModeAnalysisChart() {
  const [data, setData] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetchModewiseCollection();
  }, []);

  const fetchModewiseCollection = async () => {
    try {
      setError("")
      setLoading(true);
      const res = await axios.get(
        `${API_BASE_URL}/property/getModewiseCollection`
      );

      const row = res.data.data;

      const totalAmount =
        Number(row.ONLINE_AMOUNT || 0) +
        Number(row.OFFLINE_AMOUNT || 0) +
        Number(row.CASH_AMOUNT || 0);

      const chartData = [
        {
          mode: "Online",
          amount: Number(row.ONLINE_AMOUNT || 0),
          percent: totalAmount > 0 ? (Number(row.ONLINE_AMOUNT || 0) / totalAmount) * 100 : 0,
          color: "blue",
        },
        {
          mode: "Offline",
          amount: Number(row.OFFLINE_AMOUNT || 0),
          percent: totalAmount > 0 ? (Number(row.OFFLINE_AMOUNT || 0) / totalAmount) * 100 : 0,
          color: "orange",
        },
        {
          mode: "Cash",
          amount: Number(row.CASH_AMOUNT || 0),
          percent: totalAmount > 0 ? (Number(row.CASH_AMOUNT || 0) / totalAmount) * 100 : 0,
          color: "red",
        },
      ];

      setData(chartData);
    } catch (err) {
      console.error("Modewise Collection Error:", err);

      setError(
        err?.response?.data?.message ||
        err?.message ||
        "Failed to load data"
      );

      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const formatCrore = (amount) => {
    return `${(amount / 10000000).toFixed(2)}`;
  };

  const ref = useEChart(
    () => ({
      tooltip: {
        trigger: "item",
        formatter: "{b}: {c} Cr ({d}%)",
        position: function (point, params, dom, rect, size) {
          return [size.viewSize[0] - dom.offsetWidth - 10, point[1]];
        },
      },
      series: [
        {
          type: "pie",
          radius: ["30%", "80%"],
          center: ["50%", "50%"],
          label: { show: false },
          itemStyle: {
            borderColor: "#fff",
            borderWidth: 3,
          },
          data: data.map((d) => ({
            value: formatCrore(d.amount),
            name: d.mode,
            itemStyle: {
              color: COLOR_MAP[d.color],
            },
          })),
        },
      ],
    }),
    [data]
  );

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "150px" }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          height: "220px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          color: "red",
        }}
      >
        {error}
      </div>
    );
  }
  return (
    <div className="dma-card-body--split">
      <div
        className="dma-payment-donut-chart"
        ref={ref}
        style={{ height: "220px", width: "100%" }}
      />

      <div className="dma-legend-list">
        {data.map((row) => (
          <div
            className="dma-legend-item"
            key={row.mode}
          >
            <span
              className="dma-legend-dot"
              style={{
                background: COLOR_MAP[row.color],
              }}
            />

            <div>
              <div className="dma-legend-label">
                {row.mode}
              </div>

              <div className="dma-legend-sub">
                {formatCrore(row.amount)} Cr
                {" "}
                ({row.percent.toFixed(2)}%)
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default memo(PaymentModeAnalysisChart);