import { Component, Input, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Track } from '../../core/interfaces/track.interface';
import { TrackItemComponent } from '../track-item/track-item.component';
import { TrackService } from '../../core/services/track.service';

@Component({
  selector: 'app-track-list',
  standalone: true,
  imports: [CommonModule, TrackItemComponent],
  templateUrl: './track-list.component.html',
  styleUrls: ['./track-list.component.scss']
})
export class TrackListComponent {
  @Input() tracks: Track[] = [];
  @Output() trackDeleted = new EventEmitter<number>();

  constructor(private trackService: TrackService) {}

  onDeleteTrack(track: Track): void {
    if (confirm(`Are you sure you want to delete the track "${track.title}"?`)) {
      this.trackService.deleteTrack(track.id).subscribe({
        next: () => {
          this.trackDeleted.emit(track.id);
        },
        error: () => {
          alert('Failed to delete track. Please try again.');
        }
      });
    }
  }
}
