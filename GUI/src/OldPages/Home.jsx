import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import HomeCards from "../components/HomeCards";
import Header from "../components/Header";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function Home() {
  const [cards, setCards] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

  const handleCardClick = (title) => {
  if (title === "RTS") {
    navigate("/rtsdashboard");
  } else if (title === "Property Tax") {
    navigate("/propertydashboard");
  }
};
  useEffect(() => {
    fetchDashboard();
  }, []);

 const fetchDashboard = async () => {
  try {
    // const start = performance.now();
    setLoading(true);
    const res = await axios.get(
      `${API_BASE_URL}/dashboard/DashboardDataNew`
    );

  //  const end = performance.now();

// console.log(`API Time: ${((end - start) / 1000).toFixed(2)} sec`);

    setCards(res.data.data || []);
  } catch (err) {
    console.error("Dashboard Error:", err);
  } finally{
    setLoading(false);
  }
};

  return (
    <div className="dma-dashboard">
      <Header />

      <div className="container-fluid px-4 py-4">
        {loading ? (
          <div
            style={{
              height: "60vh",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <div
              className="spinner-border text-primary"
              role="status"
            >
              <span className="visually-hidden">
                Loading...
              </span>
            </div>
          </div>
        ) : (
         <HomeCards 
  cards={cards}
  onCardClick={handleCardClick}
/>
        )}
      </div>
    </div>
  );
}

