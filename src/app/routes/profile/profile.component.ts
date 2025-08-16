import { Component, signal, OnInit, inject } from '@angular/core';
import { UserInfoCardComponent } from '../../components/user-info-card/user-info-card.component';
import { AuthService } from '../../core/services/auth.service';
import { UserProfile } from '../../core/interfaces/user-profile.interface';
import { ButtonComponent } from '../../shared/button.component';

@Component({
  selector: 'app-profile',
  imports: [UserInfoCardComponent, ButtonComponent],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  private authService = inject(AuthService);
  user = signal<UserProfile | null>(null);
  avatarUrl = signal<string>('https://www.gravatar.com/avatar/?d=mp');

  ngOnInit(): void {
    this.authService.getProfile().subscribe({
      next: (profile) => {
        this.user.set(profile);
        // Optionally, generate a gravatar or avatar URL based on email or name
        this.avatarUrl.set(`https://i.pravatar.cc/150?u=${encodeURIComponent(profile.email)}`);
      },
      error: () => {
        this.user.set(null);
      }
    });
  }
}
