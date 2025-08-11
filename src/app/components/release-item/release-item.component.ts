
import { Component, Input } from '@angular/core';
import { StatusBadgeComponent } from '../status-badge/status-badge.component';
import { Release } from '../../core/interfaces/release.interface';

@Component({
  selector: 'app-release-item',
  imports: [StatusBadgeComponent],
  templateUrl: './release-item.component.html',
  styleUrls: ['./release-item.component.scss']
})
export class ReleaseItemComponent {
  @Input({ required: true }) release!: Release;

  get formattedDate(): string {
    const d = new Date(this.release.releaseDate);
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  }
}
