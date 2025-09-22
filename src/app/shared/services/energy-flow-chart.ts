import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, interval } from 'rxjs';
import { map } from 'rxjs/operators';
import { EnergyFlowData, HourlyEnergyFlow, ChartConfig } from '../models/energy-flow.model';

@Injectable({
  providedIn: 'root'
})
export class EnergyFlowChartService {
  private energyFlowSubject = new BehaviorSubject<EnergyFlowData>(this.generateEnergyFlowData());
  public energyFlow$ = this.energyFlowSubject.asObservable();

  private chartConfigSubject = new BehaviorSubject<ChartConfig>({
    showSolar: true,
    showConsumption: true,
    showBattery: true,
    showGrid: true,
    showPrice: false,
    timeRange: '24h'
  });
  public chartConfig$ = this.chartConfigSubject.asObservable();

  constructor() {
    // Update data every 60 seconds (every hour in fast mode for demo)
    interval(60000).subscribe(() => {
      this.energyFlowSubject.next(this.generateEnergyFlowData());
    });
  }

  updateChartConfig(config: Partial<ChartConfig>): void {
    const currentConfig = this.chartConfigSubject.value;
    this.chartConfigSubject.next({ ...currentConfig, ...config });
  }

  getCurrentEnergyFlow(): Observable<EnergyFlowData> {
    return this.energyFlow$;
  }

  private generateEnergyFlowData(): EnergyFlowData {
    const now = new Date();
    const currentHour = now.getHours();
    const hourlyData: HourlyEnergyFlow[] = [];

    for (let hour = 0; hour < 24; hour++) {
      const solarProduction = this.calculateSolarProduction(hour);
      const homeConsumption = this.calculateHomeConsumption(hour);
      const batteryLevel = this.calculateBatteryLevel(hour);
      const gridUsage = this.calculateGridUsage(solarProduction, homeConsumption, hour);
      const electricityPrice = this.calculateElectricityPrice(hour);

      hourlyData.push({
        hour,
        solarProduction,
        homeConsumption,
        batteryLevel,
        gridUsage,
        electricityPrice,
        timestamp: `${hour.toString().padStart(2, '0')}:00`
      });
    }

    return {
      timestamp: now,
      hourlyData,
      currentHour,
      peakSolarHour: 12, // Noon
      peakConsumptionHour: 19 // 7 PM
    };
  }

  private calculateSolarProduction(hour: number): number {
    // Solar production curve: 0 at night, peak at noon
    if (hour >= 6 && hour <= 18) {
      const midDay = 12;
      const distance = Math.abs(hour - midDay);
      const multiplier = Math.max(0.1, 1 - (distance / 6) * 0.8);
      return Math.round((8.5 * multiplier + Math.random() * 1.5) * 10) / 10;
    }
    return Math.round((0.1 + Math.random() * 0.2) * 10) / 10; // Minimal at night
  }

  private calculateHomeConsumption(hour: number): number {
    // Higher consumption in morning (7-9) and evening (17-22)
    let baseConsumption = 2.5; // Base consumption

    if (hour >= 6 && hour <= 9) {
      baseConsumption = 4.2; // Morning peak
    } else if (hour >= 17 && hour <= 22) {
      baseConsumption = 5.1; // Evening peak
    } else if (hour >= 10 && hour <= 16) {
      baseConsumption = 2.8; // Day time
    } else {
      baseConsumption = 1.5; // Night time
    }

    return Math.round((baseConsumption + Math.random() * 0.8 - 0.4) * 10) / 10;
  }

  private calculateBatteryLevel(hour: number): number {
    // Battery level changes throughout the day
    // Charges during day, discharges at night
    let batteryLevel = 50; // Base level

    if (hour >= 10 && hour <= 16) {
      // Charging during solar peak
      batteryLevel = 60 + (hour - 10) * 5;
    } else if (hour >= 18 && hour <= 22) {
      // Discharging during evening peak
      batteryLevel = 85 - (hour - 18) * 8;
    } else if (hour >= 23 || hour <= 6) {
      // Slow discharge at night
      const nightHour = hour >= 23 ? hour - 23 : hour + 1;
      batteryLevel = 55 - nightHour * 3;
    }

    return Math.max(20, Math.min(95, batteryLevel + Math.random() * 10 - 5));
  }

  private calculateGridUsage(solar: number, consumption: number, hour: number): number {
    // Positive = importing from grid, Negative = exporting to grid
    const netUsage = consumption - solar;

    // Add some realistic fluctuation
    const fluctuation = Math.random() * 0.5 - 0.25;

    return Math.round((netUsage + fluctuation) * 10) / 10;
  }

  private calculateElectricityPrice(hour: number): number {
    // UK-style pricing: cheap at night, expensive at peak times
    let basePrice = 0.15; // £0.15 per kWh base

    if (hour >= 18 && hour <= 21) {
      basePrice = 0.35; // Peak evening price
    } else if (hour >= 7 && hour <= 9) {
      basePrice = 0.28; // Morning peak
    } else if (hour >= 2 && hour <= 6) {
      basePrice = 0.08; // Cheap night rate
    } else if (hour >= 10 && hour <= 16) {
      basePrice = 0.18; // Day rate
    }

    return Math.round((basePrice + Math.random() * 0.03 - 0.015) * 1000) / 1000;
  }
}
