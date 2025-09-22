import { Component, OnDestroy, OnInit } from '@angular/core';
import { Theme, ThemeService } from '../../services/theme';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-theme-toggle',
  standalone: false,
  templateUrl: './theme-toggle.html',
  styleUrl: './theme-toggle.scss'
})
export class ThemeToggle implements OnInit, OnDestroy {
  currentTheme: Theme = 'dark';
  isToggling = false;

  private subscription = new Subscription();

  constructor(private themeService: ThemeService) {}

  ngOnInit(): void {
    this.subscription.add(
      this.themeService.currentTheme$.subscribe(theme => {
        this.currentTheme = theme;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  toggleTheme(): void {
    this.isToggling = true;
    this.themeService.toggleTheme();

    // Reset toggle animation after a delay
    setTimeout(() => {
      this.isToggling = false;
    }, 300);
  }

  get isDarkMode(): boolean {
    return this.currentTheme === 'dark';
  }

  get toggleIcon(): string {
    return this.isDarkMode ? 'sun' : 'moon';
  }

  get toggleLabel(): string {
    return this.isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode';
  }
}
