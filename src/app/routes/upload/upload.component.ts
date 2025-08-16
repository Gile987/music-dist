import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UploadService } from '../../core/services/upload.service';
import { TrackService, CreateTrackDto } from '../../core/services/track.service';
import { ReleaseService } from '../../core/services/release.service';
import { AuthService } from '../../core/services/auth.service';
import { Release } from '../../core/interfaces/release.interface';
import { firstValueFrom } from 'rxjs';
import { ButtonComponent } from '../../shared/button.component';

@Component({
  selector: 'app-upload',
  imports: [ReactiveFormsModule, ButtonComponent, CommonModule],
  templateUrl: './upload.component.html',
  styleUrl: './upload.component.scss'
})
export class UploadComponent implements OnInit {
  private uploadService = inject(UploadService);
  private trackService = inject(TrackService);
  private releaseService = inject(ReleaseService);
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);

  uploading = signal(false);
  progress = signal(0);
  uploadSuccess = signal(false);
  uploadError = signal('');
  releases = signal<Release[]>([]);
  loadingReleases = signal(false);

  uploadForm: FormGroup = this.fb.group({
    title: ['', [Validators.required]],
    releaseId: ['', [Validators.required]],
    isrc: ['']
  });

  uploadedFileUrl: string | null = null;
  uploadedFileMetadata: { name: string, duration: number } | null = null;

  ngOnInit(): void {
    this.loadReleases();
    this.uploading.set(false);
    this.uploadSuccess.set(false);
    this.updateFormControlsBasedOnState();
  }
  
  private updateFormControlsBasedOnState(): void {
    if (this.loadingReleases()) {
      this.uploadForm.get('releaseId')?.disable();
    } else {
      this.uploadForm.get('releaseId')?.enable();
    }
  }

  loadReleases(): void {
    this.loadingReleases.set(true);
    this.updateFormControlsBasedOnState();
    
    const user = this.authService.userValue;
    if (user) {
      this.releaseService.getReleasesByArtist(user.id).subscribe({
        next: (data) => {
          this.releases.set(data);
          this.loadingReleases.set(false);
          this.updateFormControlsBasedOnState();
        },
        error: (err) => {
          this.uploadError.set('Failed to load releases');
          this.loadingReleases.set(false);
          this.updateFormControlsBasedOnState();
        }
      });
    }
  }

  async onFileSelected(event: Event): Promise<void> {
    this.uploadError.set('');
    this.uploadSuccess.set(false);
    this.updateFormControlsBasedOnState();
    this.progress.set(0);

    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];
    this.uploading.set(true);
    this.updateFormControlsBasedOnState();

    try {
      // Get file duration (example, in a real app you'd use the Web Audio API)
      const duration = await this.getAudioDuration(file);
      this.uploadedFileMetadata = {
        name: file.name.replace(/\.[^/.]+$/, ""), // Remove extension for title suggestion
        duration
      };
      
      // Prefill the title field with the file name
      this.uploadForm.patchValue({
        title: this.uploadedFileMetadata.name
      });

      // Upload the file
      const { url } = await firstValueFrom(
        this.uploadService.getSignedUrl(file.name, file.type)
      );
      await this.uploadService.uploadFile(url, file, this.progress);
      
      // Save the URL for later submission
      this.uploadedFileUrl = url.split('?')[0]; // Remove query parameters to get the base URL
      this.uploadSuccess.set(true);
      this.updateFormControlsBasedOnState();
    } catch (err: any) {
      this.uploadError.set(err?.message ?? 'Upload failed');
    } finally {
      this.uploading.set(false);
      this.updateFormControlsBasedOnState();
    }
  }

  onSubmit(): void {
    if (this.uploadForm.invalid || !this.uploadedFileUrl || !this.uploadedFileMetadata) {
      this.uploadError.set('Please fill all required fields and upload a file');
      return;
    }

    const trackData: CreateTrackDto = {
      title: this.uploadForm.value.title,
      releaseId: parseInt(this.uploadForm.value.releaseId),
      fileUrl: this.uploadedFileUrl,
      duration: this.uploadedFileMetadata.duration,
      isrc: this.uploadForm.value.isrc || undefined
    };

    this.trackService.createTrack(trackData).subscribe({
      next: () => {
        this.uploadSuccess.set(true);
        this.uploadForm.reset();
        this.uploadedFileUrl = null;
        this.uploadedFileMetadata = null;
      },
      error: (err) => {
        this.uploadError.set('Failed to save track information');
      }
    });
  }

  // This is a mock function. In a real app, you'd use the Web Audio API to get the duration
  private async getAudioDuration(file: File): Promise<number> {
    return new Promise<number>((resolve) => {
      // Mock duration calculation - in a real app use Web Audio API
      const size = file.size;
      // Rough estimate: 1MB ≈ 1 minute of audio at moderate quality
      const estimatedMinutes = size / (1024 * 1024);
      resolve(estimatedMinutes * 60); // Convert to seconds
    });
  }

  reset(): void {
    this.uploading.set(false);
    this.progress.set(0);
    this.uploadSuccess.set(false);
    this.uploadError.set('');
    this.uploadForm.reset();
    this.uploadedFileUrl = null;
    this.uploadedFileMetadata = null;
    this.updateFormControlsBasedOnState();
  }
}
