import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReleaseListComponent } from '../../components/release-list/release-list.component';
import { StatCardComponent } from '../../components/stat-card/stat-card.component';
import { Release } from '../../core/interfaces/release.interface';

@Component({
  selector: 'app-releases',
  standalone: true,
  imports: [CommonModule, ReleaseListComponent, StatCardComponent],
  templateUrl: './releases.component.html',
  styleUrls: ['./releases.component.scss']
})
export class ReleasesComponent {
  releases: Release[] = [
    { id: 1, title: 'Summer Vibes', status: 'active', releaseDate: '2025-05-10', streams: 123456 },
    { id: 2, title: 'Winter Chill', status: 'pending', releaseDate: '2025-11-01', streams: 0 },
    { id: 3, title: 'Spring Awakening', status: 'archived', releaseDate: '2024-03-22', streams: 98765 }
  ];

  totalStreams = this.releases.reduce((acc, r) => acc + r.streams, 0);
  activeReleases = this.releases.filter(r => r.status === 'active').length;
  pendingReleases = this.releases.filter(r => r.status === 'pending').length;
}
