import { Component, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { Role, AuthUser } from '../../core/interfaces/auth.interface';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-layout',
  imports: [CommonModule, RouterOutlet, RouterLink],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
})
export class LayoutComponent {
  private readonly auth = inject(AuthService);

  user$: Observable<AuthUser | null> = this.auth.user$;

  isAuthenticated$: Observable<boolean> = this.auth.isAuthenticated$;

  logout(): void {
    this.auth.logout().subscribe({
      next: () => {
        console.log('Logged out successfully');
      },
      error: (err) => {
        console.error('Logout failed', err);
      },
    });
  }

  canUpload(role: Role | undefined): boolean {
    return role === 'artist';
  }
}
