import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Copy,
  Check,
  Trash2,
  BarChart2,
  ExternalLink,
  Clock,
  MousePointer,
  QrCode,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import toast from "react-hot-toast";

const UrlCard = ({ url, onDelete }) => {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url.shortUrl);
      setCopied(true);
      toast.success("Copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
      return;
    }
    onDelete(url.id);
  };

  const formatDate = (d) =>
    new Date(d).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  const truncate = (str, n) => (str.length > n ? str.slice(0, n) + "…" : str);

  return (
    <div className={`url-card ${url.isExpired ? "expired" : ""}`}>
      {url.isExpired && <div className="expired-badge">Expired</div>}

      <div className="url-card-header">
        <div className="url-original">
          <span className="label">Original URL</span>
          <a
            href={url.original_url}
            target="_blank"
            rel="noreferrer"
            className="original-link"
          >
            {truncate(url.original_url, 60)}
            <ExternalLink size={12} />
          </a>
        </div>

        <div className="url-short">
          <span className="label">Short URL</span>
          <div className="short-url-row">
            <a
              href={url.shortUrl}
              target="_blank"
              rel="noreferrer"
              className="short-link"
            >
              {url.shortUrl.replace(/^https?:\/\//, "")}
            </a>
            <button
              className="icon-btn copy-btn"
              onClick={handleCopy}
              title="Copy"
            >
              {copied ? <Check size={15} /> : <Copy size={15} />}
            </button>
          </div>
        </div>
      </div>

      <div className="url-card-meta">
        <div className="meta-item">
          <MousePointer size={14} />
          <span>
            {url.total_clicks} click{url.total_clicks !== 1 ? "s" : ""}
          </span>
        </div>
        <div className="meta-item">
          <Clock size={14} />
          <span>{formatDate(url.created_at)}</span>
        </div>
        {url.expires_at && (
          <div className="meta-item expires">
            <Clock size={14} />
            <span>Expires {formatDate(url.expires_at)}</span>
          </div>
        )}
      </div>

      <div className="url-card-actions">
        <button
          className="btn-action analytics"
          onClick={() => navigate(`/analytics/${url.id}`)}
        >
          <BarChart2 size={14} /> Analytics
        </button>

        <button className="btn-action qr" onClick={() => setShowQr(!showQr)}>
          <QrCode size={14} />
          {showQr ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        <button
          className={`btn-action delete ${confirmDelete ? "confirm" : ""}`}
          onClick={handleDelete}
          title={confirmDelete ? "Click again to confirm" : "Delete"}
        >
          <Trash2 size={14} />
          {confirmDelete ? "Confirm?" : "Delete"}
        </button>
      </div>

      {showQr && (
        <div className="qr-panel">
          <QRCodeSVG
            value={url.shortUrl}
            size={140}
            bgColor="transparent"
            fgColor="currentColor"
            level="H"
          />
          <span className="qr-label">Scan to visit</span>
        </div>
      )}
    </div>
  );
};

export default UrlCard;
