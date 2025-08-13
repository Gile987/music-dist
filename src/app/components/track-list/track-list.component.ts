import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Track } from '../../core/interfaces/track.interface';
import { TrackItemComponent } from '../track-item/track-item.component';

@Component({
  selector: 'app-track-list',
  standalone: true,
  imports: [CommonModule, TrackItemComponent],
  templateUrl: './track-list.component.html',
  styleUrls: ['./track-list.component.scss']
})
export class TrackListComponent {
  @Input() tracks: Track[] = [];
}
