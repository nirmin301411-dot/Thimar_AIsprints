import { useState, useEffect } from "react";
import { Search, Wifi, WifiOff } from "lucide-react";
import { getFarms } from "../api/farms";
import { getDeals } from "../api/deals";
import type { Deal } from "../api/deals";
import { farms as mockFarms } from "../data";
import FarmCard from "../components/FarmCard";
import type { FarmData } from "../components/FarmCard";
import { useLang } from "../context/LangContext";

const categories = ["All", "Organic Fruits", "Beverages", "Tropical Fruits", "Urban Farming", "Grains"];

export default function Farms() {
  const { t } = useLang();
  const [farms, setFarms] = useState<FarmData[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    // Fetch both farms and deals so we can merge real funding data
    Promise.all([getFarms(), getDeals()])
      .then(([farmData, dealData]) => {
        // Build a map from farm_id → deal for quick lookup
        const dealByFarm: Record<number, Deal> = {};
        dealData.forEach((d) => {
          // Use the latest open deal per farm
          if (!dealByFarm[d.farm_id] || d.status === "open") {
            dealByFarm[d.farm_id] = d;
          }
        });

        // Merge funding data from deals into farm objects
        const merged: FarmData[] = farmData.map((f) => {
          const deal = dealByFarm[(f as { id: number }).id];
          return {
            ...(f as unknown as FarmData),
            funded_egp: deal?.funded_egp,
            goal_egp: deal?.goal_egp,
            expected_return_pct: deal?.expected_return_pct,
            fundingPercent: deal
              ? Math.round((deal.funded_egp / deal.goal_egp) * 100)
              : undefined,
          };
        });

        setFarms(merged);
        setIsLive(true);
      })
      .catch(() => {
        setFarms(mockFarms as unknown as FarmData[]);
        setIsLive(false);
      });
  }, []);

  const getName = (f: FarmData) => f.name;
  const getCrop = (f: FarmData) => f.crop_type ?? f.cropType ?? "";

  const filtered = farms.filter((f) => {
    const matchSearch =
      getName(f).toLowerCase().includes(search.toLowerCase()) ||
      getCrop(f).toLowerCase().includes(search.toLowerCase());
    const matchCat = category === t("farms.all") || category === "All" || f.category === category;
    return matchSearch && matchCat;
  });

  return (
    <div className="animate-fade-in font-sans">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <h2 className="text-3xl font-bold text-textMain tracking-tight">{t("farms.title")}</h2>
          <span className={`flex items-center gap-1.5 text-xs px-3 py-1 rounded-full font-semibold ${isLive ? 'bg-success/15 text-success border border-success/30' : 'bg-surfaceHighlight text-textMuted border border-white/10'}`}>
            {isLive ? <Wifi size={12} /> : <WifiOff size={12} />}
            {isLive ? t("farms.live") : t("farms.mock")}
          </span>
        </div>
        <p className="text-textSecondary">{t("farms.subtitle")}</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-10 items-start md:items-center">
        <div className="relative flex-1 max-w-md">
          <Search size={18} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-textMuted" />
          <input
            id="farm-search"
            type="text"
            placeholder={t("farms.search")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-surface/50 border border-white/10 rounded-xl text-textMain focus:outline-none focus:border-primary transition-all shadow-inner placeholder:text-textMuted"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <button
              key={c}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                category === c
                  ? "bg-primary text-background shadow-[0_0_15px_rgba(0,255,102,0.3)]"
                  : "bg-surface border border-white/10 text-textSecondary hover:border-primary hover:text-primary"
              }`}
              onClick={() => setCategory(c)}
            >
              {c === "All" ? t("farms.all") : c}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20 text-textMuted">{t("common.no_data")}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((farm) => (
            <FarmCard key={farm.id} farm={farm} />
          ))}
        </div>
      )}
    </div>
  );
}
