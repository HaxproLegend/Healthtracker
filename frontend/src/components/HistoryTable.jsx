function bmiBadgeClass(category) {
  switch (category) {
    case "Normal":
      return "badge badge--normal";
    case "Underweight":
      return "badge badge--warn";
    case "Overweight":
      return "badge badge--warn";
    case "Obese":
      return "badge badge--danger";
    default:
      return "badge badge--dim";
  }
}

function formatDate(value) {
  const d = new Date(value);
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

export default function HistoryTable({ logs, onDelete }) {
  if (!logs || logs.length === 0) {
    return (
      <div className="empty-state">
        <strong>No entries yet</strong>
        Log your first entry and it'll show up here.
      </div>
    );
  }

  const sorted = [...logs].sort((a, b) => new Date(b.log_date) - new Date(a.log_date));

  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Weight</th>
            <th>BMI</th>
            <th>BP</th>
            <th>Resting HR</th>
            <th>Steps</th>
            <th>Water</th>
            <th>Sleep</th>
            <th>Notes</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((log) => (
            <tr key={log.id}>
              <td>{formatDate(log.log_date)}</td>
              <td>{log.weight_kg} kg</td>
              <td>
                {log.bmi} <span className={bmiBadgeClass(log.bmi_category)}>{log.bmi_category}</span>
              </td>
              <td>{log.systolic_bp && log.diastolic_bp ? `${log.systolic_bp}/${log.diastolic_bp}` : "—"}</td>
              <td>{log.resting_hr ?? "—"}</td>
              <td>{log.daily_steps ?? "—"}</td>
              <td>{log.water_liters ? `${log.water_liters} L` : "—"}</td>
              <td>{log.sleep_hours ? `${log.sleep_hours} h` : "—"}</td>
              <td style={{ maxWidth: 220, whiteSpace: "normal" }}>{log.notes || "—"}</td>
              <td>
                <button className="btn btn--ghost btn--sm" onClick={() => onDelete(log.id)}>
                  delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
