import { useNavigate } from "react-router-dom";
import { api } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import LogForm from "../components/LogForm.jsx";

export default function LogEntryPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(payload) {
    await api.createLog(payload);
  }

  return (
    <div>
      <div className="eyebrow">[ LOG ENTRY ]</div>
      <h1 className="page-title">
        Today's check-in
        <span className="cursor-blink" />
      </h1>
      <p style={{ color: "var(--text-dim)", marginTop: 10, maxWidth: 520 }}>
        BMI and its category are calculated automatically from weight and height.
      </p>

      <div style={{ marginTop: 20, maxWidth: 560 }}>
        <LogForm onSubmit={handleSubmit} defaultHeightCm={user?.height_cm} />
      </div>

      <button className="btn btn--ghost" style={{ marginTop: 16 }} onClick={() => navigate("/history")}>
        View history →
      </button>
    </div>
  );
}
