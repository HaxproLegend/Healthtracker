import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import MetricTile from "../components/MetricTile.jsx";
import WeightBmiChart from "../components/charts/WeightBmiChart.jsx";

export default function DashboardPage() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api
      .analyticsSummary(90)
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
  }, []);

  const trends = summary?.trends || {};
  const hasLogs = summary?.logs?.length > 0;

  return (
    <div>
      <div className="eyebrow">[ OVERVIEW ]</div>
      <h1 className="page-title">
        {user ? `Hey, ${user.username}` : "Dashboard"}
        <span className="cursor-blink" />
      </h1>

      {loading ? <p className="loading-line" style={{ marginTop: 16 }}>Loading your data</p> : null}
      {error ? <div className="form-error" style={{ marginTop: 16 }}>{error}</div> : null}

      {!loading && !hasLogs ? (
        <div className="empty-state">
          <strong>No entries yet</strong>
          Log your first daily check-in to start seeing metrics and trends.
          <div style={{ marginTop: 18 }}>
            <Link to="/log" className="btn btn--primary">
              Log an entry
            </Link>
          </div>
        </div>
      ) : null}

      {hasLogs ? (
        <>
          <div className="tile-grid">
            <MetricTile label="Weight" value={trends.weight?.value} unit="kg" delta={trends.weight?.delta} goodDirection="down" />
            <MetricTile label="BMI" value={trends.bmi?.value} unit="" delta={trends.bmi?.delta} goodDirection="down" />
            <MetricTile label="Daily Steps" value={trends.steps?.value} unit="steps" delta={trends.steps?.delta} goodDirection="up" />
            <MetricTile label="Sleep" value={trends.sleep?.value} unit="hrs" delta={trends.sleep?.delta} goodDirection="up" />
          </div>

          <div className="tile-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", marginTop: 14 }}>
            <div className="tile">
              <div className="metric-tile__label">BMI Category</div>
              <div className="metric-tile__value" style={{ fontSize: 20 }}>{summary.latest?.bmi_category ?? "—"}</div>
            </div>
            <div className="tile">
              <div className="metric-tile__label">BP Status</div>
              <div className="metric-tile__value" style={{ fontSize: 20 }}>{summary.latest?.bp_status ?? "—"}</div>
            </div>
            <div className="tile">
              <div className="metric-tile__label">Total Water (90d)</div>
              <div className="metric-tile__value" style={{ fontSize: 20 }}>{summary.totalWaterLiters ?? 0} L</div>
            </div>
            <div className="tile">
              <div className="metric-tile__label">Avg Sleep (90d)</div>
              <div className="metric-tile__value" style={{ fontSize: 20 }}>{summary.averageSleepHours ?? 0} h</div>
            </div>
          </div>

          <WeightBmiChart data={summary.logs} />
        </>
      ) : null}
    </div>
  );
}
