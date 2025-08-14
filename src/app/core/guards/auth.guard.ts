import { Injectable, inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { AuthUser } from '../interfaces/auth.interface';

export const authGuard: CanActivateFn = (): boolean | UrlTree => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const user: AuthUser | null = authService.userValue;
  if (user) {
    return true;
  } else {
    return router.createUrlTree(['/login']);
  }
};
