import { useEffect, useState } from "react";
import { api } from "../api/client.js";
import HistoryTable from "../components/HistoryTable.jsx";

export default function HistoryPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [exporting, setExporting] = useState(false);

  async function loadLogs() {
    setLoading(true);
    setError("");
    try {
      const data = await api.listLogs(365);
      setLogs(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLogs();
  }, []);

  async function handleDelete(id) {
    if (!window.confirm("Delete this entry? This can't be undone.")) return;
    try {
      await api.deleteLog(id);
      setLogs((prev) => prev.filter((log) => log.id !== id));
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleExport() {
    setExporting(true);
    setError("");
    try {
      await api.downloadExportCsv();
    } catch (err) {
      setError(err.message);
    } finally {
      setExporting(false);
    }
  }

  return (
    <div>
      <div className="eyebrow">[ HISTORY ]</div>
      <h1 className="page-title">
        Full log
        <span className="cursor-blink" />
      </h1>

      <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
        <button className="btn btn--ghost btn--sm" onClick={loadLogs}>
          refresh
        </button>
        <button className="btn btn--primary btn--sm" onClick={handleExport} disabled={exporting || logs.length === 0}>
          {exporting ? "exporting..." : "export csv"}
        </button>
      </div>

      {error ? <div className="form-error" style={{ marginTop: 16 }}>{error}</div> : null}
      {loading ? (
        <p className="loading-line" style={{ marginTop: 16 }}>Loading history</p>
      ) : (
        <HistoryTable logs={logs} onDelete={handleDelete} />
      )}
    </div>
  );
}
