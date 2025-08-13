import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReleaseListComponent } from '../../components/release-list/release-list.component';
import { StatCardComponent } from '../../components/stat-card/stat-card.component';
import { ReleaseService } from '../../core/services/release.service';
import { AuthService } from '../../core/services/auth.service';
import { Release } from '../../core/interfaces/release.interface';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-releases',
  standalone: true,
  imports: [CommonModule, ReleaseListComponent, StatCardComponent, ReactiveFormsModule],
  templateUrl: './releases.component.html',
  styleUrls: ['./releases.component.scss']
})
export class ReleasesComponent implements OnInit {
  private releaseService = inject(ReleaseService);
  private authService = inject(AuthService);

  releases = signal<Release[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  totalStreams = signal(0);
  activeReleases = signal(0);
  pendingReleases = signal(0);

  editedReleaseId = signal<number | null>(null);

  releaseForm = new FormGroup({
    title: new FormControl('', [Validators.required, Validators.maxLength(255)]),
    releaseDate: new FormControl('', [Validators.required]),
    coverUrl: new FormControl('', []),
  });

  ngOnInit(): void {
    const user = this.authService.userValue;
    if (user) {
      this.fetchReleases(user.id);
    } else {
      this.authService.user$.subscribe(u => {
        if (u) this.fetchReleases(u.id);
      });
    }
  }

  fetchReleases(artistId: number): void {
    this.loading.set(true);
    this.error.set(null);
    this.releaseService.getReleasesByArtist(artistId).subscribe({
      next: (data) => {
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

  updateStats(releases: Release[]): void {
    // Case-insensitive matching for statuses
    const activeCount = releases.filter(r => r.status.toLowerCase() === 'active').length;
    const pendingCount = releases.filter(r => r.status.toLowerCase() === 'pending').length;
    const totalStreamsCount = releases.reduce((acc, r) => acc + (r.streams ?? 0), 0);
    
    this.totalStreams.set(totalStreamsCount);
    this.activeReleases.set(activeCount);
    this.pendingReleases.set(pendingCount);
  }

  // 🔹 when user clicks "Edit" on a release
  onEditRelease(r: Release): void {
    this.editedReleaseId.set(r.id);
    this.releaseForm.setValue({
      title: r.title,
      // convert stored ISO/string to yyyy-MM-dd for <input type="date">
      releaseDate: this.toDateInputValue(r.releaseDate),
      coverUrl: r.coverUrl ?? ''
    });
    this.error.set(null);
  }

  // 🔹 when a release is deleted
  onReleaseDeleted(releaseId: number): void {
    // Filter out the deleted release from the releases signal
    this.releases.update(releases => releases.filter(r => r.id !== releaseId));
    // Update statistics
    this.updateStats([...this.releases()]);
  }

  // 🔹 cancel edit and reset to create mode
  cancelEdit(): void {
    this.editedReleaseId.set(null);
    this.releaseForm.reset();
    this.error.set(null);
  }

  onSubmit(): void {
    if (this.releaseForm.invalid) return;

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

    const editingId = this.editedReleaseId();
    if (editingId) {
      // 🔹 UPDATE
      this.releaseService.updateRelease(editingId, payload).subscribe({
        next: (updated) => {
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
      // 🔹 CREATE
      this.releaseService.createRelease(payload).subscribe({
        next: (created) => {
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

  // helper: ISO/string -> yyyy-MM-dd for date input
  private toDateInputValue(d: string): string {
    const date = new Date(d);
    const y = date.getFullYear();
    const m = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');
    return `${y}-${m}-${day}`;
  }
}
