import { Component, inject, signal, WritableSignal } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { Role, AuthUser } from '../../core/interfaces/auth.interface';
import { Observable, map } from 'rxjs';

@Component({
  selector: 'app-layout',
  imports: [CommonModule, RouterOutlet, RouterLink],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
})
export class LayoutComponent {
  private readonly auth: AuthService = inject(AuthService);

  user$: Observable<AuthUser | null> = this.auth.user$;
  isAuthenticated$: Observable<boolean> = this.auth.isAuthenticated$;
  isAdmin$: Observable<boolean> = this.auth.user$.pipe(
    map((user: AuthUser | null) => user?.role === 'admin')
  );

  logout(): void {
    this.auth.logout().subscribe({
      next: () => {
        // Logout successful
      },
      error: () => {
        // Logout failed
      },
    });
  }

}
