import {
  Component,
  OnInit,
  OnDestroy,
  inject,
  ViewChild,
  ElementRef,
} from '@angular/core';
import Chart, { ChartConfiguration } from 'chart.js/auto';
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
      });
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

    const config: ChartConfiguration<'doughnut'> = {
      type: 'doughnut',
      data: {
        labels,
        datasets: [
          {
            label: 'Revenue by Release',
            data,
            backgroundColor: [
              '#42a5f5',
              '#66bb6a',
              '#ffd600',
              '#ef5350',
              '#ab47bc',
              '#ffa726',
              '#26a69a',
              '#8d6e63',
              '#789262',
              '#d4e157',
            ],
            borderColor: '#232b36',
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: false,
        plugins: {
          legend: { display: true, position: 'bottom' },
          tooltip: { enabled: true },
        },
      },
    };

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

    const config: ChartConfiguration<'line'> = {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Monthly Revenue',
            data,
            borderColor: '#42a5f5',
            backgroundColor: 'rgba(66,165,245,0.2)',
            fill: true,
            tension: 0.3,
            pointRadius: 4,
            pointHoverRadius: 6,
          },
        ],
      },
      options: {
        responsive: false,
        plugins: {
          legend: { display: false },
          tooltip: { enabled: true },
        },
        scales: {
          y: {
            beginAtZero: true,
            title: { display: true, text: 'Revenue ($)' },
          },
          x: { title: { display: true, text: 'Month' } },
        },
      },
    };

    if (this.chart) {
      this.chart.destroy();
    }
    this.chart = new Chart(this.revenueChartRef.nativeElement, config);
  }
}
