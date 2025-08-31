import { Component, OnInit, OnDestroy, inject, signal, WritableSignal } from '@angular/core';
import { ButtonComponent } from '../../shared/button/button.component';
import { ReleaseListComponent } from '../../components/release-list/release-list.component';
import { StatCardComponent } from '../../components/stat-card/stat-card.component';
import { ReleaseService } from '../../core/services/release.service';
import { AuthService } from '../../core/services/auth.service';
import { ReleaseStatsService } from '../../core/services/release-stats.service';
import { DateUtilsService } from '../../core/services/date-utils.service';
import { Release } from '../../core/interfaces/release.interface';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-releases',
  imports: [ReleaseListComponent, StatCardComponent, ReactiveFormsModule, ButtonComponent],
  templateUrl: './releases.component.html',
  styleUrls: ['./releases.component.scss']
})
export class ReleasesComponent implements OnInit, OnDestroy {
  private readonly releaseService: ReleaseService = inject(ReleaseService);
  private readonly authService: AuthService = inject(AuthService);
  private readonly releaseStatsService: ReleaseStatsService = inject(ReleaseStatsService);
  private readonly dateUtilsService: DateUtilsService = inject(DateUtilsService);
  private readonly destroy$: Subject<void> = new Subject<void>();

  releases: WritableSignal<Release[]> = signal<Release[]>([]);
  loading: WritableSignal<boolean> = signal<boolean>(false);
  error: WritableSignal<string | null> = signal<string | null>(null);

  totalStreams: WritableSignal<number> = signal<number>(0);
  approvedReleases: WritableSignal<number> = signal<number>(0);
  pendingReleases: WritableSignal<number> = signal<number>(0);

  editedReleaseId: WritableSignal<number | null> = signal<number | null>(null);

  releaseForm: FormGroup = new FormGroup({
    title: new FormControl('', [Validators.required, Validators.maxLength(255)]),
    releaseDate: new FormControl('', [Validators.required]),
    coverUrl: new FormControl('', []),
  });

  ngOnInit(): void {
    this.initializeUserAndLoadReleases();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeUserAndLoadReleases(): void {
    const user = this.authService.userValue;
    if (user) {
      this.fetchReleases(user.id);
    } else {
      this.subscribeToUserChanges();
    }
  }

  private subscribeToUserChanges(): void {
    this.authService.user$
      .pipe(takeUntil(this.destroy$))
      .subscribe((user) => {
        if (user) {
          this.fetchReleases(user.id);
        }
      });
  }

  private fetchReleases(artistId: number): void {
    this.loading.set(true);
    this.error.set(null);
    this.releaseService.getReleasesByArtist(artistId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
      next: (data: Release[]) => {
        this.releases.set(data);
        this.updateStats(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load releases');
        this.loading.set(false);
      }
    });
  }

  private updateStats(releases: Release[]): void {
    const stats = this.releaseStatsService.calculateStats(releases);
    this.totalStreams.set(stats.totalStreams);
    this.approvedReleases.set(stats.approvedReleases);
    this.pendingReleases.set(stats.pendingReleases);
  }

  public onEditRelease(r: Release): void {
    this.editedReleaseId.set(r.id);
    this.releaseForm.setValue({
      title: r.title,
      releaseDate: this.dateUtilsService.toInputValue(r.releaseDate),
      coverUrl: r.coverUrl ?? ''
    });
    this.error.set(null);
  }

  public onReleaseDeleted(releaseId: number): void {
    this.releases.update(releases => releases.filter(r => r.id !== releaseId));
    this.updateStats([...this.releases()]);
  }

  public cancelEdit(): void {
    this.editedReleaseId.set(null);
    this.releaseForm.reset();
    this.error.set(null);
  }

  public onSubmit(): void {
    if (this.releaseForm.invalid) {
      this.error.set('Title and release date are required');
      return;
    }

    const user = this.authService.userValue;
    if (!user) {
      this.error.set('Not authenticated');
      return;
    }

    const formValue = this.releaseForm.value;
    if (!formValue.title || !formValue.releaseDate) {
      this.error.set('Title and release date are required');
      return;
    }

    const payload = {
      artistId: user.id,
      title: formValue.title,
      releaseDate: new Date(formValue.releaseDate).toISOString(),
      coverUrl: formValue.coverUrl?.trim() || undefined,
    };

    this.loading.set(true);

    const editingId: number | null = this.editedReleaseId();
    if (editingId) {
      this.releaseService.updateRelease(editingId, payload)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
        next: (updated: Release) => {
          this.releases.update(list =>
            list.map(r => (r.id === updated.id ? { ...r, ...updated } : r))
          );
          this.updateStats([...this.releases()]);
          this.releaseForm.reset();
          this.editedReleaseId.set(null);
          this.error.set(null);
          this.loading.set(false);
        },
        error: () => {
          this.error.set('Failed to update release');
          this.loading.set(false);
        }
      });
    } else {
      this.releaseService.createRelease(payload)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
        next: (created: Release) => {
          this.releases.update(releases => [...releases, created]);
          this.updateStats([...this.releases()]);
          this.releaseForm.reset();
          this.error.set(null);
          this.loading.set(false);
        },
        error: () => {
          this.error.set('Failed to create release');
          this.loading.set(false);
        },
      });
    }
  }
}
