import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { EnergyMetric } from '../../../../shared/models/energy-metrics.model';
import { SyntheticDataService } from '../../../../shared/services/synthetic-data';

@Component({
  selector: 'app-metrics-grid',
  standalone: false,
  templateUrl: './metrics-grid.html',
  styleUrl: './metrics-grid.scss'
})
export class MetricsGrid implements OnInit, OnDestroy {

  metrics$!: Observable<EnergyMetric[]>;
  private subscription?: Subscription;

  constructor(private syntheticDataService: SyntheticDataService) {}

  ngOnInit(): void {
    this.metrics$ = this.syntheticDataService.getCurrentMetrics();
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

   trackByMetricId(index: number, metric: EnergyMetric): string {
    return metric.id;
  }
}

