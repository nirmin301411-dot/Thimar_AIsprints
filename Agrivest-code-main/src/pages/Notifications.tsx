import React, { useState, useEffect } from "react";
import { CheckCircle, AlertTriangle, XCircle, Wifi, WifiOff } from "lucide-react";
import { getAlerts, resolveAlert, overrideAlert } from "../api/admin";
import type { Alert } from "../api/admin";
import { notifications as mockNotifications } from "../data";
import { useLang } from "../context/LangContext";

type Severity = "high" | "medium" | "low";

const severityConfig: Record<Severity, { color: string; icon: React.ReactElement; label: string }> = {
  high:   { color: "#f43f5e", icon: <XCircle size={16} />,       label: "High Risk" },
  medium: { color: "#f59e0b", icon: <AlertTriangle size={16} />, label: "Medium" },
  low:    { color: "#10b981", icon: <CheckCircle size={16} />,   label: "Low" },
};

export default function Notifications() {
  const { t } = useLang();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLive, setIsLive] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  useEffect(() => {
    getAlerts()
      .then((data) => { setAlerts(data); setIsLive(true); })
      .catch(() => {
        // Build Alert-shaped objects from mock notifications as fallback
        setAlerts(
          mockNotifications.map((n, i) => ({
            id: i + 1,
            deal_id: 1,
            flag_reason: n.title,
            severity: "medium",
            status: n.read ? "resolved" : "open",
            ai_reasoning: n.message,
            created_at: n.createdAt,
            resolved_at: null,
          }))
        );
        setIsLive(false);
      });
  }, []);

  const handleResolve = async (alertId: number) => {
    setActionLoading(alertId);
    try {
      const updated = await resolveAlert(alertId);
      setAlerts((prev) => prev.map((a) => (a.id === alertId ? updated : a)));
    } catch {
      // optimistic update even if backend fails in mock mode
      setAlerts((prev) => prev.map((a) => (a.id === alertId ? { ...a, status: "resolved" } : a)));
    } finally {
      setActionLoading(null);
    }
  };

  const handleOverride = async (alertId: number) => {
    setActionLoading(alertId);
    try {
      const updated = await overrideAlert(alertId);
      setAlerts((prev) => prev.map((a) => (a.id === alertId ? updated : a)));
    } catch {
      setAlerts((prev) => prev.map((a) => (a.id === alertId ? { ...a, status: "overridden" } : a)));
    } finally {
      setActionLoading(null);
    }
  };

  const open = alerts.filter((a) => a.status === "open");
  const closed = alerts.filter((a) => a.status !== "open");

  return (
    <div className="animate-fade-in font-sans">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <h2 className="text-3xl font-bold text-textMain tracking-tight">Notifications</h2>
          <span className={`flex items-center gap-1.5 text-xs px-3 py-1 rounded-full font-semibold ${isLive ? 'bg-success/15 text-success border border-success/30' : 'bg-surfaceHighlight text-textMuted border border-white/10'}`}>
            {isLive ? <Wifi size={12} /> : <WifiOff size={12} />}
            {isLive ? "Live" : "Mock data"}
          </span>
          {open.length > 0 && (
            <span className="flex items-center gap-1.5 text-xs px-3 py-1 rounded-full font-bold bg-danger text-white shadow-[0_0_10px_rgba(239,68,68,0.4)]">
              {open.length} open
            </span>
          )}
        </div>
        <p className="text-textSecondary">AI-generated risk alerts and platform activity</p>
      </div>

      {/* Open alerts */}
      {open.length > 0 && (
        <div className="mb-8">
          <div className="text-xs font-bold text-textMuted uppercase tracking-widest mb-4">
            Open Alerts
          </div>
          <div className="flex flex-col gap-4">
            {open.map((alert) => {
              const sev = severityConfig[alert.severity as Severity] ?? severityConfig.low;
              return (
                <div key={alert.id} className="bg-surface/40 backdrop-blur-md border border-white/5 rounded-2xl p-5 border-l-4 shadow-lg hover:bg-surface/60 transition-colors" style={{ borderLeftColor: sev.color }}>
                  <div className="flex items-start gap-4">
                    <span className="mt-1 shrink-0" style={{ color: sev.color }}>{sev.icon}</span>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-3 mb-2">
                        <span className="font-bold text-textMain">{alert.flag_reason}</span>
                        <span className="text-xs px-2.5 py-1 rounded-full font-bold tracking-wide" style={{ background: `${sev.color}15`, color: sev.color }}>
                          {sev.label}
                        </span>
                        <span className="text-xs font-medium text-textMuted ml-auto">Deal #{alert.deal_id}</span>
                      </div>
                      {alert.ai_reasoning && (
                        <p className="text-sm text-textSecondary leading-relaxed mb-3">{alert.ai_reasoning}</p>
                      )}
                      <div className="text-xs text-textMuted mb-4">
                        {new Date(alert.created_at).toLocaleString()}
                      </div>
                      <div className="flex gap-3">
                        <button
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold bg-primary hover:bg-primary/90 text-background shadow-[0_0_10px_rgba(0,255,102,0.2)] transition-all disabled:opacity-50"
                          disabled={actionLoading === alert.id}
                          onClick={() => handleResolve(alert.id)}
                        >
                          {actionLoading === alert.id ? "..." : "✓ Resolve"}
                        </button>
                        <button
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold bg-surfaceHighlight border border-white/10 hover:border-white/30 text-textMain transition-all disabled:opacity-50"
                          disabled={actionLoading === alert.id}
                          onClick={() => handleOverride(alert.id)}
                        >
                          Override
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Resolved/overridden */}
      {closed.length > 0 && (
        <div className="mb-8">
          <div className="text-xs font-bold text-textMuted uppercase tracking-widest mb-4">
            Resolved
          </div>
          <div className="bg-surface/40 backdrop-blur-md border border-white/5 rounded-2xl overflow-hidden shadow-xl">
            {closed.map((alert) => (
              <div key={alert.id} className="flex flex-col sm:flex-row sm:items-start gap-4 p-5 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors opacity-70 hover:opacity-100">
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-textMain mb-1">{alert.flag_reason}</h4>
                  <p className="text-sm text-textSecondary mb-2">{alert.ai_reasoning}</p>
                  <p className="text-xs text-textMuted font-medium">
                    Deal #{alert.deal_id} · <span className="uppercase">{alert.status}</span> · {alert.resolved_at ? new Date(alert.resolved_at).toLocaleDateString() : ""}
                  </p>
                </div>
                <div className="text-xs text-textMuted font-medium sm:text-right shrink-0">
                  {new Date(alert.created_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {alerts.length === 0 && (
        <div className="bg-surface/40 backdrop-blur-md border border-white/5 rounded-2xl p-12 text-center shadow-xl flex flex-col items-center justify-center min-h-[300px]">
          <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mb-4">
            <CheckCircle size={32} className="text-success" />
          </div>
          <p className="text-xl font-bold text-textMain mb-2">All clear</p>
          <p className="text-textSecondary">No open alerts at this time</p>
        </div>
      )}
    </div>
  );
}
