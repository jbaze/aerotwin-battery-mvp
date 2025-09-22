import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, interval } from 'rxjs';
import { map } from 'rxjs/operators';
import { PVDistributionData, PVDistribution } from '../models/pv-distribution.model';

@Injectable({
  providedIn: 'root'
})
export class PVDistributionService {
  private distributionSubject = new BehaviorSubject<PVDistributionData>(this.generatePVData());
  public distribution$ = this.distributionSubject.asObservable();

  constructor() {
    // Update data every 20 seconds
    interval(20000).subscribe(() => {
      this.distributionSubject.next(this.generatePVData());
    });
  }

  private generatePVData(): PVDistributionData {
    const now = new Date();
    const hour = now.getHours();

    // Base production varies by time of day
    const baseProduction = this.getBaseProduction(hour);

    // Generate realistic distribution values
    const toBattery = baseProduction * (0.08 + Math.random() * 0.15); // 8-23%
    const toHome = baseProduction * (0.12 + Math.random() * 0.08); // 12-20%
    const toGrid = Math.max(0, baseProduction - toBattery - toHome); // Remainder
    const toEVDC = 0; // Currently not in use

    const distributions: PVDistribution[] = [
      {
        id: 'to-battery',
        label: 'To Battery',
        value: toBattery,
        percentage: (toBattery / baseProduction) * 100,
        color: '#10B981', // Green
        icon: 'battery-charging',
        description: 'Energy stored in battery system'
      },
      {
        id: 'to-home',
        label: 'Powering the Home Directly',
        value: toHome,
        percentage: (toHome / baseProduction) * 100,
        color: '#3B82F6', // Blue
        icon: 'home',
        description: 'Direct consumption by household appliances'
      },
      {
        id: 'to-grid',
        label: 'Sold Back to Grid',
        value: toGrid,
        percentage: (toGrid / baseProduction) * 100,
        color: '#06B6D4', // Cyan
        icon: 'grid-export',
        description: 'Excess energy sold to utility grid'
      },
      {
        id: 'to-evdc',
        label: 'To EVDC',
        value: toEVDC,
        percentage: 0,
        color: '#F97316', // Orange
        icon: 'car',
        description: 'Electric vehicle charging (not connected)'
      }
    ];

    return {
      totalProduction: baseProduction,
      distributions: distributions.sort((a, b) => b.percentage - a.percentage),
      timestamp: now,
      efficiency: 92 + Math.random() * 6 // 92-98% efficiency
    };
  }

  private getBaseProduction(hour: number): number {
    // Solar production curve throughout the day
    if (hour >= 6 && hour <= 18) {
      const midDay = 12;
      const distance = Math.abs(hour - midDay);
      const multiplier = Math.max(0.1, 1 - (distance / 6) * 0.8);
      return Math.round((192.19 * multiplier + Math.random() * 20) * 10) / 10;
    }
    return Math.round((5 + Math.random() * 10) * 10) / 10; // Minimal at night
  }

  getCurrentDistribution(): Observable<PVDistributionData> {
    return this.distribution$;
  }
}
