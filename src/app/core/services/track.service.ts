import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { Track } from '../interfaces/track.interface';
import { CreateTrackDto } from '../interfaces/create-track-dto.interface';

@Injectable({ providedIn: 'root' })
export class TrackService {
  private readonly http: HttpClient = inject(HttpClient);

  public createTrack(data: CreateTrackDto): Observable<Track> {
    return this.http.post<Track>('/api/tracks', data, { withCredentials: true })
      .pipe(
        catchError((error: HttpErrorResponse) => throwError((): Error => error))
      );
  }

  public getTracksByRelease(releaseId: number): Observable<Track[]> {
    return this.http.get<Track[]>(`/api/tracks/release/${releaseId}`, { withCredentials: true })
      .pipe(
        catchError((error: HttpErrorResponse) => throwError((): Error => error))
      );
  }

  public deleteTrack(trackId: number): Observable<void> {
    return this.http.delete<void>(`/api/tracks/${trackId}`, { withCredentials: true })
      .pipe(
        catchError((error: HttpErrorResponse) => throwError((): Error => error))
      );
  }
}
