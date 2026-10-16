import { useEffect, useState, memo } from "react";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function CollectionPercentTable({
  maxRowsBeforeScroll = 5,
}) {
  const [data, setData] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState({
    demand: 0,
    collection: 0,
    outstanding: 0,
    percent: 0,
  });

  useEffect(() => {
    fetchCollectionPercent();
  }, []);

const fetchCollectionPercent = async () => {
  try {
    setMessage("");
    setLoading(true);
    const res = await axios.get(
      `${API_BASE_URL}/property/getCollectioninPerct`
    );

    const rows = res.data.data || [];
    // console.log("Rows", rows)
    const totalRow = rows.find(
      (r) => r.CORPORATION === "TOTAL"
    );

    const corporationRows = rows
      .filter((r) => r.CORPORATION !== "TOTAL")
      .map((r) => ({
        corporation: r.CORPORATION,
        demand: Number(r.TOTAL_DEMAND || 0),
        collection: Number(r.TOTAL_COLLECTION || 0),
        outstanding: Number(r.TOTAL_OUTSTANDING || 0),
        percent: Number(r.COLLECTION_PERCENTAGE || 0),
      }));
// console.log("corprows",corporationRows);

    setData(corporationRows);

    if (totalRow) {
      setTotal({
        demand: Number(totalRow.TOTAL_DEMAND || 0),
        collection: Number(totalRow.TOTAL_COLLECTION || 0),
        outstanding: Number(totalRow.TOTAL_OUTSTANDING || 0),
        percent: Number(totalRow.COLLECTION_PERCENTAGE || 0),
      });
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
// useEffect(() => {
//   console.log("Data State:", data);
// }, [data]);
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "150px" }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }
  
  const hasMoreThanMax =
    data.length > maxRowsBeforeScroll;

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
              Dmd
            </th>
            <th className="dma-text-center">
              Coll
            </th>
            <th className="dma-text-center">
              O/S
            </th>
            <th className="dma-text-center">Collection %</th>
          </tr>
        </thead>

    <tbody>
      
  {false ? (
    <tr>
      <td colSpan="5" className="text-center text-danger">
        {message}
      </td>
    </tr>
  ) : (
    data.map((row) => (
      <tr key={row.corporation}>
        <td>{row.corporation}</td>

        <td className="dma-text-center">
          {row.demand.toFixed(2)}
        </td>

        <td className="dma-text-center">
          {row.collection.toFixed(2)}
        </td>

        <td className="dma-text-center">
          {row.outstanding .toFixed(2)}
        </td>

        <td>
          <div className="dma-progress-cell">
            <div className="dma-progress-track">
              <div
                className="dma-progress-fill"
                style={{
                  width: `${Math.min(row.percent, 100)}%`,
                }}
              />
            </div>

            <span className="dma-progress-value">
              {row.percent.toFixed(2)}%
            </span>
          </div>
        </td>
      </tr>
    ))
  )}
</tbody>
 {/* {!message && (
  <tfoot>
    <tr>
      <td>Total</td>

      <td className="dma-text-center">
        {total.demand.toFixed(2)}
      </td>

      <td className="dma-text-center">
        {total.collection.toFixed(2)}
      </td>

      <td className="dma-text-center">
        {total.outstanding.toFixed(2)}
      </td>

      <td className="dma-text-center">
        {total.percent.toFixed(2)}%
      </td>
    </tr>
  </tfoot>
)} */}
      </table>
    </div>
  );
}

export default memo(CollectionPercentTable);