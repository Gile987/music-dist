import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Track } from '../../core/interfaces/track.interface';

@Component({
  selector: 'app-track-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './track-item.component.html',
  styleUrls: ['./track-item.component.scss']
})
export class TrackItemComponent {
  @Input({ required: true }) track!: Track;

  formatDuration(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
}
