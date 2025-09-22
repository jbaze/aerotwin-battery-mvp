import { Component, OnInit } from '@angular/core';
import { Auth } from '../../../core/services/auth';
import { Router } from '@angular/router';
import { Optimization } from '../../../shared/services/optimization';

export type TabType = 'system' | 'device';

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard implements OnInit {
  currentUser: any = null;
  activeTab: TabType = 'system';
  currentTime: string = '';
  showOptimizationNotification = false;

  constructor(
    private authService: Auth,
    private router: Router,
    private optimizationService: Optimization
  ) {}

  ngOnInit(): void {
    // Get current user
    this.currentUser = this.authService.getCurrentUser();

    // Listen for optimization changes to show notification
    this.optimizationService.optimizationState$.subscribe(result => {
      if (result?.isApplied) {
        this.showOptimizationSuccess();
      }
    });
  }

  private showOptimizationSuccess(): void {
    this.showOptimizationNotification = true;
    setTimeout(() => {
      this.showOptimizationNotification = false;
    }, 5000);
  }

  updateTime(): void {
    const now = new Date();
    this.currentTime = now.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  onTabChange(tab: TabType): void {
    this.activeTab = tab;
    console.log('Active tab changed to:', tab);
    // Here you can add logic to show different content based on tab
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
