import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { StatCardComponent } from '../../components/stat-card/stat-card.component';
import { ReleaseService } from '../../core/services/release.service';
import { RoyaltyService } from '../../core/services/royalty.service';
import { AuthService } from '../../core/services/auth.service';
import { Release } from '../../core/interfaces/release.interface';
import { Royalty } from '../../core/interfaces/royalty.interface';
import { forkJoin, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-dashboard',
  imports: [StatCardComponent],
  styleUrls: ['./dashboard.component.scss'],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();

  totalReleases: number = 0;
  monthlyRevenue: number = 0;
  totalStreams: number = 0;

  private readonly releaseService = inject(ReleaseService);
  private readonly royaltyService = inject(RoyaltyService);
  private readonly authService = inject(AuthService);

  ngOnInit(): void {
    this.loadDashboardData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadDashboardData(): void {
    this.authService.user$.pipe(takeUntil(this.destroy$)).subscribe((user) => {
      const artistId = user?.id;
      if (!artistId) return;
      forkJoin([
        this.releaseService.getReleasesByArtist(artistId),
        this.royaltyService.getRoyaltiesByArtist(artistId),
      ])
        .pipe(takeUntil(this.destroy$))
        .subscribe(([releases, royalties]) => {
          this.totalReleases = releases.length;
          this.totalStreams = releases.reduce(
            (sum, release) =>
              sum +
              (release.tracks?.reduce(
                (tSum, t) => tSum + (t.streams || 0),
                0
              ) || 0),
            0
          );
          const now = new Date();
          const month = now.getMonth() + 1;
          const year = now.getFullYear();
          this.monthlyRevenue = royalties
            .filter((r) => {
              const [royaltyYear, royaltyMonth] = r.period
                .split('-')
                .map(Number);
              return royaltyYear === year && royaltyMonth === month;
            })
            .reduce((sum, r) => sum + r.amount, 0);
        });
    });
  }
}
