/* ======================================================================
   AgriVest AI — TypeScript Types (derived from OpenAPI spec)
   ====================================================================== */

export interface Farm {
  id: number;
  name: string;
  location: string;
  cropType: string;
  category: string;
  fundingGoal: number;
  currentFunding: number;
  fundingPercent: number;
  predictedRoi: number;
  riskScore: number;
  sustainabilityScore: number;
  status: string;
  imageUrl: string;
  investorCount: number;
  minInvestment?: number;
  isFeatured?: boolean;
  tags?: string[];
  description?: string | null;
  acreage?: number | null;
}

export interface FarmDetail extends Farm {
  description: string;
  acreage: number;
  yearEstablished: number;
  farmerId: number;
  farmerName: string;
  images: string[];
  milestones: Milestone[];
}

export interface Milestone {
  title: string;
  date: string;
  completed: boolean;
  description?: string | null;
}

export interface DataPoint {
  label: string;
  value: number;
}

export interface FarmAnalytics {
  farmId: number;
  monthlyRevenue: DataPoint[];
  cropHealth: number;
  waterUsage: number;
  soilQuality: number;
  yieldHistory: DataPoint[];
  satelliteImageUrl?: string | null;
}

export interface Investment {
  id: number;
  farmId: number;
  farmName: string;
  poolId?: number | null;
  poolName?: string | null;
  amount: number;
  shares: number;
  currentValue: number;
  roi: number;
  status: string;
  createdAt: string;
  imageUrl?: string | null;
  cropType?: string | null;
}

export interface PortfolioSummary {
  totalInvested: number;
  currentValue: number;
  totalRoi: number;
  totalFarms: number;
  totalPools: number;
  monthlyReturn: number;
  sustainabilityImpact?: number;
  badges: Badge[];
}

export interface Badge {
  id: number;
  name: string;
  description: string;
  icon: string;
  earnedAt: string;
  tier?: string;
}

export interface PerformancePoint {
  date: string;
  value: number;
  invested: number;
  roi?: number;
}

export interface AllocationItem {
  name: string;
  value: number;
  percent: number;
  color: string;
}

export interface MutualPool {
  id: number;
  name: string;
  description: string;
  totalValue: number;
  investorCount: number;
  farms: number;
  expectedRoi: number;
  riskLevel: string;
  diversificationScore: number;
  status: string;
  minContribution?: number;
  imageUrl?: string | null;
  farmIds?: number[];
  monthlyPerformance?: DataPoint[];
}

export interface AiRecommendation {
  id: number;
  farmId: number;
  farmName: string;
  reason: string;
  confidence: number;
  expectedRoi: number;
  riskLevel: string;
  action: string;
  imageUrl?: string | null;
}

export interface RiskAssessment {
  farmId: number;
  overallScore: number;
  weatherRisk: number;
  marketRisk: number;
  operationalRisk: number;
  fraudFlags: number;
  lastUpdated: string;
  factors: RiskFactor[];
}

export interface RiskFactor {
  name: string;
  score: number;
  impact: string;
}

export interface MarketInsights {
  commodityPrices: CommodityPrice[];
  topCrops: string[];
  marketSentiment: string;
  weeklyReport: string;
  trends: MarketTrend[];
}

export interface CommodityPrice {
  name: string;
  price: number;
  change: number;
  changePercent: number;
}

export interface MarketTrend {
  title: string;
  description: string;
  impact: string;
}

export interface DashboardStats {
  totalFarms: number;
  totalInvestors: number;
  totalFundsDeployed: number;
  avgRoi: number;
  activePools: number;
  successfulHarvests: number;
  platformGrowth: number;
}

export interface ActivityItem {
  id: number;
  type: string;
  title: string;
  description: string;
  amount: number | null;
  timestamp: string;
  userInitials: string;
  farmName?: string | null;
}

export interface WeatherInsight {
  farmId: number;
  farmName: string;
  condition: string;
  temperature: number;
  humidity: number;
  rainfall: number;
  alert: string | null;
  forecast: WeatherDay[];
}

export interface WeatherDay {
  day: string;
  condition: string;
  high: number;
  low: number;
}

export interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  farmName?: string | null;
  actionUrl?: string | null;
}
