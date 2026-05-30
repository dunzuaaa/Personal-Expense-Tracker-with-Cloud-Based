import { useState, useEffect } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { api } from "../utils/api";

const COLORS = ["#10b981", "#f59e0b", "#3b82f6", "#ef4444", "#8b5cf6", "#ec4899", "#14b8a6", "#f97316"];

function StatCard({ label, value, type }) {
  const colors = {
    income: "bg-emerald-50 text-emerald-700 border-emerald-100",
    expense: "bg-red-50 text-red-600 border-red-100",
    balance: "bg-blue-50 text-blue-700 border-blue-100",
  };
  const icons = { income: "⬆️", expense: "⬇️", balance: "💼" };

  return (
    <div className={`rounded-xl border p-5 ${colors[type]}`}>
      <div className="flex items-center gap-2 text-sm font-medium mb-2 opacity-80">
        <span>{icons[type]}</span> {label}
      </div>
      <p className="text-2xl font-bold">
        Rp {Number(value || 0).toLocaleString("id-ID")}
      </p>
    </div>
  );
}

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/api/summary")
      .then(setSummary)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        Memuat data...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-red-500">Gagal memuat data: {error}</div>
    );
  }

  const pieData = summary?.by_category?.map((c) => ({
    name: c.category,
    value: Number(c.total),
  })) || [];

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Ringkasan keuangan bulan ini</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Total Pemasukan" value={summary?.total_income} type="income" />
        <StatCard label="Total Pengeluaran" value={summary?.total_expense} type="expense" />
        <StatCard label="Saldo Bersih" value={summary?.balance} type="balance" />
      </div>

      {/* Pie chart */}
      {pieData.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-base font-semibold text-gray-700 mb-4">Pengeluaran per Kategori</h2>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={110}
                paddingAngle={3}
                dataKey="value"
              >
                {pieData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => `Rp ${Number(value).toLocaleString("id-ID")}`}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {pieData.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-gray-400">
          <p className="text-3xl mb-2">📭</p>
          <p>Belum ada transaksi. Tambahkan transaksi pertamamu!</p>
        </div>
      )}
    </div>
  );
}
