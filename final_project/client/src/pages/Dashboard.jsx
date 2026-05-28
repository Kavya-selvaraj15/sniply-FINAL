import React, { useState, useEffect, useCallback } from "react";
import api from "../api/axios";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar";
import UrlCard from "../components/UrlCard";
import {
  Link2,
  Scissors,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  MousePointer,
  Calendar,
  Zap,
} from "lucide-react";

const Dashboard = () => {
  const [urls, setUrls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
  });
  const [form, setForm] = useState({
    originalUrl: "",
    customAlias: "",
    expiresAt: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [showAdvanced, setShowAdvanced] = useState(false);

  const fetchUrls = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await api.get(`/url/my-urls?page=${page}&limit=8`);
      setUrls(res.data.data || []);
      setPagination(
        res.data.pagination || { page: 1, totalPages: 1, total: 0 },
      );
    } catch (err) {
      console.error("Fetch error:", err);
      setUrls([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUrls();
  }, [fetchUrls]);

  const handleShorten = async (e) => {
    e.preventDefault();
    if (!form.originalUrl.trim()) {
      setFormErrors({ originalUrl: "Please enter a URL" });
      return;
    }
    try {
      new URL(form.originalUrl);
    } catch {
      setFormErrors({ originalUrl: "Enter valid URL with http://" });
      return;
    }

    setSubmitting(true);
    try {
      const payload = { originalUrl: form.originalUrl };
      if (form.customAlias) payload.customAlias = form.customAlias;
      if (form.expiresAt) payload.expiresAt = form.expiresAt;
      const res = await api.post("/url/shorten", payload);
      toast.success("Link shortened!");
      setForm({ originalUrl: "", customAlias: "", expiresAt: "" });
      setFormErrors({});
      setUrls((prev) => [res.data.data, ...prev]);
      setPagination((p) => ({ ...p, total: (p.total || 0) + 1 }));
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to shorten URL");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/url/${id}`);
      toast.success("Link deleted");
      setUrls((prev) => prev.filter((u) => u.id !== id));
    } catch {
      toast.error("Failed to delete");
    }
  };

  const totalClicks = urls.reduce((sum, u) => sum + (u.total_clicks || 0), 0);

  return (
    <div className="dashboard-page">
      <Navbar />
      <main className="dashboard-main">
        <div className="stats-bar">
          <div className="stat-item">
            <Link2 size={18} />
            <div>
              <span className="stat-value">{pagination.total || 0}</span>
              <span className="stat-label">Total Links</span>
            </div>
          </div>
          <div className="stat-item">
            <MousePointer size={18} />
            <div>
              <span className="stat-value">{totalClicks}</span>
              <span className="stat-label">Total Clicks</span>
            </div>
          </div>
          <div className="stat-item">
            <TrendingUp size={18} />
            <div>
              <span className="stat-value">
                {pagination.total > 0
                  ? (totalClicks / pagination.total).toFixed(1)
                  : "0"}
              </span>
              <span className="stat-label">Avg. Clicks</span>
            </div>
          </div>
          <div className="stat-item">
            <Calendar size={18} />
            <div>
              <span className="stat-value">
                {new Date().toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </span>
              <span className="stat-label">Today</span>
            </div>
          </div>
        </div>

        <section className="shorten-section">
          <div className="shorten-card">
            <div className="shorten-card-header">
              <Scissors size={20} />
              <h2>Shorten a URL</h2>
            </div>
            <form onSubmit={handleShorten} noValidate>
              <div className="shorten-row">
                <div
                  className={`field-group flex-1 ${formErrors.originalUrl ? "error" : ""}`}
                >
                  <input
                    type="url"
                    value={form.originalUrl}
                    onChange={(e) => {
                      setForm({ ...form, originalUrl: e.target.value });
                      setFormErrors({});
                    }}
                    placeholder="Paste your long URL here..."
                    className="url-input"
                  />
                  {formErrors.originalUrl && (
                    <span className="field-error">
                      {formErrors.originalUrl}
                    </span>
                  )}
                </div>
                <button
                  type="submit"
                  className="btn-shorten"
                  disabled={submitting}
                >
                  {submitting ? (
                    <span className="btn-spinner" />
                  ) : (
                    <>
                      <Zap size={16} />
                      <span>Shorten</span>
                    </>
                  )}
                </button>
              </div>
              <button
                type="button"
                className="advanced-toggle"
                onClick={() => setShowAdvanced(!showAdvanced)}
              >
                {showAdvanced ? "▲ Hide options" : "▼ Custom alias & expiry"}
              </button>
              {showAdvanced && (
                <div className="advanced-fields">
                  <div className="field-group">
                    <label>Custom Alias (optional)</label>
                    <input
                      type="text"
                      value={form.customAlias}
                      onChange={(e) =>
                        setForm({ ...form, customAlias: e.target.value })
                      }
                      placeholder="my-link"
                    />
                  </div>
                  <div className="field-group">
                    <label>Expiry Date (optional)</label>
                    <input
                      type="datetime-local"
                      value={form.expiresAt}
                      min={new Date().toISOString().slice(0, 16)}
                      onChange={(e) =>
                        setForm({ ...form, expiresAt: e.target.value })
                      }
                    />
                  </div>
                </div>
              )}
            </form>
          </div>
        </section>

        <section className="url-list-section">
          <div className="section-header">
            <h3>Your Links</h3>
            <span className="count-badge">{pagination.total || 0}</span>
          </div>
          {loading ? (
            <div className="url-grid">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="url-card skeleton" />
              ))}
            </div>
          ) : urls.length === 0 ? (
            <div className="empty-state">
              <Link2 size={48} />
              <h4>No links yet</h4>
              <p>Paste a URL above to create your first short link.</p>
            </div>
          ) : (
            <div className="url-grid">
              {urls.map((url) => (
                <UrlCard key={url.id} url={url} onDelete={handleDelete} />
              ))}
            </div>
          )}
          {pagination.totalPages > 1 && (
            <div className="pagination">
              <button
                className="page-btn"
                onClick={() => fetchUrls(pagination.page - 1)}
                disabled={pagination.page === 1}
              >
                <ChevronLeft size={16} /> Prev
              </button>
              <span className="page-info">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                className="page-btn"
                onClick={() => fetchUrls(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
