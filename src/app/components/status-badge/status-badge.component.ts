import { Component, Input } from '@angular/core';
import { StatusType } from '../../core/interfaces/status.interface';

@Component({
  selector: 'app-status-badge',
  templateUrl: './status-badge.component.html',
  styleUrls: ['./status-badge.component.scss']
})
export class StatusBadgeComponent {
  @Input({ required: true }) status!: StatusType;
}
