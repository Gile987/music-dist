import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { RoyaltyListComponent } from '../../components/royalty-list/royalty-list.component';
import { Royalty } from '../../core/interfaces/royalty.interface';
import { Release } from '../../core/interfaces/release.interface';
import { RoyaltyService } from '../../core/services/royalty.service';
import { ReleaseService } from '../../core/services/release.service';
import { AuthService } from '../../core/services/auth.service';
import { forkJoin, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-royalties',
  imports: [RoyaltyListComponent],
  templateUrl: './royalties.component.html',
  styleUrls: ['./royalties.component.scss']
})
export class RoyaltiesComponent implements OnInit, OnDestroy {
  royalties: Royalty[] = [];
  releases: Release[] = [];
  private readonly royaltyService: RoyaltyService = inject(RoyaltyService);
  private readonly releaseService: ReleaseService = inject(ReleaseService);
  private readonly authService: AuthService = inject(AuthService);
  private readonly destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.loadRoyaltiesAndReleases();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadRoyaltiesAndReleases(): void {
    this.authService.user$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        const artistId = user?.id ?? 0;
        forkJoin([
          this.royaltyService.getAllRoyalties(),
          this.releaseService.getReleasesByArtist(artistId)
        ])
        .pipe(takeUntil(this.destroy$))
        .subscribe(([royalties, releases]) => {
          this.royalties = royalties;
          this.releases = releases;
        });
      });
  }
}
