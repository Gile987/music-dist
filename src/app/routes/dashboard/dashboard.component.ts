import {
  Component,
  OnInit,
  OnDestroy,
  inject,
  ViewChild,
  ElementRef,
} from '@angular/core';
import Chart from 'chart.js/auto';
import { getRevenueLineConfig } from '../../core/chart-configs/revenue-line.config';
import { getRevenueByReleaseDoughnutConfig } from '../../core/chart-configs/revenue-by-release-doughnut.config';
import { getTopTracksBarConfig } from '../../core/chart-configs/top-tracks-bar.config';
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
  @ViewChild('revenueChart') revenueChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('revenueByReleaseChart')
  revenueByReleaseChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('topTracksChart')
  topTracksChartRef!: ElementRef<HTMLCanvasElement>;

  private topTracksChart: Chart<'bar'> | null = null;
  private readonly destroy$ = new Subject<void>();
  private chart: Chart<'line'> | null = null;
  private revenueByReleaseChart: Chart<'doughnut'> | null = null;

  totalReleases: number = 0;
  monthlyRevenue: number = 0;
  totalStreams: number = 0;

  private readonly releaseService: ReleaseService = inject(ReleaseService);
  private readonly royaltyService: RoyaltyService = inject(RoyaltyService);
  private readonly authService: AuthService = inject(AuthService);

  ngOnInit(): void {
    this.loadDashboardData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.chart) {
      this.chart.destroy();
    }
  }

  private loadDashboardData(): void {
    this.authService.user$.pipe(takeUntil(this.destroy$)).subscribe((user) => {
      const artistId = user?.id;
      if (!artistId) return;
      this.fetchReleasesAndRoyalties(artistId);
    });
  }

  private fetchReleasesAndRoyalties(artistId: number): void {
    forkJoin([
      this.releaseService.getReleasesByArtist(artistId),
      this.royaltyService.getRoyaltiesByArtist(artistId),
    ])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([releases, royalties]) => {
        this.setTotalReleases(releases);
        this.setTotalStreams(releases);
        this.setMonthlyRevenue(royalties);
        this.renderRevenueChart(royalties);
        this.renderRevenueByReleaseChart(releases, royalties);
        this.renderTopTracksChart(releases);
      });
  }

  private renderTopTracksChart(releases: Release[]): void {
    if (!this.topTracksChartRef || !this.topTracksChartRef.nativeElement)
      return;

    const trackStats: { title: string; streams: number }[] = [];
    for (const release of releases) {
      if (release.tracks) {
        for (const track of release.tracks) {
          trackStats.push({ title: track.title, streams: track.streams || 0 });
        }
      }
    }
    const topTracks = trackStats
      .sort((a, b) => b.streams - a.streams)
      .slice(0, 5);
    const labels = topTracks.map((t) => t.title);
    const data = topTracks.map((t) => t.streams);

    const config = getTopTracksBarConfig(labels, data);

    if (this.topTracksChart) {
      this.topTracksChart.destroy();
    }
    this.topTracksChart = new Chart(
      this.topTracksChartRef.nativeElement,
      config
    );
  }
  private renderRevenueByReleaseChart(
    releases: Release[],
    royalties: Royalty[]
  ): void {
    if (
      !this.revenueByReleaseChartRef ||
      !this.revenueByReleaseChartRef.nativeElement
    )
      return;

    const revenueByRelease: Record<number, number> = {};
    for (const release of releases) {
      let total = 0;
      if (release.tracks) {
        for (const track of release.tracks) {
          total += royalties
            .filter((r) => r.trackId === track.id)
            .reduce((sum, r) => sum + r.amount, 0);
        }
      }
      if (total > 0) {
        revenueByRelease[release.id] = total;
      }
    }
    const labels: string[] = [];
    const data: number[] = [];
    for (const release of releases) {
      if (revenueByRelease[release.id]) {
        labels.push(release.title);
        data.push(revenueByRelease[release.id]);
      }
    }

    const config = getRevenueByReleaseDoughnutConfig(labels, data);

    if (this.revenueByReleaseChart) {
      this.revenueByReleaseChart.destroy();
    }
    this.revenueByReleaseChart = new Chart(
      this.revenueByReleaseChartRef.nativeElement,
      config
    );
  }

  private setTotalReleases(releases: Release[]): void {
    this.totalReleases = releases.length;
  }

  private setTotalStreams(releases: Release[]): void {
    this.totalStreams = releases.reduce(
      (sum, release) =>
        sum +
        (release.tracks?.reduce((tSum, t) => tSum + (t.streams || 0), 0) || 0),
      0
    );
  }

  private setMonthlyRevenue(royalties: Royalty[]): void {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();
    this.monthlyRevenue = royalties
      .filter((r) => {
        const [royaltyYear, royaltyMonth] = r.period.split('-').map(Number);
        return royaltyYear === year && royaltyMonth === month;
      })
      .reduce((sum, r) => sum + r.amount, 0);
  }

  private renderRevenueChart(royalties: Royalty[]): void {
    if (!this.revenueChartRef || !this.revenueChartRef.nativeElement) return;

    const now = new Date();
    const labels: string[] = [];
    const monthKeys: string[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
        2,
        '0'
      )}`;
      monthKeys.push(key);
      labels.push(
        d.toLocaleString('default', { month: 'short', year: '2-digit' })
      );
    }

    const revenueByMonth: Record<string, number> = {};
    for (const r of royalties) {
      if (!revenueByMonth[r.period]) revenueByMonth[r.period] = 0;
      revenueByMonth[r.period] += r.amount;
    }
    const data: number[] = monthKeys.map((key) => revenueByMonth[key] || 0);

    const config = getRevenueLineConfig(labels, data);

    if (this.chart) {
      this.chart.destroy();
    }
    this.chart = new Chart(this.revenueChartRef.nativeElement, config);
  }
}
