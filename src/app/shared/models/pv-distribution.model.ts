export interface PVDistributionData {
  totalProduction: number;
  distributions: PVDistribution[];
  timestamp: Date;
  efficiency: number;
}

export interface PVDistribution {
  id: string;
  label: string;
  value: number;
  percentage: number;
  color: string;
  icon: string;
  description: string;
}
