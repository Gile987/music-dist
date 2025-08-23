import { Injectable } from '@angular/core';
import { ValidationResult } from '../interfaces/upload.interface';

@Injectable({
  providedIn: 'root'
})
export class FileValidationService {
  private readonly VALID_MIME_TYPES: readonly string[] = [
    'audio/mpeg',
    'audio/wav',
    'audio/wave',
    'audio/x-wav',
    'audio/flac',
    'audio/x-flac',
    'audio/aac',
    'audio/mp4',
    'audio/ogg',
    'audio/vorbis',
    'audio/webm'
  ] as const;

  private readonly VALID_EXTENSIONS: readonly string[] = [
    '.mp3',
    '.wav',
    '.flac',
    '.aac',
    '.m4a',
    '.ogg',
    '.webm'
  ] as const;

  private readonly MAX_FILE_SIZE: number = 50 * 1024 * 1024;

  validateAudioFile(file: File): ValidationResult {
    if (!this.isValidAudioFile(file)) {
      return {
        isValid: false,
        error: 'Please select a valid audio file (MP3, WAV, FLAC, AAC, OGG)'
      };
    }

    if (file.size > this.MAX_FILE_SIZE) {
      return {
        isValid: false,
        error: 'File size must be less than 50MB'
      };
    }

    return { isValid: true };
  }

  async getAudioDuration(file: File): Promise<number> {
    return new Promise<number>((resolve: (value: number) => void): void => {
      const size: number = file.size;
      const estimatedMinutes: number = size / (1024 * 1024);
      resolve(estimatedMinutes * 60);
    });
  }

  extractFileNameWithoutExtension(fileName: string): string {
    return fileName.replace(/\.[^/.]+$/, '');
  }

  private isValidAudioFile(file: File): boolean {
    const fileExtension: string = file.name
      .toLowerCase()
      .substring(file.name.lastIndexOf('.'));

    return (
      this.VALID_MIME_TYPES.includes(file.type as typeof this.VALID_MIME_TYPES[number]) ||
      this.VALID_EXTENSIONS.includes(fileExtension as typeof this.VALID_EXTENSIONS[number])
    );
  }
}
