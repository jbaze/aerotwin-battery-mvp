export interface EnergyMetric {
  id: string;
  title: string;
  value: number;
  unit: string;
  icon: string;
  color: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: number;
  description?: string;
}

export interface EnergyData {
  timestamp: Date;
  solarProduced: number;
  homeConsumption: number;
  batteryDischarge: number;
  batteryCharge: number;
  gridImport: number;
  gridExport: number;
}
