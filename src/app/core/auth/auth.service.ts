import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';

import { environment } from '../../../environments/environment';
import { AuthResponse, LoginRequest, SignupRequest, UserRole } from '../models/auth.models';
import { TokenStorage } from './token.storage';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly storage = inject(TokenStorage);
  private readonly router = inject(Router);

  private readonly _currentUser = signal<AuthResponse | null>(this.storage.read());

  /** Current authenticated user, or null when signed out. Reactive via signal. */
  readonly currentUser = this._currentUser.asReadonly();
  readonly isAuthenticated = computed(() => this._currentUser() !== null);
  readonly role = computed<UserRole | null>(() => this._currentUser()?.role ?? null);

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${environment.apiBaseUrl}/auth/login`, request)
      .pipe(tap((response) => this.persist(response)));
  }

  signup(request: SignupRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${environment.apiBaseUrl}/auth/signup`, request)
      .pipe(tap((response) => this.persist(response)));
  }

  logout(navigate = true): void {
    this.storage.clear();
    this._currentUser.set(null);
    if (navigate) {
      void this.router.navigate(['/login']);
    }
  }

  token(): string | null {
    return this._currentUser()?.accessToken ?? null;
  }

  hasRole(role: UserRole): boolean {
    return this.role() === role;
  }

  private persist(response: AuthResponse): void {
    this.storage.write(response);
    this._currentUser.set(response);
  }
}
