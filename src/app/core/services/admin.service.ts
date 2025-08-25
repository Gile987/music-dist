import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, map, switchMap, of } from 'rxjs';
import { Release } from '../interfaces/release.interface';
import { Track } from '../interfaces/track.interface';
import { AuthUser } from '../interfaces/auth.interface';
import { ArtistWithData } from '../interfaces/artist.interface';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private readonly http: HttpClient = inject(HttpClient);

  getAllUsers(): Observable<AuthUser[]> {
    return this.http.get<AuthUser[]>('/api/users', { withCredentials: true });
  }

  getUser(userId: number): Observable<AuthUser> {
    return this.http.get<AuthUser>(`/api/users/${userId}`, { withCredentials: true });
  }

  getAllArtistsWithData(): Observable<ArtistWithData[]> {
    return this.getAllUsers().pipe(
      map(users => users.filter(user => user.role === 'artist')),
      switchMap(artists => {
        if (artists.length === 0) return of([]);
        return forkJoin(
          artists.map(artist => this.getArtistWithData(artist.id))
        );
      })
    );
  }

  getArtistWithData(artistId: number): Observable<ArtistWithData> {
    return forkJoin({
      user: this.getUser(artistId),
      releases: this.getArtistReleases(artistId)
    }).pipe(
      map(({ user, releases }) => {
        const totalTracks = releases.reduce((sum, release) => sum + (release.tracks?.length || 0), 0);
        const totalStreams = releases.reduce((sum, release) => sum + (release.streams || 0), 0);
        
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          releases,
          totalTracks,
          totalStreams
        };
      })
    );
  }

  getArtistReleases(artistId: number): Observable<Release[]> {
    return this.http.get<Release[]>(`/api/releases/artist/${artistId}`, { withCredentials: true });
  }

  getReleaseTracks(releaseId: number): Observable<Track[]> {
    return this.http.get<Track[]>(`/api/tracks/release/${releaseId}`, { withCredentials: true });
  }

  deleteUser(userId: number): Observable<void> {
    return this.http.delete<void>(`/api/users/${userId}`, { withCredentials: true });
  }

  deleteRelease(releaseId: number): Observable<void> {
    return this.http.delete<void>(`/api/releases/${releaseId}`, { withCredentials: true });
  }

  deleteTrack(trackId: number): Observable<void> {
    return this.http.delete<void>(`/api/tracks/${trackId}`, { withCredentials: true });
  }
}
