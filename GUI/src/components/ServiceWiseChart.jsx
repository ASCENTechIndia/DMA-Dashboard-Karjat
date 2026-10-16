import React, { useEffect, useRef } from "react";
import * as echarts from "echarts";

const DEFAULT_SERIES = [
  { key: "rentedPropertyNo", label: "Rented Property No.", color: "#7c3aed" },
  { key: "rentedDemand", label: "Rented Demand", color: "#38bdf8" },
  { key: "rentedCollection", label: "Rented Collection", color: "#eab308" },
  { key: "leasedPropertyNo", label: "Leased Property No.", color: "#c084fc" },
  { key: "leasedDemand", label: "Leased Demand", color: "#818cf8" },
  { key: "leasedCollection", label: "Leased Collection", color: "#6366f1" },
];

export default function ServiceWiseChart({
  data = [],
  chartSeries = [],
  activeMode = "bar",
  selectedMonth = "ALL",
}) {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  const activeSeries = chartSeries && chartSeries.length > 0 ? chartSeries : DEFAULT_SERIES;

  useEffect(() => {
    if (!chartRef.current) return;

    if (!chartInstance.current) {
      chartInstance.current = echarts.init(chartRef.current);
    }
    const chart = chartInstance.current;

    const filteredData =
      selectedMonth === "ALL"
        ? data
        : data.filter((d) => d.month === selectedMonth);

    const months = filteredData.map((d) => d.month);

    let option = {};

    if (activeMode === "bar") {
      option = {
        tooltip: {
          trigger: "axis",
          backgroundColor: "#ffffff",
          borderColor: "#e2e8f0",
          textStyle: { color: "#1e293b", fontSize: 12 },
          formatter: (params) => {
            let res = `<div style="font-weight:700;margin-bottom:4px;">${params[0]?.axisValue || ""}</div>`;
            params.forEach((p) => {
              res += `<div style="display:flex;align-items:center;gap:6px;font-size:12px;margin:2px 0;">
                <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${p.color};"></span>
                <span>${p.seriesName}: <b>${Number(p.value || 0).toLocaleString()}</b></span>
              </div>`;
            });
            return res;
          },
        },
        grid: {
          top: 25,
          left: 55,
          right: 20,
          bottom: 25,
          containLabel: false,
        },
        xAxis: {
          type: "category",
          data: months,
          axisLine: { lineStyle: { color: "#cbd5e1" } },
          axisLabel: { color: "#64748b", fontSize: 12 },
          axisTick: { show: false },
        },
        yAxis: {
          type: "value",
          splitLine: {
            lineStyle: {
              type: "dashed",
              color: "#f1f5f9",
            },
          },
          axisLabel: {
            color: "#64748b",
            fontSize: 11,
            formatter: (v) => Number(v || 0).toLocaleString(),
          },
        },
        series: activeSeries.map((item) => ({
          name: item.label,
          type: "bar",
          barMaxWidth: 14,
          barGap: "20%",
          itemStyle: {
            color: item.color,
            borderRadius: [3, 3, 0, 0],
          },
          data: filteredData.map((d) => Number(d[item.key] || 0)),
        })),
      };
    } else if (activeMode === "area") {
      // Pick top 4 series for clean line comparison
      const lineSeries = activeSeries.slice(0, 4);

      option = {
        tooltip: {
          trigger: "axis",
          backgroundColor: "#ffffff",
          borderColor: "#e2e8f0",
          textStyle: { color: "#1e293b", fontSize: 12 },
          formatter: (params) => {
            let res = `<div style="font-weight:700;margin-bottom:4px;">${params[0]?.axisValue || ""}</div>`;
            params.forEach((p) => {
              res += `<div style="display:flex;align-items:center;gap:6px;font-size:12px;margin:2px 0;">
                <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${p.color};"></span>
                <span>${p.seriesName}: <b>${Number(p.value || 0).toLocaleString()}</b></span>
              </div>`;
            });
            return res;
          },
        },
        grid: {
          top: 25,
          left: 55,
          right: 20,
          bottom: 25,
        },
        xAxis: {
          type: "category",
          boundaryGap: false,
          data: months,
          axisLine: { lineStyle: { color: "#cbd5e1" } },
          axisLabel: { color: "#64748b", fontSize: 12 },
        },
        yAxis: {
          type: "value",
          splitLine: { lineStyle: { type: "dashed", color: "#f1f5f9" } },
          axisLabel: {
            color: "#64748b",
            fontSize: 11,
            formatter: (v) => Number(v || 0).toLocaleString(),
          },
        },
        series: lineSeries.map((item, idx) => ({
          name: item.label,
          type: "line",
          smooth: true,
          lineStyle: { width: idx === 0 ? 3 : 2, color: item.color },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: item.color + "66" },
              { offset: 1, color: item.color + "05" },
            ]),
          },
          data: filteredData.map((d) => Number(d[item.key] || 0)),
        })),
      };
    } else if (activeMode === "pie") {
      const pieData = activeSeries.map((item) => {
        const sum = filteredData.reduce((acc, c) => acc + (Number(c[item.key]) || 0), 0);
        return {
          name: item.label,
          value: sum,
          itemStyle: { color: item.color },
        };
      }).filter((item) => item.value > 0);

      // If all are zero, provide default mock slices
      const finalPieData = pieData.length > 0 ? pieData : activeSeries.map((item) => ({
        name: item.label,
        value: 1,
        itemStyle: { color: item.color },
      }));

      option = {
        tooltip: {
          trigger: "item",
          backgroundColor: "#ffffff",
          borderColor: "#e2e8f0",
          textStyle: { color: "#1e293b", fontSize: 12 },
          formatter: "{b}: <b>{c}</b> ({d}%)",
        },
        series: [
          {
            name: "Distribution",
            type: "pie",
            radius: ["42%", "72%"],
            avoidLabelOverlap: false,
            itemStyle: {
              borderRadius: 6,
              borderColor: "#fff",
              borderWidth: 2,
            },
            label: {
              show: true,
              formatter: "{b}\n{d}%",
              fontSize: 11,
              color: "#334155",
            },
            data: finalPieData,
          },
        ],
      };
    }

    chart.setOption(option, true);

    const resizeObserver = new ResizeObserver(() => {
      chart.resize();
    });
    resizeObserver.observe(chartRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [data, activeSeries, activeMode, selectedMonth]);

  return (
    <div className="sw-chart-wrapper">
      <div ref={chartRef} className="sw-chart-canvas" />

      {/* Dynamic Legend */}
      <div className="sw-chart-legend">
        {activeSeries.map((item) => (
          <div key={item.key} className="sw-legend-item">
            <span className="sw-legend-dot" style={{ backgroundColor: item.color }} />
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
