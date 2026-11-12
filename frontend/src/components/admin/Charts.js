"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardHeader } from "@/components/admin/ui";
import { formatMoney } from "@/lib/admin";

const COLORS = ["#4f46e5", "#06b6d4", "#f59e0b", "#ef4444", "#22c55e", "#a855f7", "#64748b"];

function moneyTick(value) {
  if (value >= 1000) return `${Math.round(value / 100) / 10}k`;
  return String(value);
}

export function SalesAreaChart({ data = [] }) {
  const chartData = data.map((item) => ({
    ...item,
    label: item.date?.slice(5) || item.date,
  }));

  return (
    <Card>
      <CardHeader title="Sales (14 days)" description="Revenue and order volume" />
      <div className="h-72 w-full px-2 pb-3 pt-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
            <YAxis
              yAxisId="left"
              tickFormatter={moneyTick}
              tick={{ fontSize: 11, fill: "#64748b" }}
              axisLine={false}
              tickLine={false}
              width={42}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fontSize: 11, fill: "#64748b" }}
              axisLine={false}
              tickLine={false}
              width={28}
            />
            <Tooltip
              contentStyle={{ borderRadius: 12, borderColor: "#e2e8f0", fontSize: 12 }}
              formatter={(value, name) =>
                name === "revenue" ? [formatMoney(value), "Revenue"] : [value, "Orders"]
              }
            />
            <Legend />
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="revenue"
              name="revenue"
              stroke="#4f46e5"
              fill="url(#revFill)"
              strokeWidth={2.5}
            />
            <Bar yAxisId="right" dataKey="orders" name="orders" fill="#06b6d4" radius={[4, 4, 0, 0]} barSize={14} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

export function StatusPieChart({ data = [] }) {
  const chartData = data.filter((item) => item.count > 0);
  const empty = !chartData.length;

  return (
    <Card>
      <CardHeader title="Orders by status" description="Pipeline snapshot" />
      <div className="h-72 w-full px-2 pb-3 pt-2">
        {empty ? (
          <div className="grid h-full place-items-center text-sm text-slate-500">No orders yet</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                dataKey="count"
                nameKey="status"
                innerRadius={55}
                outerRadius={90}
                paddingAngle={3}
              >
                {chartData.map((entry, index) => (
                  <Cell key={entry.status} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ borderRadius: 12, borderColor: "#e2e8f0", fontSize: 12 }}
                formatter={(value, name) => [value, String(name)]}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
}

export function UserOrdersTrendChart({ data = [] }) {
  const chartData = data.map((item) => ({
    ...item,
    label: item.date?.slice(5) || item.date,
  }));

  return (
    <Card>
      <CardHeader title="Order activity" description="Orders vs cancellations by day" />
      <div className="h-72 w-full px-2 pb-3 pt-4">
        {!chartData.length ? (
          <div className="grid h-full place-items-center text-sm text-slate-500">No order history yet</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} width={28} />
              <Tooltip contentStyle={{ borderRadius: 12, borderColor: "#e2e8f0", fontSize: 12 }} />
              <Legend />
              <Bar dataKey="orders" name="Orders" fill="#4f46e5" radius={[4, 4, 0, 0]} barSize={12} />
              <Bar dataKey="cancelled" name="Cancelled" fill="#f43f5e" radius={[4, 4, 0, 0]} barSize={12} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
}

export function TopProductsChart({ data = [] }) {
  const chartData = data.map((item) => ({
    name: (item.title || item.slug || "").slice(0, 16),
    qty: item.qty || 0,
    revenue: item.revenue || 0,
  }));

  return (
    <Card>
      <CardHeader title="Top products" description="Units sold" />
      <div className="h-72 w-full px-2 pb-3 pt-4">
        {!chartData.length ? (
          <div className="grid h-full place-items-center text-sm text-slate-500">No sales yet</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" margin={{ top: 4, right: 12, left: 8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
              <YAxis
                type="category"
                dataKey="name"
                width={90}
                tick={{ fontSize: 11, fill: "#64748b" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{ borderRadius: 12, borderColor: "#e2e8f0", fontSize: 12 }}
                formatter={(value, name) =>
                  name === "revenue" ? [formatMoney(value), "Revenue"] : [value, "Qty"]
                }
              />
              <Bar dataKey="qty" fill="#4f46e5" radius={[0, 6, 6, 0]} barSize={16} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
}
