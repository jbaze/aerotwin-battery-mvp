import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { delay, switchMap, tap } from 'rxjs/operators';
import { User} from '../models/user.model';
import { AuthResponse, LoginCredentials } from '../models/auth-response.model';

@Injectable({
  providedIn: 'root'
})
export class Auth {
  private readonly STORAGE_KEY = 'aerotwin_auth_token';
  private readonly USER_KEY = 'aerotwin_user';

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  // Demo credentials
  private readonly DEMO_CREDENTIALS = {
    email: 'demo@aerotwin.com',
    password: 'demo123'
  };

  private readonly DEMO_USER: User = {
    id: '1',
    email: 'demo@aerotwin.com',
    name: 'AeroTwin Demo User',
    role: 'admin'
  };

  constructor() {
    // Check for existing auth on service initialization
    this.checkStoredAuth();
  }

  /**
   * Fake login service - simulates API call
   */
  login(credentials: LoginCredentials): Observable<AuthResponse> {
    // Simulate API delay
    return of(null).pipe(
      delay(1000),
      tap(() => {
        // Validate credentials
        if (credentials.email !== this.DEMO_CREDENTIALS.email ||
            credentials.password !== this.DEMO_CREDENTIALS.password) {
          throw new Error('Invalid credentials');
        }
      }),
      tap(() => {
        // Generate fake token
        const token = this.generateFakeToken();

        // Store in localStorage
        localStorage.setItem(this.STORAGE_KEY, token);
        localStorage.setItem(this.USER_KEY, JSON.stringify(this.DEMO_USER));

        // Update subjects
        this.currentUserSubject.next(this.DEMO_USER);
        this.isAuthenticatedSubject.next(true);
      }),
      // Return success response
      tap(() => {}),
      // Transform to AuthResponse
      switchMap(() => of({
        user: this.DEMO_USER,
        token: this.generateFakeToken(),
        success: true,
        message: 'Login successful'
      } as AuthResponse))
    );
  }

  /**
   * Logout user and clear storage
   */
  logout(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
  }

  /**
   * Check if user is currently authenticated
   */
  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  /**
   * Get current user
   */
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Get stored token
   */
  getToken(): string | null {
    return localStorage.getItem(this.STORAGE_KEY);
  }

  /**
   * Check for stored authentication on app initialization
   */
  private checkStoredAuth(): void {
    const token = localStorage.getItem(this.STORAGE_KEY);
    const userStr = localStorage.getItem(this.USER_KEY);

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr) as User;
        this.currentUserSubject.next(user);
        this.isAuthenticatedSubject.next(true);
      } catch (error) {
        // Clear invalid stored data
        this.logout();
      }
    }
  }

  /**
   * Generate fake JWT-like token
   */
  private generateFakeToken(): string {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(JSON.stringify({
      sub: this.DEMO_USER.id,
      email: this.DEMO_USER.email,
      exp: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
    }));
    const signature = btoa('fake-signature');

    return `${header}.${payload}.${signature}`;
  }
}
