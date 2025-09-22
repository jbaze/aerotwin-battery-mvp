import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DashboardRoutingModule } from './dashboard-routing-module';
import { Dashboard } from './dashboard/dashboard';
import { MetricsGrid } from './components/metrics-grid/metrics-grid';
import { HouseVisualization } from './components/house-visualization/house-visualization';
import { EnergyChart } from './components/energy-chart/energy-chart';
import { HeaderNav } from './components/header-nav/header-nav';
import { SharedModule } from '../../shared/shared-module';
import { OptimizationModule } from '../optimization/optimization-module';
import {FormBuilderComponent } from './components/form-builder/form-builder';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormRenderComponent } from './form-render/form-render';
import { FormsManagementComponent } from './form-management/form-management';


@NgModule({
  declarations: [
    Dashboard,
    MetricsGrid,
    HouseVisualization,
    EnergyChart,
    HeaderNav,
    FormRenderComponent,
    FormsManagementComponent
  ],
  imports: [
    CommonModule,
    DashboardRoutingModule,
    SharedModule,
    OptimizationModule,
    DragDropModule,
    FormsModule,
    ReactiveFormsModule
  ],
  exports: [
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class DashboardModule { }
