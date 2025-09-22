import { Component, ElementRef, ViewChild } from '@angular/core';
import { ChartConfig, EnergyFlowData, HourlyEnergyFlow } from '../../models/energy-flow.model';
import { EnergyFlowChartService } from '../../services/energy-flow-chart';
import { combineLatest, Subscription } from 'rxjs';

@Component({
  selector: 'app-energy-flow-chart',
  standalone: false,
  templateUrl: './energy-flow-chart.html',
  styleUrl: './energy-flow-chart.scss'
})
export class EnergyFlowChart {

@ViewChild('chartSvg', { static: false }) chartSvg!: ElementRef<SVGElement>;

  energyFlowData: EnergyFlowData | null = null;
  chartConfig: ChartConfig | null = null;
  private subscription = new Subscription();

  // Chart dimensions
  chartWidth = 600;
  chartHeight = 300;
  margin = { top: 20, right: 80, bottom: 40, left: 60 };

  constructor(private energyFlowService: EnergyFlowChartService) {}

  ngOnInit(): void {
    this.subscription.add(
      combineLatest([
        this.energyFlowService.getCurrentEnergyFlow(),
        this.energyFlowService.chartConfig$
      ]).subscribe(([energyData, config]) => {
        this.energyFlowData = energyData;
        this.chartConfig = config;
        this.updateChart();
      })
    );
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.initializeChart();
    }, 100);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private initializeChart(): void {
    if (this.chartSvg && this.chartSvg.nativeElement) {
      // Clear any existing content
      this.chartSvg.nativeElement.innerHTML = '';
      this.updateChart();
    }
  }

  private updateChart(): void {
    if (!this.energyFlowData || !this.chartConfig || !this.chartSvg?.nativeElement) {
      return;
    }

    const svg = this.chartSvg.nativeElement;
    svg.innerHTML = ''; // Clear previous chart

    const data = this.energyFlowData.hourlyData;
    const innerWidth = this.chartWidth - this.margin.left - this.margin.right;
    const innerHeight = this.chartHeight - this.margin.top - this.margin.bottom;

    // Create main group
    const g = this.createSVGElement('g');
    g.setAttribute('transform', `translate(${this.margin.left},${this.margin.top})`);
    svg.appendChild(g);

    // Calculate scales
    const xScale = this.createXScale(innerWidth);
    const yScale = this.createYScale(data, innerHeight);

    // Draw grid
    this.drawGrid(g, xScale, yScale, innerWidth, innerHeight);

    // Draw axes
    this.drawAxes(g, xScale, yScale, innerWidth, innerHeight);

    // Draw data lines
    this.drawDataLines(g, data, xScale, yScale);

    // Draw current time indicator
    this.drawCurrentTimeIndicator(g, xScale, innerHeight);

    // Draw legend
    this.drawLegend(g, innerWidth, innerHeight);
  }

  private createXScale(width: number): (hour: number) => number {
    return (hour: number) => (hour / 23) * width;
  }

  private createYScale(data: HourlyEnergyFlow[], height: number): (value: number) => number {
    const maxValue = Math.max(
      ...data.map(d => Math.max(d.solarProduction, d.homeConsumption, d.batteryLevel / 10))
    );
    const minValue = Math.min(0, ...data.map(d => d.gridUsage));

    return (value: number) => height - ((value - minValue) / (maxValue - minValue)) * height;
  }

  private drawGrid(g: SVGElement, xScale: Function, yScale: Function, width: number, height: number): void {
    // Vertical grid lines (hours)
    for (let hour = 0; hour <= 24; hour += 4) {
      const line = this.createSVGElement('line');
      line.setAttribute('x1', xScale(hour).toString());
      line.setAttribute('y1', '0');
      line.setAttribute('x2', xScale(hour).toString());
      line.setAttribute('y2', height.toString());
      line.setAttribute('stroke', '#374151');
      line.setAttribute('stroke-width', '1');
      line.setAttribute('opacity', '0.3');
      g.appendChild(line);
    }

    // Horizontal grid lines
    for (let i = 0; i <= 5; i++) {
      const y = (height / 5) * i;
      const line = this.createSVGElement('line');
      line.setAttribute('x1', '0');
      line.setAttribute('y1', y.toString());
      line.setAttribute('x2', width.toString());
      line.setAttribute('y2', y.toString());
      line.setAttribute('stroke', '#374151');
      line.setAttribute('stroke-width', '1');
      line.setAttribute('opacity', '0.3');
      g.appendChild(line);
    }
  }

  private drawAxes(g: SVGElement, xScale: Function, yScale: Function, width: number, height: number): void {
    // X-axis
    const xAxis = this.createSVGElement('line');
    xAxis.setAttribute('x1', '0');
    xAxis.setAttribute('y1', height.toString());
    xAxis.setAttribute('x2', width.toString());
    xAxis.setAttribute('y2', height.toString());
    xAxis.setAttribute('stroke', '#6B7280');
    xAxis.setAttribute('stroke-width', '2');
    g.appendChild(xAxis);

    // Y-axis
    const yAxis = this.createSVGElement('line');
    yAxis.setAttribute('x1', '0');
    yAxis.setAttribute('y1', '0');
    yAxis.setAttribute('x2', '0');
    yAxis.setAttribute('y2', height.toString());
    yAxis.setAttribute('stroke', '#6B7280');
    yAxis.setAttribute('stroke-width', '2');
    g.appendChild(yAxis);

    // X-axis labels (hours)
    for (let hour = 0; hour <= 24; hour += 6) {
      const text = this.createSVGElement('text');
      text.setAttribute('x', xScale(hour).toString());
      text.setAttribute('y', (height + 20).toString());
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('fill', '#9CA3AF');
      text.setAttribute('font-size', '12');
      text.textContent = `${hour.toString().padStart(2, '0')}:00`;
      g.appendChild(text);
    }
  }

  private drawDataLines(g: SVGElement, data: HourlyEnergyFlow[], xScale: Function, yScale: Function): void {
    if (!this.chartConfig) return;

    const lineConfigs = [
      {
        key: 'solarProduction',
        color: '#F59E0B',
        enabled: this.chartConfig.showSolar,
        label: 'Solar'
      },
      {
        key: 'homeConsumption',
        color: '#3B82F6',
        enabled: this.chartConfig.showConsumption,
        label: 'Consumption'
      },
      {
        key: 'batteryLevel',
        color: '#10B981',
        enabled: this.chartConfig.showBattery,
        label: 'Battery %',
        scale: 0.1 // Scale battery level from 0-100 to 0-10
      },
      {
        key: 'gridUsage',
        color: '#EF4444',
        enabled: this.chartConfig.showGrid,
        label: 'Grid'
      }
    ];

    lineConfigs.forEach(config => {
      if (config.enabled) {
        this.drawLine(g, data, xScale, yScale, config);
      }
    });
  }

  private drawLine(g: SVGElement, data: HourlyEnergyFlow[], xScale: Function, yScale: Function, config: any): void {
    const path = this.createSVGElement('path');
    let pathData = '';

    data.forEach((point, index) => {
      const x = xScale(point.hour);
      const value = config.scale ? (point as any)[config.key] * config.scale : (point as any)[config.key];
      const y = yScale(value);

      if (index === 0) {
        pathData += `M ${x} ${y}`;
      } else {
        pathData += ` L ${x} ${y}`;
      }
    });

    path.setAttribute('d', pathData);
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', config.color);
    path.setAttribute('stroke-width', '2');
    path.setAttribute('stroke-linecap', 'round');
    path.setAttribute('stroke-linejoin', 'round');
    g.appendChild(path);

    // Add data points
    data.forEach(point => {
      const circle = this.createSVGElement('circle');
      const x = xScale(point.hour);
      const value = config.scale ? (point as any)[config.key] * config.scale : (point as any)[config.key];
      const y = yScale(value);

      circle.setAttribute('cx', x.toString());
      circle.setAttribute('cy', y.toString());
      circle.setAttribute('r', '3');
      circle.setAttribute('fill', config.color);
      circle.setAttribute('stroke', '#1F2937');
      circle.setAttribute('stroke-width', '1');
      g.appendChild(circle);
    });
  }

  private drawCurrentTimeIndicator(g: SVGElement, xScale: Function, height: number): void {
    if (!this.energyFlowData) return;

    const currentHour = this.energyFlowData.currentHour;
    const x = xScale(currentHour);

    // Current time line
    const line = this.createSVGElement('line');
    line.setAttribute('x1', x.toString());
    line.setAttribute('y1', '0');
    line.setAttribute('x2', x.toString());
    line.setAttribute('y2', height.toString());
    line.setAttribute('stroke', '#06B6D4');
    line.setAttribute('stroke-width', '2');
    line.setAttribute('stroke-dasharray', '5,5');
    g.appendChild(line);

    // Current time label
    const text = this.createSVGElement('text');
    text.setAttribute('x', (x + 5).toString());
    text.setAttribute('y', '15');
    text.setAttribute('fill', '#06B6D4');
    text.setAttribute('font-size', '12');
    text.setAttribute('font-weight', 'bold');
    text.textContent = 'Now';
    g.appendChild(text);
  }

  private drawLegend(g: SVGElement, width: number, height: number): void {
    if (!this.chartConfig) return;

    const legendItems = [
      { label: 'Solar', color: '#F59E0B', enabled: this.chartConfig.showSolar },
      { label: 'Consumption', color: '#3B82F6', enabled: this.chartConfig.showConsumption },
      { label: 'Battery %', color: '#10B981', enabled: this.chartConfig.showBattery },
      { label: 'Grid', color: '#EF4444', enabled: this.chartConfig.showGrid }
    ].filter(item => item.enabled);

    legendItems.forEach((item, index) => {
      const y = -10;
      const x = width - 150 + (index * 35);

      // Legend color box
      const rect = this.createSVGElement('rect');
      rect.setAttribute('x', x.toString());
      rect.setAttribute('y', y.toString());
      rect.setAttribute('width', '12');
      rect.setAttribute('height', '12');
      rect.setAttribute('fill', item.color);
      g.appendChild(rect);

      // Legend text
      const text = this.createSVGElement('text');
      text.setAttribute('x', (x + 15).toString());
      text.setAttribute('y', (y + 9).toString());
      text.setAttribute('fill', '#9CA3AF');
      text.setAttribute('font-size', '10');
      text.textContent = item.label;
      g.appendChild(text);
    });
  }

  private createSVGElement(tagName: string): SVGElement {
    return document.createElementNS('http://www.w3.org/2000/svg', tagName);
  }

  // Chart control methods
  toggleDataSeries(series: keyof ChartConfig): void {
    if (this.chartConfig) {
      this.energyFlowService.updateChartConfig({
        [series]: !(this.chartConfig as any)[series]
      });
    }
  }

  formatNumber(value: number): string {
    return value.toFixed(1);
  }

  getCurrentHourData(): HourlyEnergyFlow | null {
    if (!this.energyFlowData) return null;
    return this.energyFlowData.hourlyData[this.energyFlowData.currentHour] || null;
  }

  // Add this method to your component class
  getAbs(value: number): number {
    return Math.abs(value);
  }
}
