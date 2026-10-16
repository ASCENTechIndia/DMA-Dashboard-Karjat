import { useEffect, useState, memo } from "react";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function TodaysCollectionTable({
  maxRowsBeforeScroll = 5,
}) {
  const [rows, setRows] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTodaysCollection();
  }, []);

  const fetchTodaysCollection = async () => {
    try {
      setMessage("");
 setLoading(true);
      const res = await axios.get(
        `${API_BASE_URL}/property/getTodaysCollection`
      );

      if (res.data.success) {
        setRows(res.data.data || []);
      } else {
        setMessage(
          res.data.message ||
            "Failed to load data"
        );
      }
    } catch (err) {
      setMessage(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load data"
      );
    } finally{
      setLoading(false);
    }
  };

  const hasMoreThanMax =
    rows.length > maxRowsBeforeScroll;

  const totalArrears = rows.reduce(
    (sum, row) =>
      sum + Number(row.ARREARS || 0),
    0
  );

  const totalAmount = rows.reduce(
    (sum, row) =>
      sum + Number(row.TOTAL || 0),
    0
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
  return (
    <div
      className="dma-table-scroll"
      style={{
        maxHeight: hasMoreThanMax
          ? "300px"
          : "auto",
        overflowY: hasMoreThanMax
          ? "auto"
          : "visible",
      }}
    >
      <table className="dma-table">
        <thead>
          <tr>
            <th>Corporation</th>
            <th className="dma-text-center">
              Arrears
            </th>
            <th className="dma-text-center">
              Amount (L)
            </th>
          </tr>
        </thead>

        <tbody>
          {message ? (
            <tr>
              <td
                colSpan="3"
                className="text-center text-danger"
              >
                {message}
              </td>
            </tr>
          ) : (
            rows.map((row, index) => (
              <tr key={index}>
                <td>{row.CORPORATION}</td>

                <td className="dma-text-center">
                  {Number(
                    row.ARREARS || 0
                  ).toLocaleString("en-IN")}
                </td>

                <td className="dma-text-center">
                  {Number(
                    row.TOTAL || 0
                  ).toFixed(2)}
                </td>
              </tr>
            ))
          )}
        </tbody>

        {!message && (
          <tfoot>
            <tr>
              <td>Total</td>

              <td className="dma-text-center">
                {totalArrears.toLocaleString(
                  "en-IN"
                )}
              </td>

              <td className="dma-text-center">
                {totalAmount.toFixed(2)}
              </td>
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  );
}

export default memo(TodaysCollectionTable);