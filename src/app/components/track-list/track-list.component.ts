import { Component, Input, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Track } from '../../core/interfaces/track.interface';
import { TrackItemComponent } from '../track-item/track-item.component';
import { TrackService } from '../../core/services/track.service';

@Component({
  selector: 'app-track-list',
  imports: [CommonModule, TrackItemComponent],
  templateUrl: './track-list.component.html',
  styleUrls: ['./track-list.component.scss']
})
export class TrackListComponent {
  @Input() tracks: Track[] = [];
  @Output() trackDeleted: EventEmitter<number> = new EventEmitter<number>();

  private readonly trackService: TrackService = inject(TrackService);

  public onDeleteTrack(track: Track): void {
    const confirmMessage: string = `Are you sure you want to delete the track "${track.title}"?`;
    
    if (confirm(confirmMessage)) {
      this.trackService.deleteTrack(track.id).subscribe({
        next: (): void => {
          this.trackDeleted.emit(track.id);
        },
        error: (): void => {
          alert('Failed to delete track. Please try again.');
        }
      });
    }
  }
}
