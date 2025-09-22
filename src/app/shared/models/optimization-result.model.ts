export interface OptimizationResult {
  currentState: EnergyState;
  optimizedState: EnergyState;
  improvements: Improvement[];
  savings: SavingsCalculation;
  timeline: OptimizationTimeline[];
  isApplied: boolean;
}

export interface EnergyState {
  dailyConsumption: number;
  dailyProduction: number;
  batteryEfficiency: number;
  gridDependency: number;
  costPerDay: number;
  wastedEnergy: number;
}

export interface Improvement {
  id: string;
  title: string;
  description: string;
  impact: number; // percentage improvement
  category: 'timing' | 'efficiency' | 'cost';
}

export interface SavingsCalculation {
  dailySavings: number;
  monthlySavings: number;
  yearlySavings: number;
  efficiencyGain: number; // percentage
  co2Reduction: number; // kg per year
}

export interface OptimizationTimeline {
  hour: number;
  current: TimelineData;
  optimized: TimelineData;
}

export interface TimelineData {
  batteryCharge: number;
  solarProduction: number;
  homeConsumption: number;
  gridUsage: number;
  electricityPrice: number;
}
