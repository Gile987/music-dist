import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { Observable, map, take } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = (): Observable<boolean | UrlTree> => {
  const authService: AuthService = inject(AuthService);
  const router: Router = inject(Router);

  return authService.user$.pipe(
    take(1),
    map((user): boolean | UrlTree => {
      if (user && user.role === 'admin') {
        return true;
      } else {
        return router.createUrlTree(['/dashboard']);
      }
    })
  );
};
