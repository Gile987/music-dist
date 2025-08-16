import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, map, switchMap, tap, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { AuthUser, LoginCredentials } from '../interfaces/auth.interface';
import { UserProfile } from '../interfaces/user-profile.interface';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http: HttpClient = inject(HttpClient);
  private readonly router: Router = inject(Router);

  private readonly userSubject: BehaviorSubject<AuthUser | null> = new BehaviorSubject<AuthUser | null>(
    AuthService.getStoredUser()
  );
  public readonly user$: Observable<AuthUser | null> = this.userSubject.asObservable();
  public readonly isAuthenticated$: Observable<boolean> = this.user$.pipe(map((user: AuthUser | null): boolean => !!user));

  constructor() {
    // On service init, try to refresh user from backend, but keep localStorage as fallback
    this.me().subscribe({
      next: (): void => {},
      error: (): void => {
        this.userSubject.next(null);
        AuthService.clearStoredUser();
      },
    });
  }

  public login(email: string, password: string): Observable<void> {
    return this.http
      .post<void>('/api/auth/login', { email, password }, { withCredentials: true })
      .pipe(
        switchMap((): Observable<AuthUser> => this.me()),
        tap(() => {
          // userSubject will be set by me(), which will also update localStorage
        }),
        map((): void => void 0),
        catchError((error: HttpErrorResponse) => throwError((): Error => error))
      );
  }

  public me(): Observable<AuthUser> {
    return this.http.get<AuthUser>('/api/auth/me', { withCredentials: true }).pipe(
      tap((user: AuthUser): void => {
        this.userSubject.next(user);
        AuthService.storeUser(user);
      }),
      catchError((error: HttpErrorResponse) => {
        this.userSubject.next(null);
        AuthService.clearStoredUser();
        return throwError((): Error => error);
      })
    );
  }

  public logout(): Observable<void> {
    return this.http.post<void>('/api/auth/logout', {}, { withCredentials: true }).pipe(
      tap((): void => {
        this.userSubject.next(null);
        AuthService.clearStoredUser();
        void this.router.navigateByUrl('/login');
      }),
      map((): void => void 0),
      catchError((error: HttpErrorResponse) => throwError((): Error => error))
    );
  }

  // --- LocalStorage helpers ---
  private static readonly STORAGE_KEY = 'authUser';

  private static storeUser(user: AuthUser): void {
    try {
      localStorage.setItem(AuthService.STORAGE_KEY, JSON.stringify(user));
    } catch {}
  }

  private static getStoredUser(): AuthUser | null {
    try {
      const raw = localStorage.getItem(AuthService.STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  private static clearStoredUser(): void {
    try {
      localStorage.removeItem(AuthService.STORAGE_KEY);
    } catch {}
  }

  public get userValue(): AuthUser | null {
    return this.userSubject.getValue();
  }

  public getProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>('/api/auth/me', { withCredentials: true });
  }
}
