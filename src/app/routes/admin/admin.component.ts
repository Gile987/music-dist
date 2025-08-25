import { Component, OnInit, OnDestroy, inject, signal, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../core/services/admin.service';
import { ArtistWithData } from '../../core/interfaces/artist.interface';
import { Release } from '../../core/interfaces/release.interface';
import { Track } from '../../core/interfaces/track.interface';
import { AuthService } from '../../core/services/auth.service';
import { ReleaseService } from '../../core/services/release.service';
import { TrackService } from '../../core/services/track.service';
import { ButtonComponent } from '../../shared/button/button.component';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-admin',
  imports: [CommonModule, ButtonComponent],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss'
})
export class AdminComponent implements OnInit, OnDestroy {
  private readonly adminService: AdminService = inject(AdminService);
  private readonly authService: AuthService = inject(AuthService);
  private readonly releaseService: ReleaseService = inject(ReleaseService);
  private readonly trackService: TrackService = inject(TrackService);
  private readonly destroy$: Subject<void> = new Subject<void>();

  artists: WritableSignal<ArtistWithData[]> = signal<ArtistWithData[]>([]);
  loading: WritableSignal<boolean> = signal<boolean>(false);
  error: WritableSignal<string | null> = signal<string | null>(null);
  expandedArtistId: WritableSignal<number | null> = signal<number | null>(null);
  deletingArtistId: WritableSignal<number | null> = signal<number | null>(null);
  deletingReleaseId: WritableSignal<number | null> = signal<number | null>(null);
  deletingTrackId: WritableSignal<number | null> = signal<number | null>(null);

  ngOnInit(): void {
    this.loadAllArtists();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadAllArtists(): void {
    this.loading.set(true);
    this.error.set(null);

    this.adminService.getAllArtistsWithData()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (artists: ArtistWithData[]) => {
          this.artists.set(artists);
          this.loading.set(false);
        },
        error: () => {
          this.error.set('Failed to load artists data');
          this.loading.set(false);
        }
      });
  }

  public toggleArtistExpansion(artistId: number): void {
    const currentExpanded = this.expandedArtistId();
    this.expandedArtistId.set(currentExpanded === artistId ? null : artistId);
  }

  public onDeleteArtist(artistId: number, artistName: string): void {
    const confirmMessage = `Are you sure you want to delete artist "${artistName}"? This will permanently delete all their releases and tracks.`;
    
    if (confirm(confirmMessage)) {
      this.deletingArtistId.set(artistId);
      this.error.set(null);

      this.adminService.deleteUser(artistId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.artists.update(artists => artists.filter(artist => artist.id !== artistId));
            this.deletingArtistId.set(null);
            this.expandedArtistId.set(null);
          },
          error: () => {
            this.error.set('Failed to delete artist');
            this.deletingArtistId.set(null);
          }
        });
    }
  }

  public onDeleteRelease(releaseId: number, releaseTitle: string, artistId: number): void {
    const confirmMessage = `Are you sure you want to delete release "${releaseTitle}"? This will also delete all associated tracks.`;
    
    if (confirm(confirmMessage)) {
      this.deletingReleaseId.set(releaseId);
      this.error.set(null);

      this.adminService.deleteRelease(releaseId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.artists.update(artists => 
              artists.map(artist => {
                if (artist.id === artistId) {
                  return {
                    ...artist,
                    releases: artist.releases.filter((release: Release) => release.id !== releaseId)
                  };
                }
                return artist;
              })
            );
            this.deletingReleaseId.set(null);
          },
          error: () => {
            this.error.set('Failed to delete release');
            this.deletingReleaseId.set(null);
          }
        });
    }
  }

  public onDeleteTrack(trackId: number, trackTitle: string, artistId: number, releaseId: number): void {
    const confirmMessage = `Are you sure you want to delete track "${trackTitle}"?`;
    
    if (confirm(confirmMessage)) {
      this.deletingTrackId.set(trackId);
      this.error.set(null);

      this.adminService.deleteTrack(trackId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.artists.update(artists => 
              artists.map(artist => {
                if (artist.id === artistId) {
                  return {
                    ...artist,
                    releases: artist.releases.map((release: Release) => {
                      if (release.id === releaseId && release.tracks) {
                        return {
                          ...release,
                          tracks: release.tracks.filter((track: Track) => track.id !== trackId)
                        };
                      }
                      return release;
                    })
                  };
                }
                return artist;
              })
            );
            this.deletingTrackId.set(null);
          },
          error: () => {
            this.error.set('Failed to delete track');
            this.deletingTrackId.set(null);
          }
        });
    }
  }

  public refreshData(): void {
    this.loadAllArtists();
  }
}
