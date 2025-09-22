export interface EnergyFlowData {
  timestamp: Date;
  hourlyData: HourlyEnergyFlow[];
  currentHour: number;
  peakSolarHour: number;
  peakConsumptionHour: number;
}

export interface HourlyEnergyFlow {
  hour: number;
  solarProduction: number;
  homeConsumption: number;
  batteryLevel: number;
  gridUsage: number; // Positive = import, Negative = export
  electricityPrice: number;
  timestamp: string;
}

export interface ChartConfig {
  showSolar: boolean;
  showConsumption: boolean;
  showBattery: boolean;
  showGrid: boolean;
  showPrice: boolean;
  timeRange: '24h' | '7d' | '30d';
}
