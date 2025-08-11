import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Role } from '../../core/interfaces/auth.interface';

@Component({
  selector: 'app-user-info-card',
  imports: [CommonModule],
  templateUrl: './user-info-card.component.html',
  styleUrls: ['./user-info-card.component.scss']
})
export class UserInfoCardComponent {
  @Input({ required: true }) name!: string;
  @Input({ required: true }) email!: string;
  @Input() avatarUrl: string = 'https://www.gravatar.com/avatar/?d=mp';
  @Input() role?: Role;
  @Input() joinedDate?: string;
}
