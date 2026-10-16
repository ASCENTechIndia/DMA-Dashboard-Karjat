import { useState, useEffect, memo } from "react";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function CollectionRankingChart() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const fetchCollectionRanking = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/property/getTotalPerfCorpCollection`);
        if (response.data.success) {
          const rows = response.data.data || [];
          if (rows.length === 0) {
            setMessage(response.data.message || "No collection ranking data available.");
          } else {
            setData(
              rows.map((item) => ({
                corporation: item.CORPORATION || "Unknown",
                amount: Number(item.TOTAL_COLLECTION || 0) / 10000000, // convert to Crores
                rank: Number(item.RANK_NO || 0),
              }))
            );
          }
        } else {
          setMessage(response.data.message || "Failed to load collection ranking.");
        }
      } catch (err) {
        console.error("Error fetching collection ranking:", err);
        setMessage(err.response?.data?.message || err.message || "Failed to load collection ranking.");
      } finally {
        setLoading(false);
      }
    };

    fetchCollectionRanking();
  }, []);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "150px" }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (message) {
    return (
      <div className="alert alert-info m-2" role="alert">
        <i className="bi bi-info-circle me-2"></i>
        {message}
      </div>
    );
  }

  const max = Math.max(...data.map((d) => d.amount));

  return (
    <div className="dma-bar-list">
      {data.map((row) => (
        <div className="dma-bar-row" key={row.corporation}>
          <span className="dma-bar-name">{row.corporation}</span>
          <div className="dma-bar-track">
            <div
              className="dma-bar-fill"
              style={{
                width: `${max > 0 ? (row.amount / max) * 100 : 0}%`,
                background: "var(--dma-purple)",
              }}
            />
          </div>
          <span
            className="dma-bar-value"
            style={{ color: "var(--dma-purple)" }}
          >
            {row.amount.toFixed(2)} Cr
          </span>
        </div>
      ))}
    </div>
  );
}

export default memo(CollectionRankingChart);
