import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
  inject,
} from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { StatusBadgeComponent } from '../status-badge/status-badge.component';
import { TrackListComponent } from '../track-list/track-list.component';
import { Release } from '../../core/interfaces/release.interface';
import { Track } from '../../core/interfaces/track.interface';
import { TrackService } from '../../core/services/track.service';
import { ReleaseService } from '../../core/services/release.service';
import { DateFormatPipe } from '../../shared/pipes/date-format.pipe';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-release-item',
  imports: [DecimalPipe, StatusBadgeComponent, TrackListComponent, DateFormatPipe],
  templateUrl: './release-item.component.html',
  styleUrls: ['./release-item.component.scss'],
})
export class ReleaseItemComponent implements OnInit, OnDestroy {
  @Input({ required: true }) release!: Release;
  @Output() edit: EventEmitter<Release> = new EventEmitter<Release>();
  @Output() deleted: EventEmitter<number> = new EventEmitter<number>();

  private readonly trackService: TrackService = inject(TrackService);
  private readonly releaseService: ReleaseService = inject(ReleaseService);
  private readonly destroy$ = new Subject<void>();

  public showTracks: boolean = false;
  public tracks: Track[] = [];
  public tracksLoaded: boolean = false;

  ngOnInit(): void {
    if (this.release.tracks && this.release.tracks.length > 0) {
      this.tracks = this.release.tracks;
      this.tracksLoaded = true;
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  public onEditClick(): void {
    this.edit.emit(this.release);
  }

  public onDeleteClick(): void {
    const confirmMessage: string = `Are you sure you want to delete the release "${this.release.title}"? This will also delete all associated tracks.`;

    if (confirm(confirmMessage)) {
      this.releaseService.deleteRelease(this.release.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
        next: (): void => {
          this.deleted.emit(this.release.id);
        },
        error: (): void => {
          alert('Failed to delete release. Please try again.');
        },
      });
    }
  }

  public toggleTracks(): void {
    this.showTracks = !this.showTracks;
    if (this.showTracks && !this.tracksLoaded) {
      this.loadTracks();
    }
  }

  public onTrackDeleted(trackId: number): void {
    this.tracks = this.tracks.filter(
      (track: Track): boolean => track.id !== trackId
    );
  }

  private loadTracks(): void {
    this.trackService.getTracksByRelease(this.release.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
      next: (tracks: Track[]): void => {
        this.tracks = tracks;
        this.tracksLoaded = true;
      },
      error: (): void => {
        alert('Failed to load tracks. Please try again.');
      },
    });
  }
}
