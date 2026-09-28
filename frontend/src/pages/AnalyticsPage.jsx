import { useEffect, useState } from "react";
import { api } from "../api/client.js";
import WeightBmiChart from "../components/charts/WeightBmiChart.jsx";
import ActivitySleepChart from "../components/charts/ActivitySleepChart.jsx";
import BpHrChart from "../components/charts/BpHrChart.jsx";

const RANGE_OPTIONS = [
  { label: "30D", value: 30 },
  { label: "90D", value: 90 },
  { label: "1Y", value: 365 },
];

export default function AnalyticsPage() {
  const [range, setRange] = useState(90);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api
      .analyticsSummary(range)
      .then((data) => {
        if (!cancelled) setSummary(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [range]);

  const hasLogs = summary?.logs?.length > 0;

  return (
    <div>
      <div className="eyebrow">[ ANALYTICS ]</div>
      <h1 className="page-title">
        Deep dive
        <span className="cursor-blink" />
      </h1>

      <div style={{ display: "flex", gap: 8, marginTop: 18 }}>
        {RANGE_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            className={`btn btn--sm ${range === opt.value ? "btn--primary" : "btn--ghost"}`}
            onClick={() => setRange(opt.value)}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {loading ? <p className="loading-line" style={{ marginTop: 16 }}>Crunching the numbers</p> : null}
      {error ? <div className="form-error" style={{ marginTop: 16 }}>{error}</div> : null}

      {!loading && !hasLogs ? (
        <div className="empty-state">
          <strong>Not enough data yet</strong>
          Log a few entries to unlock trend charts for this range.
        </div>
      ) : null}

      {hasLogs ? (
        <>
          <WeightBmiChart data={summary.logs} />
          <ActivitySleepChart data={summary.logs} />
          <BpHrChart data={summary.logs} />
        </>
      ) : null}
    </div>
  );
}
