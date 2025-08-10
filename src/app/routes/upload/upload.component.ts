import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UploadService } from '../../core/interfaces/services/upload.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-upload',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.scss'],
})
export class UploadComponent {
  uploading = signal(false);
  progress = signal(0);
  uploadSuccess = signal(false);
  uploadError = signal('');

  constructor(private uploadService: UploadService) {}

  async onFileSelected(event: Event): Promise<void> {
    this.uploadError.set('');
    this.uploadSuccess.set(false);
    this.progress.set(0);

    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];
    this.uploading.set(true);

    try {
      const { url } = await firstValueFrom(
        this.uploadService.getSignedUrl(file.name, file.type)
      );
      await this.uploadService.uploadFile(url, file, this.progress);
      this.uploadSuccess.set(true);
    } catch (err: any) {
      this.uploadError.set(err?.message ?? 'Upload failed');
    } finally {
      this.uploading.set(false);
    }
  }
}
