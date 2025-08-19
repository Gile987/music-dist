import { Injectable, inject, WritableSignal } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { SignedUrlResponse } from '../interfaces/upload.interface';

@Injectable({ providedIn: 'root' })
export class UploadService {
  private readonly http: HttpClient = inject(HttpClient);

  public getSignedUrl(filename: string, contentType: string): Observable<SignedUrlResponse> {
    const params: HttpParams = new HttpParams()
      .set('filename', filename)
      .set('contentType', contentType);

    return this.http.get<SignedUrlResponse>('/api/upload/signed-url', {
      params,
      withCredentials: true,
    }).pipe(
      catchError((error: HttpErrorResponse) => throwError((): Error => error))
    );
  }

  public uploadFile(signedUrl: string, file: File, progress: WritableSignal<number>): Promise<void> {
    return new Promise<void>((resolve, reject): void => {
      const xhr: XMLHttpRequest = new XMLHttpRequest();
      xhr.open('PUT', signedUrl);
      xhr.setRequestHeader('Content-Type', file.type);

      xhr.upload.onprogress = (event: ProgressEvent): void => {
        if (event.lengthComputable) {
          const percentComplete: number = Math.round((event.loaded / event.total) * 100);
          progress.set(percentComplete);
        }
      };

      xhr.onload = (): void => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve();
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      };

      xhr.onerror = (): void => {
        reject(new Error('Network error during upload'));
      };

      xhr.send(file);
    });
  }
}
