import { Component, Input, Output, EventEmitter } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Track } from '../../core/interfaces/track.interface';

@Component({
  selector: 'app-track-item',
  imports: [DecimalPipe],
  templateUrl: './track-item.component.html',
  styleUrls: ['./track-item.component.scss']
})
export class TrackItemComponent {
  @Input({ required: true }) track!: Track;
  @Output() deleteTrack: EventEmitter<Track> = new EventEmitter<Track>();

  public formatDuration(seconds: number): string {
    const minutes: number = Math.floor(seconds / 60);
    const remainingSeconds: number = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  public onDeleteClick(): void {
    this.deleteTrack.emit(this.track);
  }
}
