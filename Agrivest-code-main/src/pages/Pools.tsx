import { mutualPools } from "../data";

function riskBadge(level: string) {
  const isLow = level === "Low";
  const isMed = level === "Medium";
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
      isLow ? "bg-success/15 text-success border border-success/30" :
      isMed ? "bg-accent-amber/15 text-accent-amber border border-accent-amber/30" :
      "bg-danger/15 text-danger border border-danger/30"
    }`}>
      {level} Risk
    </span>
  );
}

export default function Pools() {
  return (
    <div className="animate-fade-in font-sans">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-textMain tracking-tight mb-2">Mutual Pools</h2>
        <p className="text-textSecondary">Join diversified investment pools managed by experts</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mutualPools.map((pool) => (
          <div key={pool.id} className="bg-surface/40 backdrop-blur-md border border-white/5 rounded-2xl p-6 shadow-xl hover:border-primary/30 transition-all group">
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-xl font-bold text-textMain group-hover:text-primary transition-colors">{pool.name}</h3>
              {riskBadge(pool.riskLevel)}
            </div>
            <p className="text-sm text-textSecondary leading-relaxed mb-6 min-h-[40px]">{pool.description}</p>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-xs font-bold text-textMuted uppercase tracking-wider mb-1">Total Value</label>
                <span className="text-lg font-bold text-textMain">${(pool.totalValue / 1e6).toFixed(1)}M</span>
              </div>
              <div>
                <label className="block text-xs font-bold text-textMuted uppercase tracking-wider mb-1">Expected ROI</label>
                <span className="text-lg font-bold text-success">{pool.expectedRoi}%</span>
              </div>
              <div>
                <label className="block text-xs font-bold text-textMuted uppercase tracking-wider mb-1">Investors</label>
                <span className="text-sm font-bold text-textMain">{pool.investorCount}</span>
              </div>
              <div>
                <label className="block text-xs font-bold text-textMuted uppercase tracking-wider mb-1">Farms</label>
                <span className="text-sm font-bold text-textMain">{pool.farms}</span>
              </div>
              <div>
                <label className="block text-xs font-bold text-textMuted uppercase tracking-wider mb-1">Diversification</label>
                <span className="text-sm font-bold text-textMain">{pool.diversificationScore}/100</span>
              </div>
              <div>
                <label className="block text-xs font-bold text-textMuted uppercase tracking-wider mb-1">Min. Entry</label>
                <span className="text-sm font-bold text-textMain">${pool.minContribution}</span>
              </div>
            </div>
            
            <button className="w-full flex items-center justify-center gap-2 bg-surfaceHighlight hover:bg-primary hover:text-background border border-white/10 text-textMain px-4 py-3 rounded-xl font-bold transition-all shadow-[0_0_10px_rgba(0,0,0,0.1)] hover:shadow-[0_0_15px_rgba(0,255,102,0.3)]">
              Contribute to Pool
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
