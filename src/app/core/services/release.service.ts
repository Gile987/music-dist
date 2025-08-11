import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { Release } from '../interfaces/release.interface';
import { ReleaseCreateDto } from '../interfaces/release-dto.interface';

@Injectable({ providedIn: 'root' })
export class ReleaseService {
  private readonly http: HttpClient = inject(HttpClient);

  public getReleasesByArtist(artistId: number): Observable<Release[]> {
    return this.http.get<Release[]>(`/api/releases/artist/${artistId}`, { withCredentials: true })
      .pipe(
        catchError((error: HttpErrorResponse) => throwError((): Error => error))
      );
  }

  public createRelease(data: ReleaseCreateDto): Observable<Release> {
    return this.http.post<Release>('/api/releases', data, { withCredentials: true })
      .pipe(
        catchError((error: HttpErrorResponse) => throwError((): Error => error))
      );
  }
}
