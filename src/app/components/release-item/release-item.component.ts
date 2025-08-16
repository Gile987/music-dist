import { Component, Input, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { StatusBadgeComponent } from '../status-badge/status-badge.component';
import { TrackListComponent } from '../track-list/track-list.component';
import { Release } from '../../core/interfaces/release.interface';
import { Track } from '../../core/interfaces/track.interface';
import { TrackService } from '../../core/services/track.service';
import { ReleaseService } from '../../core/services/release.service';

@Component({
  selector: 'app-release-item',
  imports: [StatusBadgeComponent, TrackListComponent],
  templateUrl: './release-item.component.html',
  styleUrls: ['./release-item.component.scss']
})
export class ReleaseItemComponent implements OnInit {
  @Input({ required: true }) release!: Release;
  @Output() edit = new EventEmitter<Release>();
  @Output() deleted = new EventEmitter<number>();

  private trackService = inject(TrackService);
  private releaseService = inject(ReleaseService);
  
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

  onDeleteClick(): void {
    if (confirm(`Are you sure you want to delete the release "${this.release.title}"? This will also delete all associated tracks.`)) {
      this.releaseService.deleteRelease(this.release.id).subscribe({
        next: () => {
          this.deleted.emit(this.release.id);
        },
        error: () => {
          alert('Failed to delete release. Please try again.');
        }
      });
    }
  }

  toggleTracks(): void {
    this.showTracks = !this.showTracks;
    
    // Load tracks if they haven't been loaded yet and the section is expanded
    if (this.showTracks && !this.tracksLoaded) {
      this.loadTracks();
    }
  }

  onTrackDeleted(trackId: number): void {
    // Remove the track from the local array
    this.tracks = this.tracks.filter(track => track.id !== trackId);
  }

  private loadTracks(): void {
    this.trackService.getTracksByRelease(this.release.id).subscribe({
      next: (tracks) => {
        this.tracks = tracks;
        this.tracksLoaded = true;
      },
      error: () => {
        alert('Failed to load tracks. Please try again.');
      }
    });
  }
}
