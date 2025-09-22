import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { authGuard } from './shared/guards/auth-guard';
import { FormBuilderComponent } from './features/dashboard/components/form-builder/form-builder';
import { FormsManagementComponent } from './features/dashboard/form-management/form-management';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/auth/login',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth-module').then(m => m.AuthModule)
  },
  {
    path: 'dashboard',
    loadChildren: () => import('./features/dashboard/dashboard-module').then(m => m.DashboardModule),
    canActivate: [authGuard]
  },
  {
    path: 'optimization',
    loadChildren: () => import('./features/optimization/optimization-module').then(m => m.OptimizationModule),
    canActivate: [authGuard]
  },
  { path: 'forms', component: FormsManagementComponent },
  { path: 'form-builder', component: FormBuilderComponent },
  { path: 'form-builder/:id', component: FormBuilderComponent },
  {
    path: '**',
    redirectTo: '/auth/login'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
