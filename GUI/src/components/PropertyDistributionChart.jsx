import { useState, useEffect, memo } from 'react';
import axios from 'axios';
import { useEChart } from '../hooks/useEChart';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const COLORS = {
  residential: '#2f6fed',
  commercial: '#f5891f',
  mixed: '#1fa854',
  border: 'rgba(148, 163, 184, 0.25)',
  muted: '#64748b',
};

/**
 * PropertyDistributionChart
 * Stacked bar chart: Residential / Commercial / Mixed counts per corporation.
 * Pairs with <PropertySummaryTable /> inside the "Property Summary" card.
 */
function PropertyDistributionChart() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchPropertySummary = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/property/getPropertySummary`);
        if (response.data.success) {
          const rows = response.data.data || [];
          if (rows.length === 0) {
            setMessage(response.data.message || 'No property data available.');
          } else {
            setData(
              rows.map((item) => ({
                corporation: item.CORPORATION || 'Unknown',
                residential: Number(item.RESIDENTIAL || 0),
                commercial: Number(item.COMMERCIAL || 0),
                mixed: Number(item.MIXED || 0),
              }))
            );
          }
        } else {
          setMessage(response.data.message || 'Failed to load property data.');
        }
      } catch (err) {
        console.error('Error fetching property summary for chart:', err);
        setMessage(err.response?.data?.message || err.message || 'Failed to load property data.');
      } finally {
        setLoading(false);
      }
    };

    fetchPropertySummary();
  }, []);

  const ref = useEChart(
    () => ({
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: (params) => {
          if (!params || params.length === 0) return '';
          let html = `<div style="font-weight: 700; margin-bottom: 6px; font-size: 13px; color: #1e293b;">${params[0].name}</div>`;
          let total = 0;
          params.forEach((p) => {
            const val = Number(p.value || 0);
            total += val;
            html += `<div style="display: flex; justify-content: space-between; align-items: center; gap: 16px; font-size: 12px; margin-bottom: 3px; color: #64748b;">
              <span>${p.marker} ${p.seriesName}</span>
              <span style="font-weight: 700; color: #1e293b;">${val.toLocaleString('en-IN')}</span>
            </div>`;
          });
          html += `<div style="border-top: 1px solid rgba(148, 163, 184, 0.25); margin-top: 6px; padding-top: 6px; display: flex; justify-content: space-between; font-size: 12px; font-weight: 700; color: #1e293b;">
            <span>Total</span>
            <span>${total.toLocaleString('en-IN')}</span>
          </div>`;
          return html;
        }
      },
      legend: {
        top: 0,
        data: ['Residential', 'Commercial', 'Mixed'],
        textStyle: { color: COLORS.muted, fontSize: 11 },
        itemWidth: 14,
        itemHeight: 14,
        itemGap: 15,
      },
      grid: {
        left: '2%',
        right: '15%', // Room for the dataZoom slider
        bottom: '5%',
        top: 45,
        containLabel: true,
      },
      xAxis: {
        type: 'value',
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { lineStyle: { color: COLORS.border, type: 'dashed' } },
        axisLabel: {
          color: COLORS.muted,
          fontSize: 10,
          formatter: (v) => {
            if (v >= 10000000) return `${(v / 10000000).toFixed(1)}Cr`;
            if (v >= 100000) return `${(v / 100000).toFixed(0)}L`;
            if (v >= 1000) return `${(v / 1000).toFixed(0)}K`;
            return v;
          },
        },
      },
      yAxis: {
        type: 'category',
        data: data.map((d) => d.corporation),
        inverse: true, // Align first corporation at the top
        axisLine: { lineStyle: { color: COLORS.border } },
        axisTick: { alignWithLabel: true },
        axisLabel: {
          color: '#000000',
          fontSize: isMobile ? 11 : 12,
          fontWeight: 500,
          width: isMobile ? 90 : 180,
          overflow: 'truncate',
          ellipsis: '...',
        },
      },
      dataZoom: data.length > 6 ? [
        {
          type: 'slider',
          yAxisIndex: 0,
          orient: 'vertical',
          right: '3%',
          width: 8,
          start: 0,
          end: Math.min(100, Math.floor((6 / data.length) * 100)),
          showDetail: false,
          showDataShadow: false, // removes the blue line chart inside the track
          borderColor: 'transparent',
          backgroundColor: '#f1f5f9', // clean light grey track
          fillerColor: '#cbd5e1', // clean grey thumb
          handleIcon: 'path://M 0,0 L 0,0 Z', // hides the drag icons/handles completely
          handleSize: '0%',
          brushSelect: false, // behaves strictly as a scrollbar
        },
        {
          type: 'inside',
          yAxisIndex: 0,
          zoomOnMouseWheel: false,
          moveOnMouseMove: true,
          moveOnMouseWheel: true,
        }
      ] : [],
      series: [
        {
          name: 'Residential',
          type: 'bar',
          stack: 'total',
          barWidth: 14,
          data: data.map((d) => d.residential),
          itemStyle: { color: COLORS.residential },
        },
        {
          name: 'Commercial',
          type: 'bar',
          stack: 'total',
          barWidth: 14,
          data: data.map((d) => d.commercial),
          itemStyle: { color: COLORS.commercial },
        },
        {
          name: 'Mixed',
          type: 'bar',
          stack: 'total',
          barWidth: 14,
          data: data.map((d) => d.mixed),
          itemStyle: { color: COLORS.mixed },
        },
      ],
    }),
    [data, isMobile]
  );

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
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

  return <div className="echart-container" ref={ref} />;
}

export default memo(PropertyDistributionChart);
