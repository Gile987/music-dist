import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Release } from '../interfaces/release.interface';

@Injectable({ providedIn: 'root' })
export class ReleaseService {
  private http = inject(HttpClient);

  getReleasesByArtist(artistId: number): Observable<Release[]> {
    return this.http.get<Release[]>(`/api/releases/artist/${artistId}`, { withCredentials: true });
  }

  createRelease(data: Partial<Release>): Observable<Release> {
    return this.http.post<Release>('/api/releases', data, { withCredentials: true });
  }
}
