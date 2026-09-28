import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceArea,
} from "recharts";

const COLORS = {
  grid: "#2a2a26",
  text: "#83837a",
  systolic: "#e8ff00",
  diastolic: "#6dffb0",
  hr: "#ff5c5c",
};

function formatDate(value) {
  const d = new Date(value);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

export default function BpHrChart({ data }) {
  const chartData = data.map((row) => ({
    date: row.log_date,
    systolic: row.systolic_bp,
    diastolic: row.diastolic_bp,
    hr: row.resting_hr,
  }));

  return (
    <div className="tile chart-tile">
      <div className="chart-tile__title">
        <span>BLOOD PRESSURE &amp; RESTING HR</span>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <ComposedChart data={chartData} margin={{ top: 4, right: 12, bottom: 4, left: -12 }}>
          <CartesianGrid stroke={COLORS.grid} strokeDasharray="3 3" vertical={false} />
          {/* Normal blood-pressure band, systolic < 120 / diastolic < 80 */}
          <ReferenceArea yAxisId="bp" y1={0} y2={120} fill="#6dffb0" fillOpacity={0.04} />
          <XAxis
            dataKey="date"
            tickFormatter={formatDate}
            stroke={COLORS.text}
            tick={{ fontFamily: "Space Mono", fontSize: 11, fill: COLORS.text }}
          />
          <YAxis
            yAxisId="bp"
            stroke={COLORS.text}
            tick={{ fontFamily: "Space Mono", fontSize: 11, fill: COLORS.text }}
            width={40}
            domain={[40, "auto"]}
          />
          <YAxis
            yAxisId="hr"
            orientation="right"
            stroke={COLORS.text}
            tick={{ fontFamily: "Space Mono", fontSize: 11, fill: COLORS.text }}
            width={36}
          />
          <Tooltip
            labelFormatter={formatDate}
            contentStyle={{
              background: "#131311",
              border: "1px solid #2a2a26",
              fontFamily: "Space Mono",
              fontSize: 12,
            }}
          />
          <Legend wrapperStyle={{ fontFamily: "Space Mono", fontSize: 11 }} />
          <Line
            yAxisId="bp"
            type="monotone"
            dataKey="systolic"
            name="Systolic"
            stroke={COLORS.systolic}
            strokeWidth={2}
            dot={{ r: 2 }}
            connectNulls
          />
          <Line
            yAxisId="bp"
            type="monotone"
            dataKey="diastolic"
            name="Diastolic"
            stroke={COLORS.diastolic}
            strokeWidth={2}
            dot={{ r: 2 }}
            connectNulls
          />
          <Line
            yAxisId="hr"
            type="monotone"
            dataKey="hr"
            name="Resting HR"
            stroke={COLORS.hr}
            strokeWidth={1.5}
            strokeDasharray="4 3"
            dot={{ r: 2 }}
            connectNulls
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
