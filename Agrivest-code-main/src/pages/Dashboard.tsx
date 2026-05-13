import { useState, useEffect } from "react";
import { TrendingUp, Users, Sprout, DollarSign, Award, BarChart3, Wifi, WifiOff, Send, CheckCircle, AlertCircle, XCircle } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useAuth } from "../context/AuthContext";
import { getAdminStats, publishPlatformPost, simulateDealFunded } from "../api/admin";
import { getTransactions } from "../api/transactions";
import { getDeals, updateDealStatus } from "../api/deals";
import type { AdminStats } from "../api/admin";
import type { Transaction } from "../api/transactions";
import type { Deal } from "../api/deals";
import { dashboardStats, performanceData } from "../data";

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [activity, setActivity] = useState<Transaction[]>([]);
  const [isLive, setIsLive] = useState(false);

  // Platform Post state
  const [postTitle, setPostTitle] = useState("");
  const [postContent, setPostContent] = useState("");
  const [postTarget, setPostTarget] = useState("all");
  const [postSending, setPostSending] = useState(false);
  const [postResult, setPostResult] = useState<{ ok: boolean; msg: string } | null>(null);

  // Deal Management state
  const [deals, setDeals] = useState<Deal[]>([]);
  const [closingDealId, setClosingDealId] = useState<number | null>(null);
  const [fundingDealId, setFundingDealId] = useState<number | null>(null);
  const [dealResult, setDealResult] = useState<{ ok: boolean; msg: string } | null>(null);

  useEffect(() => {
    getAdminStats()
      .then((s) => { setStats(s); setIsLive(true); })
      .catch(() => setIsLive(false));

    if (user) {
      getTransactions(user.user_id)
        .then(setActivity)
        .catch(() => setActivity([]));
    }

    // Load deals for admin deal management
    if (user?.role === "admin") {
      getDeals().then(setDeals).catch(() => setDeals([]));
    }
  }, [user]);

  const handlePublishPost = async () => {
    if (!postTitle.trim() || !postContent.trim()) return;
    setPostSending(true);
    setPostResult(null);
    try {
      await publishPlatformPost(postTitle, postContent, user?.name, postTarget);
      setPostResult({ ok: true, msg: "Post published & sent to n8n workflow!" });
      setPostTitle("");
      setPostContent("");
    } catch {
      setPostResult({ ok: false, msg: "Failed to publish post." });
    } finally {
      setPostSending(false);
      setTimeout(() => setPostResult(null), 5000);
    }
  };

  const statCards = stats
    ? [
        { label: "Total Farms", value: stats.total_farms, icon: <Sprout />, color: "#10b981", change: "", positive: true },
        { label: "Total Investors", value: stats.total_users.toLocaleString(), icon: <Users />, color: "#06b6d4", change: "", positive: true },
        { label: "Funds Deployed", value: `EGP ${(stats.total_invested_egp / 1000).toFixed(1)}k`, icon: <DollarSign />, color: "#8b5cf6", change: "", positive: true },
        { label: "Total Deals", value: stats.total_deals, icon: <TrendingUp />, color: "#f59e0b", change: "", positive: true },
        { label: "Open Alerts", value: stats.open_alerts, icon: <BarChart3 />, color: "#f43f5e", change: "", positive: stats.open_alerts === 0 },
        { label: "Pending Farms", value: stats.pending_farms, icon: <Award />, color: "#22c55e", change: "", positive: true },
      ]
    : [
        { label: "Total Farms", value: dashboardStats.totalFarms, icon: <Sprout />, color: "#10b981", change: "+12", positive: true },
        { label: "Active Investors", value: dashboardStats.totalInvestors.toLocaleString(), icon: <Users />, color: "#06b6d4", change: "+28.5%", positive: true },
        { label: "Funds Deployed", value: `$${(dashboardStats.totalFundsDeployed / 1e6).toFixed(1)}M`, icon: <DollarSign />, color: "#8b5cf6", change: "+$2.1M", positive: true },
        { label: "Average ROI", value: `${dashboardStats.avgRoi}%`, icon: <TrendingUp />, color: "#f59e0b", change: "+1.8%", positive: true },
        { label: "Active Pools", value: dashboardStats.activePools, icon: <BarChart3 />, color: "#f43f5e", change: "+3", positive: true },
        { label: "Successful Harvests", value: dashboardStats.successfulHarvests, icon: <Award />, color: "#22c55e", change: "+45", positive: true },
      ];

  return (
    <div className="animate-fade-in font-sans">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <h2 className="text-3xl font-bold text-textMain tracking-tight">Dashboard</h2>
          <span className={`flex items-center gap-1.5 text-xs px-3 py-1 rounded-full font-semibold ${isLive ? 'bg-success/15 text-success border border-success/30' : 'bg-surfaceHighlight text-textMuted border border-white/10'}`}>
            {isLive ? <Wifi size={12} /> : <WifiOff size={12} />}
            {isLive ? "Live" : "Mock data"}
          </span>
        </div>
        <p className="text-textSecondary">Welcome back{user ? `, ${user.name}` : ""} — here's how the platform is performing</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {statCards.map((s, i) => (
          <div key={i} className="bg-surface/40 backdrop-blur-md border border-white/5 rounded-2xl p-6 relative overflow-hidden group hover:border-white/20 transition-colors">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="absolute top-0 left-0 right-0 h-1" style={{ background: `linear-gradient(90deg, ${s.color}, transparent)` }} />
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl" style={{ background: `${s.color}15`, color: s.color }}>
                {s.icon}
              </div>
              {s.change && (
                <div className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${s.positive ? "bg-success/15 text-success" : "bg-danger/15 text-danger"}`}>
                  {s.positive ? "↑" : "↓"} {s.change}
                </div>
              )}
            </div>
            <div className="relative z-10">
              <div className="text-3xl font-bold tracking-tight text-textMain mb-1">{s.value}</div>
              <div className="text-sm font-medium text-textMuted uppercase tracking-wider">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Performance chart */}
        <div className="bg-surface/40 backdrop-blur-md border border-white/5 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-textMain mb-6 flex items-center gap-2">
            <BarChart3 className="text-primary" size={20} />
            Portfolio Performance
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={performanceData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00FF66" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#00FF66" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `EGP ${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ background: "#041B11", border: "1px solid #124d32", borderRadius: 12, fontSize: 13 }}
                  labelStyle={{ color: "#94a3b8" }}
                  formatter={(value: number) => [`EGP ${value.toLocaleString()}`, "Value"]}
                />
                <Area type="monotone" dataKey="value" stroke="#00FF66" strokeWidth={3} fill="url(#colorValue)" />
                <Area type="monotone" dataKey="invested" stroke="#64748b" strokeWidth={1} strokeDasharray="4 4" fill="none" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent activity */}
        <div className="bg-surface/40 backdrop-blur-md border border-white/5 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-textMain mb-6 flex items-center gap-2">
            <TrendingUp className="text-accent-blue" size={20} />
            Recent Activity
          </h3>
          <div className="flex flex-col gap-4">
          {activity.length > 0 ? (
            activity.slice(0, 6).map((tx) => (
              <div key={tx.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors">
                <div className="w-10 h-10 rounded-full bg-surfaceHighlight flex items-center justify-center font-bold text-primary border border-white/10 uppercase">
                  {tx.type[0]}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-textMain font-medium">
                    <span className="capitalize">{tx.type}</span>
                    {tx.deal_id ? <span className="text-textMuted"> — Deal #{tx.deal_id}</span> : ""}{tx.note ? ` — ${tx.note}` : ""}
                  </p>
                  <div className="text-xs text-textMuted mt-1">{new Date(tx.created_at).toLocaleDateString()}</div>
                </div>
                <div className={`font-bold text-sm ${tx.type === "deposit" || tx.type === "return" ? "text-success" : "text-danger"}`}>
                  {tx.type === "deposit" || tx.type === "return" ? "+" : "-"}EGP {tx.amount_egp.toLocaleString()}
                </div>
              </div>
            ))
          ) : (
            <p className="text-textMuted text-sm">No recent activity.</p>
          )}
          </div>
        </div>
      </div>

      {/* ─── Platform Post — n8n workflow trigger ─── */}
      {user?.role === "admin" && (
        <div className="bg-surface/40 backdrop-blur-md border border-white/5 rounded-2xl p-6 mt-8">
          <div className="text-lg font-bold text-textMain flex items-center gap-2 mb-2">
            <Send size={20} className="text-accent-purple" />
            Platform Post
            <span className="text-xs font-normal text-textMuted bg-white/5 px-2 py-0.5 rounded-full ml-2">→ n8n workflow</span>
          </div>
          <p className="text-sm text-textSecondary mb-6">
            Publish an announcement to all users via the n8n automation workflow.
          </p>

          <div className="flex flex-col gap-4">
            <input
              id="platform-post-title"
              type="text"
              placeholder="Post title..."
              value={postTitle}
              onChange={(e) => setPostTitle(e.target.value)}
              className="w-full bg-surfaceHighlight/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-textMain focus:outline-none focus:border-primary transition-colors placeholder:text-textMuted"
            />
            <textarea
              id="platform-post-content"
              placeholder="Write your announcement..."
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              rows={4}
              className="w-full bg-surfaceHighlight/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-textMain focus:outline-none focus:border-primary transition-colors placeholder:text-textMuted resize-y"
            />
            <div className="flex flex-wrap items-center gap-4">
              <select
                id="platform-post-target"
                value={postTarget}
                onChange={(e) => setPostTarget(e.target.value)}
                className="bg-surfaceHighlight/50 border border-white/10 rounded-xl px-4 py-2 text-sm text-textMain focus:outline-none focus:border-primary transition-colors"
              >
                <option value="all">All Users</option>
                <option value="investors">Investors Only</option>
                <option value="farmers">Farmers Only</option>
              </select>

              <button
                id="platform-post-submit"
                onClick={handlePublishPost}
                disabled={postSending || !postTitle.trim() || !postContent.trim()}
                className={`flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-bold transition-all ${
                  postSending || !postTitle.trim() || !postContent.trim()
                    ? "bg-white/5 text-textMuted cursor-not-allowed"
                    : "bg-primary text-background hover:bg-primaryHover hover:shadow-[0_0_15px_rgba(0,255,102,0.4)]"
                }`}
              >
                <Send size={16} />
                {postSending ? "Publishing..." : "Publish Post"}
              </button>

              {postResult && (
                <span className={`flex items-center gap-1.5 text-sm font-medium ${postResult.ok ? "text-success" : "text-danger"}`}>
                  {postResult.ok ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                  {postResult.msg}
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── Deal Management — close deals to trigger n8n ─── */}
      {user?.role === "admin" && deals.length > 0 && (
        <div className="bg-surface/40 backdrop-blur-md border border-white/5 rounded-2xl p-6 mt-8">
          <div className="text-lg font-bold text-textMain flex items-center gap-2 mb-2">
            <XCircle size={20} className="text-accent-amber" />
            Deal Management
            <span className="text-xs font-normal text-textMuted bg-white/5 px-2 py-0.5 rounded-full ml-2">→ n8n deal-closed workflow</span>
          </div>
          <p className="text-sm text-textSecondary mb-6">
            Close a deal or simulate full funding to trigger n8n workflows.
          </p>

          {dealResult && (
            <div className={`flex items-center gap-2 text-sm font-medium p-3 rounded-xl mb-4 ${dealResult.ok ? "bg-success/10 text-success" : "bg-danger/10 text-danger"}`}>
              {dealResult.ok ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
              {dealResult.msg}
            </div>
          )}

          <div className="flex flex-col gap-3">
            {deals.map((deal) => (
              <div
                key={deal.id}
                className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-surfaceHighlight/30 border border-white/5 rounded-xl hover:bg-surfaceHighlight/50 transition-colors gap-4"
              >
                <div className="flex-1">
                  <div className="text-textMain font-bold text-sm">
                    Deal #{deal.id} — {deal.model_type}
                  </div>
                  <div className="text-textMuted text-xs mt-1">
                    Goal: EGP {deal.goal_egp.toLocaleString()} · Funded: EGP {deal.funded_egp.toLocaleString()} · {deal.expected_return_pct}% ROI · {deal.duration_months}mo
                  </div>
                </div>
                <div className="flex items-center flex-wrap gap-3">
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${deal.status === "active" ? "bg-success/15 text-success" : "bg-accent-amber/15 text-accent-amber"}`}>
                    {deal.status}
                  </span>
                  <button
                    id={`fund-deal-${deal.id}`}
                    onClick={async () => {
                      setFundingDealId(deal.id);
                      setDealResult(null);
                      try {
                        await simulateDealFunded(deal.id);
                        setDealResult({ ok: true, msg: `Deal #${deal.id} fully funded → n8n webhook fired!` });
                        setDeals((prev) => prev.map((d) => d.id === deal.id ? { ...d, funded_egp: d.goal_egp } : d));
                      } catch {
                        setDealResult({ ok: false, msg: `Failed to fund Deal #${deal.id}.` });
                      } finally {
                        setFundingDealId(null);
                        setTimeout(() => setDealResult(null), 5000);
                      }
                    }}
                    disabled={fundingDealId === deal.id || deal.funded_egp >= deal.goal_egp}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                      deal.funded_egp >= deal.goal_egp 
                        ? "bg-success/5 text-textMuted border border-white/5 cursor-not-allowed" 
                        : "bg-success/15 text-success border border-success/30 hover:bg-success/25"
                    } ${fundingDealId === deal.id ? "opacity-50" : ""}`}
                  >
                    <CheckCircle size={14} />
                    {deal.funded_egp >= deal.goal_egp ? "Funded ✓" : fundingDealId === deal.id ? "Funding..." : "Fund Deal"}
                  </button>
                  <button
                    id={`close-deal-${deal.id}`}
                    onClick={async () => {
                      setClosingDealId(deal.id);
                      setDealResult(null);
                      try {
                        await updateDealStatus(deal.id, "closed");
                        setDealResult({ ok: true, msg: `Deal #${deal.id} closed → n8n webhook fired!` });
                        setDeals((prev) => prev.filter((d) => d.id !== deal.id));
                      } catch {
                        setDealResult({ ok: false, msg: `Failed to close Deal #${deal.id}.` });
                      } finally {
                        setClosingDealId(null);
                        setTimeout(() => setDealResult(null), 5000);
                      }
                    }}
                    disabled={closingDealId === deal.id}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors bg-danger/10 text-danger border border-danger/20 hover:bg-danger/20 ${
                      closingDealId === deal.id ? "opacity-50 cursor-wait" : ""
                    }`}
                  >
                    <XCircle size={14} />
                    {closingDealId === deal.id ? "Closing..." : "Close Deal"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
