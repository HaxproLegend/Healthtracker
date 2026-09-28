/**
 * Displays one headline metric — a big value, its unit, and a
 * week-over-week delta badge. `goodDirection` controls whether an
 * "up" delta is treated as good (ok/green) or bad (warn/amber) news —
 * e.g. more steps is good, higher resting heart rate is not.
 */
export default function MetricTile({ label, value, unit, delta, goodDirection = "up" }) {
  const hasValue = value !== null && value !== undefined;
  const hasDelta = delta !== null && delta !== undefined;

  let direction = "flat";
  if (hasDelta) {
    if (delta > 0) direction = "up";
    else if (delta < 0) direction = "down";
  }

  const isGoodNews =
    direction === "flat" ? null : (direction === goodDirection);

  const deltaClass =
    direction === "flat"
      ? "metric-tile__delta--flat"
      : isGoodNews
      ? "metric-tile__delta--down"
      : "metric-tile__delta--up";

  const arrow = direction === "up" ? "↑" : direction === "down" ? "↓" : "–";

  return (
    <div className="tile tile--interactive">
      <div className="metric-tile__label">{label}</div>
      <div className="metric-tile__value">
        {hasValue ? value : "—"}
        {unit ? <span className="metric-tile__unit">{unit}</span> : null}
      </div>
      <div className={`metric-tile__delta ${deltaClass}`}>
        {arrow} {hasDelta ? `${Math.abs(delta)} ${unit}`.trim() : "no prior data"}
      </div>
    </div>
  );
}
