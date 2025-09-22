import { Injectable } from '@angular/core';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { delay, map, switchMap, tap } from 'rxjs/operators';
import { EnergyState, Improvement, OptimizationResult, OptimizationTimeline, SavingsCalculation } from '../models/optimization-result.model';


@Injectable({
  providedIn: 'root'
})
export class Optimization {
  private optimizationStateSubject = new BehaviorSubject<OptimizationResult | null>(null);
  public optimizationState$ = this.optimizationStateSubject.asObservable();

  private isOptimizationApplied = false;

  constructor() {}

  /**
   * Generate optimization recommendations and projected results
   */

  // And update the generateOptimization method to properly return the result:
  generateOptimization(): Observable<OptimizationResult> {
    return of(null).pipe(
      delay(2000), // Simulate AI processing time
      switchMap(() => {
        const result = this.calculateOptimizationResult();
        this.optimizationStateSubject.next(result);
        return of(result);
      })
    );
  }

  /**
   * Apply the optimization (demo purposes)
   */
  applyOptimization(): Observable<boolean> {
    return of(true).pipe(
      delay(1500),
      tap(() => {
        this.isOptimizationApplied = true;
        const currentResult = this.optimizationStateSubject.value;
        if (currentResult) {
          currentResult.isApplied = true;
          this.optimizationStateSubject.next(currentResult);
        }
      })
    );
  }

  /**
   * Reset to original state
   */
  resetOptimization(): void {
    this.isOptimizationApplied = false;
    this.optimizationStateSubject.next(null);
  }

  /**
   * Get current optimization state
   */
  getCurrentOptimization(): OptimizationResult | null {
    return this.optimizationStateSubject.value;
  }

  /**
   * Check if optimization is currently applied
   */
  isOptimizationActive(): boolean {
    return this.isOptimizationApplied;
  }

  private calculateOptimizationResult(): OptimizationResult {
    const currentState: EnergyState = {
      dailyConsumption: 76.4,
      dailyProduction: 192.19,
      batteryEfficiency: 82, // Current efficiency
      gridDependency: 35, // Percentage dependent on grid
      costPerDay: 12.45,
      wastedEnergy: 28.5 // kWh wasted per day
    };

    const optimizedState: EnergyState = {
      dailyConsumption: 76.4, // Same consumption
      dailyProduction: 192.19, // Same production
      batteryEfficiency: 94, // Optimized efficiency (+12%)
      gridDependency: 18, // Reduced grid dependency (-17%)
      costPerDay: 9.85, // Reduced cost (-21%)
      wastedEnergy: 8.2 // Reduced waste (-72%)
    };

    const improvements: Improvement[] = [
      {
        id: 'charging-timing',
        title: 'Optimized Charging Windows',
        description: 'Shift charging to low-cost hours (2am-6am) when tariffs are cheapest',
        impact: 15.2,
        category: 'timing'
      },
      {
        id: 'discharge-timing',
        title: 'Peak Avoidance Strategy',
        description: 'Avoid discharging during expensive peak hours (6pm-9pm)',
        impact: 12.8,
        category: 'cost'
      },
      {
        id: 'solar-efficiency',
        title: 'Solar Utilization Boost',
        description: 'Maximize direct solar consumption during peak production',
        impact: 18.5,
        category: 'efficiency'
      },
      {
        id: 'grid-optimization',
        title: 'Smart Grid Interaction',
        description: 'Optimize when to buy/sell energy based on dynamic pricing',
        impact: 22.1,
        category: 'cost'
      }
    ];

    const savings: SavingsCalculation = {
      dailySavings: 2.60,
      monthlySavings: 78.00,
      yearlySavings: 949.00,
      efficiencyGain: 20.8,
      co2Reduction: 1240
    };

    const timeline = this.generateOptimizationTimeline();

    return {
      currentState,
      optimizedState,
      improvements,
      savings,
      timeline,
      isApplied: false
    };
  }

  private generateOptimizationTimeline(): OptimizationTimeline[] {
    const timeline: OptimizationTimeline[] = [];

    for (let hour = 0; hour < 24; hour++) {
      // Generate realistic hourly data
      const solarMultiplier = this.getSolarMultiplier(hour);
      const priceMultiplier = this.getPriceMultiplier(hour);
      const consumptionMultiplier = this.getConsumptionMultiplier(hour);

      timeline.push({
        hour,
        current: {
          batteryCharge: this.getCurrentBatteryCharge(hour),
          solarProduction: 8.0 * solarMultiplier,
          homeConsumption: 3.2 * consumptionMultiplier,
          gridUsage: this.getCurrentGridUsage(hour),
          electricityPrice: 0.15 + (0.25 * priceMultiplier)
        },
        optimized: {
          batteryCharge: this.getOptimizedBatteryCharge(hour),
          solarProduction: 8.0 * solarMultiplier, // Same solar production
          homeConsumption: 3.2 * consumptionMultiplier, // Same consumption
          gridUsage: this.getOptimizedGridUsage(hour),
          electricityPrice: 0.15 + (0.25 * priceMultiplier) // Same prices
        }
      });
    }

    return timeline;
  }

  private getSolarMultiplier(hour: number): number {
    if (hour >= 6 && hour <= 18) {
      const midDay = 12;
      const distance = Math.abs(hour - midDay);
      return Math.max(0.1, 1 - (distance / 6) * 0.8);
    }
    return 0.05;
  }

  private getPriceMultiplier(hour: number): number {
    // Peak pricing 6pm-9pm and 7am-9am
    if ((hour >= 18 && hour <= 21) || (hour >= 7 && hour <= 9)) {
      return 1.0; // Expensive
    } else if (hour >= 2 && hour <= 6) {
      return 0.1; // Very cheap
    }
    return 0.5; // Normal
  }

  private getConsumptionMultiplier(hour: number): number {
    // Higher consumption during morning and evening
    if ((hour >= 6 && hour <= 9) || (hour >= 17 && hour <= 22)) {
      return 1.3;
    } else if (hour >= 10 && hour <= 16) {
      return 0.8; // Lower during day
    }
    return 0.6; // Very low at night
  }

  private getCurrentBatteryCharge(hour: number): number {
    // Simulate current suboptimal charging pattern
    const baseCharge = 50 + (hour * 2) % 40;
    return Math.max(20, Math.min(90, baseCharge + Math.sin(hour * 0.3) * 15));
  }

  private getOptimizedBatteryCharge(hour: number): number {
    // Optimized charging pattern - charge at night, discharge at peak
    if (hour >= 2 && hour <= 6) {
      return Math.min(95, 30 + (hour - 2) * 15); // Charge during cheap hours
    } else if (hour >= 18 && hour <= 21) {
      return Math.max(25, 90 - (hour - 18) * 20); // Discharge during expensive hours
    } else if (hour >= 10 && hour <= 16) {
      return 75 + Math.sin(hour * 0.5) * 10; // Maintain good level during day
    }
    return 60 + Math.sin(hour * 0.2) * 15; // Stable otherwise
  }

  private getCurrentGridUsage(hour: number): number {
    return Math.random() * 2.5 + 0.5; // 0.5-3.0 kW random usage
  }

  private getOptimizedGridUsage(hour: number): number {
    // Reduced and optimized grid usage
    return Math.max(0, this.getCurrentGridUsage(hour) * 0.6); // 40% reduction
  }

  getOptimizedChartData(): Observable<any> {
    return this.optimizationState$.pipe(
      map(result => ({
        isOptimized: result?.isApplied || false,
        efficiencyGain: result?.savings.efficiencyGain || 0,
        currentData: this.generateCurrentChartData(),
        optimizedData: result ? this.generateOptimizedChartData(result) : null,
        comparisonData: result ? this.generateComparisonData(result) : null
      }))
    );
  }

  private generateCurrentChartData(): any {
    return {
      batteryLevels: Array.from({length: 24}, (_, hour) =>
        Math.max(20, Math.min(85, 50 + Math.sin(hour * 0.3) * 20 + Math.random() * 15))
      ),
      gridUsage: Array.from({length: 24}, () => Math.random() * 2.5 + 0.8),
      efficiency: 82,
      cost: 12.45
    };
  }

  private generateOptimizedChartData(result: OptimizationResult): any {
    return {
      batteryLevels: Array.from({length: 24}, (_, hour) => {
        if (hour >= 2 && hour <= 6) return Math.min(95, 25 + (hour - 2) * 17);
        if (hour >= 18 && hour <= 21) return Math.max(30, 95 - (hour - 18) * 18);
        if (hour >= 10 && hour <= 16) return 80 + Math.sin(hour * 0.4) * 12;
        return 65 + Math.sin(hour * 0.2) * 10;
      }),
      gridUsage: Array.from({length: 24}, (_, hour) => {
        const baseUsage = Math.random() * 2.5 + 0.8;
        if (hour >= 2 && hour <= 6) return baseUsage * 1.2;
        if (hour >= 18 && hour <= 21) return baseUsage * 0.3;
        return baseUsage * 0.7;
      }),
      efficiency: result.optimizedState.batteryEfficiency,
      cost: result.optimizedState.costPerDay
    };
  }

  private generateComparisonData(result: OptimizationResult): any {
    return {
      savings: result.savings,
      improvements: result.improvements,
      timeline: result.timeline
    };
  }
}
