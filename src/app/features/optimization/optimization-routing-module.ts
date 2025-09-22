import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OptimizationCenter } from './optimization-center/optimization-center';

const routes: Routes = [
  {
    path: '',
    component: OptimizationCenter
  }
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OptimizationRoutingModule { }
