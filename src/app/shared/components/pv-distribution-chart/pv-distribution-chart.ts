import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { PVDistribution, PVDistributionData } from '../../models/pv-distribution.model';
import { Subscription } from 'rxjs';
import { PVDistributionService } from '../../services/pv-distribution';

@Component({
  selector: 'app-pv-distribution-chart',
  standalone: false,
  templateUrl: './pv-distribution-chart.html',
  styleUrl: './pv-distribution-chart.scss'
})
export class PvDistributionChart implements OnInit, OnDestroy {
  distributionData: PVDistributionData | null = null;
  private subscription = new Subscription();

  constructor(private pvDistributionService: PVDistributionService) {}

  ngOnInit(): void {
    this.subscription.add(
      this.pvDistributionService.getCurrentDistribution().subscribe(data => {
        this.distributionData = data;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  formatNumber(value: number): string {
    return value.toFixed(1);
  }

  formatPercentage(value: number): string {
    return value.toFixed(1);
  }

  trackByDistribution(index: number, distribution: PVDistribution): string {
    return distribution.id;
  }

  getConicGradient(): string {
    if (!this.distributionData) return '';

    let gradientStops: string[] = [];
    let currentPercentage = 0;

    this.distributionData.distributions.forEach(distribution => {
      if (distribution.percentage > 0) {
        gradientStops.push(`${distribution.color} ${currentPercentage}%`);
        currentPercentage += distribution.percentage;
        gradientStops.push(`${distribution.color} ${currentPercentage}%`);
      }
    });

    return `conic-gradient(from 0deg, ${gradientStops.join(', ')})`;
  }
}
