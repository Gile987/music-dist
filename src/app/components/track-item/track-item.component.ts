import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Track } from '../../core/interfaces/track.interface';

@Component({
  selector: 'app-track-item',
  templateUrl: './track-item.component.html',
  styleUrls: ['./track-item.component.scss']
})
export class TrackItemComponent {
  @Input({ required: true }) track!: Track;
  @Output() deleteTrack = new EventEmitter<Track>();

  formatDuration(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  onDeleteClick(): void {
    this.deleteTrack.emit(this.track);
  }
}
