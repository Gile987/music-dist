import { Component } from '@angular/core';
import { UserInfoCardComponent } from '../../components/user-info-card/user-info-card.component';
import { Role } from '../../core/interfaces/auth.interface';

@Component({
  selector: 'app-profile',
  imports: [UserInfoCardComponent],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent {
  user = {
    name: 'Gile Developer',
    email: 'gile@example.com',
    avatarUrl: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70) + 1}`,
    role: 'artist' as Role,
    joinedDate: '2024-11-10'
  };
}
