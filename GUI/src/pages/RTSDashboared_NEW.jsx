// RTSDashboared_NEW.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/dashboard.css";
import "../styles/rts-new.css";

import Header_NEW from "../components/Header_NEW";
import { getHomePath } from "../utils/auth";
import Stats_NEW from "../components/Stats_NEW";
import DashboardCard_NEW from "../components/DashboardCard_NEW";
import Table_NEW from "../components/Table_NEW";

function RTSDashboard_NEW() {
  const navigate = useNavigate();
  const [lastUpdated, setLastUpdated] = useState("");

  useEffect(() => {
    const now = new Date();
    const day = now.getDate();
    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];
    const month = months[now.getMonth()];
    const year = now.getFullYear();
    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12; // 0 hour should be 12
    const formattedHours = String(hours).padStart(2, "0");

    setLastUpdated(`${day} ${month} ${year} ${formattedHours}:${minutes} ${ampm}`);
  }, []);

  return (
    <div className="dma-dashboard">
      {/* 1 ── Top Header bar */}
      <Header_NEW title="RTS Dashboard" />

      {/* 2 ── Last Updated Date/Time Row */}
      {lastUpdated && (
        <div className="rts-date-row">
          <span className="rts-last-updated">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="2" />
              <path d="M3 9h18M8 3v4M16 3v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            Last Updated: {lastUpdated}
          </span>
        </div>
      )}

      {/* 3 ── 7 KPI Summary Cards ─────────────────────────────────── */}
      <Stats_NEW />

      {/* Back Arrow button */}
      <div className="rts-back-btn-row">
        <button
          onClick={() => navigate(getHomePath())}
          className="rts-back-btn-inline"
          title="Go Back to Home"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
        </button>
      </div>

      {/* 4 ── Corporation-wise Table ──────────────────────────────── */}
      <DashboardCard_NEW className="rts-table-card">
        <Table_NEW />
      </DashboardCard_NEW>

      {/* Back Arrow button below the table */}
      <div className="rts-back-btn-row" style={{ marginTop: "10px" }}>
        <button
          onClick={() => navigate(getHomePath())}
          className="rts-back-btn-inline"
          title="Go Back to Home"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
        </button>
      </div>

    </div>
  );
}

export default RTSDashboard_NEW;
