export interface HouseData {
  batteryLevel: number;
  batteryStatus: 'charging' | 'discharging' | 'idle';
  solarProduction: number;
  homeConsumption: number;
  gridConnection: 'importing' | 'exporting' | 'idle';
  //energyFlows: EnergyFlow[];
  timestamp: Date;
}

// export interface EnergyFlow {
//   from: 'solar' | 'battery' | 'grid';
//   to: 'battery' | 'home' | 'grid';
//   amount: number;
//   isActive: boolean;
// }

export interface EnergyFlow {
  id: string;
  from: { x: number; y: number };
  to: { x: number; y: number };
  color: string;
  isActive: boolean;
  type: 'solar' | 'battery' | 'grid';
  particles: Array<{ x: number; y: number; progress: number; delay: number }>;
}

export interface BatteryInfo {
  level: number;
  capacity: number;
  temperature: number;
  voltage: number;
  status: 'charging' | 'discharging' | 'idle';
  health: number;
}
