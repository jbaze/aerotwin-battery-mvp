
import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { debounceTime, distinctUntilChanged, Subscription } from 'rxjs';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { Optimization } from '../../../../shared/services/optimization';

// Register Chart.js components
Chart.register(...registerables);

@Component({
  selector: 'app-energy-chart',
  standalone: false,
  templateUrl: './energy-chart.html',
  styleUrl: './energy-chart.scss'
})
export class EnergyChart  implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('chartCanvas', { static: true }) chartCanvas!: ElementRef<HTMLCanvasElement>;

  activeView: 'current' | 'optimized' | 'comparison' | 'distribution' = 'current';
  isOptimized = false;
  isTransitioning = false;
  chart: any;

  private subscription = new Subscription();

  constructor(private optimizationService: Optimization) {}

  ngOnInit(): void {
    this.subscription.add(
      this.optimizationService.optimizationState$.pipe(
        debounceTime(100),
        distinctUntilChanged((prev, curr) => prev?.isApplied === curr?.isApplied)
      ).subscribe(result => {
        const wasOptimized = this.isOptimized;
        this.isOptimized = result?.isApplied || false;
        if (!wasOptimized && this.isOptimized) {
          this.triggerOptimizationTransition();
        } else if (wasOptimized && !this.isOptimized) {
          this.activeView = 'current';
          this.updateChart();
        }
      })
    );
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.initializeChart();
    }, 1000);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    if (this.chart) {
      this.chart.destroy();
    }
  }

  private triggerOptimizationTransition(): void {
    this.isTransitioning = true;

    // Show transition effect
    setTimeout(() => {
      this.activeView = 'comparison';
      this.updateChart();
      this.isTransitioning = false;
    }, 1000);
  }

  setActiveView(view: 'current' | 'optimized' | 'comparison' | 'distribution'): void {
    this.activeView = view;
    this.updateChart();
  }

  private initializeChart(): void {
    if (typeof (window as any).Chart === 'undefined') {
      console.log('Chart.js not available, using CSS charts');
      return;
    }

    try {
      const ctx = this.chartCanvas.nativeElement.getContext('2d');
      if (!ctx) return;

      this.chart = new (window as any).Chart(ctx, this.getChartConfig());
      console.log('Chart initialized successfully');
    } catch (error) {
      console.error('Error initializing chart:', error);
    }
  }

  private updateChart(): void {
    if (this.chart) {
      const config = this.getChartConfig();
      this.chart.data = config.data;
      this.chart.options = config.options;
      this.chart.update('active');
    } else {
      this.initializeChart();
    }
  }

  private getChartConfig(): any {
    const hours = Array.from({length: 24}, (_, i) => `${i.toString().padStart(2, '0')}:00`);

    switch (this.activeView) {
      case 'current':
        return this.getCurrentChartConfig(hours);
      case 'optimized':
        return this.getOptimizedChartConfig(hours);
      case 'comparison':
        return this.getComparisonChartConfig(hours);
      case 'distribution':
        return this.getDistributionChartConfig();
      default:
        return this.getCurrentChartConfig(hours);
    }
  }

  private generateCurrentData(): number[] {
    // Suboptimal battery pattern
    return Array.from({length: 24}, (_, hour) => {
      return 50 + Math.sin(hour * 0.3) * 20 + Math.random() * 10;
    });
  }

  private generateOptimizedData(): number[] {
    // Optimized battery pattern
    return Array.from({length: 24}, (_, hour) => {
      if (hour >= 2 && hour <= 6) {
        return 30 + (hour - 2) * 15; // Charge during cheap hours
      } else if (hour >= 18 && hour <= 21) {
        return 90 - (hour - 18) * 20; // Discharge during expensive hours
      }
      return 60 + Math.sin(hour * 0.2) * 15;
    });
  }

  private getBasicOptions(title: string): any {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: title,
          color: '#FFFFFF',
          font: { size: 16, weight: 'bold' }
        },
        legend: {
          labels: { color: '#D1D5DB' }
        }
      },
      scales: {
        x: {
          grid: { color: 'rgba(75, 85, 99, 0.3)' },
          ticks: { color: '#9CA3AF' },
          title: { display: true, text: 'Time of Day', color: '#D1D5DB' }
        },
        y: {
          grid: { color: 'rgba(75, 85, 99, 0.3)' },
          ticks: { color: '#9CA3AF' },
          title: { display: true, text: 'Battery Level (%)', color: '#D1D5DB' }
        }
      }
    };
  }

  private getDoughnutOptions(): any {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: 'Energy Distribution',
          color: '#FFFFFF',
          font: { size: 16, weight: 'bold' }
        },
        legend: {
          position: 'right',
          labels: { color: '#D1D5DB' }
        }
      },
      cutout: '60%'
    };
  }

  private showFallbackChart(): void {
    // Create a simple fallback visualization using canvas
    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#374151';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Chart Loading...', ctx.canvas.width / 2, ctx.canvas.height / 2);

    ctx.fillStyle = '#9CA3AF';
    ctx.font = '12px Arial';
    ctx.fillText('Please check Chart.js installation', ctx.canvas.width / 2, ctx.canvas.height / 2 + 30);
  }

  private getCurrentChartConfig(hours: string[]): any {
    return {
      type: 'line',
      data: {
        labels: hours,
        datasets: [{
          label: 'Current Battery Level (%)',
          data: this.generateCurrentBatteryData(),
          borderColor: this.isOptimized ? '#EF4444' : '#EF4444',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          fill: true,
          tension: 0.4,
          pointRadius: 2,
          borderWidth: 2
        }, {
          label: 'Grid Usage (kW)',
          data: this.generateCurrentGridData(),
          borderColor: '#F97316',
          backgroundColor: 'rgba(249, 115, 22, 0.1)',
          fill: false,
          tension: 0.4,
          pointRadius: 1,
          borderWidth: 2
        }]
      },
      options: this.getBasicChartOptions('Current System Performance', '#EF4444')
    };
  }

  private getOptimizedChartConfig(hours: string[]): any {
    return {
      type: 'line',
      data: {
        labels: hours,
        datasets: [{
          label: 'Optimized Battery Level (%)',
          data: this.generateOptimizedBatteryData(),
          borderColor: '#10B981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          fill: true,
          tension: 0.4,
          pointRadius: 2,
          borderWidth: 3
        }, {
          label: 'Smart Grid Usage (kW)',
          data: this.generateOptimizedGridData(),
          borderColor: '#06B6D4',
          backgroundColor: 'rgba(6, 182, 212, 0.1)',
          fill: false,
          tension: 0.4,
          pointRadius: 1,
          borderWidth: 2
        }]
      },
      options: this.getBasicChartOptions('AeroTwin Optimized Performance', '#10B981')
    };
  }

  private getComparisonChartConfig(hours: string[]): any {
    return {
      type: 'line',
      data: {
        labels: hours,
        datasets: [{
          label: 'Current Battery (Suboptimal)',
          data: this.generateCurrentBatteryData(),
          borderColor: '#EF4444',
          backgroundColor: 'rgba(239, 68, 68, 0.05)',
          fill: false,
          tension: 0.4,
          pointRadius: 2,
          borderWidth: 2,
          borderDash: this.isOptimized ? [5, 5] : []
        }, {
          label: 'AeroTwin Optimized',
          data: this.generateOptimizedBatteryData(),
          borderColor: '#10B981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          fill: '+1',
          tension: 0.4,
          pointRadius: 2,
          borderWidth: 3
        }, {
          label: 'Electricity Price (p/kWh)',
          data: this.generatePriceData(),
          borderColor: '#FBBF24',
          backgroundColor: 'rgba(251, 191, 36, 0.1)',
          fill: false,
          tension: 0.3,
          pointRadius: 1,
          borderWidth: 1,
          yAxisID: 'price'
        }]
      },
      options: this.getComparisonChartOptions()
    };
  }

  private getDistributionChartConfig(): any {
    const currentData = [27.9, 20.7, 157.6, 143.6];
    const optimizedData = [33.5, 31.2, 94.6, 172.3]; // Improved distribution

    return {
      type: 'doughnut',
      data: {
        labels: ['Solar Direct', 'Battery Storage', 'Grid Import', 'Sold to Grid'],
        datasets: [{
          label: this.isOptimized ? 'Optimized Distribution' : 'Current Distribution',
          data: this.isOptimized ? optimizedData : currentData,
          backgroundColor: [
            '#FBBF24', // Solar - Yellow
            '#10B981', // Battery - Green
            this.isOptimized ? '#F59E0B' : '#EF4444', // Grid Import - Orange/Red
            '#06B6D4'  // Grid Export - Cyan
          ],
          borderColor: [
            '#F59E0B',
            '#059669',
            this.isOptimized ? '#D97706' : '#DC2626',
            '#0891B2'
          ],
          borderWidth: 2
        }]
      },
      options: this.getDoughnutChartOptions()
    };
  }

  private generateCurrentBatteryData(): number[] {
    // Suboptimal pattern - random charging
    return Array.from({length: 24}, (_, hour) => {
      return Math.max(20, Math.min(85, 50 + Math.sin(hour * 0.3) * 20 + Math.random() * 15));
    });
  }

  private generateOptimizedBatteryData(): number[] {
    // Optimized pattern - strategic charging
    return Array.from({length: 24}, (_, hour) => {
      if (hour >= 2 && hour <= 6) {
        return Math.min(95, 25 + (hour - 2) * 17); // Smart charging 2am-6am
      } else if (hour >= 18 && hour <= 21) {
        return Math.max(30, 95 - (hour - 18) * 18); // Strategic discharge 6pm-9pm
      } else if (hour >= 10 && hour <= 16) {
        return 80 + Math.sin(hour * 0.4) * 12; // Solar optimization
      }
      return 65 + Math.sin(hour * 0.2) * 10;
    });
  }

  private generateCurrentGridData(): number[] {
    return Array.from({length: 24}, () => Math.random() * 2.5 + 0.8);
  }

  private generateOptimizedGridData(): number[] {
    return this.generateCurrentGridData().map((val, hour) => {
      // Reduce grid usage during optimization
      if (hour >= 2 && hour <= 6) return val * 1.2; // Slightly more during cheap charging
      if (hour >= 18 && hour <= 21) return val * 0.3; // Much less during expensive hours
      return val * 0.7; // Generally reduced
    });
  }

  private generatePriceData(): number[] {
    return Array.from({length: 24}, (_, hour) => {
      if (hour >= 18 && hour <= 21 || hour >= 7 && hour <= 9) {
        return 35 + Math.random() * 8; // Peak pricing
      } else if (hour >= 2 && hour <= 6) {
        return 8 + Math.random() * 4; // Off-peak pricing
      }
      return 15 + Math.random() * 8; // Standard pricing
    });
  }

  private getBasicChartOptions(title: string, accentColor: string): any {
    return {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: this.isTransitioning ? 2000 : 1000,
        easing: 'easeInOutQuart'
      },
      plugins: {
        title: {
          display: true,
          text: title,
          color: '#FFFFFF',
          font: { size: 16, weight: 'bold' }
        },
        legend: {
          labels: {
            color: '#D1D5DB',
            usePointStyle: true,
            padding: 15
          }
        },
        tooltip: {
          backgroundColor: 'rgba(17, 24, 39, 0.95)',
          titleColor: '#FFFFFF',
          bodyColor: '#D1D5DB',
          borderColor: accentColor,
          borderWidth: 1,
          cornerRadius: 8,
          callbacks: {
            afterBody: this.isOptimized && this.activeView === 'optimized' ?
              function(context: any) {
                const hour = context[0].dataIndex;
                if (hour >= 2 && hour <= 6) {
                  return ['🌙 Optimal charging window', '(Low electricity rates)'];
                } else if (hour >= 18 && hour <= 21) {
                  return ['⚡ Peak avoidance active', '(High electricity rates)'];
                }
                return [];
              } : undefined
          }
        }
      },
      scales: {
        x: {
          grid: { color: 'rgba(75, 85, 99, 0.3)' },
          ticks: { color: '#9CA3AF' },
          title: { display: true, text: 'Time of Day', color: '#D1D5DB' }
        },
        y: {
          grid: { color: 'rgba(75, 85, 99, 0.3)' },
          ticks: { color: '#9CA3AF' },
          title: { display: true, text: 'Battery Level (%) / Grid Usage (kW)', color: '#D1D5DB' }
        }
      }
    };
  }

  private getComparisonChartOptions(): any {
    return {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 2000,
        easing: 'easeInOutQuart'
      },
      plugins: {
        title: {
          display: true,
          text: this.isOptimized ? 'AeroTwin Optimization Impact' : 'Current vs Optimized Performance',
          color: this.isOptimized ? '#10B981' : '#FFFFFF',
          font: { size: 18, weight: 'bold' }
        },
        legend: {
          labels: {
            color: '#D1D5DB',
            usePointStyle: true,
            padding: 20,
            font: { size: 12 }
          }
        },
        tooltip: {
          backgroundColor: 'rgba(17, 24, 39, 0.95)',
          titleColor: '#FFFFFF',
          bodyColor: '#D1D5DB',
          borderColor: '#10B981',
          borderWidth: 1,
          cornerRadius: 8,
          callbacks: {
            afterBody: function(context: any) {
              const hour = context[0].dataIndex;
              const improvements = [
                '💡 Smart charging optimization',
                '⚡ Peak rate avoidance',
                '🔋 Battery efficiency boost',
                '💰 Cost reduction active'
              ];
              if (hour >= 2 && hour <= 6) {
                return [improvements[0], '(Charging at lowest rates)'];
              } else if (hour >= 18 && hour <= 21) {
                return [improvements[1], '(Avoiding peak pricing)'];
              } else if (hour >= 10 && hour <= 16) {
                return [improvements[2], '(Solar optimization)'];
              }
              return [improvements[3]];
            }
          }
        }
      },
      scales: {
        x: {
          grid: { color: 'rgba(75, 85, 99, 0.3)' },
          ticks: { color: '#9CA3AF' },
          title: { display: true, text: 'Time of Day (24h)', color: '#D1D5DB' }
        },
        y: {
          type: 'linear',
          display: true,
          position: 'left',
          grid: { color: 'rgba(75, 85, 99, 0.3)' },
          ticks: { color: '#9CA3AF' },
          title: { display: true, text: 'Battery Level (%)', color: '#D1D5DB' }
        },
        price: {
          type: 'linear',
          display: true,
          position: 'right',
          grid: { drawOnChartArea: false },
          ticks: { color: '#F59E0B' },
          title: { display: true, text: 'Price (p/kWh)', color: '#F59E0B' }
        }
      }
    };
  }

  private getDoughnutChartOptions(): any {
    return {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: this.isTransitioning ? 2000 : 1000,
        easing: 'easeInOutQuart'
      },
      plugins: {
        title: {
          display: true,
          text: this.isOptimized ? 'Optimized Energy Distribution' : 'Current Energy Distribution',
          color: this.isOptimized ? '#10B981' : '#FFFFFF',
          font: { size: 16, weight: 'bold' }
        },
        legend: {
          position: 'right',
          labels: {
            color: '#D1D5DB',
            usePointStyle: true,
            padding: 15,
            font: { size: 12 }
          }
        },
        tooltip: {
          backgroundColor: 'rgba(17, 24, 39, 0.95)',
          titleColor: '#FFFFFF',
          bodyColor: '#D1D5DB',
          borderColor: this.isOptimized ? '#10B981' : '#6B7280',
          borderWidth: 1,
          cornerRadius: 8,
          callbacks: {
            label: function(context: any) {
              const value = context.parsed;
              const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
              const percentage = ((value / total) * 100).toFixed(1);
              return `${context.label}: ${value} kWh (${percentage}%)`;
            },
            afterLabel: (context: any) => {
              if (!this.isOptimized) return '';
              const improvements = {
                0: '+20% solar utilization',
                1: '+51% battery efficiency',
                2: '-40% grid dependency',
                3: '+20% export revenue'
              };
              return improvements[context.dataIndex as keyof typeof improvements] || '';
            }
          }
        }
      },
      cutout: '60%'
    };
  }

  // Chart status methods
  getChartTitle(): string {
    const titles = {
      current: 'Current System Performance',
      optimized: this.isOptimized ? 'AeroTwin Optimized Performance' : 'Projected Optimized Performance',
      comparison: this.isOptimized ? 'Optimization Impact Analysis' : 'Current vs Optimized Potential',
      distribution: this.isOptimized ? 'Optimized Energy Distribution' : 'Current Energy Distribution'
    };
    return titles[this.activeView];
  }

  getChartDescription(): string {
    const descriptions = {
      current: this.isOptimized ?
        'Previous suboptimal charging patterns before AeroTwin optimization' :
        'Current system shows suboptimal charging patterns and higher grid dependency',
      optimized: this.isOptimized ?
        'AeroTwin Intelligence active - charges during low-cost hours, avoids peak pricing' :
        'Projected performance with smart charging during low-cost hours (2am-6am)',
      comparison: this.isOptimized ?
        '🔥 Live comparison showing AeroTwin optimization impact with 20.8% efficiency gain' :
        '🔥 Potential impact: Green line shows 20% more efficient battery usage patterns',
      distribution: this.isOptimized ?
        'Optimized energy allocation with +20% export revenue and -40% grid dependency' :
        'Current energy flow distribution showing optimization potential'
    };
    return descriptions[this.activeView];
  }

  getOptimizationInsights(): any[] {
    if (!this.isOptimized) return [];

    return [
      {
        icon: '🌙',
        title: 'Night Optimization (2am-6am)',
        description: 'Smart charging during cheapest electricity rates',
        improvement: '+40% charging efficiency',
        color: 'text-blue-400'
      },
      {
        icon: '⚡',
        title: 'Peak Avoidance (6pm-9pm)',
        description: 'Using battery power instead of expensive grid electricity',
        improvement: '-60% peak hour usage',
        color: 'text-orange-400'
      },
      {
        icon: '💰',
        title: 'Revenue Optimization',
        description: 'Maximizing energy sales during high-price periods',
        improvement: '+20% export income',
        color: 'text-green-400'
      }
    ];
  }
}
