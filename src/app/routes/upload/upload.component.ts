import {
  Component,
  OnInit,
  OnDestroy,
  inject,
  signal,
  computed,
  WritableSignal,
  Signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { UploadService } from '../../core/services/upload.service';
import {
  TrackService,
  CreateTrackDto,
} from '../../core/services/track.service';
import { ReleaseService } from '../../core/services/release.service';
import { AuthService } from '../../core/services/auth.service';
import { FileValidationService } from '../../core/services/file-validation.service';
import { Release } from '../../core/interfaces/release.interface';
import {
  FileMetadata,
  UploadFormValue,
  ValidationResult,
} from '../../core/interfaces/upload.interface';
import { firstValueFrom, Subscription, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ButtonComponent } from '../../shared/button/button.component';

@Component({
  selector: 'app-upload',
  imports: [ReactiveFormsModule, ButtonComponent, CommonModule],
  templateUrl: './upload.component.html',
  styleUrl: './upload.component.scss',
})
export class UploadComponent implements OnInit, OnDestroy {
  readonly fileInputEnabled: WritableSignal<boolean> = signal(true);
  readonly uploading: WritableSignal<boolean> = signal(false);
  readonly progress: WritableSignal<number> = signal(0);
  readonly uploadSuccess: WritableSignal<boolean> = signal(false);
  readonly uploadError: WritableSignal<string> = signal('');
  readonly releases: WritableSignal<Release[]> = signal<Release[]>([]);
  readonly loadingReleases: WritableSignal<boolean> = signal(false);

  readonly isFormDisabled: Signal<boolean> = computed(() => 
    this.loadingReleases() || this.uploading()
  );

  readonly canSubmit: Signal<boolean> = computed(() => 
    !this.uploadForm.invalid && 
    !!this.uploadedFileUrl && 
    !!this.uploadedFileMetadata &&
    !this.uploading()
  );

  private readonly uploadService: UploadService = inject(UploadService);
  private readonly trackService: TrackService = inject(TrackService);
  private readonly releaseService: ReleaseService = inject(ReleaseService);
  private readonly authService: AuthService = inject(AuthService);
  private readonly fileValidationService: FileValidationService = inject(FileValidationService);
  private readonly fb: FormBuilder = inject(FormBuilder);

  private readonly destroy$ = new Subject<void>();

  readonly uploadForm: FormGroup = this.fb.group({
    title: ['', [Validators.required]],
    releaseId: ['', [Validators.required]],
    isrc: [''],
  });

  uploadedFileUrl: string | null = null;
  uploadedFileMetadata: FileMetadata | null = null;

  ngOnInit(): void {
    this.loadReleases();
    this.resetUploadState();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private resetUploadState(): void {
    this.uploading.set(false);
    this.uploadSuccess.set(false);
    this.progress.set(0);
    this.updateFormControlsBasedOnState();
  }

  private updateFormControlsBasedOnState(): void {
    const releaseIdControl = this.uploadForm.get('releaseId');
    if (!releaseIdControl) return;

    if (this.isFormDisabled()) {
      releaseIdControl.disable();
    } else {
      releaseIdControl.enable();
    }
  }

  private loadReleases(): void {
    this.loadingReleases.set(true);
    this.updateFormControlsBasedOnState();

    const user = this.authService.userValue;
    if (!user) {
      this.handleLoadReleasesError('User not authenticated');
      return;
    }

    const releases$ = this.releaseService.getReleasesByArtist(user.id);
    
    releases$
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: Release[]): void => {
          this.releases.set(data);
          this.loadingReleases.set(false);
          this.updateFormControlsBasedOnState();
        },
        error: (): void => {
          this.handleLoadReleasesError('Failed to load releases');
        },
      });
  }

  private handleLoadReleasesError(message: string): void {
    this.uploadError.set(message);
    this.loadingReleases.set(false);
    this.updateFormControlsBasedOnState();
  }

  async onFileSelected(event: Event): Promise<void> {
    this.clearErrors();
    this.progress.set(0);

    const file = this.extractFileFromEvent(event);
    if (!file) return;

    const validation: ValidationResult = this.fileValidationService.validateAudioFile(file);
    if (!validation.isValid) {
      this.handleFileError(validation.error!, event.target as HTMLInputElement);
      return;
    }

    await this.processFileUpload(file);
  }

  private extractFileFromEvent(event: Event): File | null {
    const input = event.target as HTMLInputElement;
    return input.files?.[0] ?? null;
  }

  private clearErrors(): void {
    this.uploadError.set('');
    this.uploadSuccess.set(false);
    this.updateFormControlsBasedOnState();
  }

  private handleFileError(error: string, input: HTMLInputElement): void {
    this.uploadError.set(error);
    input.value = '';
  }

  private async processFileUpload(file: File): Promise<void> {
    this.uploading.set(true);
    this.updateFormControlsBasedOnState();

    try {
      const metadata = await this.createFileMetadata(file);
      this.uploadedFileMetadata = metadata;
      this.updateFormTitle(metadata.name);

      const uploadUrl = await this.getUploadUrl(file);
      await this.uploadFile(uploadUrl, file);
      
      this.uploadedFileUrl = this.cleanUploadUrl(uploadUrl);
      this.fileInputEnabled.set(false);
      this.updateFormControlsBasedOnState();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed';
      this.uploadError.set(errorMessage);
    } finally {
      this.uploading.set(false);
      this.updateFormControlsBasedOnState();
    }
  }

  private async createFileMetadata(file: File): Promise<FileMetadata> {
    const duration = await this.fileValidationService.getAudioDuration(file);
    const name = this.fileValidationService.extractFileNameWithoutExtension(file.name);
    return { name, duration };
  }

  private updateFormTitle(title: string): void {
    this.uploadForm.patchValue({ title });
  }

  private async getUploadUrl(file: File): Promise<string> {
    const { url } = await firstValueFrom(
      this.uploadService.getSignedUrl(file.name, file.type)
    );
    return url;
  }

  private async uploadFile(url: string, file: File): Promise<void> {
    await this.uploadService.uploadFile(url, file, this.progress);
  }

  private cleanUploadUrl(url: string): string {
    return url.split('?')[0];
  }

  onSubmit(): void {
    if (!this.canSubmit()) {
      this.uploadError.set('Please fill all required fields and upload a file');
      return;
    }

    const formValue = this.uploadForm.value as UploadFormValue;
    const releaseId = this.parseReleaseId(formValue.releaseId);
    
    if (releaseId === null) {
      this.uploadError.set('Invalid release selection');
      return;
    }

    const trackData = this.createTrackData(formValue, releaseId);
    this.submitTrack(trackData);
  }

  private parseReleaseId(releaseIdString: string): number | null {
    const releaseId = parseInt(releaseIdString, 10);
    return Number.isNaN(releaseId) ? null : releaseId;
  }

  private createTrackData(formValue: UploadFormValue, releaseId: number): CreateTrackDto {
    return {
      title: formValue.title,
      releaseId,
      fileUrl: this.uploadedFileUrl!,
      duration: this.uploadedFileMetadata!.duration,
      isrc: formValue.isrc || undefined,
    };
  }

  private submitTrack(trackData: CreateTrackDto): void {
    this.trackService.createTrack(trackData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (): void => {
          this.handleSubmitSuccess();
        },
        error: (): void => {
          this.uploadError.set('Failed to save track information');
        },
      });
  }

  private handleSubmitSuccess(): void {
    this.uploadSuccess.set(true);
    this.uploadForm.reset();
    this.uploadedFileUrl = null;
    this.uploadedFileMetadata = null;
  }

  reset(): void {
    this.resetUploadState();
    this.uploadForm.reset();
    this.uploadedFileUrl = null;
    this.uploadedFileMetadata = null;
    this.fileInputEnabled.set(true);
    this.updateFormControlsBasedOnState();
  }
}
