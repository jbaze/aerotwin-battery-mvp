import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { EnergyMetric } from '../../models/energy-metrics.model';
import { Subscription } from 'rxjs';
import { Optimization } from '../../services/optimization';

@Component({
  selector: 'app-metric-card',
  standalone: false,
  templateUrl: './metric-card.html',
  styleUrl: './metric-card.scss'
})
export class MetricCard implements OnInit, OnDestroy {
  @Input() metric!: EnergyMetric;
  @Input() isAnimated: boolean = true;

  isOptimized = false;
  private subscription = new Subscription();

  constructor(private optimizationService: Optimization) {}

  ngOnInit(): void {
    // Listen for optimization state changes
    this.subscription.add(
      this.optimizationService.optimizationState$.subscribe(result => {
        this.isOptimized = result?.isApplied || false;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  getIconClass(iconType: string): string {
  const icons: { [key: string]: string } = {
    solar: 'fas fa-sun',
    home: 'fas fa-home',
    'battery-down': 'fas fa-battery-quarter',
    'battery-up': 'fas fa-battery-full',
    'grid-down': 'fas fa-plug',
    'grid-up': 'fas fa-bolt'
  };
  return icons[iconType] || icons['home'];
}
  getIconSvg(iconType: string): string {
    const icons: { [key: string]: string } = {
      'solar': `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/>`,
      'home': `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>`,
      'battery-down': `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"/>`,
      'battery-up': `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18"/>`,
      'grid-down': `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"/>`,
      'grid-up': `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>`
    };
    return icons[iconType] || icons['home'];
  }

  getTrendIcon(trend: string): string {
    switch (trend) {
      case 'up':
        return `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>`;
      case 'down':
        return `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"/>`;
      default:
        return `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"/>`;
    }
  }

  getTrendColor(trend: string): string {
    if (this.isOptimized) {
      return 'text-green-400';
    }

    switch (trend) {
      case 'up':
        return 'text-green-400';
      case 'down':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  }

  getCardClasses(): string {
    const baseClasses = 'bg-gray-800 border border-gray-700 rounded-xl p-6 hover:border-gray-600 transition-colors duration-300 hover:shadow-lg group relative';

    if (this.isOptimized) {
      return `${baseClasses} border-green-500 border-opacity-50`;
    }

    return baseClasses;
  }

  getOptimizationBadge(): string | null {
    if (!this.isOptimized) return null;

    const improvements: { [key: string]: string } = {
      'battery-discharge': '20% Reduced',
      'battery-charge': '20% More Efficient',
      'grid-import': '40% Reduced',
      'grid-export': '20% Increased',
      'home-consumption': '8% More Efficient'
    };

    return improvements[this.metric.id] || 'Optimized';
  }
}
