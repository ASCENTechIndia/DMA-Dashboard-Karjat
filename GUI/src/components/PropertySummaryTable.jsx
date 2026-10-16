import { useState, useEffect, memo } from "react";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function PropertySummaryTable() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const fetchPropertySummary = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/property/getPropertySummary`);
        console.log(response.data);
        if (response.data.success) {
          const rows = response.data.data || [];
          if (rows.length === 0) {
            setMessage(response.data.message || "No property summary data available.");
          } else {
            setData(
              rows.map((item) => ({
                corporation: item.CORPORATION || item.corporation || "Unknown",
                residential: Number(item.RESIDENTIAL || item.residential || 0),
                commercial: Number(item.COMMERCIAL || item.commercial || 0),
                mixed: Number(item.MIXED || item.mixed || 0),
                total: Number(item.TOTAL || item.total || 0),
              }))
            );
          }
        } else {
          setMessage(response.data.message || "Failed to load property summary.");
        }
      } catch (err) {
        console.error("Error fetching property summary:", err);
        setMessage(err.response?.data?.message || err.message || "Failed to load property summary.");
      } finally {
        setLoading(false);
      }
    };

    fetchPropertySummary();
  }, []);

  const total = data.reduce(
    (acc, row) => ({
      residential: acc.residential + row.residential,
      commercial: acc.commercial + row.commercial,
      mixed: acc.mixed + row.mixed,
      total: acc.total + row.total,
    }),
    { residential: 0, commercial: 0, mixed: 0, total: 0 }
  );

  const hasMoreThanFive = data.length > 5;

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

  return (
    <div
      className="dma-table-scroll"
      style={{
        maxHeight: hasMoreThanFive ? "300px" : "auto",
        overflowY: hasMoreThanFive ? "auto" : "visible",
      }}
    >
      <table className="dma-table">
        <thead>
          <tr>
            <th>Corporation</th>
            <th className="dma-text-center">Residential</th>
            <th className="dma-text-center">Commercial</th>
            <th className="dma-text-center">Mixed</th>
            <th className="dma-text-center">Total</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr key={idx}>
              <td>
                {row.corporation === "वसई-विरार मनपा" ? (
                  <a
                    href="https://dashboard.onlinevvcmc.in/property/mode"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: "#0d6efd",
                      textDecoration: "underline",
                      cursor: "pointer",
                    }}
                  >
                    {row.corporation}
                  </a>
                ) : (
                  row.corporation
                )}
              </td>
              <td className="dma-text-center">{row.residential.toLocaleString("en-IN")}</td>
              <td className="dma-text-center">{row.commercial.toLocaleString("en-IN")}</td>
              <td className="dma-text-center">{row.mixed.toLocaleString("en-IN")}</td>
              <td className="dma-text-center">{row.total.toLocaleString("en-IN")}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td>Total</td>
            <td className="dma-text-center">{total.residential.toLocaleString("en-IN")}</td>
            <td className="dma-text-center">{total.commercial.toLocaleString("en-IN")}</td>
            <td className="dma-text-center">{total.mixed.toLocaleString("en-IN")}</td>
            <td className="dma-text-center">{total.total.toLocaleString("en-IN")}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

export default memo(PropertySummaryTable);