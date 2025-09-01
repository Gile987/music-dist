import { Component, Input } from '@angular/core';
import { ReleaseStatusType } from '../../core/interfaces/release-status.interface';
import { RoyaltyStatusType } from '../../core/interfaces/royalty-status.interface';

@Component({
  selector: 'app-status-badge',
  templateUrl: './status-badge.component.html',
  styleUrls: ['./status-badge.component.scss']
})
export class StatusBadgeComponent {
  @Input() status!: ReleaseStatusType | RoyaltyStatusType;
}
