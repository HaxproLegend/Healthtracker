import { useState } from "react";

const initialState = {
  log_date: new Date().toISOString().slice(0, 10),
  weight_kg: "",
  height_cm: "",
  systolic_bp: "",
  diastolic_bp: "",
  resting_hr: "",
  daily_steps: "",
  water_liters: "",
  sleep_hours: "",
  notes: "",
};

const NUMERIC_FIELDS = [
  "weight_kg", "height_cm", "systolic_bp", "diastolic_bp",
  "resting_hr", "daily_steps", "water_liters", "sleep_hours",
];

export default function LogForm({ onSubmit, defaultHeightCm }) {
  const [form, setForm] = useState({
    ...initialState,
    height_cm: defaultHeightCm ? String(defaultHeightCm) : "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    const weight = parseFloat(form.weight_kg);
    const height = parseFloat(form.height_cm);

    if (!weight || weight <= 0) {
      setError("Enter a valid weight in kg.");
      return;
    }
    if (!height || height <= 0) {
      setError("Enter a valid height in cm.");
      return;
    }

    const payload = { log_date: form.log_date, weight_kg: weight, height_cm: height };
    for (const field of NUMERIC_FIELDS) {
      if (field === "weight_kg" || field === "height_cm") continue;
      if (form[field] !== "") payload[field] = parseFloat(form[field]);
    }
    if (form.notes.trim()) payload.notes = form.notes.trim();

    setSubmitting(true);
    try {
      await onSubmit(payload);
      setSuccess("Entry logged.");
      setForm({ ...initialState, height_cm: form.height_cm, log_date: form.log_date });
    } catch (err) {
      setError(err.message || "Could not save entry.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="tile" onSubmit={handleSubmit}>
      {error ? <div className="form-error">{error}</div> : null}
      {success ? <div className="form-success">{success}</div> : null}

      <div className="form-grid">
        <div className="field">
          <label htmlFor="log_date">Date</label>
          <input id="log_date" type="date" name="log_date" value={form.log_date} onChange={handleChange} />
        </div>
        <div className="field">
          <label htmlFor="weight_kg">Weight (kg)</label>
          <input
            id="weight_kg" type="number" step="0.1" min="0" name="weight_kg"
            value={form.weight_kg} onChange={handleChange} placeholder="e.g. 68.4" required
          />
        </div>
        <div className="field">
          <label htmlFor="height_cm">Height (cm)</label>
          <input
            id="height_cm" type="number" step="0.1" min="0" name="height_cm"
            value={form.height_cm} onChange={handleChange} placeholder="e.g. 172" required
          />
        </div>
      </div>

      <div className="form-grid">
        <div className="field">
          <label htmlFor="systolic_bp">Systolic BP</label>
          <input id="systolic_bp" type="number" min="0" name="systolic_bp" value={form.systolic_bp} onChange={handleChange} placeholder="120" />
        </div>
        <div className="field">
          <label htmlFor="diastolic_bp">Diastolic BP</label>
          <input id="diastolic_bp" type="number" min="0" name="diastolic_bp" value={form.diastolic_bp} onChange={handleChange} placeholder="80" />
        </div>
        <div className="field">
          <label htmlFor="resting_hr">Resting HR</label>
          <input id="resting_hr" type="number" min="0" name="resting_hr" value={form.resting_hr} onChange={handleChange} placeholder="68" />
        </div>
      </div>

      <div className="form-grid">
        <div className="field">
          <label htmlFor="daily_steps">Daily Steps</label>
          <input id="daily_steps" type="number" min="0" name="daily_steps" value={form.daily_steps} onChange={handleChange} placeholder="8500" />
        </div>
        <div className="field">
          <label htmlFor="water_liters">Water (L)</label>
          <input id="water_liters" type="number" step="0.1" min="0" name="water_liters" value={form.water_liters} onChange={handleChange} placeholder="2.5" />
        </div>
        <div className="field">
          <label htmlFor="sleep_hours">Sleep (hrs)</label>
          <input id="sleep_hours" type="number" step="0.1" min="0" name="sleep_hours" value={form.sleep_hours} onChange={handleChange} placeholder="7.5" />
        </div>
      </div>

      <div className="field">
        <label htmlFor="notes">Notes</label>
        <textarea id="notes" name="notes" value={form.notes} onChange={handleChange} placeholder="Anything worth remembering about today" />
      </div>

      <button type="submit" className="btn btn--primary" disabled={submitting}>
        {submitting ? "Saving..." : "Save entry"}
      </button>
    </form>
  );
}
