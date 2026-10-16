// Home_NEW.jsx
// DMA Dashboard – Home page (new design, matches screenshot).
// Fetches cards from API and renders them in a 4-column grid.

import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import HomeCard_NEW from "../components/HomeCard_NEW";
import "../styles/home-new.css";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api").replace(/\/+$/, "");

/* ── Card metadata list: exact color + route + solid SVG icon by index ── */
const CARD_META_LIST = [
  /* 0: Property Tax */
  {
    color: "blue",
    route: "/propertydashboard",
    icon: (
      <svg width="20" height="20" viewBox="-1 1.5 24 24" fill="none">
        <rect x="2" y="7" width="13" height="15" rx="1.5" stroke="currentColor" strokeWidth="1.7" />
        <rect x="15" y="11" width="7" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.7" />
        <rect x="5" y="10" width="2.5" height="2.5" rx="0.5" fill="currentColor" opacity="0.7" />
        <rect x="9.5" y="10" width="2.5" height="2.5" rx="0.5" fill="currentColor" opacity="0.7" />
        <rect x="5" y="14.5" width="2.5" height="2.5" rx="0.5" fill="currentColor" opacity="0.7" />
        <rect x="9.5" y="14.5" width="2.5" height="2.5" rx="0.5" fill="currentColor" opacity="0.7" />
        <rect x="17" y="14" width="2" height="2" rx="0.4" fill="currentColor" opacity="0.7" />
        <rect x="17" y="18" width="2" height="2" rx="0.4" fill="currentColor" opacity="0.7" />
        <rect x="7" y="19" width="3" height="3" rx="0.5" fill="currentColor" opacity="0.6" />
      </svg>
    ),
  },
  /* 1: Water Tax */
  {
    color: "teal",
    route: null,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
      </svg>
    ),
  },
  /* 2: Grievances */
  {
    color: "red",
    route: null,
    icon: (
      <svg width="24" height="24" viewBox="0 0 576 512" fill="currentColor">
        <path d="M416 192c0-88.4-93.1-160-208-160S0 103.6 0 192c0 34.3 14.1 65.9 38 92-13.4 30.2-35.5 54.2-35.8 54.5-2.2 2.3-2.8 5.7-1.5 8.7S4.8 352 8 352c36.6 0 66.9-12.3 88.7-25 32.2 15.7 70.3 25 111.3 25 114.9 0 208-71.6 208-160zm122 220c23.9-26 38-57.7 38-92 0-66.9-53.5-124.2-129.3-148.1.9 6.6 1.3 13.3 1.3 20.1 0 105.9-107.7 192-240 192-10.8 0-21.3-.8-31.7-1.9C207.8 439.6 281.8 480 368 480c41 0 79.1-9.2 111.3-25 21.8 12.7 52.1 25 88.7 25 3.2 0 6.1-1.9 7.3-4.8 1.3-2.9.7-6.3-1.5-8.7-.3-.3-22.4-24.2-35.8-54.5z" />
      </svg>
    ),
  },
  /* 3: Estate */
  {
    color: "purple",
    route: "/servicedashboard?module=ESTD&title=Estate",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
        <path fillRule="evenodd" d="M3 2.25a.75.75 0 0 0 0 1.5v16.5h-.75a.75.75 0 0 0 0 1.5H15v-18a.75.75 0 0 0 0-1.5H3ZM6.75 19.5v-2.25a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 1-.75.75h-3a.75.75 0 0 1-.75-.75ZM6 6.75A.75.75 0 0 1 6.75 6h.75a.75.75 0 0 1 0 1.5h-.75A.75.75 0 0 1 6 6.75ZM6.75 9a.75.75 0 0 0 0 1.5h.75a.75.75 0 0 0 0-1.5h-.75ZM6 12.75a.75.75 0 0 1 .75-.75h.75a.75.75 0 0 1 0 1.5h-.75a.75.75 0 0 1-.75-.75ZM10.5 6a.75.75 0 0 0 0 1.5h.75a.75.75 0 0 0 0-1.5h-.75Zm-.75 3.75A.75.75 0 0 1 10.5 9h.75a.75.75 0 0 1 0 1.5h-.75a.75.75 0 0 1-.75-.75ZM10.5 12a.75.75 0 0 0 0 1.5h.75a.75.75 0 0 0 0-1.5h-.75ZM16.5 6.75v15h5.25a.75.75 0 0 0 0-1.5H21v-12a.75.75 0 0 0 0-1.5h-4.5Zm1.5 4.5a.75.75 0 0 1 .75-.75h.008a.75.75 0 0 1 .75.75v.008a.75.75 0 0 1-.75.75h-.008a.75.75 0 0 1-.75-.75v-.008Zm.75 2.25a.75.75 0 0 0-.75.75v.008c0 .414.336.75.75.75h.008a.75.75 0 0 0 .75-.75v-.008a.75.75 0 0 0-.75-.75h-.008ZM18 17.25a.75.75 0 0 1 .75-.75h.008a.75.75 0 0 1 .75.75v.008a.75.75 0 0 1-.75.75h-.008a.75.75 0 0 1-.75-.75v-.008Z" clipRule="evenodd" />
      </svg>
    ),
  },
  /* 4: CFC */
  {
    color: "green",
    route: null,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
      </svg>
    ),
  },
  /* 5: Accounts */
  {
    color: "navy",
    route: null,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
      </svg>
    ),
  },
  /* 6: Estate */
  {
    color: "orange",
    route: "/servicedashboard?module=ESTD&title=Estate",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
        <path fillRule="evenodd" d="M3 2.25a.75.75 0 0 0 0 1.5v16.5h-.75a.75.75 0 0 0 0 1.5H15v-18a.75.75 0 0 0 0-1.5H3ZM6.75 19.5v-2.25a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 1-.75.75h-3a.75.75 0 0 1-.75-.75ZM6 6.75A.75.75 0 0 1 6.75 6h.75a.75.75 0 0 1 0 1.5h-.75A.75.75 0 0 1 6 6.75ZM6.75 9a.75.75 0 0 0 0 1.5h.75a.75.75 0 0 0 0-1.5h-.75ZM6 12.75a.75.75 0 0 1 .75-.75h.75a.75.75 0 0 1 0 1.5h-.75a.75.75 0 0 1-.75-.75ZM10.5 6a.75.75 0 0 0 0 1.5h.75a.75.75 0 0 0 0-1.5h-.75Zm-.75 3.75A.75.75 0 0 1 10.5 9h.75a.75.75 0 0 1 0 1.5h-.75a.75.75 0 0 1-.75-.75ZM10.5 12a.75.75 0 0 0 0 1.5h.75a.75.75 0 0 0 0-1.5h-.75ZM16.5 6.75v15h5.25a.75.75 0 0 0 0-1.5H21v-12a.75.75 0 0 0 0-1.5h-4.5Zm1.5 4.5a.75.75 0 0 1 .75-.75h.008a.75.75 0 0 1 .75.75v.008a.75.75 0 0 1-.75.75h-.008a.75.75 0 0 1-.75-.75v-.008Zm.75 2.25a.75.75 0 0 0-.75.75v.008c0 .414.336.75.75.75h.008a.75.75 0 0 0 .75-.75v-.008a.75.75 0 0 0-.75-.75h-.008ZM18 17.25a.75.75 0 0 1 .75-.75h.008a.75.75 0 0 1 .75.75v.008a.75.75 0 0 1-.75.75h-.008a.75.75 0 0 1-.75-.75v-.008Z" clipRule="evenodd" />
      </svg>
    ),
  },
  /* 7: Grievances */
  {
    color: "teal",
    route: null,
    icon: (
      <svg width="24" height="24" viewBox="0 0 576 512" fill="currentColor">
        <path d="M416 192c0-88.4-93.1-160-208-160S0 103.6 0 192c0 34.3 14.1 65.9 38 92-13.4 30.2-35.5 54.2-35.8 54.5-2.2 2.3-2.8 5.7-1.5 8.7S4.8 352 8 352c36.6 0 66.9-12.3 88.7-25 32.2 15.7 70.3 25 111.3 25 114.9 0 208-71.6 208-160zm122 220c23.9-26 38-57.7 38-92 0-66.9-53.5-124.2-129.3-148.1.9 6.6 1.3 13.3 1.3 20.1 0 105.9-107.7 192-240 192-10.8 0-21.3-.8-31.7-1.9C207.8 439.6 281.8 480 368 480c41 0 79.1-9.2 111.3-25 21.8 12.7 52.1 25 88.7 25 3.2 0 6.1-1.9 7.3-4.8 1.3-2.9.7-6.3-1.5-8.7-.3-.3-22.4-24.2-35.8-54.5z" />
      </svg>
    ),
  },
  /* 8: Social Welfare */
  {
    color: "red",
    route: null,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
      </svg>
    ),
  },
  /* 9: Asset Management */
  {
    color: "blue",
    route: null,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
        <line x1="12" y1="22.08" x2="12" y2="12" />
      </svg>
    ),
  },
  /* 10: Project Management */
  {
    color: "green",
    route: null,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
      </svg>
    ),
  },
  /* 11: Septic Tank */
  {
    color: "purple",
    route: null,
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
        {/* Loop Handle */}
        <path d="M 8.5 7 A 3.5 3.5 0 0 1 15.5 7" stroke="currentColor" strokeWidth="2.2" fill="none" strokeLinecap="round" />
        {/* Canister Cap */}
        <rect x="6.5" y="7" width="11" height="2.2" rx="0.6" fill="currentColor" />
        {/* Canister Neck */}
        <rect x="9.5" y="9.2" width="5" height="1.8" fill="currentColor" />
        {/* Canister Body */}
        <rect x="5.5" y="11" width="13" height="11.5" rx="1.5" fill="currentColor" />
        {/* Cutout text using purple fill */}
        <text x="12" y="14.3" fontFamily="Inter, system-ui, -apple-system, sans-serif" fontWeight="900" fontSize="3" letterSpacing="0.2" textAnchor="middle" fill="var(--hn-purple)">SEP</text>
        <text x="12" y="17.5" fontFamily="Inter, system-ui, -apple-system, sans-serif" fontWeight="900" fontSize="3" letterSpacing="0.2" textAnchor="middle" fill="var(--hn-purple)">TIC</text>
        <text x="12" y="20.7" fontFamily="Inter, system-ui, -apple-system, sans-serif" fontWeight="900" fontSize="3" letterSpacing="0.2" textAnchor="middle" fill="var(--hn-purple)">TNK</text>
      </svg>
    ),
  },
  /* 12: Inward Outward */
  {
    color: "orange",
    route: null,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M9 3L5 6.99h3V14h2V6.99h3L9 3zm7 14.01V10h-2v7.01h-3L15 21l4-3.99h-3z" />
      </svg>
    ),
  },
  /* 13: Birth & Death */
  {
    color: "teal",
    route: null,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
      </svg>
    ),
  },
  /* 14: Asset Management */
  {
    color: "blue",
    route: null,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="M12 15a2.5 2.5 0 0 0 2.5-2.5V9.5a1 1 0 0 0-2 0v1h-1v-2a1 1 0 0 0-2 0v2h-1v-1a1 1 0 0 0-2 0v3.5A2.5 2.5 0 0 0 12 15z" fill="currentColor" fillOpacity="0.3" />
      </svg>
    ),
  },
  /* 15: Smart Parking */
  {
    color: "green",
    route: null,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12.5 6.5H10v3h2.5c.83 0 1.5-.67 1.5-1.5S13.33 6.5 12.5 6.5zM19 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-3.5 5c0 1.93-1.57 3.5-3.5 3.5H10v3H8V5h4.5C14.43 5 15.5 6.57 15.5 8z" />
      </svg>
    ),
  },
  /* 16: Legal */
  {
    color: "purple",
    route: null,
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        {/* Sounding block at bottom-left */}
        <rect x="2" y="17" width="10" height="2.5" rx="1.25" fill="currentColor" />
        {/* Gavel rotated at 45 deg, mallet center at (8.5, 9.5) */}
        <g transform="translate(8.5, 9.5) rotate(45)">
          {/* Mallet Head */}
          <rect x="-2.5" y="-6" width="5" height="12" rx="1.2" fill="currentColor" />
          {/* Head Ridge/Band */}
          <rect x="-3" y="-1.5" width="6" height="3" fill="currentColor" />
          {/* Handle */}
          <rect x="2" y="-1" width="14" height="2" rx="1" fill="currentColor" />
        </g>
      </svg>
    ),
  },
  /* 17: Market */
  {
    color: "red",
    route: null,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20 4H4v2h16V4zm1 10v-2l-1-5H4L3 12v2c0 .55.45 1 1 1h1v6h10v-6h4v6h2v-6c.55 0 1-.45 1-1zm-9 4H7v-4h5v4z" />
      </svg>
    ),
  },
  /* 18: Medicine Inventory */
  {
    color: "green",
    route: null,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19 3H5c-1.1 0-1.99.9-1.99 2L3 19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-1 11h-4v4h-4v-4H6v-4h4V6h4v4h4v4z" />
      </svg>
    ),
  },
  /* 19: Open Land */
  {
    color: "teal",
    route: null,
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
        <polygon points="3,5 8.5,2.25 8.5,19.25 3,22" />
        <polygon points="9.5,2.25 14.5,4.75 14.5,21.75 9.5,19.25" />
        <polygon points="15.5,4.75 21,2 21,19 15.5,21.75" />
      </svg>
    ),
  },
  /* 20: Fire */
  {
    color: "red",
    route: null,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M13.5.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67zM11.71 19c-1.78 0-3.22-1.4-3.22-3.14 0-1.62 1.05-2.76 2.81-3.12 1.77-.36 3.6-1.21 4.62-2.58.39 1.29.59 2.65.59 4.04 0 2.65-2.15 4.8-4.8 4.8z" />
      </svg>
    ),
  },
  /* 21: Works */
  {
    color: "gold",
    route: null,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
      </svg>
    ),
  },
  /* 22: Marriage Registration */
  {
    color: "pink",
    route: null,
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
        {/* Floating Heart */}
        <path d="M12 4.3c-0.4-0.6-1-0.9-1.7-0.9c-1.2 0-2.2 1-2.2 2.2c0 1.8 3.4 3.9 3.9 4.3c0.5-0.4 3.9-2.5 3.9-4.3c0-1.2-1-2.2-2.2-2.2c-0.7 0-1.3 0.3-1.7 0.9z" fill="currentColor" />
        {/* Bride Veil (Behind) */}
        <path d="M7.5 10.8c-2.3 0-3.8 1.5-3.8 4.2v6.2c0 .3.2.5.5.5h6.6c.3 0 .5-.2.5-.5v-6.2c0-2.7-1.5-4.2-3.8-4.2z" fill="currentColor" opacity="0.25" />
        {/* Bride Bun */}
        <circle cx="7.5" cy="11.2" r="1.1" fill="currentColor" />
        {/* Bride Head */}
        <circle cx="7.5" cy="14" r="2.2" fill="currentColor" />
        {/* Bride Neck */}
        <rect x="6.8" y="16.2" width="1.4" height="2.3" fill="currentColor" />
        {/* Bride Dress */}
        <path d="M3.5 22c0-2.5 1.5-3.5 4-3.5s4 1 4 3.5h-8z" fill="currentColor" />
        {/* Bride Sweetheart Cutout */}
        <path d="M5.5 18.5c0.8 1 3.2 1 4 0z" fill="var(--hn-pink)" />
        {/* Groom Hair */}
        <path d="M14.3 13.5c0-1.8 1-2.6 2.2-2.6s2.2 0.8 2.2 2.6z" fill="currentColor" />
        {/* Groom Head */}
        <circle cx="16.5" cy="14" r="2.2" fill="currentColor" />
        {/* Groom Neck */}
        <rect x="15.8" y="16.2" width="1.4" height="2.3" fill="currentColor" />
        {/* Groom Suit */}
        <path d="M12.5 22c0-2.5 1.5-3.5 4-3.5s4 1 4 3.5h-8z" fill="currentColor" />
        {/* Groom Collar Cutout */}
        <polygon points="16.5,18.5 15.1,20.5 17.9,20.5" fill="var(--hn-pink)" />
        {/* Groom Tie */}
        <polygon points="16.5,19.5 16.1,21.5 16.5,22 16.9,21.5" fill="currentColor" />
      </svg>
    ),
  },
  /* 23: Visitor Management */
  {
    color: "blue",
    route: null,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
      </svg>
    ),
  },
  /* 24: RTS */
  {
    color: "purple",
    route: "/rtsdashboard",
    icon: (
      <svg width="20" height="20" viewBox="-1 1.5 24 24" fill="none">
        <rect x="2" y="7" width="13" height="15" rx="1.5" stroke="currentColor" strokeWidth="1.7" />
        <rect x="15" y="11" width="7" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.7" />
        <rect x="5" y="10" width="2.5" height="2.5" rx="0.5" fill="currentColor" opacity="0.7" />
        <rect x="9.5" y="10" width="2.5" height="2.5" rx="0.5" fill="currentColor" opacity="0.7" />
        <rect x="5" y="14.5" width="2.5" height="2.5" rx="0.5" fill="currentColor" opacity="0.7" />
        <rect x="9.5" y="14.5" width="2.5" height="2.5" rx="0.5" fill="currentColor" opacity="0.7" />
        <rect x="17" y="14" width="2" height="2" rx="0.4" fill="currentColor" opacity="0.7" />
        <rect x="17" y="18" width="2" height="2" rx="0.4" fill="currentColor" opacity="0.7" />
        <rect x="7" y="19" width="3" height="3" rx="0.5" fill="currentColor" opacity="0.6" />
      </svg>
    ),
  },
  /* 25: OPD */
  {
    color: "blue",
    route: null,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19 3H5c-1.1 0-1.99.9-1.99 2L3 19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-1 11h-4v4h-4v-4H6v-4h4V6h4v4h4v4z" />
      </svg>
    ),
  },
  /* 26: Digital Library */
  {
    color: "gold",
    route: null,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M21 5c-1.11-.35-2.33-.5-3.5-.5-1.95 0-4.05.4-5.5 1.5-1.45-1.1-3.55-1.5-5.5-1.5S2.45 4.9 1 6v14.65c0 .25.25.5.5.5.1 0 .15-.05.25-.05C3.1 20.45 5.05 20 6.5 20c1.95 0 4.05.4 5.5 1.5 1.35-.85 3.8-1.5 5.5-1.5 1.65 0 3.35.3 4.75 1.05.1.05.15.05.25.05.25 0 .5-.25.5-.5V6c-.6-.45-1.25-.75-2-1zm0 13.5c-1.1-.35-2.3-.5-3.5-.5-1.7 0-4.15.65-5.5 1.5V8c1.35-.85 3.8-1.5 5.5-1.5 1.2 0 2.4.15 3.5.5v11.5z" />
      </svg>
    ),
  },
  /* 27: Tanker */
  {
    color: "teal",
    route: null,
    icon: (
      <svg width="23" height="23" viewBox="0 0 640 512" fill="currentColor">
        <g transform="translate(640, 0) scale(-1, 1)">
          <path d="M624 352h-16V243.9c0-12.7-5.1-24.9-14.1-33.9L494 110.1c-9-9-21.2-14.1-33.9-14.1H416V48c0-26.5-21.5-48-48-48H48C21.5 0 0 21.5 0 48v320c0 26.5 21.5 48 48 48h16c0 53 43 96 96 96s96-43 96-96h128c0 53 43 96 96 96s96-43 96-96h48c8.8 0 16-7.2 16-16v-32c0-8.8-7.2-16-16-16zM160 464c-26.5 0-48-21.5-48-48s21.5-48 48-48 48 21.5 48 48-21.5 48-48 48zm320 0c-26.5 0-48-21.5-48-48s21.5-48 48-48 48 21.5 48 48-21.5 48-48 48zm80-208H416V144h44.1l99.9 99.9V256z" />
        </g>
      </svg>
    ),
  },
  /* 28: Advertisement */
  {
    color: "purple",
    route: null,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h3l-3 3v1h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-3 13H7v-2h10v2zm0-3H7v-2h10v2zm0-3H7V7h10v2z" />
      </svg>
    ),
  },
  /* 29: Bombay Nursing Act */
  {
    color: "teal",
    route: null,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
      </svg>
    ),
  },
  /* 30: File Management Module (FMGNT) */
  {
    color: "blue",
    route: null,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z" />
      </svg>
    ),
  },
  /* 31: Payroll Module (ADM) */
  {
    color: "green",
    route: null,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19 14V6c0-1.1-.9-2-2-2H3c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zm-9-1c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm13-6v11c0 1.1-.9 2-2 2H4v-2h17V7h2z" />
      </svg>
    ),
  },
  /* 32: Municipal Secretary (MS) */
  {
    color: "purple",
    route: null,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
      </svg>
    ),
  },
  /* 33: Pension Module (P1) */
  {
    color: "orange",
    route: null,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
      </svg>
    ),
  },
  /* 34: Solid Waste Management (SWMD) */
  {
    color: "teal",
    route: null,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M16 9v10H8V9h8m-1.5-6h-5l-1 1H5v2h14V4h-3.5l-1-1zM18 7H6v12c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7z" />
      </svg>
    ),
  },
];

/** Mapping card titles to their original hardcoded index in CARD_META_LIST */
const TITLE_TO_INDEX_MAP = {
  "property tax": 0,
  "water tax": 1,
  "grievances": 2,
  "estate": 3,
  "cfc": 4,
  "accounts": 5,
  "social welfare": 8,
  "asset management": 9,
  "project management": 10,
  "septic tank": 11,
  "inward outward": 12,
  "birth & death": 13,
  "smart parking": 15,
  "legal": 16,
  "market": 17,
  "medicine inventory": 18,
  "inventory": 18,
  "open land": 19,
  "fire": 20,
  "works": 21,
  "marriage registration": 22,
  "visitor management": 23,
  "rts": 24,
  "opd": 25,
  "digital library": 26,
  "tanker": 27,
  "advertisement": 28,
  "bombay nursing act": 29,
  "file management module": 30,
  "file management": 30,
  "fmgnt": 30,
  "payroll module": 31,
  "payroll": 31,
  "adm": 31,
  "municipal secretary": 32,
  "ms": 32,
  "pension module": 33,
  "pension": 33,
  "p1": 33,
  "solid waste management": 34,
  "solid waste": 34,
  "swmd": 34,
};

/** Default fallback metadata for unknown card indexes/titles */
export function getCardMeta(title, index) {
  // First, try title-based lookup to avoid API order mismatch
  if (title) {
    const mappedIndex = TITLE_TO_INDEX_MAP[title.toLowerCase()];
    if (mappedIndex !== undefined && CARD_META_LIST[mappedIndex]) {
      return CARD_META_LIST[mappedIndex];
    }
  }

  // Fallback to array index
  if (index !== undefined && CARD_META_LIST[index]) {
    return CARD_META_LIST[index];
  }
  // fallback
  return {
    color: "navy",
    route: null,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <rect x="3" y="3" width="18" height="18" rx="2" />
      </svg>
    ),
  };
}

/** Format current date the way the screenshot shows: "May 24, 2025 / Saturday" */
function getFormattedDate() {
  const now = new Date();
  const opts = { year: "numeric", month: "long", day: "numeric", weekday: "long" };
  const parts = new Intl.DateTimeFormat("en-US", opts).formatToParts(now);
  const get = (t) => parts.find((p) => p.type === t)?.value ?? "";
  return {
    date: `${get("month")} ${get("day")}, ${get("year")}`,
    day: get("weekday"),
  };
}

/* ── Skeleton loader grid ──────────────────────────────────────────── */
function SkeletonGrid() {
  return (
    <div className="hn-grid">
      {Array.from({ length: 12 }).map((_, i) => (
        <div className="hn-skeleton-card" key={i}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <div className="hn-skel-circle" />
            <div className="hn-skel-line hn-skel-line--short" style={{ marginBottom: 0 }} />
          </div>
          <div className="hn-skel-line hn-skel-line--full" />
          <div className="hn-skel-line hn-skel-line--full" />
          <div className="hn-skel-line hn-skel-line--short" />
        </div>
      ))}
    </div>
  );
}



/* ── Main Page Component ────────────────────────────────────────────── */
export default function Home_NEW() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { date, day } = getFormattedDate();

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      let rawCards = [];

      try {
        const res = await axios.get(`${API_BASE_URL}/dashboard/DashboardDataNew`);
        if (res.data?.success && Array.isArray(res.data.data) && res.data.data.length > 0) {
          rawCards = res.data.data;
        }
      } catch (e) {
        console.warn("DashboardDataNew fetch error:", e.message);
      }

      if (rawCards.length === 0) {
        try {
          const resFallback = await axios.get(`${API_BASE_URL}/dashboard/FetchDashboardDataNew`);
          if (resFallback.data?.success && Array.isArray(resFallback.data.data) && resFallback.data.data.length > 0) {
            rawCards = resFallback.data.data;
          }
        } catch (e2) {
          console.warn("FetchDashboardDataNew fallback error:", e2.message);
        }
      }


      const DISABLED_CODES = new Set(["OPDM", "BNA", "VIST", "TNKR", "DLIB", "SEPT", "LICD"]);
      const DISABLED_TITLES = [
        "opd",
        "bombay nursing",
        "bombay nursing act",
        "visitor management",
        "visitor module",
        "visitor",
        "tanker",
        "water tanker",
        "digital library",
        "digital liberes",
        "septic tank",
        "licenses department",
        "license department",
        "licenses departement",
      ];

      const cleanCards = rawCards
        .filter((card) => {
          const code = (card.code || "").toUpperCase().trim();
          const title = (card.title || "").toLowerCase().trim();
          if (DISABLED_CODES.has(code)) return false;
          if (DISABLED_TITLES.some((dt) => title.includes(dt))) return false;
          return true;
        })
        .map((card) => {
          const code = (card.code || "").toUpperCase().trim();
          const title = (card.title || "").toLowerCase().trim();
          let updatedCard = { ...card };
          if (code === "MEDI" || title.includes("medicine inventory") || title === "medicine") {
            updatedCard.title = "Inventory";
          }
          if (code === "RTS" || title === "rts") {
            updatedCard.metrics = (updatedCard.metrics || []).map((m) => {
              const lbl = (m.label || "").toLowerCase();
              if (lbl.includes("approved")) {
                return { ...m, label: "Certificates Issued" };
              }
              return m;
            });
          }
          return updatedCard;
        });

      const cardsWithIndex = cleanCards.map((card, index) => ({
        ...card,
        origIndex: index,
      }));

      setCards(cardsWithIndex);
    } catch (err) {
      console.error("Dashboard Error:", err);
      setCards([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const handleCardClick = (card, index) => {
    // If the card has a direct external link
    if (card.link && (card.link.startsWith("http://") || card.link.startsWith("https://"))) {
      window.open(card.link, "_blank", "noopener,noreferrer");
      return;
    }

    const titleLower = (card.title || "").toLowerCase().trim();
    const code = (card.code || "").toUpperCase().trim();

    // Specific dedicated dashboards
    if (titleLower === "property tax" || code === "PTAX") {
      navigate("/propertydashboard");
      return;
    }
    if (titleLower === "rts" || code === "RTS") {
      navigate("/rtsdashboard");
      return;
    }

    // All services (Water Tax, Estate, Market, CFC, Grievances, Accounts, etc.)
    const meta = getCardMeta(card.title, index);
    const targetCode = code || (card.title ? card.title.substring(0, 4).toUpperCase() : "ESTD");
    const targetTitle = card.title || "Service";
    navigate(`/servicedashboard?module=${targetCode}&title=${encodeURIComponent(targetTitle)}`, {
      state: {
        title: targetTitle,
        color: meta.color || "blue",
        metrics: card.metrics || [],
        ulbId: 1890,
        corpName: "Karjat Municipal Council, Karjat"
      }
    });
  };

  return (
    <div className="hn-page">
      {/* ── TOP HEADER ── */}
      <header className="hn-header">
        {/* Left: logo + title */}
        <div className="hn-header-left">
            <img
            src="/Images/logos/KarjatLogo.png"
            alt="Karjat"
            className="hn-header-logo"
             style={{ width: "50px", height: "50px" }}
            onError={(e) => { e.currentTarget.style.display = "none"; }}
          />
          <div className="hn-header-title-wrap">
            <h1 className="hn-header-title">Karjat Nagar Parishad - Dashboard</h1>
          </div>
        </div>

        {/* Right: Nagar Karyawali logo + date badge */}
        <div className="hn-header-right">
          <img
            src="/Images/MasterPageLogo.png"
            alt="Nagar Karyawali"
            className="hn-brand-logo"
            onError={(e) => { e.currentTarget.style.display = "none"; }}
          />
          <div className="hn-date-badge">
            {/* Calendar icon */}
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="2" />
              <path d="M3 9h18M8 3v4M16 3v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <span>{date}</span>
            <span style={{ opacity: 0.7 }}>|</span>
            <span>{day}</span>
          </div>
        </div>
      </header>

      {/* ── BODY ── */}
      <div className="hn-body">
        {loading && <SkeletonGrid />}

        {!loading && error && (
          <div className="hn-error">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
              <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <span style={{ flex: 1 }}>{error}</span>
            <button className="hn-error-retry" onClick={fetchDashboard}>
              Retry
            </button>
          </div>
        )}

        {!loading && !error && (
          <div className="hn-grid">
            {cards.map((card) => {
              const meta = getCardMeta(card.title, card.origIndex);
              const isClickable = true;
              return (
                <HomeCard_NEW
                  key={`${card.code ?? card.title}-${card.origIndex}`}
                  title={card.title}
                  color={meta.color}
                  icon={meta.icon}
                  clickable={isClickable}
                  onClick={() => handleCardClick(card, card.origIndex)}
                  metrics={card.metrics || []}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
