import { CloudSun, Droplets, Wind, AlertTriangle } from "lucide-react";
import { weatherInsights } from "../data";

export default function Weather() {
  return (
    <div className="animate-fade-in font-sans">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-textMain tracking-tight mb-2">Weather Insights</h2>
        <p className="text-textSecondary">Real-time weather monitoring for your portfolio farms</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {weatherInsights.map((w) => (
          <div key={w.farmId} className="bg-surface/40 backdrop-blur-md border border-white/5 rounded-2xl p-6 shadow-xl hover:border-white/20 transition-all">
            <h4 className="text-lg font-bold text-textMain mb-6">{w.farmName}</h4>
            
            <div className="flex items-center gap-6 mb-8">
              <CloudSun size={48} className="text-accent-amber drop-shadow-[0_0_15px_rgba(245,158,11,0.4)]" />
              <div>
                <div className="text-4xl font-bold text-textMain tracking-tighter">{w.temperature}°C</div>
                <div className="text-sm font-medium text-textSecondary uppercase tracking-widest">{w.condition}</div>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4 mb-6 p-4 rounded-xl bg-surfaceHighlight/30 border border-white/5">
              <div className="flex flex-col gap-1 text-center">
                <label className="text-[10px] font-bold text-textMuted uppercase tracking-widest flex items-center justify-center gap-1"><Droplets size={12} className="text-accent-cyan" /> Humidity</label>
                <span className="text-sm font-bold text-textMain">{w.humidity}%</span>
              </div>
              <div className="flex flex-col gap-1 text-center border-l border-white/10">
                <label className="text-[10px] font-bold text-textMuted uppercase tracking-widest flex items-center justify-center gap-1"><Wind size={12} className="text-accent-blue" /> Rainfall</label>
                <span className="text-sm font-bold text-textMain">{w.rainfall}mm</span>
              </div>
              <div className="flex flex-col gap-1 text-center border-l border-white/10">
                <label className="text-[10px] font-bold text-textMuted uppercase tracking-widest">Forecast</label>
                <span className="text-sm font-bold text-textMain">{w.forecast[0]?.condition}</span>
              </div>
            </div>
            
            {w.alert && (
              <div className="flex items-center gap-2 mb-6 p-3 rounded-lg bg-danger/10 border border-danger/20 text-danger text-sm font-bold">
                <AlertTriangle size={16} />
                {w.alert}
              </div>
            )}
            
            <div className="flex gap-2">
              {w.forecast.map((d) => (
                <div key={d.day} className="flex-1 text-center p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5">
                  <div className="text-xs font-bold text-textMuted uppercase tracking-wider mb-1">{d.day}</div>
                  <div className="text-sm font-bold text-textMain">{d.high}° <span className="text-textMuted text-xs">/ {d.low}°</span></div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
