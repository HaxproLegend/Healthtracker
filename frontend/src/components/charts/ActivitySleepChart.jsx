import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from "recharts";

const COLORS = {
  grid: "#2a2a26",
  text: "#83837a",
  steps: "#e8ff00",
  sleep: "#6dffb0",
  target: "#ff5c5c",
};

const STEPS_TARGET = 10000;
const SLEEP_TARGET = 8;

function formatDate(value) {
  const d = new Date(value);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

export default function ActivitySleepChart({ data }) {
  const chartData = data.map((row) => ({
    date: row.log_date,
    steps: row.daily_steps,
    sleep: row.sleep_hours,
  }));

  return (
    <div className="tile chart-tile">
      <div className="chart-tile__title">
        <span>DAILY ACTIVITY &amp; SLEEP</span>
        <span style={{ color: "#83837a" }}>target: {STEPS_TARGET.toLocaleString()} steps / {SLEEP_TARGET}h sleep</span>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <ComposedChart data={chartData} margin={{ top: 4, right: 12, bottom: 4, left: -12 }}>
          <CartesianGrid stroke={COLORS.grid} strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={formatDate}
            stroke={COLORS.text}
            tick={{ fontFamily: "Space Mono", fontSize: 11, fill: COLORS.text }}
          />
          <YAxis
            yAxisId="steps"
            stroke={COLORS.text}
            tick={{ fontFamily: "Space Mono", fontSize: 11, fill: COLORS.text }}
            width={48}
          />
          <YAxis
            yAxisId="sleep"
            orientation="right"
            stroke={COLORS.text}
            tick={{ fontFamily: "Space Mono", fontSize: 11, fill: COLORS.text }}
            width={30}
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
          <ReferenceLine yAxisId="steps" y={STEPS_TARGET} stroke={COLORS.target} strokeDasharray="4 3" />
          <ReferenceLine yAxisId="sleep" y={SLEEP_TARGET} stroke={COLORS.target} strokeDasharray="2 2" />
          <Bar yAxisId="steps" dataKey="steps" name="Steps" fill={COLORS.steps} />
          <Line
            yAxisId="sleep"
            type="monotone"
            dataKey="sleep"
            name="Sleep (hrs)"
            stroke={COLORS.sleep}
            strokeWidth={2}
            dot={{ r: 2 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
