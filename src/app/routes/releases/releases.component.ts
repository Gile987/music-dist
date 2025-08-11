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
      // Optionally, listen for user changes if async:
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
    this.totalStreams.set(releases.reduce((acc, r) => acc + (r.streams ?? 0), 0));
    this.activeReleases.set(releases.filter(r => r.status === 'active').length);
    this.pendingReleases.set(releases.filter(r => r.status === 'pending').length);
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

    const newRelease = {
      artistId: user.id,
      title: formValue.title,
      releaseDate: new Date(formValue.releaseDate!).toISOString(),
      coverUrl: formValue.coverUrl?.trim() || undefined,
    };

    this.loading.set(true);
    this.releaseService.createRelease(newRelease).subscribe({
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
