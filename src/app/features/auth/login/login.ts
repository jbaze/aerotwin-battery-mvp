import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from '../../../core/services/auth';
import { LoginCredentials } from '../../../core/models/auth-response.model';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {
  isLoading = false;
  errorMessage = '';

  constructor(
    private authService: Auth,
    private router: Router
  ) {
    // Redirect if already authenticated
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }
  }

  onLogin(credentials: LoginCredentials): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login(credentials).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.router.navigate(['/dashboard']);
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = 'Invalid email or password. Please try again.';
        console.error('Login error:', error);
      }
    });
  }
}
