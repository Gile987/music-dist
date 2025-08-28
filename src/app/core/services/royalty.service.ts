import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { Royalty } from '../interfaces/royalty.interface';

@Injectable({ providedIn: 'root' })
export class RoyaltyService {
  private readonly http: HttpClient = inject(HttpClient);

  public getAllRoyalties(): Observable<Royalty[]> {
    return this.http.get<Royalty[]>('/api/royalties', { withCredentials: true })
      .pipe(catchError((error: HttpErrorResponse) => throwError((): Error => error)));
  }

  public getRoyalty(id: number): Observable<Royalty> {
    return this.http.get<Royalty>(`/api/royalties/${id}`, { withCredentials: true })
      .pipe(catchError((error: HttpErrorResponse) => throwError((): Error => error)));
  }

  public getRoyaltiesByArtist(artistId: number): Observable<Royalty[]> {
    return this.http.get<Royalty[]>(`/api/royalties/artist/${artistId}`, { withCredentials: true })
      .pipe(catchError((error: HttpErrorResponse) => throwError((): Error => error)));
  }

  public getRoyaltiesByTrack(trackId: number): Observable<Royalty[]> {
    return this.http.get<Royalty[]>(`/api/royalties/track/${trackId}`, { withCredentials: true })
      .pipe(catchError((error: HttpErrorResponse) => throwError((): Error => error)));
  }
}
