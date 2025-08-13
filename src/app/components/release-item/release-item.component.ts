import { Component, Input, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatusBadgeComponent } from '../status-badge/status-badge.component';
import { TrackListComponent } from '../track-list/track-list.component';
import { Release } from '../../core/interfaces/release.interface';
import { Track } from '../../core/interfaces/track.interface';
import { TrackService } from '../../core/services/track.service';

@Component({
  selector: 'app-release-item',
  imports: [CommonModule, StatusBadgeComponent, TrackListComponent],
  templateUrl: './release-item.component.html',
  styleUrls: ['./release-item.component.scss']
})
export class ReleaseItemComponent implements OnInit {
  @Input({ required: true }) release!: Release;
  @Output() edit = new EventEmitter<Release>();

  private trackService = inject(TrackService);
  
  showTracks = false;
  tracks: Track[] = [];
  tracksLoaded = false;

  ngOnInit(): void {
    // If tracks are already available in the release, use them
    if (this.release.tracks && this.release.tracks.length > 0) {
      this.tracks = this.release.tracks;
      this.tracksLoaded = true;
    }
  }

  public get formattedDate(): string {
    const d: Date = new Date(this.release.releaseDate);
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  }

  onEditClick(): void {
    this.edit.emit(this.release);
  }

  toggleTracks(): void {
    this.showTracks = !this.showTracks;
    
    // Load tracks if they haven't been loaded yet and the section is expanded
    if (this.showTracks && !this.tracksLoaded) {
      this.loadTracks();
    }
  }

  private loadTracks(): void {
    this.trackService.getTracksByRelease(this.release.id).subscribe({
      next: (tracks) => {
        this.tracks = tracks;
        this.tracksLoaded = true;
      },
      error: (error) => {
        console.error('Failed to load tracks', error);
      }
    });
  }
}
