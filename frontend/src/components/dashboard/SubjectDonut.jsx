import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const COLORS = ["#1e3d2b", "#4ade9a", "#3b7dd8", "#e0a12e", "#dc4c4c", "#6a3999", "#93650f"];

export default function SubjectDonut({ data }) {
  return (
    <div className="flex items-center gap-6">
      <ResponsiveContainer width={140} height={140}>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" innerRadius={40} outerRadius={65} paddingAngle={2}>
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #eae7dc", fontSize: 12 }} />
        </PieChart>
      </ResponsiveContainer>
      <ul className="space-y-1.5 text-sm">
        {data.map((d, i) => (
          <li key={d.name} className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
            <span className="text-ink-900/70">{d.name}</span>
            <span className="text-ink-900/40 ml-auto pl-4">{d.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
