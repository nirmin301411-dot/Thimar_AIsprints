import { MapPin, Users, Activity, CheckCircle2, AlertCircle, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export type FarmData = {
  id: number | string;
  name: string;
  location?: string;
  governorate?: string;
  cropType?: string;
  crop_type?: string;
  category?: string;
  tags?: string[];
  imageUrl?: string;
  photo_urls?: string[] | null;
  fundingPercent?: number;
  funded_egp?: number;
  goal_egp?: number;
  currentFunding?: number;
  fundingGoal?: number;
  predictedRoi?: number;
  expected_return_pct?: number;
  riskScore?: number;
  investorCount?: number;
  sustainability_score?: number;
};

interface FarmCardProps {
  farm: FarmData;
}

export default function FarmCard({ farm }: FarmCardProps) {
  const getName = (f: FarmData) => f.name;
  const getCrop = (f: FarmData) => f.crop_type ?? f.cropType ?? "";
  const getLocation = (f: FarmData) => f.governorate ?? f.location ?? "";
  const getImage = (f: FarmData) => f.photo_urls?.[0] ?? f.imageUrl ?? "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=600&q=80";
  const getFundedPct = (f: FarmData) => {
    if (f.fundingPercent !== undefined) return f.fundingPercent;
    if (f.funded_egp !== undefined && f.goal_egp) return Math.round((f.funded_egp / f.goal_egp) * 100);
    return 0;
  };
  const getFunded = (f: FarmData) => f.currentFunding ?? f.funded_egp ?? 0;
  const getGoal = (f: FarmData) => f.fundingGoal ?? f.goal_egp ?? 0;
  const getRoi = (f: FarmData) => f.predictedRoi ?? f.expected_return_pct ?? 0;
  const getRisk = (f: FarmData) => f.riskScore ?? (f.sustainability_score ? Math.round((100 - f.sustainability_score) / 20) : 3);
  const getInvestors = (f: FarmData) => f.investorCount ?? Math.floor(Math.random() * 50) + 10; // mock if undefined

  const isAIRecommended = getRisk(farm) <= 2 && getRoi(farm) > 10;
  const isFeatured = getFundedPct(farm) > 80;

  return (
    <motion.div 
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="group relative bg-surface/40 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden shadow-lg hover:shadow-[0_0_30px_rgba(0,255,102,0.15)] hover:border-primary/50 transition-colors duration-300 cursor-pointer"
    >
      {/* Image Section */}
      <div className="relative h-48 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent z-10" />
        <motion.img 
          src={getImage(farm)} 
          alt={getName(farm)} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        
        {/* Badges Overlay */}
        <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
          {isAIRecommended && (
            <div className="flex items-center gap-1 bg-primary/20 backdrop-blur-md text-primary px-3 py-1 rounded-full text-xs font-bold border border-primary/30 shadow-[0_0_10px_rgba(0,255,102,0.4)]">
              <Sparkles size={12} /> AI Recommended
            </div>
          )}
          {isFeatured && (
            <div className="flex items-center gap-1 bg-accent-blue/20 backdrop-blur-md text-accent-blue px-3 py-1 rounded-full text-xs font-bold border border-accent-blue/30">
              <Activity size={12} /> Featured
            </div>
          )}
        </div>

        {/* Tags */}
        <div className="absolute bottom-4 left-4 z-20 flex flex-wrap gap-2">
          <span className="bg-background/80 backdrop-blur-md text-textMain px-3 py-1 rounded-md text-xs font-semibold border border-white/10">
            {getCrop(farm)}
          </span>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-bold text-textMain leading-tight">{getName(farm)}</h3>
          <div className="text-right">
            <div className="text-primary font-bold text-lg">{getRoi(farm)}%</div>
            <div className="text-xs text-textMuted uppercase tracking-wider">Est. ROI</div>
          </div>
        </div>

        <div className="flex items-center gap-1 text-sm text-textMuted mb-5">
          <MapPin size={14} /> {getLocation(farm)}
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-xs font-medium mb-1.5">
            <span className="text-textSecondary">Funded</span>
            <span className="text-primary">{getFundedPct(farm)}%</span>
          </div>
          <div className="w-full h-2 bg-background rounded-full overflow-hidden border border-white/5">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${getFundedPct(farm)}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-primary to-accent-blue rounded-full relative"
            >
              <div className="absolute inset-0 bg-white/20 w-full animate-pulse-glow" />
            </motion.div>
          </div>
          <div className="flex justify-between text-xs mt-1.5">
            <span className="text-textMain font-semibold">${getFunded(farm).toLocaleString()}</span>
            <span className="text-textMuted">Goal: ${getGoal(farm).toLocaleString()}</span>
          </div>
        </div>

        {/* Footer Stats */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-md ${getRisk(farm) <= 2 ? 'bg-success/10 text-success' : getRisk(farm) === 3 ? 'bg-accent-amber/10 text-accent-amber' : 'bg-danger/10 text-danger'}`}>
              {getRisk(farm) <= 2 ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            </div>
            <div>
              <div className="text-xs text-textMuted">Risk Score</div>
              <div className="text-sm font-semibold text-textMain">{getRisk(farm)}/5</div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-white/5 text-textSecondary">
              <Users size={16} />
            </div>
            <div>
              <div className="text-xs text-textMuted">Investors</div>
              <div className="text-sm font-semibold text-textMain">{getInvestors(farm)}</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-5 flex gap-3">
          <button className="flex-1 bg-white/5 hover:bg-white/10 text-textMain py-2.5 rounded-lg text-sm font-bold transition-colors border border-white/10">
            Details
          </button>
          <button className="flex-1 bg-primary text-background py-2.5 rounded-lg text-sm font-bold hover:bg-primaryHover hover:shadow-[0_0_15px_rgba(0,255,102,0.4)] transition-all">
            Invest Now
          </button>
        </div>
      </div>
    </motion.div>
  );
}
