import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { RoyaltyItemComponent } from '../royalty-item/royalty-item.component';
import { AppCurrencyPipe } from '../../shared/pipes/currency.pipe';
import { Royalty } from '../../core/interfaces/royalty.interface';
import { Release } from '../../core/interfaces/release.interface';

interface GroupedRoyalty {
  releaseId: number;
  releaseTitle: string;
  royalties: Royalty[];
  totalRoyalty: number;
}

@Component({
  selector: 'app-royalty-list',
  imports: [RoyaltyItemComponent, AppCurrencyPipe],
  templateUrl: './royalty-list.component.html',
  styleUrls: ['./royalty-list.component.scss']
})
export class RoyaltyListComponent implements OnChanges {
  @Input() royalties: Royalty[] = [];
  @Input() releases: Release[] = [];
  grouped: GroupedRoyalty[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['royalties'] || changes['releases']) {
      this.groupRoyalties();
    }
  }

  private groupRoyalties(): void {
    const map = new Map<number, GroupedRoyalty>();
    for (const release of this.releases) {
      const royaltiesForRelease = this.royalties.filter(r => release.tracks?.some(t => t.id === r.trackId));
      if (royaltiesForRelease.length === 0) continue;
      map.set(release.id, {
        releaseId: release.id,
        releaseTitle: release.title,
        royalties: royaltiesForRelease,
        totalRoyalty: royaltiesForRelease.reduce((sum, r) => sum + r.amount, 0)
      });
    }
    this.grouped = Array.from(map.values());
  }
}
