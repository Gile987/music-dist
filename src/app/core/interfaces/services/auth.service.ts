import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, map, of, tap } from 'rxjs';
import { Router } from '@angular/router';

export type Role = 'artist' | 'admin';

export type AuthUser = {
  id: number;
  email: string;
  name: string;
  role: Role;
};

type JwtPayload = {
  sub: number;
  email: string;
  name: string;
  role: string;
  exp: number;
};

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private readonly tokenKey = 'auth_token';

  private userSubject = new BehaviorSubject<AuthUser | null>(
    this.loadStoredUser()
  );
  readonly user$ = this.userSubject.asObservable();
  readonly isAuthenticated$: Observable<boolean> = this.user$.pipe(
    map((user) => !!user)
  );

  login(email: string, password: string): Observable<void> {
    return this.http
      .post<{ token: string }>('/api/auth/login', { email, password })
      .pipe(
        map((response) => {
          const user = this.decodeJWT(response.token);
          if (!user)
            throw new Error('Invalid token structure or expired token');

          this.setToken(response.token);
          this.userSubject.next(user);
        }),
        catchError((err) => {
          console.error('Login failed', err);
          throw err;
        })
      );
  }

  async logout(): Promise<void> {
    this.clearToken();
    this.userSubject.next(null);
    await this.router.navigateByUrl('/login');
  }

  private setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  private getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  private loadStoredUser(): AuthUser | null {
    const token = this.getToken();
    if (!token) return null;

    const user = this.decodeJWT(token);
    if (!user) {
      this.clearToken();
      return null;
    }

    return user;
  }

  private clearToken(): void {
    localStorage.removeItem(this.tokenKey);
  }

  private decodeJWT(token: string): AuthUser | null {
    try {
      const [, payloadBase64] = token.split('.');
      const payloadJson = atob(payloadBase64);
      const payload: JwtPayload = JSON.parse(payloadJson);

      // Expiry check
      const nowInSec = Math.floor(Date.now() / 1000);
      if (payload.exp < nowInSec) return null;

      // Role validation
      if (payload.role !== 'artist' && payload.role !== 'admin') return null;

      return {
        id: payload.sub,
        email: payload.email,
        name: payload.name,
        role: payload.role as Role,
      };
    } catch {
      return null;
    }
  }
}
