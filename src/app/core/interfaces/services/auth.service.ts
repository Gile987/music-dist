import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, map, of, switchMap, tap, throwError } from 'rxjs';
import { Router } from '@angular/router';

export type Role = 'artist' | 'admin';

export type AuthUser = {
  id: number;
  email: string;
  name: string;
  role: Role;
};

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private userSubject = new BehaviorSubject<AuthUser | null>(null);
  readonly user$ = this.userSubject.asObservable();
  readonly isAuthenticated$ = this.user$.pipe(map((u) => !!u));

  constructor() {
    // Try to load current user when the app starts (silent auth check)
    this.me().subscribe({
      next: () => {},
      error: () => {
        // not authenticated, that's fine — leave userSubject as null
      },
    });
  }

  /**
   * Login: backend sets an HttpOnly cookie. After successful login request,
   * call /auth/me to get the user object and store it in memory.
   */
  login(email: string, password: string): Observable<void> {
    return this.http
      .post('/api/auth/login', { email, password }, { withCredentials: true })
      .pipe(
        switchMap(() => this.me()),
        map(() => void 0),
        catchError((err) => {
          // rethrow so callers can display errors
          return throwError(() => err);
        })
      );
  }

  /**
   * Fetch the current user from backend (uses cookie auth).
   * Updates the in-memory user state.
   */
  me(): Observable<AuthUser> {
    return this.http.get<AuthUser>('/api/auth/me', { withCredentials: true }).pipe(
      tap((user) => this.userSubject.next(user)),
      catchError((err) => {
        // clear user on error
        this.userSubject.next(null);
        return throwError(() => err);
      })
    );
  }

  /**
   * Logout: call backend to clear cookie, then clear local user state.
   */
  logout(): Observable<void> {
    return this.http.post('/api/auth/logout', {}, { withCredentials: true }).pipe(
      tap(() => {
        this.userSubject.next(null);
        // navigate to login screen
        void this.router.navigateByUrl('/login');
      }),
      map(() => void 0),
      catchError((err) => {
        return throwError(() => err);
      })
    );
  }

  /**
   * Synchronous helper to read latest user value.
   */
  get userValue(): AuthUser | null {
    return this.userSubject.getValue();
  }
}
