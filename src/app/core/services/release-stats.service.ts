import { Injectable } from '@angular/core';
import { Release } from '../interfaces/release.interface';
import { ReleaseStats } from '../interfaces/release-stats.interface';

@Injectable({
  providedIn: 'root'
})
export class ReleaseStatsService {
  calculateStats(releases: Release[]): ReleaseStats {
    const approvedCount: number = releases.filter(r => r.status === 'APPROVED').length;
    const pendingCount: number = releases.filter(r => r.status === 'PENDING').length;
    const totalStreamsCount: number = releases.reduce((acc, r) => acc + ((r.totalStreams ?? r.streams) ?? 0), 0);
    
    return {
      totalStreams: totalStreamsCount,
      approvedReleases: approvedCount,
      pendingReleases: pendingCount
    };
  }
}
