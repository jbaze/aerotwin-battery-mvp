import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { OptimizationRoutingModule } from './optimization-routing-module';
import { OptimizationCenter } from './optimization-center/optimization-center';
import { ApplySuggestions } from './components/apply-suggestions/apply-suggestions';
import { SavingsCalculator } from './components/savings-calculator/savings-calculator';
import { BeforeAfterComparison } from './components/before-after-comparison/before-after-comparison';
import { SharedModule } from '../../shared/shared-module';


@NgModule({
  declarations: [
    OptimizationCenter,
    ApplySuggestions,
    SavingsCalculator,
    BeforeAfterComparison
  ],
  imports: [
    CommonModule,
    OptimizationRoutingModule,
    SharedModule
  ],
  exports: [
    ApplySuggestions // Export for use in other modules
  ]
})
export class OptimizationModule { }
