import { Component, OnDestroy, OnInit } from '@angular/core';
import { OptimizationResult } from '../../../../shared/models/optimization-result.model';
import { Subscription } from 'rxjs';
import { Optimization } from '../../../../shared/services/optimization';

@Component({
  selector: 'app-apply-suggestions',
  standalone: false,
  templateUrl: './apply-suggestions.html',
  styleUrl: './apply-suggestions.scss'
})
export class ApplySuggestions implements OnInit, OnDestroy {
  optimizationResult: OptimizationResult | null = null;
  isLoading = false;
  isApplying = false;
  showComparison = false;

  private subscription = new Subscription();

  constructor(private optimizationService: Optimization) {}

  ngOnInit(): void {
    // Listen for optimization state changes
    this.subscription.add(
      this.optimizationService.optimizationState$.subscribe(result => {
        this.optimizationResult = result;
        if (result && result.isApplied) {
          this.showComparison = true;
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  onGenerateOptimization(): void {
    this.isLoading = true;
    this.showComparison = false;

    this.subscription.add(
      this.optimizationService.generateOptimization().subscribe({
        next: () => {
          this.isLoading = false;
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Optimization generation failed:', error);
        }
      })
    );
  }

  onApplyOptimization(): void {
    if (!this.optimizationResult) return;

    this.isApplying = true;

    this.subscription.add(
      this.optimizationService.applyOptimization().subscribe({
        next: () => {
          this.isApplying = false;
          this.showComparison = true;
        },
        error: (error) => {
          this.isApplying = false;
          console.error('Optimization application failed:', error);
        }
      })
    );
  }

  onResetOptimization(): void {
    this.optimizationService.resetOptimization();
    this.showComparison = false;
    this.optimizationResult = null;
  }

  getImprovementIcon(category: string): string {
    switch (category) {
      case 'timing':
        return 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z';
      case 'efficiency':
        return 'M13 10V3L4 14h7v7l9-11h-7z';
      case 'cost':
        return 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1';
      default:
        return 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z';
    }
  }

  getImprovementColor(category: string): string {
    switch (category) {
      case 'timing':
        return 'text-blue-400';
      case 'efficiency':
        return 'text-green-400';
      case 'cost':
        return 'text-yellow-400';
      default:
        return 'text-gray-400';
    }
  }
}

