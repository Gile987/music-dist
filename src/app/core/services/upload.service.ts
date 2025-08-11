import { Injectable, inject, WritableSignal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UploadService {
  private http = inject(HttpClient);

  getSignedUrl(filename: string, contentType: string): Observable<{ url: string }> {
    const params = { filename, contentType };
    return this.http.get<{ url: string }>('/api/upload/signed-url', {
      params: { filename, contentType },
      withCredentials: true,
    });
  }

  uploadFile(signedUrl: string, file: File, progress: WritableSignal<number>): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('PUT', signedUrl);
      xhr.setRequestHeader('Content-Type', file.type);

      xhr.upload.onprogress = event => {
        if (event.lengthComputable) {
          progress.set(Math.round((event.loaded / event.total) * 100));
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) resolve();
        else reject(new Error(`Upload failed with status ${xhr.status}`));
      };

      xhr.onerror = () => reject(new Error('Network error during upload'));

      xhr.send(file);
    });
  }
}
