import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

const COLORS = {
  grid: "#2a2a26",
  text: "#83837a",
  weight: "#e8ff00",
  ma7: "#6dffb0",
  bmi: "#ff5c5c",
};

function formatDate(value) {
  const d = new Date(value);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

export default function WeightBmiChart({ data }) {
  const chartData = data.map((row) => ({
    date: row.log_date,
    weight: row.weight_kg,
    weightMa7: row.weight_ma_7,
    bmi: row.bmi,
  }));

  return (
    <div className="tile chart-tile">
      <div className="chart-tile__title">
        <span>WEIGHT &amp; BMI TREND</span>
        <span className="loading-line" style={{ visibility: "hidden" }}>-</span>
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
            yAxisId="weight"
            stroke={COLORS.text}
            tick={{ fontFamily: "Space Mono", fontSize: 11, fill: COLORS.text }}
            width={40}
          />
          <YAxis
            yAxisId="bmi"
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
            yAxisId="weight"
            type="monotone"
            dataKey="weight"
            name="Weight (kg)"
            stroke={COLORS.weight}
            strokeWidth={2}
            dot={false}
          />
          <Line
            yAxisId="weight"
            type="monotone"
            dataKey="weightMa7"
            name="7-day avg"
            stroke={COLORS.ma7}
            strokeWidth={1.5}
            strokeDasharray="4 3"
            dot={false}
          />
          <Line
            yAxisId="bmi"
            type="monotone"
            dataKey="bmi"
            name="BMI"
            stroke={COLORS.bmi}
            strokeWidth={2}
            dot={{ r: 2 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
