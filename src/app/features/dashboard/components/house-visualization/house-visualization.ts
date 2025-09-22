import { Component, OnDestroy, OnInit } from '@angular/core';
import { BatteryInfo, EnergyFlow, HouseData } from '../../../../shared/models/house-data.model';
import { debounceTime, distinctUntilChanged, interval, Subscription } from 'rxjs';
import { SyntheticDataService } from '../../../../shared/services/synthetic-data';
import { Optimization } from '../../../../shared/services/optimization';


@Component({
  selector: 'app-house-visualization',
  standalone: false,
  templateUrl: './house-visualization.html',
  styleUrl: './house-visualization.scss'
})
export class HouseVisualization implements OnInit, OnDestroy {
  houseData: HouseData = {
    batteryLevel: 78,
    batteryStatus: 'charging',
    solarProduction: 6.5,
    homeConsumption: 3.8,
    gridConnection: 'exporting',
    timestamp: new Date()
  };
   energyFlows: EnergyFlow[] = [];
  //batteryInfo: BatteryInfo = this.getInitialBatteryInfo();
  isOptimized = false;
  isTransitioning = false;
  optimizationProgress = 0;

  isOptimizing = false;
  showOptimizationButton = true;

  private subscription = new Subscription();

  private animationFrame!: number;

  constructor(
    private syntheticDataService: SyntheticDataService,
    private optimizationService: Optimization
  ) {}

  ngOnInit(): void {

    this.initializeEnergyFlows();
    this.startAnimation();

    // Update data every 12 seconds
    this.subscription.add(
      interval(12000).subscribe(() => {
        this.updateHouseData();
      })
    );

    // Update flows every 3 seconds for smooth animation
    this.subscription.add(
      interval(3000).subscribe(() => {
        this.updateEnergyFlows();
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
  }
private initializeEnergyFlows(): void {
    this.energyFlows = [
      {
        id: 'solar-to-house',
        from: { x: 50, y: 30 }, // Solar panels position
        to: { x: 50, y: 60 },   // House center
        color: '#fbbf24',
        isActive: true,
        type: 'solar',
        particles: this.createParticles(8)
      },
      {
        id: 'battery-to-house',
        from: { x: 80, y: 70 }, // Battery position
        to: { x: 50, y: 60 },   // House center
        color: '#10b981',
        isActive: true,
        type: 'battery',
        particles: this.createParticles(6)
      },
      {
        id: 'house-to-grid',
        from: { x: 50, y: 60 }, // House center
        to: { x: 10, y: 40 },   // Grid connection
        color: '#06b6d4',
        isActive: true,
        type: 'grid',
        particles: this.createParticles(5)
      }
    ];
  }

  private createParticles(count: number): Array<{ x: number; y: number; progress: number; delay: number }> {
    const particles = [];
    for (let i = 0; i < count; i++) {
      particles.push({
        x: 0,
        y: 0,
        progress: (i / count),
        delay: i * 0.2
      });
    }
    return particles;
  }

  private startAnimation(): void {
    const animate = () => {
      this.updateParticlePositions();
      this.animationFrame = requestAnimationFrame(animate);
    };
    animate();
  }

  private updateParticlePositions(): void {
    this.energyFlows.forEach(flow => {
      if (this.shouldFlowBeActive(flow.type)) {
        flow.isActive = true;
        flow.particles.forEach(particle => {
          particle.progress += 0.008; // Animation speed
          if (particle.progress > 1) {
            particle.progress = 0;
          }

          // Calculate position along the flow path
          const t = particle.progress;
          particle.x = flow.from.x + (flow.to.x - flow.from.x) * t;
          particle.y = flow.from.y + (flow.to.y - flow.from.y) * t;
        });
      } else {
        flow.isActive = false;
      }
    });
  }

  private shouldFlowBeActive(type: 'solar' | 'battery' | 'grid'): boolean {
    switch (type) {
      case 'solar':
        return this.houseData.solarProduction > 0;
      case 'battery':
        return this.houseData.batteryStatus !== 'idle';
      case 'grid':
        return this.houseData.gridConnection !== 'idle';
      default:
        return false;
    }
  }

  private updateEnergyFlows(): void {
    // Update flow directions based on current data
    const batteryFlow = this.energyFlows.find(f => f.id === 'battery-to-house');
    const gridFlow = this.energyFlows.find(f => f.id === 'house-to-grid');

    if (batteryFlow) {
      if (this.houseData.batteryStatus === 'charging') {
        // Solar to battery
        batteryFlow.from = { x: 50, y: 30 };
        batteryFlow.to = { x: 80, y: 70 };
        batteryFlow.color = '#10b981';
      } else if (this.houseData.batteryStatus === 'discharging') {
        // Battery to house
        batteryFlow.from = { x: 80, y: 70 };
        batteryFlow.to = { x: 50, y: 60 };
        batteryFlow.color = '#f97316';
      }
    }

    if (gridFlow) {
      if (this.houseData.gridConnection === 'importing') {
        // Grid to house
        gridFlow.from = { x: 10, y: 40 };
        gridFlow.to = { x: 50, y: 60 };
        gridFlow.color = '#ef4444';
      } else if (this.houseData.gridConnection === 'exporting') {
        // House to grid
        gridFlow.from = { x: 50, y: 60 };
        gridFlow.to = { x: 10, y: 40 };
        gridFlow.color = '#10b981';
      }
    }
  }

  private updateHouseData(): void {
    const hour = new Date().getHours();

    this.houseData = {
      ...this.houseData,
      batteryLevel: Math.round(Math.max(10, Math.min(95, this.houseData.batteryLevel + (Math.random() * 10 - 5))) * 100) / 100,
      batteryStatus: this.getRandomBatteryStatus(),
      solarProduction: this.getSolarProduction(hour),
      homeConsumption: Math.round((3.2 + Math.random() * 2) * 10) / 10,
      gridConnection: this.getGridConnection(),
      timestamp: new Date()
    };
  }

  private getRandomBatteryStatus(): 'charging' | 'discharging' | 'idle' {
    const hour = new Date().getHours();
    if (hour >= 9 && hour <= 16 && this.houseData.solarProduction > 3) {
      return Math.random() > 0.3 ? 'charging' : 'idle';
    } else if (hour >= 17 && hour <= 22) {
      return Math.random() > 0.4 ? 'discharging' : 'idle';
    }
    return 'idle';
  }

  private getSolarProduction(hour: number): number {
    if (hour >= 6 && hour <= 18) {
      const peak = 12;
      const distance = Math.abs(hour - peak);
      const multiplier = Math.max(0.1, 1 - (distance / 6) * 0.8);
      return Math.round((8 * multiplier + Math.random() * 2) * 10) / 10;
    }
    return 0;
  }

  private getGridConnection(): 'importing' | 'exporting' | 'idle' {
    const solar = this.houseData.solarProduction;
    const consumption = this.houseData.homeConsumption;

    if (solar > consumption + 1) {
      return 'exporting';
    } else if (consumption > solar + 1) {
      return 'importing';
    }
    return 'idle';
  }

  getBatteryStatusColor(): string {
    switch (this.houseData.batteryStatus) {
      case 'charging': return 'text-green-400';
      case 'discharging': return 'text-orange-400';
      default: return 'text-gray-400';
    }
  }

  getBatteryStatusIcon(): string {
    switch (this.houseData.batteryStatus) {
      case 'charging': return 'M5 10l7-7m0 0l7 7m-7-7v18';
      case 'discharging': return 'M19 14l-7 7m0 0l-7-7m7 7V3';
      default: return 'M20 12H4';
    }
  }

  getGridStatusColor(): string {
    switch (this.houseData.gridConnection) {
      case 'exporting': return 'text-green-400';
      case 'importing': return 'text-red-400';
      default: return 'text-gray-400';
    }
  }

  getSelfSufficiency(): number {
    if (this.houseData.homeConsumption === 0) return 100;
    return Math.max(0, Math.min(100, (this.houseData.solarProduction / this.houseData.homeConsumption * 100)));
  }

  getHomeConsumptionWidth(): number {
    return Math.min(100, (this.houseData.homeConsumption / 8) * 100);
  }
  trackByParticle(index: number, particle: any): number {
    return index;
  }
}
