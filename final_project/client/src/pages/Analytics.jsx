import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  ArrowLeft,
  MousePointer,
  Clock,
  ExternalLink,
  Link2,
  Activity,
  Globe,
} from "lucide-react";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="chart-tooltip">
        <p className="tooltip-label">{label}</p>
        <p className="tooltip-value">{payload[0].value} clicks</p>
      </div>
    );
  }
  return null;
};

const Analytics = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get(`/url/analytics/${id}`);
        setData(res.data.data);
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to load analytics");
        navigate("/dashboard");
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [id, navigate]);

  const formatDate = (d) =>
    new Date(d).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  const formatDateTime = (d) =>
    new Date(d).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const formatChartDate = (d) =>
    new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });

  const parseUA = (ua = "") => {
    if (!ua || ua === "unknown") return { browser: "Unknown", os: "Unknown" };
    const browser = ua.includes("Chrome")
      ? "Chrome"
      : ua.includes("Firefox")
        ? "Firefox"
        : ua.includes("Safari")
          ? "Safari"
          : ua.includes("Edge")
            ? "Edge"
            : "Other";
    const os = ua.includes("Windows")
      ? "Windows"
      : ua.includes("Mac")
        ? "macOS"
        : ua.includes("Linux")
          ? "Linux"
          : ua.includes("Android")
            ? "Android"
            : ua.includes("iPhone") || ua.includes("iPad")
              ? "iOS"
              : "Other";
    return { browser, os };
  };

  if (loading) {
    return (
      <div className="analytics-page">
        <Navbar />
        <div className="loading-screen">
          <div className="spinner" />
        </div>
      </div>
    );
  }

  const { url, lastVisited, recentVisits, dailyClicks } = data;
  const chartData = dailyClicks.map((d) => ({
    date: formatChartDate(d.date),
    clicks: d.clicks,
  }));

  return (
    <div className="analytics-page">
      <Navbar />

      <main className="analytics-main">
        <button className="back-btn" onClick={() => navigate("/dashboard")}>
          <ArrowLeft size={16} /> Back to Dashboard
        </button>

        {/* ── URL info header ── */}
        <div className="analytics-header">
          <div className="analytics-url-info">
            <div className="analytics-short-url">
              <Link2 size={18} />
              <a href={url.shortUrl} target="_blank" rel="noreferrer">
                {url.shortUrl}
              </a>
            </div>
            <a
              href={url.original_url}
              target="_blank"
              rel="noreferrer"
              className="analytics-original-url"
            >
              {url.original_url} <ExternalLink size={12} />
            </a>
            <div className="analytics-meta">
              <span>Created {formatDate(url.created_at)}</span>
              {url.expires_at && (
                <span>Expires {formatDate(url.expires_at)}</span>
              )}
              {url.isExpired && <span className="expired-tag">Expired</span>}
            </div>
          </div>
        </div>

        {/* ── KPI cards ── */}
        <div className="kpi-grid">
          <div className="kpi-card highlight">
            <MousePointer size={24} />
            <div>
              <span className="kpi-value">{url.total_clicks}</span>
              <span className="kpi-label">Total Clicks</span>
            </div>
          </div>
          <div className="kpi-card">
            <Clock size={24} />
            <div>
              <span className="kpi-value">
                {lastVisited ? formatDateTime(lastVisited) : "Never"}
              </span>
              <span className="kpi-label">Last Visited</span>
            </div>
          </div>
          <div className="kpi-card">
            <Activity size={24} />
            <div>
              <span className="kpi-value">{dailyClicks.length}</span>
              <span className="kpi-label">Active Days</span>
            </div>
          </div>
          <div className="kpi-card">
            <Globe size={24} />
            <div>
              <span className="kpi-value">{recentVisits.length}</span>
              <span className="kpi-label">Recent Visits</span>
            </div>
          </div>
        </div>

        {/* ── Chart ── */}
        <div className="chart-card">
          <h3>Daily Clicks — Last 30 Days</h3>
          {chartData.length === 0 ? (
            <div className="chart-empty">
              <Activity size={36} />
              <p>No click data yet. Share your link to get started!</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart
                data={chartData}
                margin={{ top: 10, right: 20, left: -10, bottom: 0 }}
              >
                <defs>
                  <linearGradient
                    id="clickGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor="var(--accent)"
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--accent)"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12, fill: "var(--text-muted)" }}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 12, fill: "var(--text-muted)" }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="clicks"
                  stroke="var(--accent)"
                  strokeWidth={2.5}
                  fill="url(#clickGradient)"
                  dot={false}
                  activeDot={{ r: 5, fill: "var(--accent)" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* ── Recent visits table ── */}
        <div className="visits-card">
          <h3>Recent Visits</h3>
          {recentVisits.length === 0 ? (
            <div className="chart-empty">
              <Globe size={36} />
              <p>No visits recorded yet.</p>
            </div>
          ) : (
            <div className="visits-table-wrap">
              <table className="visits-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Date & Time</th>
                    <th>Browser</th>
                    <th>OS</th>
                    <th>IP Address</th>
                  </tr>
                </thead>
                <tbody>
                  {recentVisits.map((visit, i) => {
                    const { browser, os } = parseUA(visit.user_agent);
                    return (
                      <tr key={visit.id}>
                        <td className="visit-num">{i + 1}</td>
                        <td>{formatDateTime(visit.visited_at)}</td>
                        <td>
                          <span className="badge">{browser}</span>
                        </td>
                        <td>
                          <span className="badge secondary">{os}</span>
                        </td>
                        <td className="ip">{visit.ip_address || "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Analytics;
