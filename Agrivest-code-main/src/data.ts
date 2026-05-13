/* ======================================================================
   AgriVest AI — Mock Data
   Realistic demo data for all API entities so the frontend works
   without a backend server.
   ====================================================================== */

import type {
  Farm,
  FarmDetail,
  Investment,
  PortfolioSummary,
  PerformancePoint,
  AllocationItem,
  MutualPool,
  AiRecommendation,
  DashboardStats,
  ActivityItem,
  WeatherInsight,
  MarketInsights,
  Notification,
  DataPoint,
} from "./types";

/* ------------------------------------------------------------------ */
/*  Farms                                                              */
/* ------------------------------------------------------------------ */

export const farms: Farm[] = [
  {
    id: 1,
    name: "Sunrise Organic Avocado Farm",
    location: "Murang'a, Kenya",
    cropType: "Avocado",
    category: "Organic Fruits",
    fundingGoal: 250000,
    currentFunding: 187500,
    fundingPercent: 75,
    predictedRoi: 18.5,
    riskScore: 2.3,
    sustainabilityScore: 92,
    status: "Active",
    imageUrl: "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=600&q=80",
    investorCount: 142,
    minInvestment: 50,
    isFeatured: true,
    tags: ["Organic", "Export-Ready", "AI-Monitored"],
    description: "Premium Hass avocado farm supplying EU export markets with sustainable practices.",
    acreage: 45,
  },
  {
    id: 2,
    name: "Green Valley Tea Estate",
    location: "Kericho, Kenya",
    cropType: "Tea",
    category: "Beverages",
    fundingGoal: 500000,
    currentFunding: 425000,
    fundingPercent: 85,
    predictedRoi: 14.2,
    riskScore: 1.8,
    sustainabilityScore: 88,
    status: "Active",
    imageUrl: "https://images.unsplash.com/photo-1556881286-fc6915169721?w=600&q=80",
    investorCount: 234,
    minInvestment: 100,
    isFeatured: true,
    tags: ["Premium", "Established", "Fair-Trade"],
    description: "Highland tea estate producing specialty teas for international markets.",
    acreage: 120,
  },
  {
    id: 3,
    name: "SunRipe Mango Orchards",
    location: "Machakos, Kenya",
    cropType: "Mango",
    category: "Tropical Fruits",
    fundingGoal: 180000,
    currentFunding: 108000,
    fundingPercent: 60,
    predictedRoi: 22.1,
    riskScore: 3.1,
    sustainabilityScore: 85,
    status: "Funding",
    imageUrl: "https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?w=600&q=80",
    investorCount: 89,
    minInvestment: 25,
    isFeatured: false,
    tags: ["High-ROI", "Seasonal", "Growing"],
    description: "Grafted mango varieties with drip irrigation for consistent yields.",
    acreage: 30,
  },
  {
    id: 4,
    name: "Highland Coffee Cooperative",
    location: "Nyeri, Kenya",
    cropType: "Coffee",
    category: "Beverages",
    fundingGoal: 350000,
    currentFunding: 332500,
    fundingPercent: 95,
    predictedRoi: 16.8,
    riskScore: 2.0,
    sustainabilityScore: 95,
    status: "Active",
    imageUrl: "https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=600&q=80",
    investorCount: 312,
    minInvestment: 75,
    isFeatured: true,
    tags: ["Cooperative", "Specialty", "Carbon-Neutral"],
    description: "Specialty coffee co-op producing AA grade beans at 1800m altitude.",
    acreage: 85,
  },
  {
    id: 5,
    name: "AquaGreens Hydroponic Hub",
    location: "Nairobi, Kenya",
    cropType: "Vegetables",
    category: "Urban Farming",
    fundingGoal: 120000,
    currentFunding: 48000,
    fundingPercent: 40,
    predictedRoi: 25.3,
    riskScore: 3.5,
    sustainabilityScore: 90,
    status: "Funding",
    imageUrl: "https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=600&q=80",
    investorCount: 56,
    minInvestment: 30,
    isFeatured: false,
    tags: ["Tech", "Urban", "Year-Round"],
    description: "Vertical hydroponic farm producing leafy greens for Nairobi supermarkets.",
    acreage: 2,
  },
  {
    id: 6,
    name: "Rift Valley Wheat Fields",
    location: "Nakuru, Kenya",
    cropType: "Wheat",
    category: "Grains",
    fundingGoal: 400000,
    currentFunding: 280000,
    fundingPercent: 70,
    predictedRoi: 12.5,
    riskScore: 2.5,
    sustainabilityScore: 78,
    status: "Active",
    imageUrl: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&q=80",
    investorCount: 178,
    minInvestment: 100,
    isFeatured: false,
    tags: ["Staple", "Mechanized", "Large-Scale"],
    description: "Mechanized wheat farming on rich volcanic soils in the Rift Valley.",
    acreage: 200,
  },
];

/* ------------------------------------------------------------------ */
/*  Farm Detail (extended)                                             */
/* ------------------------------------------------------------------ */

export const farmDetails: Record<number, FarmDetail> = {
  1: {
    ...farms[0],
    description: "Premium Hass avocado farm supplying EU export markets with sustainable practices. Our AI-powered monitoring system tracks soil moisture, pest pressure, and growth stages in real-time to optimize yields.",
    acreage: 45,
    yearEstablished: 2019,
    farmerId: 101,
    farmerName: "James Mwangi",
    images: [farms[0].imageUrl],
    milestones: [
      { title: "Land Preparation Complete", date: "2024-01-15", completed: true },
      { title: "First Harvest", date: "2024-06-20", completed: true },
      { title: "EU Export Certification", date: "2024-09-10", completed: true },
      { title: "Scale to 60 Acres", date: "2025-03-01", completed: false },
    ],
    tags: farms[0].tags,
  },
};

/* ------------------------------------------------------------------ */
/*  Investments                                                        */
/* ------------------------------------------------------------------ */

export const investments: Investment[] = [
  {
    id: 1, farmId: 1, farmName: "Sunrise Organic Avocado Farm",
    amount: 2500, shares: 50, currentValue: 2962, roi: 18.5,
    status: "Active", createdAt: "2024-08-15", cropType: "Avocado",
    imageUrl: farms[0].imageUrl,
  },
  {
    id: 2, farmId: 2, farmName: "Green Valley Tea Estate",
    amount: 5000, shares: 50, currentValue: 5710, roi: 14.2,
    status: "Active", createdAt: "2024-06-01", cropType: "Tea",
    imageUrl: farms[1].imageUrl,
  },
  {
    id: 3, farmId: 4, farmName: "Highland Coffee Cooperative",
    amount: 3000, shares: 40, currentValue: 3504, roi: 16.8,
    status: "Active", createdAt: "2024-09-22", cropType: "Coffee",
    imageUrl: farms[3].imageUrl,
  },
  {
    id: 4, farmId: 3, farmName: "SunRipe Mango Orchards",
    amount: 1000, shares: 40, currentValue: 1221, roi: 22.1,
    status: "Active", createdAt: "2025-01-10", cropType: "Mango",
    imageUrl: farms[2].imageUrl,
  },
];

/* ------------------------------------------------------------------ */
/*  Portfolio                                                          */
/* ------------------------------------------------------------------ */

export const portfolioSummary: PortfolioSummary = {
  totalInvested: 11500,
  currentValue: 13397,
  totalRoi: 16.5,
  totalFarms: 4,
  totalPools: 1,
  monthlyReturn: 385,
  sustainabilityImpact: 87,
  badges: [
    { id: 1, name: "Early Adopter", description: "Among the first 100 investors", icon: "🌱", earnedAt: "2024-06-01", tier: "Gold" },
    { id: 2, name: "Green Champion", description: "Invested in 3+ sustainable farms", icon: "🌿", earnedAt: "2024-09-15", tier: "Silver" },
    { id: 3, name: "Diversified", description: "Invested across 4+ crop types", icon: "🌾", earnedAt: "2025-01-10", tier: "Bronze" },
  ],
};

export const performanceData: PerformancePoint[] = [
  { date: "Jul 2024", value: 5000, invested: 5000, roi: 0 },
  { date: "Aug 2024", value: 7800, invested: 7500, roi: 4 },
  { date: "Sep 2024", value: 11200, invested: 10500, roi: 6.7 },
  { date: "Oct 2024", value: 11800, invested: 10500, roi: 12.4 },
  { date: "Nov 2024", value: 12100, invested: 10500, roi: 15.2 },
  { date: "Dec 2024", value: 11900, invested: 10500, roi: 13.3 },
  { date: "Jan 2025", value: 12500, invested: 11500, roi: 8.7 },
  { date: "Feb 2025", value: 12850, invested: 11500, roi: 11.7 },
  { date: "Mar 2025", value: 13100, invested: 11500, roi: 13.9 },
  { date: "Apr 2025", value: 13397, invested: 11500, roi: 16.5 },
];

export const allocations: AllocationItem[] = [
  { name: "Avocado", value: 2962, percent: 22.1, color: "#10b981" },
  { name: "Tea", value: 5710, percent: 42.6, color: "#06b6d4" },
  { name: "Coffee", value: 3504, percent: 26.2, color: "#8b5cf6" },
  { name: "Mango", value: 1221, percent: 9.1, color: "#f59e0b" },
];

/* ------------------------------------------------------------------ */
/*  Mutual Pools                                                       */
/* ------------------------------------------------------------------ */

export const mutualPools: MutualPool[] = [
  {
    id: 1, name: "East Africa Growth Fund",
    description: "Diversified pool across Kenya's top-performing farms. Professionally managed with quarterly rebalancing.",
    totalValue: 2450000, investorCount: 534, farms: 12, expectedRoi: 15.8,
    riskLevel: "Medium", diversificationScore: 92, status: "Open",
    minContribution: 100,
    monthlyPerformance: [
      { label: "Jan", value: 14.2 }, { label: "Feb", value: 15.1 },
      { label: "Mar", value: 14.8 }, { label: "Apr", value: 15.8 },
    ],
  },
  {
    id: 2, name: "Organic Premium Collection",
    description: "Focused on certified organic farms with premium export potential. Lower risk, steady returns.",
    totalValue: 1800000, investorCount: 312, farms: 8, expectedRoi: 13.2,
    riskLevel: "Low", diversificationScore: 85, status: "Open",
    minContribution: 200,
    monthlyPerformance: [
      { label: "Jan", value: 12.5 }, { label: "Feb", value: 12.9 },
      { label: "Mar", value: 13.0 }, { label: "Apr", value: 13.2 },
    ],
  },
  {
    id: 3, name: "High-Growth Incubator",
    description: "Early-stage farms with high ROI potential. Higher risk, higher reward strategy.",
    totalValue: 750000, investorCount: 156, farms: 5, expectedRoi: 24.5,
    riskLevel: "High", diversificationScore: 68, status: "Open",
    minContribution: 50,
    monthlyPerformance: [
      { label: "Jan", value: 20.1 }, { label: "Feb", value: 22.3 },
      { label: "Mar", value: 21.5 }, { label: "Apr", value: 24.5 },
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  AI Recommendations                                                 */
/* ------------------------------------------------------------------ */

export const aiRecommendations: AiRecommendation[] = [
  {
    id: 1, farmId: 1, farmName: "Sunrise Organic Avocado Farm",
    reason: "Strong export demand from EU markets, above-average soil metrics, and consistent rainfall patterns indicate high yield probability this season.",
    confidence: 92, expectedRoi: 18.5, riskLevel: "Low", action: "Buy",
    imageUrl: farms[0].imageUrl,
  },
  {
    id: 2, farmId: 5, farmName: "AquaGreens Hydroponic Hub",
    reason: "Urban farming demand surging 40% YoY. Tech-driven approach minimizes weather risk. Early-stage entry offers maximum upside.",
    confidence: 85, expectedRoi: 25.3, riskLevel: "Medium", action: "Buy",
    imageUrl: farms[4].imageUrl,
  },
  {
    id: 3, farmId: 4, farmName: "Highland Coffee Cooperative",
    reason: "Specialty coffee prices at 5-year high. Carbon-neutral certification opens premium buyer channels.",
    confidence: 88, expectedRoi: 16.8, riskLevel: "Low", action: "Hold",
    imageUrl: farms[3].imageUrl,
  },
];

/* ------------------------------------------------------------------ */
/*  Market Insights                                                    */
/* ------------------------------------------------------------------ */

export const marketInsights: MarketInsights = {
  commodityPrices: [
    { name: "Avocado (Hass)", price: 2.85, change: 0.15, changePercent: 5.6 },
    { name: "Tea (CTC)", price: 3.42, change: -0.08, changePercent: -2.3 },
    { name: "Coffee (AA)", price: 5.10, change: 0.32, changePercent: 6.7 },
    { name: "Mango (Kent)", price: 1.20, change: 0.05, changePercent: 4.3 },
    { name: "Wheat", price: 0.35, change: -0.02, changePercent: -5.4 },
  ],
  topCrops: ["Avocado", "Coffee", "Macadamia", "Passion Fruit"],
  marketSentiment: "Bullish",
  weeklyReport: "Agricultural commodity markets showed strength this week, led by coffee and avocado. EU demand for organic produce continues to drive premium pricing for Kenyan exports.",
  trends: [
    { title: "EU Organic Demand Surges", description: "European importers increasing orders for certified organic produce by 35% YoY.", impact: "Positive" },
    { title: "Drought Risk in Eastern Regions", description: "Below-average rainfall forecasted for Machakos and Kitui counties through Q3.", impact: "Negative" },
    { title: "Carbon Credit Integration", description: "New programs enabling farms to monetize carbon sequestration alongside crop revenue.", impact: "Positive" },
  ],
};

/* ------------------------------------------------------------------ */
/*  Dashboard Stats                                                    */
/* ------------------------------------------------------------------ */

export const dashboardStats: DashboardStats = {
  totalFarms: 156,
  totalInvestors: 4823,
  totalFundsDeployed: 12500000,
  avgRoi: 16.2,
  activePools: 8,
  successfulHarvests: 342,
  platformGrowth: 28.5,
};

/* ------------------------------------------------------------------ */
/*  Activity Feed                                                      */
/* ------------------------------------------------------------------ */

export const recentActivity: ActivityItem[] = [
  { id: 1, type: "investment", title: "New Investment", description: "invested in Sunrise Organic Avocado Farm", amount: 500, timestamp: "2 min ago", userInitials: "JK", farmName: "Sunrise Organic Avocado Farm" },
  { id: 2, type: "harvest", title: "Harvest Complete", description: "Green Valley Tea Estate completed Q1 harvest", amount: null, timestamp: "15 min ago", userInitials: "GV", farmName: "Green Valley Tea Estate" },
  { id: 3, type: "roi", title: "ROI Distributed", description: "Highland Coffee Cooperative distributed quarterly returns", amount: 12500, timestamp: "1 hr ago", userInitials: "HC", farmName: "Highland Coffee Cooperative" },
  { id: 4, type: "investment", title: "New Investment", description: "invested in AquaGreens Hydroponic Hub", amount: 250, timestamp: "2 hrs ago", userInitials: "AM", farmName: "AquaGreens Hydroponic Hub" },
  { id: 5, type: "milestone", title: "Milestone Reached", description: "Sunrise Organic Avocado Farm reached 75% funding", amount: null, timestamp: "3 hrs ago", userInitials: "SO", farmName: "Sunrise Organic Avocado Farm" },
];

/* ------------------------------------------------------------------ */
/*  Weather                                                            */
/* ------------------------------------------------------------------ */

export const weatherInsights: WeatherInsight[] = [
  {
    farmId: 1, farmName: "Sunrise Organic Avocado Farm",
    condition: "Partly Cloudy", temperature: 24, humidity: 65, rainfall: 2.1,
    alert: null,
    forecast: [
      { day: "Mon", condition: "Sunny", high: 26, low: 18 },
      { day: "Tue", condition: "Cloudy", high: 24, low: 17 },
      { day: "Wed", condition: "Rain", high: 22, low: 16 },
    ],
  },
  {
    farmId: 2, farmName: "Green Valley Tea Estate",
    condition: "Light Rain", temperature: 19, humidity: 82, rainfall: 8.5,
    alert: "Heavy rainfall expected Thursday — monitor drainage",
    forecast: [
      { day: "Mon", condition: "Rain", high: 20, low: 14 },
      { day: "Tue", condition: "Rain", high: 19, low: 13 },
      { day: "Wed", condition: "Cloudy", high: 21, low: 15 },
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  Notifications                                                      */
/* ------------------------------------------------------------------ */

export const notifications: Notification[] = [
  { id: 1, type: "roi", title: "Returns Distributed", message: "Your Q1 returns of $385 from Highland Coffee Cooperative have been credited.", read: false, createdAt: "2025-04-01", farmName: "Highland Coffee Cooperative" },
  { id: 2, type: "milestone", title: "Farm Milestone", message: "Sunrise Organic Avocado Farm has reached 75% funding!", read: false, createdAt: "2025-03-28", farmName: "Sunrise Organic Avocado Farm" },
  { id: 3, type: "weather", title: "Weather Alert", message: "Heavy rainfall expected at Green Valley Tea Estate. Farm manager is monitoring.", read: true, createdAt: "2025-03-25", farmName: "Green Valley Tea Estate" },
  { id: 4, type: "system", title: "Welcome to AgriVest", message: "Your account has been verified. Start exploring farms!", read: true, createdAt: "2024-06-01" },
];

/* ------------------------------------------------------------------ */
/*  Farm Analytics                                                     */
/* ------------------------------------------------------------------ */

export const farmAnalyticsData: Record<number, { monthlyRevenue: DataPoint[]; cropHealth: number; waterUsage: number; soilQuality: number; yieldHistory: DataPoint[] }> = {
  1: {
    monthlyRevenue: [
      { label: "Oct", value: 12000 }, { label: "Nov", value: 14500 },
      { label: "Dec", value: 13200 }, { label: "Jan", value: 15800 },
      { label: "Feb", value: 16200 }, { label: "Mar", value: 17500 },
    ],
    cropHealth: 94,
    waterUsage: 72,
    soilQuality: 88,
    yieldHistory: [
      { label: "2022", value: 8500 }, { label: "2023", value: 11200 },
      { label: "2024", value: 14800 }, { label: "2025 (proj)", value: 17500 },
    ],
  },
};
