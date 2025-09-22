import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ChartConfiguration, TimelineChartData } from '../models/chart-data.model';
import { OptimizationTimeline } from '../models/optimization-result.model';

@Injectable({
  providedIn: 'root'
})
export class ChartService {

  constructor() {}

  /**
   * Generate timeline charts from optimization data
   */
  generateTimelineCharts(timeline: OptimizationTimeline[]): Observable<TimelineChartData> {
    const labels = timeline.map(t => `${t.hour.toString().padStart(2, '0')}:00`);

    const currentBatteryData = timeline.map(t => t.current.batteryCharge);
    const optimizedBatteryData = timeline.map(t => t.optimized.batteryCharge);
    const currentGridData = timeline.map(t => t.current.gridUsage);
    const optimizedGridData = timeline.map(t => t.optimized.gridUsage);
    const priceData = timeline.map(t => t.current.electricityPrice * 100); // Convert to pence

    const currentChart: ChartConfiguration = {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Battery Charge Level',
            data: currentBatteryData,
            borderColor: '#EF4444',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            fill: true,
            tension: 0.4,
            pointRadius: 3,
            pointHoverRadius: 6,
            borderWidth: 2
          },
          {
            label: 'Grid Usage',
            data: currentGridData,
            borderColor: '#F97316',
            backgroundColor: 'rgba(249, 115, 22, 0.1)',
            fill: false,
            tension: 0.4,
            pointRadius: 2,
            pointHoverRadius: 5,
            borderWidth: 2
          }
        ]
      },
      options: this.getChartOptions('Current System Performance', '#EF4444')
    };

    const optimizedChart: ChartConfiguration = {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Optimized Battery Charge',
            data: optimizedBatteryData,
            borderColor: '#10B981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            fill: true,
            tension: 0.4,
            pointRadius: 3,
            pointHoverRadius: 6,
            borderWidth: 2
          },
          {
            label: 'Optimized Grid Usage',
            data: optimizedGridData,
            borderColor: '#06B6D4',
            backgroundColor: 'rgba(6, 182, 212, 0.1)',
            fill: false,
            tension: 0.4,
            pointRadius: 2,
            pointHoverRadius: 5,
            borderWidth: 2
          }
        ]
      },
      options: this.getChartOptions('Optimized System Performance', '#10B981')
    };

    const comparisonChart: ChartConfiguration = {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Current Battery Level',
            data: currentBatteryData,
            borderColor: '#EF4444',
            backgroundColor: 'rgba(239, 68, 68, 0.05)',
            fill: false,
            tension: 0.4,
            pointRadius: 2,
            borderWidth: 2
          },
          {
            label: 'Optimized Battery Level',
            data: optimizedBatteryData,
            borderColor: '#10B981',
            backgroundColor: 'rgba(16, 185, 129, 0.05)',
            fill: false,
            tension: 0.4,
            pointRadius: 2,
            borderWidth: 3
          },
          {
            label: 'Electricity Price (p/kWh)',
            data: priceData,
            borderColor: '#FBBF24',
            backgroundColor: 'rgba(251, 191, 36, 0.1)',
            fill: true,
            tension: 0.3,
            pointRadius: 1,
            borderWidth: 1
          }
        ]
      },
      options: this.getComparisonChartOptions()
    };

    return of({
      current: currentChart,
      optimized: optimizedChart,
      comparison: comparisonChart
    });
  }

  /**
   * Generate energy distribution pie chart
   */
  generateEnergyDistributionChart(data: any): Observable<ChartConfiguration> {
    return of({
      type: 'doughnut',
      data: {
        labels: ['Solar Direct', 'Battery Storage', 'Grid Import', 'Sold to Grid'],
        datasets: [{
          label: 'Energy Distribution',
          data: [data.solarDirect, data.batteryStorage, data.gridImport, data.gridExport],
          borderColor: '#FFFFFF',
          // Cast backgroundColor to 'any' to satisfy ChartDataset type
          backgroundColor: [
            'rgba(251, 191, 36, 0.8)',
            'rgba(16, 185, 129, 0.8)',
            'rgba(239, 68, 68, 0.8)',
            'rgba(6, 182, 212, 0.8)'
          ] as any,
          fill: true,
          tension: 0.4,
          borderWidth: 2
        }]
      },
      options: this.getDoughnutChartOptions()
    });
  }

  private getChartOptions(title: string, accentColor: string): any {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: title,
          color: '#FFFFFF',
          font: {
            size: 16,
            weight: 'bold'
          }
        },
        legend: {
          labels: {
            color: '#D1D5DB',
            usePointStyle: true,
            padding: 20
          }
        },
        tooltip: {
          backgroundColor: 'rgba(17, 24, 39, 0.9)',
          titleColor: '#FFFFFF',
          bodyColor: '#D1D5DB',
          borderColor: accentColor,
          borderWidth: 1,
          cornerRadius: 8,
          displayColors: true
        }
      },
      scales: {
        x: {
          grid: {
            color: 'rgba(75, 85, 99, 0.3)',
            drawBorder: false
          },
          ticks: {
            color: '#9CA3AF',
            font: {
              size: 11
            }
          },
          title: {
            display: true,
            text: 'Time of Day',
            color: '#D1D5DB'
          }
        },
        y: {
          grid: {
            color: 'rgba(75, 85, 99, 0.3)',
            drawBorder: false
          },
          ticks: {
            color: '#9CA3AF',
            font: {
              size: 11
            }
          },
          title: {
            display: true,
            text: 'Battery Level (%) / Grid Usage (kW)',
            color: '#D1D5DB'
          }
        }
      },
      elements: {
        point: {
          hoverBackgroundColor: accentColor
        }
      }
    };
  }

  private getComparisonChartOptions(): any {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: 'Current vs Optimized Performance',
          color: '#FFFFFF',
          font: {
            size: 18,
            weight: 'bold'
          }
        },
        legend: {
          labels: {
            color: '#D1D5DB',
            usePointStyle: true,
            padding: 20,
            font: {
              size: 12
            }
          }
        },
        tooltip: {
          backgroundColor: 'rgba(17, 24, 39, 0.95)',
          titleColor: '#FFFFFF',
          bodyColor: '#D1D5DB',
          borderColor: '#10B981',
          borderWidth: 1,
          cornerRadius: 8,
          displayColors: true,
          callbacks: {
            afterBody: function(context: any) {
              const dataIndex = context[0].dataIndex;
              const hour = dataIndex;
              if (hour >= 2 && hour <= 6) {
                return ['💡 Optimal charging window', '(Low electricity rates)'];
              } else if (hour >= 18 && hour <= 21) {
                return ['⚡ Peak avoidance period', '(High electricity rates)'];
              }
              return [];
            }
          }
        }
      },
      scales: {
        x: {
          grid: {
            color: 'rgba(75, 85, 99, 0.3)',
            drawBorder: false
          },
          ticks: {
            color: '#9CA3AF',
            font: {
              size: 11
            }
          },
          title: {
            display: true,
            text: 'Time of Day (24h)',
            color: '#D1D5DB',
            font: {
              size: 13,
              weight: 'bold'
            }
          }
        },
        y: {
          grid: {
            color: 'rgba(75, 85, 99, 0.3)',
            drawBorder: false
          },
          ticks: {
            color: '#9CA3AF',
            font: {
              size: 11
            }
          },
          title: {
            display: true,
            text: 'Battery Level (%) / Price (p/kWh)',
            color: '#D1D5DB',
            font: {
              size: 13,
              weight: 'bold'
            }
          }
        }
      },
      elements: {
        point: {
          hoverBackgroundColor: '#10B981'
        }
      }
    };
  }

  private getDoughnutChartOptions(): any {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: 'Energy Distribution',
          color: '#FFFFFF',
          font: {
            size: 16,
            weight: 'bold'
          }
        },
        legend: {
          position: 'right',
          labels: {
            color: '#D1D5DB',
            usePointStyle: true,
            padding: 15,
            font: {
              size: 12
            }
          }
        },
        tooltip: {
          backgroundColor: 'rgba(17, 24, 39, 0.9)',
          titleColor: '#FFFFFF',
          bodyColor: '#D1D5DB',
          borderColor: '#10B981',
          borderWidth: 1,
          cornerRadius: 8,
          callbacks: {
            label: function(context: any) {
              const value = context.parsed;
              const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
              const percentage = ((value / total) * 100).toFixed(1);
              return `${context.label}: ${value} kWh (${percentage}%)`;
            }
          }
        }
      },
      cutout: '60%',
      elements: {
        arc: {
          borderWidth: 2,
          borderColor: '#1F2937'
        }
      }
    };
  }
}
