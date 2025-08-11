import { Component, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService, Role } from '../../core/services/auth.service';

@Component({
  selector: 'app-layout',
  imports: [CommonModule, RouterOutlet, RouterLink],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
})
export class LayoutComponent {
  private auth = inject(AuthService);

  user$ = this.auth.user$;
  isAuthenticated$ = this.auth.isAuthenticated$;

  logout(): void {
    this.auth.logout().subscribe({
      next: () => {
        // TODO: probably a toast or notification here
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
