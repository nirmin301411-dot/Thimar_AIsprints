import { useState, useEffect } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Wifi, WifiOff } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getPortfolio } from "../api/investments";
import { getTransactions } from "../api/transactions";
import type { PortfolioSummary } from "../api/investments";
import type { Transaction } from "../api/transactions";
import { portfolioSummary as mockSummary, investments as mockInvestments, performanceData, allocations } from "../data";
import { useLang } from "../context/LangContext";

const COLORS = ["#10b981", "#8b5cf6", "#06b6d4", "#f59e0b", "#f43f5e"];

export default function Portfolio() {
  const { user } = useAuth();
  const { t } = useLang();
  const [summary, setSummary] = useState<PortfolioSummary | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLive, setIsLive] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const investorId = user.user_id;

    Promise.all([
      getPortfolio(investorId),
      getTransactions(investorId),
    ])
      .then(([portfolio, txs]) => {
        setSummary(portfolio);
        setTransactions(txs);
        setIsLive(true);
      })
      .catch(() => {
        // Fall back to mock data
        setSummary({
          total_invested: mockSummary.totalInvested,
          current_value: mockSummary.currentValue,
          total_roi_pct: mockSummary.totalRoi,
          active_deals: mockInvestments.length,
          investments: [],
        });
        setIsLive(false);
      })
      .finally(() => setLoading(false));
  }, [user]);

  // Build pie chart data from live investments or mock allocations
  const pieData = summary?.investments?.length
    ? summary.investments.map((inv, i) => ({
        name: `Deal #${inv.deal_id}`,
        value: inv.amount_egp,
        color: COLORS[i % COLORS.length],
      }))
    : allocations;

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 300 }}>
        <div style={{ color: "var(--color-text-secondary)" }}>Loading portfolio...</div>
      </div>
    );
  }

  const s = summary!;
  const gain = s.current_value - s.total_invested;

  return (
    <div className="animate-fade-in font-sans">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <h2 className="text-3xl font-bold text-textMain tracking-tight">My Portfolio</h2>
          <span className={`flex items-center gap-1.5 text-xs px-3 py-1 rounded-full font-semibold ${isLive ? 'bg-success/15 text-success border border-success/30' : 'bg-surfaceHighlight text-textMuted border border-white/10'}`}>
            {isLive ? <Wifi size={12} /> : <WifiOff size={12} />}
            {isLive ? "Live" : "Mock data"}
          </span>
        </div>
        <p className="text-textSecondary">Track your investments and returns across all farms</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { label: "Current Value", value: `EGP ${s.current_value.toLocaleString()}`, color: "#00FF66", change: gain >= 0 ? `↑ EGP ${Math.abs(gain).toLocaleString()} gain` : `↓ EGP ${Math.abs(gain).toLocaleString()} loss`, positive: gain >= 0 },
          { label: "Total Invested", value: `EGP ${s.total_invested.toLocaleString()}`, color: "#8b5cf6", change: null },
          { label: "Total ROI", value: `${s.total_roi_pct}%`, color: "#06b6d4", change: s.total_roi_pct >= 0 ? `↑ ${Math.abs(s.total_roi_pct)}%` : `↓ ${Math.abs(s.total_roi_pct)}%`, positive: s.total_roi_pct >= 0 },
          { label: "Active Deals", value: s.active_deals, color: "#f59e0b", change: null }
        ].map((stat, i) => (
          <div key={i} className="bg-surface/40 backdrop-blur-md border border-white/5 rounded-2xl p-6 relative overflow-hidden group hover:border-white/20 transition-colors">
            <div className="absolute top-0 left-0 right-0 h-1" style={{ background: `linear-gradient(90deg, ${stat.color}, transparent)` }} />
            <div className="text-3xl font-bold tracking-tight text-textMain mb-1">{stat.value}</div>
            <div className="text-sm font-medium text-textMuted uppercase tracking-wider mb-3">{stat.label}</div>
            {stat.change && (
              <div className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${stat.positive ? "bg-success/15 text-success" : "bg-danger/15 text-danger"}`}>
                {stat.change}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Performance chart */}
        <div className="bg-surface/40 backdrop-blur-md border border-white/5 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-textMain mb-6">Performance Over Time</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={performanceData}>
                <defs>
                  <linearGradient id="pv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00FF66" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#00FF66" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `EGP ${(v / 1000).toFixed(0)}k`} />
                <Tooltip contentStyle={{ background: "#041B11", border: "1px solid #124d32", borderRadius: 12, fontSize: 13 }} formatter={(value: number) => [`EGP ${value.toLocaleString()}`]} />
                <Area type="monotone" dataKey="value" stroke="#00FF66" strokeWidth={3} fill="url(#pv)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Allocation pie */}
        <div className="bg-surface/40 backdrop-blur-md border border-white/5 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-textMain mb-6">Allocation Breakdown</h3>
          <div className="flex flex-col sm:flex-row items-center gap-8 h-full">
            <div className="w-48 h-48 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} stroke="none">
                    {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "#041B11", border: "1px solid #124d32", borderRadius: 12, fontSize: 13 }} formatter={(v: number) => [`EGP ${v.toLocaleString()}`]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 flex flex-col gap-3 w-full">
              {pieData.map((a, i) => (
                <div key={a.name} className="flex items-center gap-3 p-3 rounded-xl bg-surfaceHighlight/30 border border-white/5">
                  <div className="w-3 h-3 rounded-full shrink-0" style={{ background: COLORS[i % COLORS.length], boxShadow: `0 0 10px ${COLORS[i % COLORS.length]}80` }} />
                  <span className="flex-1 text-sm text-textSecondary font-medium">{a.name}</span>
                  <span className="text-sm font-bold text-textMain">EGP {a.value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Active investments table */}
      <div className="bg-surface/40 backdrop-blur-md border border-white/5 rounded-2xl p-6 mb-8 overflow-hidden">
        <h3 className="text-lg font-bold text-textMain mb-6">Active Investments</h3>
        {s.investments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="pb-3 text-xs font-bold text-textMuted uppercase tracking-wider">Deal ID</th>
                  <th className="pb-3 text-xs font-bold text-textMuted uppercase tracking-wider">Invested (EGP)</th>
                  <th className="pb-3 text-xs font-bold text-textMuted uppercase tracking-wider">Status</th>
                  <th className="pb-3 text-xs font-bold text-textMuted uppercase tracking-wider">Invested On</th>
                  <th className="pb-3 text-xs font-bold text-textMuted uppercase tracking-wider">Expected Return</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {s.investments.map((inv) => (
                  <tr key={inv.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-4 text-sm font-bold text-textMain">Deal #{inv.deal_id}</td>
                    <td className="py-4 text-sm font-medium text-textMain">EGP {inv.amount_egp.toLocaleString()}</td>
                    <td className="py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                        inv.status === "active" ? "bg-success/15 text-success" : "bg-accent-amber/15 text-accent-amber"
                      }`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-4 text-sm text-textMuted">{new Date(inv.invested_at).toLocaleDateString()}</td>
                    <td className="py-4 text-sm text-textMuted">{inv.expected_return_date ? new Date(inv.expected_return_date).toLocaleDateString() : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-textMuted py-4">No investments yet.</p>
        )}
      </div>

      {/* Transaction history */}
      {transactions.length > 0 && (
        <div className="bg-surface/40 backdrop-blur-md border border-white/5 rounded-2xl p-6 overflow-hidden">
          <h3 className="text-lg font-bold text-textMain mb-6">Transaction History</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="pb-3 text-xs font-bold text-textMuted uppercase tracking-wider">Type</th>
                  <th className="pb-3 text-xs font-bold text-textMuted uppercase tracking-wider">Amount (EGP)</th>
                  <th className="pb-3 text-xs font-bold text-textMuted uppercase tracking-wider">Deal</th>
                  <th className="pb-3 text-xs font-bold text-textMuted uppercase tracking-wider">Status</th>
                  <th className="pb-3 text-xs font-bold text-textMuted uppercase tracking-wider">Date</th>
                  <th className="pb-3 text-xs font-bold text-textMuted uppercase tracking-wider">Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {transactions.slice(0, 10).map((tx) => (
                  <tr key={tx.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-4">
                      <span className="capitalize text-sm font-bold text-textMain">{tx.type}</span>
                    </td>
                    <td className={`py-4 text-sm font-bold ${tx.type === "deposit" || tx.type === "return" ? "text-success" : "text-danger"}`}>
                      {tx.type === "deposit" || tx.type === "return" ? "+" : "-"} EGP {tx.amount_egp.toLocaleString()}
                    </td>
                    <td className="py-4 text-sm text-textMuted">{tx.deal_id ? `#${tx.deal_id}` : "—"}</td>
                    <td className="py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-success/15 text-success">
                        {tx.status}
                      </span>
                    </td>
                    <td className="py-4 text-sm text-textMuted">{new Date(tx.created_at).toLocaleDateString()}</td>
                    <td className="py-4 text-sm text-textMuted truncate max-w-[150px]">{tx.note || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
