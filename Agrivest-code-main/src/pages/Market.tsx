import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, Wifi, WifiOff } from "lucide-react";
import { getMarketPrices } from "../api/admin";
import type { MarketPrice } from "../api/admin";
import { marketInsights } from "../data";
import { useLang } from "../context/LangContext";

export default function Market() {
  const { t } = useLang();
  const m = marketInsights;
  const [prices, setPrices] = useState<MarketPrice[]>([]);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    getMarketPrices()
      .then((data) => { setPrices(data); setIsLive(true); })
      .catch(() => setIsLive(false));
  }, []);

  // Fallback to mock commodity prices if API unavailable
  const displayPrices = isLive
    ? prices
    : m.commodityPrices.map((c) => ({
        crop: c.name,
        price_egp_per_ton: Math.round(c.price * 30000),
        change_pct: c.changePercent,
      }));

  const topGainers = [...displayPrices].sort((a, b) => b.change_pct - a.change_pct).slice(0, 3);
  const overallSentiment = displayPrices.filter((p) => p.change_pct > 0).length > displayPrices.length / 2
    ? "Bullish" : "Mixed";

  return (
    <div className="animate-fade-in font-sans">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <h2 className="text-3xl font-bold text-textMain tracking-tight">{t("market.title")}</h2>
          <span className={`flex items-center gap-1.5 text-xs px-3 py-1 rounded-full font-semibold ${isLive ? 'bg-success/15 text-success border border-success/30' : 'bg-surfaceHighlight text-textMuted border border-white/10'}`}>
            {isLive ? <Wifi size={12} /> : <WifiOff size={12} />}
            {isLive ? "Live" : "Mock data"}
          </span>
        </div>
        <p className="text-textSecondary">Egyptian agricultural commodity prices and market trends</p>
      </div>

      {/* Sentiment banner */}
      <div className="mb-8 bg-gradient-to-br from-[#8b5cf6]/10 to-[#06b6d4]/10 border border-[#8b5cf6]/20 rounded-2xl p-6 backdrop-blur-md shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-4">
          <div>
            <div className="text-xs font-bold text-textMuted uppercase tracking-[0.1em] mb-1">Market Sentiment</div>
            <div className={`text-3xl font-bold tracking-tight ${overallSentiment === "Bullish" ? "text-success" : "text-accent-amber"}`}>
              {overallSentiment}
            </div>
          </div>
          <div className="sm:text-right">
            <div className="text-xs font-bold text-textMuted uppercase tracking-[0.1em] mb-2">Top Gainers</div>
            <div className="flex flex-wrap gap-2 sm:justify-end">
              {topGainers.map((c) => (
                <span key={c.crop} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-success/15 text-success border border-success/30 shadow-[0_0_10px_rgba(0,255,102,0.15)]">
                  {c.crop} +{c.change_pct}%
                </span>
              ))}
            </div>
          </div>
        </div>
        <p className="text-sm text-textSecondary leading-relaxed border-t border-white/5 pt-4">
          {m.weeklyReport}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Live prices table */}
        <div className="bg-surface/40 backdrop-blur-md border border-white/5 rounded-2xl p-6 overflow-hidden shadow-xl">
          <h3 className="text-lg font-bold text-textMain mb-6">Commodity Prices (EGP / ton)</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="pb-3 text-xs font-bold text-textMuted uppercase tracking-wider">Commodity</th>
                  <th className="pb-3 text-xs font-bold text-textMuted uppercase tracking-wider">Price (EGP/ton)</th>
                  <th className="pb-3 text-xs font-bold text-textMuted uppercase tracking-wider">Change</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {displayPrices.map((c) => (
                  <tr key={c.crop} className="hover:bg-white/5 transition-colors">
                    <td className="py-4 text-sm font-bold text-textMain">{c.crop}</td>
                    <td className="py-4 text-sm font-medium text-textMain">
                      {c.price_egp_per_ton.toLocaleString()}
                    </td>
                    <td className="py-4">
                      <span
                        className={`inline-flex items-center gap-1 text-sm font-bold ${
                          c.change_pct >= 0 ? "text-success" : "text-danger"
                        }`}
                      >
                        {c.change_pct >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                        {c.change_pct >= 0 ? "+" : ""}{c.change_pct}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Market trends */}
        <div className="bg-surface/40 backdrop-blur-md border border-white/5 rounded-2xl p-6 shadow-xl h-fit">
          <h3 className="text-lg font-bold text-textMain mb-6">Market Trends</h3>
          <div className="flex flex-col gap-6">
            {m.trends.map((t, i) => (
              <div key={i} className={`pb-6 ${i < m.trends.length - 1 ? "border-b border-white/5" : ""}`}>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-base font-bold text-textMain">{t.title}</h4>
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                    t.impact === "Positive" ? "bg-success/15 text-success" : "bg-danger/15 text-danger"
                  }`}>
                    {t.impact}
                  </span>
                </div>
                <p className="text-sm text-textSecondary leading-relaxed">{t.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
