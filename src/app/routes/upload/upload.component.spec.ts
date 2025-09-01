import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { UploadComponent } from './upload.component';
import { of, throwError } from 'rxjs';

describe('UploadComponent', () => {
  let component: UploadComponent;
  let fixture: ComponentFixture<UploadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UploadComponent, HttpClientTestingModule],
    }).compileComponents();

    fixture = TestBed.createComponent(UploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call loadReleases and resetUploadState on ngOnInit', () => {
    const loadSpy = spyOn<any>(component, 'loadReleases');
    const resetSpy = spyOn<any>(component, 'resetUploadState');
    component.ngOnInit();
    expect(loadSpy).toHaveBeenCalled();
    expect(resetSpy).toHaveBeenCalled();
  });

  it('should set error if user is not authenticated when loading releases', () => {
    spyOnProperty(component['authService'], 'userValue', 'get').and.returnValue(
      null
    );
    component['handleLoadReleasesError'] = jasmine.createSpy();
    (component as any).loadReleases();
    expect(component['handleLoadReleasesError']).toHaveBeenCalledWith(
      'User not authenticated'
    );
  });

  it('should set releases and loading state on successful load', () => {
    const user = {
      id: 1,
      email: 'a@b.com',
      name: 'Test',
      role: 'artist' as const,
    };
    spyOnProperty(component['authService'], 'userValue', 'get').and.returnValue(
      user
    );
    const releases = [
      {
        id: 1,
        title: 'R',
        status: 'PENDING' as const,
        releaseDate: '2025-01-01',
        streams: 0,
      },
    ];
    spyOn(component['releaseService'], 'getReleasesByArtist').and.returnValue(
      of(releases)
    );
    (component as any).loadReleases();
    expect(component.releases()).toEqual(releases);
    expect(component.loadingReleases()).toBeFalse();
  });

  it('should set error and loading state on failed load', () => {
    const user = {
      id: 1,
      email: 'a@b.com',
      name: 'Test',
      role: 'artist' as const,
    };
    spyOnProperty(component['authService'], 'userValue', 'get').and.returnValue(
      user
    );
    spyOn(component['releaseService'], 'getReleasesByArtist').and.returnValue(
      throwError(() => new Error('fail'))
    );
    spyOn(component as any, 'handleLoadReleasesError');
    (component as any).loadReleases();
    expect((component as any).handleLoadReleasesError).toHaveBeenCalledWith(
      'Failed to load releases'
    );
  });

  it('should reset state on reset()', () => {
    component.uploadedFileUrl = 'url';
    component.uploadedFileMetadata = { name: 'file', duration: 123 };
    component.fileInputEnabled.set(false);
    spyOn(component as any, 'resetUploadState');
    spyOn(component.uploadForm, 'reset');
    component.reset();
    expect(component.uploadedFileUrl).toBeNull();
    expect(component.uploadedFileMetadata).toBeNull();
    expect(component.fileInputEnabled()).toBeTrue();
    expect((component as any).resetUploadState).toHaveBeenCalled();
    expect(component.uploadForm.reset).toHaveBeenCalled();
  });

  it('should set error if file validation fails on file select', async () => {
    const fakeEvent = {
      target: {
        files: [new File([''], 'test.mp3', { type: 'audio/mp3' })],
        value: '',
      },
    } as any;
    spyOn(
      component['fileValidationService'],
      'validateAudioFile'
    ).and.returnValue({ isValid: false, error: 'Invalid' });
    spyOn(component as any, 'handleFileError');
    await component.onFileSelected(fakeEvent);
    expect((component as any).handleFileError).toHaveBeenCalledWith(
      'Invalid',
      fakeEvent.target
    );
  });

  it('should update form and state on successful file upload', async () => {
    const file = new File([''], 'test.mp3', { type: 'audio/mp3' });
    const fakeEvent = { target: { files: [file] } } as any;
    spyOn(
      component['fileValidationService'],
      'validateAudioFile'
    ).and.returnValue({ isValid: true });
    spyOn(component as any, 'processFileUpload').and.returnValue(
      Promise.resolve()
    );
    await component.onFileSelected(fakeEvent);
    expect((component as any).processFileUpload).toHaveBeenCalledWith(file);
  });

  it('should set error if form is invalid on submit', () => {
    spyOn(component, 'canSubmit').and.returnValue(false);
    component.uploadError.set('');
    component.onSubmit();
    expect(component.uploadError()).toBe(
      'Please fill all required fields and upload a file'
    );
  });

  it('should set error if releaseId is invalid on submit', () => {
    spyOn(component, 'canSubmit').and.returnValue(true);
    spyOn(component as any, 'parseReleaseId').and.returnValue(null);
    component.uploadError.set('');
    component.onSubmit();
    expect(component.uploadError()).toBe('Invalid release selection');
  });

  it('should call trackService.createTrack and handle success on submit', () => {
    spyOn(component, 'canSubmit').and.returnValue(true);
    spyOn(component as any, 'parseReleaseId').and.returnValue(1);
    spyOn(component as any, 'createTrackData').and.returnValue({
      title: 'T',
      releaseId: 1,
      fileUrl: 'url',
      duration: 1,
    });
    const nextSpy = jasmine.createSpy('next');
    spyOn(component['trackService'], 'createTrack').and.returnValue(
      of({ id: 1, title: 'T', duration: 1, fileUrl: 'url' })
    );
    spyOn(component as any, 'handleSubmitSuccess');
    component.onSubmit();
    expect((component as any).handleSubmitSuccess).toHaveBeenCalled();
  });

  it('should call trackService.createTrack and handle error on submit', () => {
    spyOn(component, 'canSubmit').and.returnValue(true);
    spyOn(component as any, 'parseReleaseId').and.returnValue(1);
    spyOn(component as any, 'createTrackData').and.returnValue({
      title: 'T',
      releaseId: 1,
      fileUrl: 'url',
      duration: 1,
    });
    spyOn(component['trackService'], 'createTrack').and.returnValue(
      throwError(() => new Error('fail'))
    );
    component.uploadError.set('');
    component.onSubmit();
    expect(component.uploadError()).toBe('Failed to save track information');
  });

  it('should clean up on ngOnDestroy', () => {
    const completeSpy = spyOn(component['destroy$'], 'complete');
    component.ngOnDestroy();
    expect(completeSpy).toHaveBeenCalled();
  });

  it('should re-enable file input after a failed upload', async () => {
    const file = new File([''], 'fail.mp3', { type: 'audio/mp3' });
    const fakeEvent = { target: { files: [file] } } as any;
    spyOn(
      component['fileValidationService'],
      'validateAudioFile'
    ).and.returnValue({ isValid: true });
    spyOn(component as any, 'processFileUpload').and.callFake(async () => {
      component.fileInputEnabled.set(false);
      throw new Error('Upload failed');
    });
    try {
      await component.onFileSelected(fakeEvent);
    } catch {}
    expect(component.fileInputEnabled()).toBeFalse();
    component.uploading.set(false);
    (component as any).updateFormControlsBasedOnState();
    expect(component.fileInputEnabled()).toBeFalse();
    component.reset();
    expect(component.fileInputEnabled()).toBeTrue();
  });

  it('should update progress signal during upload', async () => {
    component.progress.set(0);
    expect(component.progress()).toBe(0);
    component.progress.set(50);
    expect(component.progress()).toBe(50);
    component.progress.set(100);
    expect(component.progress()).toBe(100);
  });

  it('should enable/disable form controls based on loading and uploading state', () => {
    const releaseIdControl = component.uploadForm.get('releaseId');
    if (!releaseIdControl) throw new Error('releaseId control missing');
    component.loadingReleases.set(true);
    (component as any).updateFormControlsBasedOnState();
    expect(releaseIdControl.disabled).toBeTrue();
    component.loadingReleases.set(false);
    component.uploading.set(true);
    (component as any).updateFormControlsBasedOnState();
    expect(releaseIdControl.disabled).toBeTrue();
    component.uploading.set(false);
    (component as any).updateFormControlsBasedOnState();
    expect(releaseIdControl.enabled).toBeTrue();
  });
});
