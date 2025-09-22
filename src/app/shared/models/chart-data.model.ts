export interface ChartDataset {
  label: string;
  data: number[];
  borderColor: string;
  backgroundColor: string;
  fill: boolean;
  tension: number;
  pointRadius?: number;
  pointHoverRadius?: number;
  borderWidth?: number;
}

export interface ChartConfiguration {
  type: 'line' | 'bar' | 'doughnut';
  data: {
    labels: string[];
    datasets: ChartDataset[];
  };
  options: any;
}

export interface TimelineChartData {
  current: ChartConfiguration;
  optimized: ChartConfiguration;
  comparison: ChartConfiguration;
}
