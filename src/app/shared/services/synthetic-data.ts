import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, interval } from 'rxjs';
import { map } from 'rxjs/operators';
import { EnergyMetric, EnergyData } from '../models/energy-metrics.model';
import { Optimization } from './optimization';

@Injectable({
  providedIn: 'root'
})
export class SyntheticDataService {
  private currentDataSubject = new BehaviorSubject<EnergyData>(this.generateCurrentData());
  public currentData$ = this.currentDataSubject.asObservable();

  private isOptimizedSubject = new BehaviorSubject<boolean>(false);
  public isOptimized$ = this.isOptimizedSubject.asObservable();

  constructor(private optimizationService: Optimization) {
    // Listen for optimization state changes
    this.optimizationService.optimizationState$.subscribe(result => {
      if (result?.isApplied) {
        this.applyOptimization();
      } else {
        this.resetToCurrentState();
      }
    });

    // Update data every 30 seconds for demo purposes
    interval(30000).subscribe(() => {
      this.updateData();
    });
  }

  getCurrentMetrics(): Observable<EnergyMetric[]> {
    return this.currentData$.pipe(
      map(data => this.convertToMetrics(data))
    );
  }

   private applyOptimization(): void {
    this.isOptimizedSubject.next(true);
    const optimizedData = this.generateOptimizedData();
    this.currentDataSubject.next(optimizedData);
  }

  private resetToCurrentState(): void {
    this.isOptimizedSubject.next(false);
    const currentData = this.generateCurrentData();
    this.currentDataSubject.next(currentData);
  }

  private updateData(): void {
    const isOptimized = this.isOptimizedSubject.value;
    const newData = isOptimized ? this.generateOptimizedData() : this.generateCurrentData();
    this.currentDataSubject.next(newData);
  }

  private generateCurrentData(): EnergyData {
    // Generate realistic energy data based on current time
    const now = new Date();
    const hour = now.getHours();

    // Solar production varies by time of day
    const solarMultiplier = this.getSolarMultiplier(hour);

    return {
      timestamp: now,
      solarProduced: Math.round(192.19 * solarMultiplier * (0.9 + Math.random() * 0.2)),
      homeConsumption: Math.round(76.4 + (Math.random() * 20 - 10)),
      batteryDischarge: Math.round(149.76 + (Math.random() * 30 - 15)),
      batteryCharge: Math.round(160.52 + (Math.random() * 25 - 12.5)),
      gridImport: Math.round(157.65 + (Math.random() * 40 - 20)),
      gridExport: Math.round(262.68 + (Math.random() * 50 - 25))
    };
  }

  private generateOptimizedData(): EnergyData {
    // Optimized system performance (20% improvement)
    const now = new Date();
    const hour = now.getHours();
    const solarMultiplier = this.getSolarMultiplier(hour);

    return {
      timestamp: now,
      solarProduced: Math.round(192.19 * solarMultiplier * (0.95 + Math.random() * 0.1)), // Same solar production
      homeConsumption: Math.round(76.4 + (Math.random() * 15 - 7.5)), // Slightly more efficient consumption
      batteryDischarge: Math.round(119.8 + (Math.random() * 20 - 10)), // 20% reduction in discharge
      batteryCharge: Math.round(193.4 + (Math.random() * 20 - 10)), // 20% more efficient charging
      gridImport: Math.round(94.6 + (Math.random() * 25 - 12.5)), // 40% reduction in grid import
      gridExport: Math.round(315.2 + (Math.random() * 40 - 20)) // 20% increase in grid export
    };
  }

  private getSolarMultiplier(hour: number): number {
    // Solar production curve throughout the day
    if (hour >= 6 && hour <= 18) {
      // Daylight hours - bell curve
      const midDay = 12;
      const distance = Math.abs(hour - midDay);
      return Math.max(0.1, 1 - (distance / 6) * 0.8);
    }
    return 0.05; // Minimal production at night
  }

   private convertToMetrics(data: EnergyData): EnergyMetric[] {
    const isOptimized = this.isOptimizedSubject.value;

    return [
      {
        id: 'solar-produced',
        title: 'Solar Produced',
        value: data.solarProduced,
        unit: 'kWh',
        icon: 'solar',
        color: 'text-yellow-400',
        trend: 'neutral',
        trendValue: isOptimized ? 2.1 : 12.3,
        description: isOptimized ?
          'Optimal solar utilization with smart routing' :
          'Total solar energy generated today'
      },
      {
        id: 'home-consumption',
        title: 'Powering the Home Directly',
        value: data.homeConsumption,
        unit: 'kWh',
        icon: 'home',
        color: 'text-blue-400',
        trend: isOptimized ? 'down' : 'neutral',
        trendValue: isOptimized ? -8.5 : 2.1,
        description: isOptimized ?
          'Optimized direct consumption with smart scheduling' :
          'Energy directly consumed by household appliances'
      },
      {
        id: 'battery-discharge',
        title: 'Battery Discharge',
        value: data.batteryDischarge,
        unit: 'kWh',
        icon: 'battery-down',
        color: 'text-orange-400',
        trend: isOptimized ? 'down' : 'down',
        trendValue: isOptimized ? -20.1 : -5.4,
        description: isOptimized ?
          'Strategic discharge during peak hours only' :
          'Energy released from battery storage'
      },
      {
        id: 'battery-charge',
        title: 'Battery Charging',
        value: data.batteryCharge,
        unit: 'kWh',
        icon: 'battery-up',
        color: 'text-green-400',
        trend: isOptimized ? 'up' : 'up',
        trendValue: isOptimized ? 20.5 : 8.7,
        description: isOptimized ?
          'Smart charging during low-cost hours (2am-6am)' :
          'Energy stored in battery system'
      },
      {
        id: 'grid-import',
        title: 'Grid Imported',
        value: data.gridImport,
        unit: 'kWh',
        icon: 'grid-down',
        color: 'text-red-400',
        trend: isOptimized ? 'down' : 'down',
        trendValue: isOptimized ? -40.0 : -15.2,
        description: isOptimized ?
          'Minimized grid dependency through smart management' :
          'Energy purchased from the grid'
      },
      {
        id: 'grid-export',
        title: 'Sold Back to Grid',
        value: data.gridExport,
        unit: 'kWh',
        icon: 'grid-up',
        color: 'text-teal-400',
        trend: isOptimized ? 'up' : 'up',
        trendValue: isOptimized ? 20.1 : 23.8,
        description: isOptimized ?
          'Maximized energy sales during peak pricing' :
          'Energy sold back to the grid'
      }
    ];
  }
}
