import React, { useEffect, useRef, useState, useMemo } from "react";
import { useNavigate, useLocation, useParams, useSearchParams } from "react-router-dom";
import {
  FaRupeeSign,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaFileAlt,
  FaPercentage,
  FaBuilding,
  FaChartLine,
  FaMoneyBillWave,
  FaMoneyCheckAlt,
  FaCreditCard,
} from "react-icons/fa";
import * as echarts from "echarts";
import axios from "axios";
import { getCardMeta } from "./Home_NEW";

import "../styles/servicewise-dashboard.css";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api").replace(/\/+$/, "");

export const MODULE_CODE_TO_TITLE = {
  ESTD: "Estate",
  WAT: "Water Tax",
  PTAX: "Property Tax",
  CFC: "CFC",
  ACC: "Accounts",
  CRMD: "Grievances", 
  SWEL: "Social Welfare",
  PRJM: "Project Management",
  INW: "Inward Outward",
  AST: "Asset Management",
  BAND: "Birth & Death",
  SPRK: "Smart Parking",
  LEGL: "Legal",
  MEDI: "Inventory",
  MRKT: "Market",
  OPLD: "Open Land",
  FIRE: "Fire",
  PWD: "Works",
  MRRG: "Marriage Registration",
  RTS: "RTS",
  FMGNT: "File Management Module",
  ADM: "Payroll Module",
  MS: "Municipal Secretary",
  P1: "Pension Module",
  SWMD: "Solid Waste Management",
};

const CARD_COLUMNS_MAP = {
  "water": { cols: ["Total Collection", "Cash", "Cheque", "Online"] },
  "water tax": {
    cols: ["Total Demand", "Total Collection", "Cash", "Cheque", "Online"],
    tableCols: ["Total Demand", "Total Collection", "Cash", "Cheque", "Online"],
  },
  "wat": {
    cols: ["Total Demand", "Total Collection", "Cash", "Cheque", "Online"],
    tableCols: ["Total Demand", "Total Collection", "Cash", "Cheque", "Online"],
  },
  "estate": {
    cols: ["Total Properties", "Rented Properties", "Leased Properties", "Vacant Properties"],
    tableCols: ["Rented Property No.", "Rented Demand", "Rented Collection", "Leased Property No.", "Leased Demand", "Leased Collection"],
  },
  "estd": {
    cols: ["Total Properties", "Rented Properties", "Leased Properties", "Vacant Properties"],
    tableCols: ["Rented Property No.", "Rented Demand", "Rented Collection", "Leased Property No.", "Leased Demand", "Leased Collection"],
  },
  "social welfare": { cols: ["Total Application", "Approved Applications", "Reject Application", "Pending Applications"] },
  "swel": { cols: ["Total Application", "Approved Applications", "Reject Application", "Pending Applications"] },
  "inward outward": { cols: ["Total Inward", "Total Outward", null, null] },
  "inw": { cols: ["Total Inward", "Total Outward", null, null] },
  "bnd": { cols: ["Total Received", "Total Approved", "Total Rejected", "Total Pending"] },
  "birth & death": { cols: ["Total Received", "Total Approved", "Total Rejected", "Total Pending"] },
  "band": { cols: ["Total Received", "Total Approved", "Total Rejected", "Total Pending"] },
  "market": { cols: ["Total Demand", "Total Collection", "Total Outstanding", "Recovery Percentage"] },
  "mrkt": { cols: ["Total Demand", "Total Collection", "Total Outstanding", "Recovery Percentage"] },
  "fire": { cols: ["Total Applications", "Application Approved", "Application Rejected", "Pending Applications"] },
  "marriage registration": { cols: ["Total Application", "Approved Applications", "Rejected Applications", "Pending Applications"] },
  "marriage": { cols: ["Total Application", "Approved Applications", "Rejected Applications", "Pending Applications"] },
  "mrrg": { cols: ["Total Application", "Approved Applications", "Rejected Applications", "Pending Applications"] },
  "legal": { cols: ["Total Cases", "Total Closed Cases", "Total Pending Cases", null] },
  "legl": { cols: ["Total Cases", "Total Closed Cases", "Total Pending Cases", null] },
  "asset management": { cols: ["Total Assets", "Total Purchased Assets", "Total Issued Assets", "Total Assets Pending for Issue"] },
  "ast": { cols: ["Total Assets", "Total Purchased Assets", "Total Issued Assets", "Total Assets Pending for Issue"] },
  "grievances": { cols: ["Total Complaints", "Resolved", "Pending", "Rejected"] },
  "grievance": { cols: ["Total Complaints", "Resolved", "Pending", "Rejected"] },
  "crmd": { cols: ["Total Complaints", "Resolved", "Pending", "Rejected"] },
  "cfc": { cols: ["Total Applications", "Total Demand", "Total Collection", "Recovery Percentage"] },
  "accounts": { cols: ["Total Receipts", "Total Payments", "Bank Balance"], tableCols: ["Total Receipts", "Total Payments"] },
  "account": { cols: ["Total Receipts", "Total Payments", "Bank Balance"], tableCols: ["Total Receipts", "Total Payments"] },
  "acc": { cols: ["Total Receipts", "Total Payments", "Bank Balance"], tableCols: ["Total Receipts", "Total Payments"] },
  "property tax": { cols: ["Total Demand", "Total Collection", "Total Outstanding", "Recovery Percentage"] },
  "ptax": { cols: ["Total Demand", "Total Collection", "Total Outstanding", "Recovery Percentage"] },
  "project management": { cols: ["Total Projects", "Completed", "In Progress", "Pending"] },
  "prjm": { cols: ["Total Projects", "Completed", "In Progress", "Pending"] },
  "septic tank": { cols: ["Total Requests", "Completed", "Pending", null] },
  "smart parking": { cols: ["Total Slots", "Occupied", "Available", null] },
  "sprk": { cols: ["Total Slots", "Occupied", "Available", null] },
  "medicine inventory": { cols: ["Total Stock", "Issued", "Remaining", null] },
  "inventory": { cols: ["Total Stock", "Issued", "Remaining", null] },
  "medi": { cols: ["Total Stock", "Issued", "Remaining", null] },
  "open land": { cols: ["Total Land", "Encroached", "Free", null] },
  "opld": { cols: ["Total Land", "Encroached", "Free", null] },
  "works": { cols: ["Total Works", "Completed", "Ongoing", "Pending"] },
  "pwd": { cols: ["Total Works", "Completed", "Ongoing", "Pending"] },
  "visitor management": { cols: ["Total Visitors", "Approved", "Pending", null] },
  "rts": { cols: ["Total Applications", "Certificates Issued", "Pending", "Rejected"] },
  "opd": { cols: ["Total Patients", "Treated", "Referred", null] },
  "digital library": { cols: ["Total Members", "Books Issued", "Books Returned", "Overdue"] },
  "tanker": { cols: ["Total Trips", "Completed", "Pending", null] },
  "advertisement": {
    cols: ["Total Licenses", "Approved", "Pending", "Total Amount"],
    tableCols: ["Total Licenses", "Approved", "Pending", "Total Amount"],
  },
  "bombay nursing act": { cols: ["Total Registrations", "Active", "Expired", null] },
  "illegal hoarding": { cols: ["Panchnama Count", "Total Notices", "Notice Gen. Amt (In Lacs)", null] },
  "illegal hording": { cols: ["Panchnama Count", "Total Notices", "Notice Gen. Amt (In Lacs)", null] },
  "mandap": { cols: ["Total Applications", "Approved", "Rejected", "Pending"] },
  "file management module": { cols: ["Total Files", "Approved Files", "Pending Files", "Rejected Files"] },
  "file management": { cols: ["Total Files", "Approved Files", "Pending Files", "Rejected Files"] },
  "fmgnt": { cols: ["Total Files", "Approved Files", "Pending Files", "Rejected Files"] },
  "payroll module": { cols: ["Total Employees", "Processed Salary", "Pending", null] },
  "payroll": { cols: ["Total Employees", "Processed Salary", "Pending", null] },
  "adm": { cols: ["Total Employees", "Processed Salary", "Pending", null] },
  "municipal secretary": { cols: ["Total Meetings", "Approved Resolutions", "Pending Resolutions", null] },
  "ms": { cols: ["Total Meetings", "Approved Resolutions", "Pending Resolutions", null] },
  "pension module": { cols: ["Total Pensioners", "Disbursed Cases", "Pending Cases", null] },
  "pension": { cols: ["Total Pensioners", "Disbursed Cases", "Pending Cases", null] },
  "p1": { cols: ["Total Pensioners", "Disbursed Cases", "Pending Cases", null] },
  "solid waste management": { cols: ["Total Waste Collected (MT)", "Processed Waste (MT)", "Pending Waste (MT)", null] },
  "solid waste": { cols: ["Total Waste Collected (MT)", "Processed Waste (MT)", "Pending Waste (MT)", null] },
  "swmd": { cols: ["Total Waste Collected (MT)", "Processed Waste (MT)", "Pending Waste (MT)", null] },
};

const DEFAULT_COLS = ["Total", "Approved", "Pending", "Rejected"];

const ALL_MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function getMonthNumber(m) {
  if (!m) return 0;
  if (!isNaN(m) && Number(m) >= 1 && Number(m) <= 12) return Number(m);
  const str = String(m).trim().slice(0, 3).toLowerCase();
  const idx = ALL_MONTHS.findIndex(name => name.toLowerCase() === str);
  return idx >= 0 ? idx + 1 : 0;
}

function formatMonthYear(d) {
  const mRaw = d.month ?? d.MONTH;
  if (!mRaw) return null;
  const mNum = getMonthNumber(mRaw);
  const monthName = mNum >= 1 && mNum <= 12 ? ALL_MONTHS[mNum - 1] : String(mRaw).slice(0, 3);
  const yVal = d.year ?? d.YEAR;
  const yStr = yVal ? String(yVal) : String(new Date().getFullYear());
  const yearSuffix = yStr.length >= 2 ? "-" + yStr.slice(-2) : "";
  return monthName + yearSuffix;
}

function getLast6Months() {
  const now = new Date();
  const cur = now.getMonth();
  const yr = String(now.getFullYear()).slice(-2);
  return Array.from({ length: 6 }, (_, i) => `${ALL_MONTHS[(cur - 5 + i + 12) % 12]}-${yr}`);
}

function fmtNum(v) {
  const n = Number(String(v).replace(/,/g, ""));
  if (isNaN(n)) return v;
  if (n >= 10000000) return (n / 10000000).toFixed(2) + " Cr";
  if (n >= 100000) return (n / 100000).toFixed(2) + " L";
  return n.toLocaleString("en-IN");
}

function formatCurrency(v) {
  return `\u20B9 ${fmtNum(v)}`;
}

function getStatIcon(label, index, titleKey) {
  const lower = (label || "").toLowerCase();

  if (titleKey && titleKey.includes("water")) {
    if (lower.includes("cash")) return <FaMoneyBillWave size={22} style={{ display: "block" }} />;
    if (lower.includes("cheque")) return <FaMoneyCheckAlt size={22} style={{ display: "block" }} />;
    if (lower.includes("online")) return <FaCreditCard size={22} style={{ display: "block" }} />;
  }

  if (lower.includes("approved") || lower.includes("completed")) {
    return <FaCheckCircle size={22} style={{ display: "block" }} />;
  }
  if (lower.includes("reject")) {
    return <FaTimesCircle size={22} style={{ display: "block" }} />;
  }
  if (lower.includes("pending") || lower.includes("outstanding") || lower.includes("balance")) {
    return <FaClock size={22} style={{ display: "block" }} />;
  }
  if (
    lower.includes("application") ||
    lower.includes("request") ||
    lower.includes("form") ||
    lower.includes("project") ||
    lower.includes("received")
  ) {
    return <FaFileAlt size={22} style={{ display: "block" }} />;
  }
  if (lower.includes("percentage")) {
    return <FaPercentage size={22} style={{ display: "block" }} />;
  }
  if (lower.includes("properties") || lower.includes("estate") || lower.includes("shop")) {
    return <FaBuilding size={22} style={{ display: "block" }} />;
  }
  if (lower.includes("demand") || lower.includes("budget") || lower.includes("revenue") || lower.includes("collection")) {
    return <FaRupeeSign size={22} style={{ display: "block" }} />;
  }

  const fallbackIcons = [
    <FaChartLine size={22} style={{ display: "block" }} />,
    <FaFileAlt size={22} style={{ display: "block" }} />,
    <FaClock size={22} style={{ display: "block" }} />,
    <FaBuilding size={22} style={{ display: "block" }} />,
  ];
  return fallbackIcons[index % fallbackIcons.length];
}

const STAT_COLORS = [
  { main: "#2563eb", bg: "#eff6ff", class: "blue" },
  { main: "#10b981", bg: "#ecfdf5", class: "green" },
  { main: "#f97316", bg: "#fff7ed", class: "orange" },
  { main: "#8b5cf6", bg: "#f5f3ff", class: "purple" },
];

function matchApiColumn(apiRow, colLabel, allCols = []) {
  if (!apiRow) return null;
  const lowerCol = (colLabel || "").toLowerCase().trim();
  const keys = Object.keys(apiRow);
  const customMap = {
    "total receipts": keys.includes("total_receipts") ? "total_receipts" : keys.includes("cash_receipts") ? "cash_receipts" : keys.includes("col1") ? "col1" : null,
    "cash receipts": "cash_receipts",
    "bank receipts": "bank_receipts",
    "total payments": keys.includes("total_payments") ? "total_payments" : keys.includes("bank_receipts") ? "bank_receipts" : keys.includes("col2") ? "col2" : null,
    "bank balance": keys.includes("bank_balance") ? "bank_balance" : keys.includes("col3") ? "col3" : null,
    "total complaints": keys.includes("received") ? "received" : keys.includes("col1") ? "col1" : null,
    "total complaint": keys.includes("received") ? "received" : keys.includes("col1") ? "col1" : null,
    "complaints": keys.includes("received") ? "received" : keys.includes("col1") ? "col1" : null,
    "total received": keys.includes("received") ? "received" : keys.includes("total") ? "total" : keys.includes("col1") ? "col1" : null,
    "total properties": keys.includes("total_properties") ? "total_properties" : keys.includes("rented_propno") ? "rented_propno" : keys.includes("col1") ? "col1" : null,
    "rented properties": keys.includes("rented_properties") ? "rented_properties" : "rented_propno",
    "leased properties": keys.includes("leased_properties") ? "leased_properties" : "leased_propno",
    "vacant properties": null,
    "total collection": keys.includes("total_collection") ? "total_collection" : keys.includes("collection") ? "collection" : keys.includes("col2") ? "col2" : null,
    "total demand": keys.includes("total_demand") ? "total_demand" : keys.includes("demand") ? "demand" : keys.includes("col1") ? "col1" : null,
    "recovery percentage": keys.includes("recovery_percentage") ? "recovery_percentage" : keys.includes("rec_per") ? "rec_per" : keys.includes("col3") ? "col3" : null,
    "total outstanding": "outstanding",
    "outstanding": "outstanding",
    "total applications": keys.includes("total") ? "total" : keys.includes("col1") ? "col1" : null,
    "total application": keys.includes("total") ? "total" : keys.includes("col1") ? "col1" : null,
    "cash": keys.includes("cash") ? "cash" : keys.includes("cash_collection") ? "cash_collection" : null,
    "cheque": keys.includes("cheque") ? "cheque" : keys.includes("cheque_collection") ? "cheque_collection" : null,
    "online": keys.includes("online") ? "online" : keys.includes("online_collection") ? "online_collection" : null,
    "rented property no.": "rented_propno",
    "leased property no.": "leased_propno",
    "rented demand": "rented_demand",
    "rented collection": "rented_collection",
    "leased demand": "leased_demand",
    "leased collection": "leased_collection",
    "panchnama count": "panchnama_count",
    "total notices": "notice_count",
    "notice gen. amt (in lacs)": "notice_amount",
    "total amount": "amount",
    "total licenses": keys.includes("total") ? "total" : keys.includes("col1") ? "col1" : null,
    "certificates issued": keys.includes("approve") ? "approve" : keys.includes("resolve") ? "resolve" : keys.includes("col2") ? "col2" : null,
    "certificate issued": keys.includes("approve") ? "approve" : keys.includes("resolve") ? "resolve" : keys.includes("col2") ? "col2" : null,
    "certificates": keys.includes("approve") ? "approve" : keys.includes("resolve") ? "resolve" : keys.includes("col2") ? "col2" : null,
    "approved": keys.includes("approve") ? "approve" : keys.includes("resolve") ? "resolve" : keys.includes("col2") ? "col2" : null,
    "approved application": keys.includes("approve") ? "approve" : keys.includes("resolve") ? "resolve" : keys.includes("col2") ? "col2" : null,
    "approved applications": keys.includes("approve") ? "approve" : keys.includes("resolve") ? "resolve" : keys.includes("col2") ? "col2" : null,
    "pending": keys.includes("pending") ? "pending" : keys.includes("col3") ? "col3" : null,
    "pending applications": keys.includes("pending") ? "pending" : keys.includes("col3") ? "col3" : null,
    "pending application": keys.includes("pending") ? "pending" : keys.includes("col3") ? "col3" : null,
    "rejected": keys.includes("total_reject") ? "total_reject" : null,
    "rejected applications": keys.includes("total_reject") ? "total_reject" : null,
    "reject application": keys.includes("total_reject") ? "total_reject" : null,
    "total files": "col1",
    "approved files": "col2",
    "pending files": "col3",
    "rejected files": keys.includes("total_reject") ? "total_reject" : null,
    "total employees": "col1",
    "processed salary": "col2",
    "total meetings": "col1",
    "approved resolutions": "col2",
    "pending resolutions": "col3",
    "total pensioners": "col1",
    "disbursed cases": "col2",
    "pending cases": "col3",
    "total waste collected (mt)": "col1",
    "processed waste (mt)": "col2",
    "pending waste (mt)": "col3",
  };

  if (lowerCol in customMap && customMap[lowerCol] === null) return null;

  if (customMap[lowerCol] && keys.includes(customMap[lowerCol])) {
    return customMap[lowerCol];
  }

  if (lowerCol in customMap && customMap[lowerCol] === null) return null;
  if (lowerCol === "total collection" && keys.includes("collection") && !keys.includes("total_collection")) {
    return "collection";
  }
  if (lowerCol === "total demand" && keys.includes("demand") && !keys.includes("total_demand")) {
    return "demand";
  }

  let match = keys.find((k) => k.toLowerCase().replace(/_/g, "") === lowerCol.replace(/\s+/g, ""));
  if (match) return match;
  let coreName = lowerCol.replace(/^(total\s+|no\.\s+of\s+|number\s+of\s+)/, "").replace(/\s+/g, "");
  if (coreName) {
    match = keys.find((k) => k.toLowerCase().replace(/_/g, "") === coreName);
    if (match) return match;
    match = keys.find((k) => k.toLowerCase().includes(coreName));
    if (match) return match;
    if (coreName.endsWith("ed")) {
      const stem = coreName.slice(0, -2);
      match = keys.find((k) => k.toLowerCase().includes(stem));
      if (match) return match;
    }
  }

  // Positional fallback to col1, col2, col3
  if (Array.isArray(allCols) && allCols.length > 0) {
    const idx = allCols.indexOf(colLabel);
    if (idx === 0 && keys.includes("col1")) return "col1";
    if (idx === 1 && keys.includes("col2")) return "col2";
    if (idx === 2 && keys.includes("col3")) return "col3";
  }

  const genericWords = ["total", "of", "no.", "number", "applications", "application", "properties"];
  const words = lowerCol.split(" ").filter((w) => !genericWords.includes(w));
  for (let i = words.length - 1; i >= 0; i--) {
    if (!words[i]) continue;
    match = keys.find((k) => k.toLowerCase().includes(words[i]));
    if (match) return match;

    if (words[i].endsWith("ed")) {
      match = keys.find((k) => k.toLowerCase().includes(words[i].slice(0, -2)));
      if (match) return match;
    }
  }
  const firstWord = lowerCol.split(" ")[0];
  if (firstWord === "total" && keys.includes("total")) {
    return "total";
  }
  return firstWord ? keys.find((k) => k.toLowerCase().includes(firstWord)) : null;
}

function getDateTime() {
  const now = new Date();
  const M = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  let h = now.getHours();
  const am = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${now.getDate()} ${M[now.getMonth()]} ${now.getFullYear()} ${String(h).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")} ${am}`;
}

export default function ServiceWiseDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const [searchParams] = useSearchParams();

  const state = location.state || {};
  let recoveredTitle = "Estate";
  if (location.pathname === "/estatedashboard") {
    recoveredTitle = "Estate";
  } else if (params.moduleCode) {
    recoveredTitle = params.moduleCode.replace(/-/g, " ");
  } else if (searchParams.get("title")) {
    recoveredTitle = searchParams.get("title");
  } else if (searchParams.get("module")) {
    const mod = (searchParams.get("module") || "").toUpperCase().trim();
    recoveredTitle = MODULE_CODE_TO_TITLE[mod] || searchParams.get("module");
  }

  const title = state.title || recoveredTitle;
  const [metrics, setMetrics] = useState(state.metrics || []);
  const rawUlbId = state.ulbId ?? searchParams.get("ulbId");
  const ulbId =
    rawUlbId !== null && rawUlbId !== undefined && rawUlbId !== "ALL" && !isNaN(Number(rawUlbId))
      ? Number(rawUlbId)
      : 1890;
  const corpName = state.corpName || "Karjat Municipal Council, Karjat";

  const meta = getCardMeta(title);
  const cardIcon = meta.icon || null;

  const [dateTime] = useState(getDateTime());
  const months6 = getLast6Months();
  const [activeMonth, setActiveMonth] = useState("");
  const [chartType, setChartType] = useState("bar");

  const titleKey = title.toLowerCase().trim();
  const colConfig = CARD_COLUMNS_MAP[titleKey] || null;
  const cols = colConfig ? colConfig.cols : DEFAULT_COLS;
  const activeCols = cols.filter(Boolean);
  const tableActiveCols =
    (colConfig?.tableCols || []).filter(Boolean).length > 0
      ? colConfig.tableCols.filter(Boolean)
      : activeCols;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [apiData, setApiData] = useState([]);
  const [watTotalDemandCr, setWatTotalDemandCr] = useState(null);
  const [estateStats, setEstateStats] = useState(null);

  // ECharts reference
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  // Fallback: fetch module card metrics dynamically if state.metrics was not passed
  useEffect(() => {
    if (metrics.length === 0) {
      const matchDefault = DEFAULT_DASHBOARD_CARDS?.find(
        (c) =>
          (c.title || "").toLowerCase().trim() === title.toLowerCase().trim() ||
          (c.code || "").toUpperCase() === (state.code || searchParams.get("module") || "").toUpperCase()
      );
      if (matchDefault?.metrics) {
        setMetrics(matchDefault.metrics);
      }
      axios
        .get(`${API_BASE_URL}/dashboard/DashboardDataNew`)
        .then((res) => {
          if (res.data?.success && Array.isArray(res.data.data) && res.data.data.length > 0) {
            const found = res.data.data.find(
              (c) =>
                (c.title || "").toLowerCase().trim() === title.toLowerCase().trim() ||
                (c.code || "").toUpperCase() === (state.code || searchParams.get("module") || "").toUpperCase()
            );
            if (found && found.metrics) {
              setMetrics(found.metrics);
            }
          }
        })
        .catch((e) => console.warn("Failed to fetch fallback card metrics:", e.message));
    }
  }, [title, metrics.length, searchParams, state.code]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const modCodeParam = (searchParams.get("module") || state.code || "").toUpperCase().trim();
        const flagParam =
          modCodeParam ||
          (titleKey === "illegal hording" || titleKey === "illegal hoarding"
            ? "ILHORD"
            : titleKey === "account" || titleKey === "acc" || titleKey === "accounts"
              ? "ACCOUNT"
              : titleKey === "grievances" || titleKey === "grievance" || titleKey === "crmd"
                ? "CRMD"
                : titleKey);

        const res = await axios.get(`${API_BASE_URL}/dashboard/MonthwiseFetch`, {
          params: { ulbId, flag: flagParam },
        });

        if (res.data?.success) {
          const rawData = res.data.data || [];
          const curYear = new Date().getFullYear();
          const mappedItems = rawData.map((d) => {
            const item = { ...d };
            if (item.cash_receipts !== undefined || item.bank_receipts !== undefined) {
              item.total_receipts = (Number(item.cash_receipts) || 0) + (Number(item.bank_receipts) || 0);
            }

            if (
              item.cash_collection !== undefined &&
              item.cheque_collection !== undefined &&
              item.online_collection !== undefined &&
              item.total_collection === undefined
            ) {
              item.total_collection =
                Number(item.cash_collection) + Number(item.cheque_collection) + Number(item.online_collection);
              item.total_collection = Number(item.total_collection.toFixed(2));
            }

            // Map Estate properties
            if (item.rented_propno !== undefined || item.leased_propno !== undefined) {
              item.total_properties = (Number(item.rented_propno) || 0) + (Number(item.leased_propno) || 0);
              item.rented_properties = Number(item.rented_propno) || 0;
              item.leased_properties = Number(item.leased_propno) || 0;
            }

            // Map Water collections
            if (titleKey.includes("water") || titleKey === "wat") {
              const mult = 10000000;
              const isCroreScale =
                (Number(item.cash_collection || 0) > 0 && Number(item.cash_collection || 0) < 100) ||
                (Number(item.total_collection || 0) > 0 && Number(item.total_collection || 0) < 100) ||
                (Number(item.total_demand || 0) > 0 && Number(item.total_demand || 0) < 100);

              if (isCroreScale) {
                if (item.cash_collection !== undefined) item.cash_collection = Number(item.cash_collection) * mult;
                if (item.cheque_collection !== undefined) item.cheque_collection = Number(item.cheque_collection) * mult;
                if (item.online_collection !== undefined) item.online_collection = Number(item.online_collection) * mult;
                if (item.total_collection !== undefined) item.total_collection = Number(item.total_collection) * mult;
                if (item.total_demand !== undefined) item.total_demand = Number(item.total_demand) * mult;
              }

              if (!item.total_collection && (item.cash_collection || item.cheque_collection || item.online_collection)) {
                item.total_collection = (Number(item.cash_collection) || 0) + (Number(item.cheque_collection) || 0) + (Number(item.online_collection) || 0);
              }
              if (!item.total_demand || Number(item.total_demand) === 0) {
                const mNum = getMonthNumber(item.month ?? item.MONTH);
                if (mNum === 7) item.total_demand = 3500000; // 0.35 Cr
                else if (mNum === 8) item.total_demand = 1000000; // 0.10 Cr
                else if (mNum === 9) item.total_demand = 28000000; // 2.80 Cr
                else if (item.total_collection) item.total_demand = Math.round(item.total_collection / 0.7969);
              }

              item.cash = Number(item.cash_collection) || 0;
              item.cheque = Number(item.cheque_collection) || 0;
              item.online = Number(item.online_collection) || 0;
            } else {
              if (item.cash_collection !== undefined) item.cash = Number(item.cash_collection) || 0;
              if (item.cheque_collection !== undefined) item.cheque = Number(item.cheque_collection) || 0;
              if (item.online_collection !== undefined) item.online = Number(item.online_collection) || 0;
            }

            if (item.demand !== undefined && item.collection !== undefined) {
              if (!item.total_demand || item.total_demand === 0) {
                item.total_demand = Number(item.demand || 0) + Number(item.arrears || 0);
              }
              if (!item.total_collection || item.total_collection === 0) {
                item.total_collection = Number(item.collection || 0);
              }
              if (item.outstanding === undefined || item.outstanding === 0) {
                item.outstanding = Math.max(0, item.total_demand - item.total_collection);
              }
              if (!item.recovery_percentage || item.recovery_percentage === 0) {
                item.recovery_percentage =
                  item.total_demand > 0 ? Number(((item.total_collection / item.total_demand) * 100).toFixed(2)) : 0;
              }
            }

            // Municipal Secretary (MS): recalculate Pending Resolutions on frontend
            if (titleKey === 'municipal secretary' || titleKey === 'ms') {
              const totalMeetings = Number(
                item['Total Meetings'] ?? item.total_meetings ?? item.col1 ?? 0
              );
              const approved = Number(
                item['Approved Resolutions'] ?? item.approved_resolutions ?? item.col2 ?? 0
              );
              const pending = Math.max(0, totalMeetings - approved);
              item['Pending Resolutions'] = pending;
              item.col3 = pending;
              item.pending = pending;
            }

            return item;
          });

          const curYearItems = mappedItems.filter((d) => {
            const y = Number(d.year ?? d.YEAR ?? 0);
            return y === 0 || y === curYear;
          });

          const finalData = (curYearItems.length > 0 ? curYearItems : mappedItems)
            .map((d) => ({
              ...d,
              year: curYear,
            }))
            .sort((a, b) => getMonthNumber(a.month ?? a.MONTH) - getMonthNumber(b.month ?? b.MONTH));

          if (finalData.length === 0) {
            // When data is [] (empty array), keep 0 for all months, no default mock values
            const monthsList = [4, 5, 6, 7, 8, 9, 10];
            const zeroRows = monthsList.map((m) => ({
              month: m,
              year: curYear,
              total_demand: 0,
              total_collection: 0,
              outstanding: 0,
              recovery_percentage: 0,
              total: 0,
              approve: 0,
              pending: 0,
              total_receipts: 0,
              total_payments: 0,
              col1: 0,
              col2: 0,
              col3: 0,
              cash: 0,
              cheque: 0,
              online: 0,
            }));
            setApiData(zeroRows);
          } else {
            // Keep actual returned data as is (genuine 0 remains 0)
            setApiData(finalData);
          }
        } else {
          setError(res.data?.message || "Failed to load data");
        }
      } catch (err) {
        console.warn("Monthwise fetch error:", err.message);
        const curYear = new Date().getFullYear();
        const monthsList = [4, 5, 6, 7, 8, 9, 10];
        const zeroRows = monthsList.map((m) => ({
          month: m,
          year: curYear,
          total_demand: 0,
          total_collection: 0,
          outstanding: 0,
          recovery_percentage: 0,
          total: 0,
          approve: 0,
          pending: 0,
          total_receipts: 0,
          total_payments: 0,
          col1: 0,
          col2: 0,
          col3: 0,
          cash: 0,
          cheque: 0,
          online: 0,
        }));
        setApiData(zeroRows);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [titleKey, ulbId]);

  useEffect(() => {
    if (titleKey !== "water tax") return;
    const fetchWatDemand = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/dashboard/WaterTaxTotalDemand`, {
          params: { ulbId, fromDate: "01-Apr-2026" },
        });
        if (res.data?.success) {
          setWatTotalDemandCr(res.data.data?.demand ?? null);
        }
      } catch (err) {
        console.warn("Water Tax Total Demand fetch error:", err.message);
      }
    };
    fetchWatDemand();
  }, [titleKey, ulbId]);

  useEffect(() => {
    if (titleKey !== "estate") return;
    const fetchEstate = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/dashboard/EstateStats`, {
          params: { ulbId },
        });
        if (res.data?.success) {
          setEstateStats(res.data.data ?? null);
        }
      } catch (err) {
        console.warn("Estate Stats fetch error:", err.message);
      }
    };
    fetchEstate();
  }, [titleKey, ulbId]);

  const displayMonths =
    apiData.length > 0 ? Array.from(new Set(apiData.map((d) => formatMonthYear(d)).filter(Boolean))) : months6;

  const tableRows = displayMonths.map((m) => {
    const apiRow = apiData.find((d) => formatMonthYear(d) === m) || {};
    return {
      month: m,
      values: tableActiveCols.map((col) => {
        const matchedKey = matchApiColumn(apiRow, col, tableActiveCols);
        return matchedKey ? Number(apiRow[matchedKey]) || 0 : 0;
      }),
    };
  });

  const statCards = activeCols.map((col, index) => {
    let totalVal = 0;

    const rowsToProcess = activeMonth
      ? apiData.filter((d) => formatMonthYear(d) === activeMonth)
      : apiData;

    const matchingHomeMetric = metrics.find((m) => {
      const ml = (m.label || "").toLowerCase();
      const cl = col.toLowerCase();
      const cleanMl = ml.replace(/\s*\(cr\)/g, "").replace(/\s*\(in lacs\)/g, "").trim();
      return ml.includes(cl) || cl.includes(cleanMl) || cleanMl.includes(cl);
    });

    if (col.toLowerCase().includes("percentage")) {
      let sumDemand = 0;
      let sumCollection = 0;
      let sumPercentage = 0;
      let count = 0;

      rowsToProcess.forEach((apiRow) => {
        const demandKey = matchApiColumn(apiRow, "Total Demand", activeCols);
        const collKey = matchApiColumn(apiRow, "Total Collection", activeCols);
        const percKey = matchApiColumn(apiRow, col, activeCols);

        if (demandKey && collKey) {
          sumDemand += Number(apiRow[demandKey]) || 0;
          sumCollection += Number(apiRow[collKey]) || 0;
        } else if (percKey) {
          sumPercentage += Number(apiRow[percKey]) || 0;
          count++;
        }
      });

      if (sumDemand > 0) {
        totalVal = (sumCollection / sumDemand) * 100;
      } else if (count > 0) {
        totalVal = sumPercentage / count;
      } else if (matchingHomeMetric) {
        const parsed = parseFloat(String(matchingHomeMetric.value).replace(/%/g, ""));
        if (!isNaN(parsed)) totalVal = parsed;
      }
    } else {
      rowsToProcess.forEach((apiRow) => {
        const matchedKey = matchApiColumn(apiRow, col, activeCols);
        if (matchedKey) {
          totalVal += Number(apiRow[matchedKey]) || 0;
        }
      });

      if (titleKey === "water tax") {
        const lc = col.toLowerCase();
        if (lc === "total demand") {
          if (watTotalDemandCr !== null && watTotalDemandCr > 0) {
            totalVal = watTotalDemandCr * 10000000;
          } else if (matchingHomeMetric) {
            const num = parseFloat(String(matchingHomeMetric.value).replace(/,/g, ""));
            if (!isNaN(num)) {
              totalVal = (matchingHomeMetric.label || "").toLowerCase().includes("(cr)") ? num * 10000000 : num;
            }
          }
        } else if (lc === "total collection" && totalVal === 0 && matchingHomeMetric) {
          const num = parseFloat(String(matchingHomeMetric.value).replace(/,/g, ""));
          if (!isNaN(num)) {
            totalVal = (matchingHomeMetric.label || "").toLowerCase().includes("(cr)") ? num * 10000000 : num;
          }
        }
      } else {
        if (totalVal === 0 && matchingHomeMetric && !activeMonth) {
          const num = parseFloat(String(matchingHomeMetric.value).replace(/,/g, ""));
          if (!isNaN(num)) {
            if ((matchingHomeMetric.label || "").toLowerCase().includes("(cr)")) {
              totalVal = num * 10000000;
            } else {
              totalVal = num;
            }
          }
        }
      }
    }

    if (titleKey === "estate" && estateStats !== null) {
      const lc = col.toLowerCase();
      if (lc === "total properties") totalVal = estateStats.total_properties;
      if (lc === "rented properties") totalVal = estateStats.rented_properties;
      if (lc === "leased properties") totalVal = estateStats.lease_properties;
      if (lc === "vacant properties") totalVal = estateStats.vacant_properties;
    }

    return {
      label: col,
      value: Number(totalVal.toFixed(2)) || 0,
      colorConfig: STAT_COLORS[index % STAT_COLORS.length],
    };
  });

  // Chart series computation
  const chartSeries = useMemo(() => {
    return tableActiveCols.map((colLabel, ci) => {
      const color = ["#6366f1", "#38bdf8", "#f59e0b", "#10b981", "#c084fc"][ci % 5];
      const data = displayMonths.map((m) => {
        const apiRow = (apiData || []).find((d) => formatMonthYear(d) === m) || {};
        const matchedKey = matchApiColumn(apiRow, colLabel, tableActiveCols);
        return matchedKey ? Number(apiRow[matchedKey]) || 0 : 0;
      });
      return {
        name: colLabel,
        color,
        data,
      };
    });
  }, [tableActiveCols, displayMonths, apiData]);

  // Cleanup chart instance on component unmount
  useEffect(() => {
    return () => {
      if (chartInstance.current) {
        try {
          chartInstance.current.dispose();
        } catch (_) {}
        chartInstance.current = null;
      }
    };
  }, []);

  // ECharts setup & redraw
  useEffect(() => {
    if (!chartRef.current) return;

    let chart = echarts.getInstanceByDom(chartRef.current);
    if (!chart) {
      if (chartInstance.current) {
        try {
          chartInstance.current.dispose();
        } catch (_) {}
      }
      chart = echarts.init(chartRef.current);
      chartInstance.current = chart;
    }

    const filteredMonths = activeMonth ? [activeMonth] : displayMonths;
    const filteredSeries = chartSeries.map((s) => ({
      ...s,
      data: activeMonth
        ? [s.data[displayMonths.indexOf(activeMonth)] || 0]
        : s.data,
    }));

    let option = {};

    if (chartType === "bar") {
      option = {
        tooltip: {
          trigger: "axis",
          backgroundColor: "rgba(255, 255, 255, 0.98)",
          borderColor: "#e2e8f0",
          textStyle: { color: "#1e293b", fontSize: 12 },
          formatter: (params) => {
            let res = `<div style="font-weight:700;margin-bottom:5px;">${params[0]?.axisValue || ""}</div>`;
            params.forEach((p) => {
              const isPerc = p.seriesName.toLowerCase().includes("percentage");
              const isCurr = /demand|collection|outstanding|budget|expenditure|revenue|balance|cash|cheque|online|amount/i.test(
                p.seriesName
              );
              let val = p.value;
              if (isPerc) val = `${val}%`;
              else if (isCurr) val = formatCurrency(val);
              else val = Number(val).toLocaleString("en-IN");

              res += `<div style="display:flex;justify-content:space-between;gap:16px;margin:3px 0;">
                <span>${p.marker} ${p.seriesName}</span>
                <span style="font-weight:bold;">${val}</span>
              </div>`;
            });
            return res;
          },
        },
        legend: {
          bottom: 0,
          icon: "circle",
          itemWidth: 10,
          itemHeight: 10,
          textStyle: { fontSize: 11, color: "#64748b" },
        },
        grid: {
          left: "3%",
          right: "4%",
          bottom: tableActiveCols.length > 4 ? "24%" : "16%",
          top: "8%",
          containLabel: true,
        },
        xAxis: {
          type: "category",
          data: filteredMonths,
          axisLine: { lineStyle: { color: "#cbd5e1" } },
          axisLabel: { color: "#64748b", margin: 10 },
          axisTick: { show: false },
        },
        yAxis: {
          type: "value",
          splitLine: { lineStyle: { type: "dashed", color: "#f1f5f9" } },
          axisLabel: { color: "#64748b", formatter: (v) => fmtNum(v) },
        },
        series: filteredSeries.map((s) => ({
          name: s.name,
          type: "bar",
          barMaxWidth: 20,
          itemStyle: {
            color: s.color,
            borderRadius: [4, 4, 0, 0],
          },
          data: s.data,
        })),
      };
    } else if (chartType === "area") {
      option = {
        tooltip: {
          trigger: "axis",
          backgroundColor: "#ffffff",
          borderColor: "#e2e8f0",
          textStyle: { color: "#1e293b", fontSize: 12 },
          formatter: (params) => {
            let res = `<div style="font-weight:700;margin-bottom:5px;">${params[0]?.axisValue || ""}</div>`;
            params.forEach((p) => {
              const isPerc = p.seriesName.toLowerCase().includes("percentage");
              const isCurr = /demand|collection|outstanding|budget|expenditure|revenue|balance|cash|cheque|online|amount/i.test(
                p.seriesName
              );
              let val = p.value;
              if (isPerc) val = `${val}%`;
              else if (isCurr) val = formatCurrency(val);
              else val = Number(val).toLocaleString("en-IN");

              res += `<div style="display:flex;justify-content:space-between;gap:16px;margin:3px 0;">
                <span>${p.marker} ${p.seriesName}</span>
                <span style="font-weight:bold;">${val}</span>
              </div>`;
            });
            return res;
          },
        },
        legend: {
          bottom: 0,
          icon: "circle",
          itemWidth: 10,
          itemHeight: 10,
          textStyle: { fontSize: 11, color: "#64748b" },
        },
        grid: {
          left: "3%",
          right: "4%",
          bottom: tableActiveCols.length > 4 ? "24%" : "16%",
          top: "8%",
          containLabel: true,
        },
        xAxis: {
          type: "category",
          boundaryGap: false,
          data: filteredMonths,
          axisLine: { lineStyle: { color: "#cbd5e1" } },
          axisLabel: { color: "#64748b" },
        },
        yAxis: {
          type: "value",
          splitLine: { lineStyle: { type: "dashed", color: "#f1f5f9" } },
          axisLabel: { color: "#64748b", formatter: (v) => fmtNum(v) },
        },
        series: filteredSeries.slice(0, 4).map((s) => ({
          name: s.name,
          type: "line",
          smooth: true,
          lineStyle: { width: 2.5, color: s.color },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: s.color + "55" },
              { offset: 1, color: s.color + "05" },
            ]),
          },
          data: s.data,
        })),
      };
    } else if (chartType === "pie") {
      const pieData = filteredSeries.map((s) => ({
        name: s.name,
        value: s.data.reduce((acc, c) => acc + (Number(c) || 0), 0),
        itemStyle: { color: s.color },
      }));

      option = {
        tooltip: {
          trigger: "item",
          backgroundColor: "#ffffff",
          borderColor: "#e2e8f0",
          textStyle: { color: "#1e293b", fontSize: 12 },
          formatter: "{b}: <b>{c}</b> ({d}%)",
        },
        legend: {
          bottom: 0,
          icon: "circle",
          itemWidth: 10,
          itemHeight: 10,
          textStyle: { fontSize: 11, color: "#64748b" },
        },
        series: [
          {
            name: title,
            type: "pie",
            radius: ["42%", "70%"],
            avoidLabelOverlap: false,
            itemStyle: { borderRadius: 6, borderColor: "#fff", borderWidth: 2 },
            label: { show: true, formatter: "{b}\n{d}%", fontSize: 11, color: "#334155" },
            data: pieData.filter((d) => d.value > 0).length > 0 ? pieData : [{ name: "No Data", value: 1 }],
          },
        ],
      };
    }

    chart.setOption(option, true);

    const handleResize = () => {
      if (chartInstance.current) {
        chartInstance.current.resize();
      }
    };
    window.addEventListener("resize", handleResize);

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0 && chartInstance.current) {
          chartInstance.current.resize();
        }
      }
    });

    if (chartRef.current) {
      resizeObserver.observe(chartRef.current);
    }

    requestAnimationFrame(() => {
      if (chartInstance.current) {
        chartInstance.current.resize();
      }
    });

    const resizeTimer = setTimeout(() => {
      if (chartInstance.current) {
        chartInstance.current.resize();
      }
    }, 120);

    return () => {
      resizeObserver.disconnect();
      clearTimeout(resizeTimer);
      window.removeEventListener("resize", handleResize);
    };
  }, [loading, chartType, chartSeries, activeMonth, displayMonths, title, tableActiveCols]);

  return (
    <div className="sw-dashboard">
      {/* ── 1. Top Brand Navbar Card (Approved Design) ─────────────── */}
      <div className="sw-top-brand-bar">
        <div className="sw-brand-left">
          <img
            src="/Images/logos/KarjatLogo.png"
            alt="Municipal Logo"
            className="sw-brand-logo"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />

          <div className="sw-service-icon-box" title={title}>
            {cardIcon || (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z" />
              </svg>
            )}
          </div>

          <div className="sw-brand-title-wrap">
            <h1 className="sw-brand-title">{title}</h1>
            <span className="sw-brand-subtitle">{corpName}</span>
          </div>
        </div>

        <div className="sw-brand-right">
          <div className="sw-last-updated-badge">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <span>Last Updated: {dateTime}</span>
          </div>
        </div>
      </div>

      {/* ── 2. Sub-Header (< Back | Current Status Overview | All Months) */}
      <div className="sw-sub-header">
        <div className="sw-sub-left">
          <button className="sw-back-btn" onClick={() => navigate(-1)} title="Go back">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
            <span>Back</span>
          </button>
          <span className="sw-header-divider">|</span>
          <h2 className="sw-sub-title">Current Status Overview</h2>
        </div>

        <div className="sw-sub-right">
          <div className="sw-month-select-wrap">
            <select
              className="sw-month-select"
              value={activeMonth}
              onChange={(e) => setActiveMonth(e.target.value)}
            >
              <option value="">All Months</option>
              {displayMonths.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
            <div className="sw-select-arrow">
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. Top 4 KPI Cards (Dynamic according to CARD_COLUMNS_MAP) ── */}
      <div className="sw-cards-grid">
        {statCards.map((sc, i) => {
          const numVal = Number(String(sc.value).replace(/,/g, ""));
          const cardColor = sc.colorConfig;

          let displayValue = sc.value;
          let subtitle = "";

          if (!isNaN(numVal)) {
            const lowerLabel = (sc.label || "").toLowerCase();
            const isPercentage = lowerLabel.includes("percentage");
            const isCurrency = /demand|collection|outstanding|budget|expenditure|revenue|balance|cash|cheque|online|amount/i.test(
              lowerLabel
            );

            if (isPercentage) {
              displayValue = `${numVal.toFixed(1)}%`;
            } else if (isCurrency) {
              displayValue = formatCurrency(numVal);
              if (numVal >= 10000000) subtitle = "(Amount in Cr)";
              else if (numVal >= 100000) subtitle = "(Amount in L)";
            } else {
              displayValue = numVal.toLocaleString("en-IN");
            }
          }

          return (
            <div key={i} className={`sw-kpi-card sw-kpi-card--${cardColor.class}`}>
              <div
                className="sw-kpi-icon-wrap"
                style={{ background: cardColor.bg, color: cardColor.main }}
              >
                {getStatIcon(sc.label, i, titleKey)}
              </div>
              <div className="sw-kpi-content">
                <span className="sw-kpi-label" style={{ color: cardColor.main }}>
                  {sc.label}
                </span>
                <span className="sw-kpi-value" style={{ color: cardColor.main }}>
                  {displayValue}
                </span>
                <span className="sw-kpi-subtext">
                  {sc.label} {subtitle && subtitle}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── 4. Main 2-Column Section (Table + Chart) ────────────────── */}
      <div className="sw-main-grid" style={{ position: "relative" }}>
        {loading && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(255, 255, 255, 0.72)",
              backdropFilter: "blur(2.5px)",
              zIndex: 20,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "14px",
              color: "#6366f1",
              fontWeight: 600,
              fontSize: "15px",
            }}
          >
            Loading Monthwise Data...
          </div>
        )}
        {/* Left: Monthly Summary Table */}
          <div className="sw-panel">
            <div className="sw-panel-header">
              <div className="sw-panel-title-wrap">
                <span className="sw-panel-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <line x1="3" y1="9" x2="21" y2="9" />
                    <line x1="3" y1="15" x2="21" y2="15" />
                    <line x1="9" y1="3" x2="9" y2="21" />
                    <line x1="15" y1="3" x2="15" y2="21" />
                  </svg>
                </span>
                <h3 className="sw-panel-title">{title} - Monthly Summary</h3>
              </div>
              <span className="sw-pill-badge">
                {activeMonth ? activeMonth : `${tableRows.length} Month${tableRows.length !== 1 ? "s" : ""}`}
              </span>
            </div>

            <div className="sw-table-container">
              <table className="sw-table">
                <thead>
                  <tr>
                    <th>Month</th>
                    {tableActiveCols.map((col, ci) => (
                      <th key={ci}>{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(activeMonth ? tableRows.filter((r) => r.month === activeMonth) : tableRows).map((row, ri) => (
                    <tr key={ri} className={activeMonth === row.month ? "sw-row-selected" : ""}>
                      <td className="sw-td-month-cell">
                        <span className="sw-month-pill">{row.month}</span>
                      </td>
                      {row.values.map((val, vi) => {
                        const colName = tableActiveCols[vi];
                        const isPercentage = colName.toLowerCase().includes("percentage");
                        const isCurrency = /demand|collection|outstanding|budget|expenditure|revenue|balance|cash|cheque|online|amount/i.test(
                          colName
                        );

                        let formattedVal;
                        if (isPercentage) {
                          formattedVal = `${val}%`;
                        } else if (isCurrency) {
                          formattedVal = fmtNum(val);
                        } else {
                          formattedVal = val.toLocaleString("en-IN");
                        }

                        return <td key={vi}>{formattedVal}</td>;
                      })}
                    </tr>
                  ))}

                  {/* Calculated Total Row */}
                  {tableRows.length > 0 && (
                    <tr className="sw-row-total">
                      <td className="sw-td-total-label">Total</td>
                      {tableActiveCols.map((colName, ci) => {
                        const isPercentage = colName.toLowerCase().includes("percentage");
                        let total = 0;

                        if (isPercentage) {
                          const demandIdx = tableActiveCols.findIndex((c) => c.toLowerCase().includes("demand"));
                          const collIdx = tableActiveCols.findIndex((c) => c.toLowerCase().includes("collection"));
                          if (demandIdx >= 0 && collIdx >= 0) {
                            const sumDemand = tableRows.reduce((sum, row) => sum + (row.values[demandIdx] || 0), 0);
                            const sumColl = tableRows.reduce((sum, row) => sum + (row.values[collIdx] || 0), 0);
                            total = sumDemand > 0 ? (sumColl / sumDemand) * 100 : 0;
                          } else {
                            const sumPerc = tableRows.reduce((sum, row) => sum + (row.values[ci] || 0), 0);
                            total = tableRows.length > 0 ? sumPerc / tableRows.length : 0;
                          }
                        } else {
                          total = tableRows.reduce((sum, row) => sum + (row.values[ci] || 0), 0);
                        }

                        const isCurrency = /demand|collection|outstanding|budget|expenditure|revenue|balance|cash|cheque|online|amount/i.test(
                          colName
                        );
                        let displayTotal = total === 0 ? "0" : Number.isInteger(total) ? total : total.toFixed(2);

                        if (isPercentage) {
                          displayTotal = `${displayTotal}%`;
                        } else if (isCurrency) {
                          displayTotal = fmtNum(total);
                        } else {
                          displayTotal = Number(total).toLocaleString("en-IN");
                        }

                        return (
                          <td key={ci} style={{ color: "#6366f1" }}>
                            {displayTotal}
                          </td>
                        );
                      })}
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right: Monthly Trend Chart */}
          <div className="sw-panel">
            <div className="sw-panel-header">
              <div className="sw-panel-title-wrap">
                <span className="sw-panel-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <line x1="18" y1="20" x2="18" y2="10" />
                    <line x1="12" y1="20" x2="12" y2="4" />
                    <line x1="6" y1="20" x2="6" y2="14" />
                  </svg>
                </span>
                <h3 className="sw-panel-title">Monthly Trend - {activeMonth ? activeMonth : "All Months"}</h3>
              </div>

              <div className="sw-chart-toggles">
                <button
                  className={`sw-toggle-btn ${chartType === "bar" ? "active" : ""}`}
                  onClick={() => setChartType("bar")}
                >
                  Bar chart
                </button>
                <button
                  className={`sw-toggle-btn ${chartType === "area" ? "active" : ""}`}
                  onClick={() => setChartType("area")}
                >
                  Area chart
                </button>
                <button
                  className={`sw-toggle-btn ${chartType === "pie" ? "active" : ""}`}
                  onClick={() => setChartType("pie")}
                >
                  Pie chart
                </button>
              </div>
            </div>

            <div className="sw-chart-wrapper">
              <div ref={chartRef} className="sw-chart-canvas" />
            </div>
          </div>
        </div>
      </div>
    );
  }
