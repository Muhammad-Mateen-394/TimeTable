import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export default function WorkloadChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: -18, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke="#eae7dc" />
        <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#8b8878" }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: "#8b8878" }} axisLine={false} tickLine={false} />
        <Tooltip
          cursor={{ fill: "rgba(30,61,43,0.06)" }}
          contentStyle={{ borderRadius: 10, border: "1px solid #eae7dc", fontSize: 12 }}
        />
        <Bar dataKey="max" fill="#eae7dc" radius={[4, 4, 0, 0]} barSize={16} />
        <Bar dataKey="assigned" fill="#1e3d2b" radius={[4, 4, 0, 0]} barSize={16} />
      </BarChart>
    </ResponsiveContainer>
  );
}
