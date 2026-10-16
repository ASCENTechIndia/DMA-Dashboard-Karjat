import { useEffect, useState, memo } from "react";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function TopPerformingCorporationsChart() {
  const [data, setData] = useState([]);
    const [error, setError] = useState("");
    const[loading, setLoading] = useState(true);
  useEffect(() => {
    fetchTopPerforming();
  }, []);

  const fetchTopPerforming = async () => {
    try {
      setError("");
      setLoading(true);
      const res = await axios.get(
        `${API_BASE_URL}/property/getTotalPerfCorpbyColl`
      );

      const formattedData = (res.data.data || []).map((row) => ({
        corporation: row.CORPORATION,
        percent: Number(row.COLLECTION_PERCENTAGE || 0),
      }));

      setData(formattedData);
    } catch (err) {
      setError(
      err?.response?.data?.message ||
      err?.message ||
      "Failed to load data"
    );
      console.error(
        "Top Performing Corporations Error:",
        err
      );
    } finally{
      setLoading(false);
    }
  };
   if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "150px" }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }
  const max =
    data.length > 0
      ? Math.max(...data.map((d) => d.percent))
      : 1;

  return (
    <div className="dma-bar-list">
      {error ? (
        <div className="text-center text-danger py-3">
          {error}
        </div>
      ) : (
      data.map((row) => (
        <div
          className="dma-bar-row"
          key={row.corporation}
        >
          <span className="dma-bar-name">
            {row.corporation}
          </span>

          <div className="dma-bar-track">
            <div
              className="dma-bar-fill"
              style={{
                width: `${(row.percent / max) * 100}%`,
                background: "var(--dma-green)",
              }}
            />
          </div>

          <span
            className="dma-bar-value"
            style={{
              color: "var(--dma-green)",
            }}
          >
            {row.percent.toFixed(2)}%
          </span>
        </div>
      ))
    )}  
    </div>
  );
}

export default memo(TopPerformingCorporationsChart);