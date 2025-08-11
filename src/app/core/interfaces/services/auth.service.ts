import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, map, switchMap, tap, throwError } from 'rxjs';
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
    this.me().subscribe({
      next: () => {},
      error: () => {
        this.userSubject.next(null);
      },
    });
  }

  login(email: string, password: string): Observable<void> {
    return this.http
      .post('/api/auth/login', { email, password }, { withCredentials: true })
      .pipe(
        switchMap(() => this.me()),
        map(() => void 0),
        catchError((err) => throwError(() => err))
      );
  }

  me(): Observable<AuthUser> {
    return this.http.get<AuthUser>('/api/auth/me', { withCredentials: true }).pipe(
      tap((user) => this.userSubject.next(user)),
      catchError((err) => {
        this.userSubject.next(null);
        return throwError(() => err);
      })
    );
  }

  logout(): Observable<void> {
    return this.http.post('/api/auth/logout', {}, { withCredentials: true }).pipe(
      tap(() => {
        this.userSubject.next(null);
        void this.router.navigateByUrl('/login');
      }),
      map(() => void 0),
      catchError((err) => throwError(() => err))
    );
  }

  get userValue(): AuthUser | null {
    return this.userSubject.getValue();
  }
}
