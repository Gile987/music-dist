import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminComponent } from './admin.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of, throwError, Subject } from 'rxjs';
import { RELEASE_STATUSES } from '../../core/interfaces/release-status.interface';

const mockTrack = {
  id: 1,
  title: 'T',
  duration: 1,
  fileUrl: 'url',
  streams: 0,
};
const mockRelease = {
  id: 1,
  title: 'R',
  status: 'PENDING' as const,
  releaseDate: '2025-01-01',
  streams: 0,
  tracks: [mockTrack],
};
const mockArtist: any = {
  id: 1,
  name: 'A',
  email: 'a@b.com',
  role: 'artist',
  releases: [mockRelease],
  totalTracks: 1,
  totalStreams: 0,
};
const mockArtists = [
  { ...mockArtist },
  { ...mockArtist, id: 2, name: 'B', email: 'b@b.com' },
];

const adminServiceStub = {
  getAllArtistsWithData: () => of(mockArtists),
  deleteUser: () => of(void 0),
  deleteRelease: () => of(void 0),
  deleteTrack: () => of(void 0),
  updateTrackStreams: () => of({ ...mockTrack, streams: 10 }),
  updateReleaseStatus: () =>
    of({ ...mockRelease, status: 'APPROVED' as const }),
};

const authServiceStub = {};
const releaseServiceStub = {};
const trackServiceStub = {};

describe('AdminComponent', () => {
  let component: AdminComponent;
  let fixture: ComponentFixture<AdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminComponent, HttpClientTestingModule],
      providers: [
        { provide: 'AdminService', useValue: adminServiceStub },
        { provide: 'AuthService', useValue: authServiceStub },
        { provide: 'ReleaseService', useValue: releaseServiceStub },
        { provide: 'TrackService', useValue: trackServiceStub },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(AdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call loadAllArtists on ngOnInit', () => {
    const spy = spyOn<any>(component, 'loadAllArtists');
    component.ngOnInit();
    expect(spy).toHaveBeenCalled();
  });

  it('should clean up on ngOnDestroy', () => {
    const completeSpy = spyOn(component['destroy$'], 'complete');
    component.ngOnDestroy();
    expect(completeSpy).toHaveBeenCalled();
  });

  it('should load artists and set loading/error', () => {
    spyOn(component['adminService'], 'getAllArtistsWithData').and.returnValue(
      of(mockArtists)
    );
    component['loadAllArtists']();
    expect(component.artists()).toEqual(mockArtists);
    expect(component.loading()).toBeFalse();
    expect(component.error()).toBeNull();
  });

  it('should handle error when loading artists fails', () => {
    spyOn(component['adminService'], 'getAllArtistsWithData').and.returnValue(
      throwError(() => new Error('fail'))
    );
    component['loadAllArtists']();
    expect(component.error()).toBe('Failed to load artists data');
    expect(component.loading()).toBeFalse();
  });

  it('should toggle artist expansion', () => {
    component.expandedArtistId.set(1);
    component.toggleArtistExpansion(1);
    expect(component.expandedArtistId()).toBeNull();
    component.toggleArtistExpansion(2);
    expect(component.expandedArtistId()).toBe(2);
  });

  it('should delete artist after confirmation and update state', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    component.artists.set([...mockArtists]);
    spyOn(component['adminService'], 'deleteUser').and.returnValue(of(void 0));
    component.onDeleteArtist(1, 'A');
    expect(component.artists().some((a) => a.id === 1)).toBeFalse();
    expect(component.deletingArtistId()).toBeNull();
    expect(component.expandedArtistId()).toBeNull();
  });

  it('should handle error when deleting artist fails', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    component.artists.set([...mockArtists]);
    spyOn(component['adminService'], 'deleteUser').and.returnValue(
      throwError(() => new Error('fail'))
    );
    component.onDeleteArtist(1, 'A');
    expect(component.error()).toBe('Failed to delete artist');
    expect(component.deletingArtistId()).toBeNull();
  });

  it('should delete release after confirmation and update state', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    const artist = { ...mockArtist };
    component.artists.set([artist]);
    spyOn(component['adminService'], 'deleteRelease').and.returnValue(
      of(void 0)
    );
    component.onDeleteRelease(1, 'R', artist.id);
    expect(component.artists()[0].releases.length).toBe(0);
    expect(component.deletingReleaseId()).toBeNull();
  });

  it('should handle error when deleting release fails', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    const artist = { ...mockArtist };
    component.artists.set([artist]);
    spyOn(component['adminService'], 'deleteRelease').and.returnValue(
      throwError(() => new Error('fail'))
    );
    component.onDeleteRelease(1, 'R', artist.id);
    expect(component.error()).toBe('Failed to delete release');
    expect(component.deletingReleaseId()).toBeNull();
  });

  it('should delete track after confirmation and update state', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    const artist = { ...mockArtist };
    component.artists.set([artist]);
    spyOn(component['adminService'], 'deleteTrack').and.returnValue(of(void 0));
    component.onDeleteTrack(1, 'T', artist.id, mockRelease.id);
    expect(component.artists()[0].releases[0].tracks!.length).toBe(0);
    expect(component.deletingTrackId()).toBeNull();
  });

  it('should handle error when deleting track fails', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    const artist = { ...mockArtist };
    component.artists.set([artist]);
    spyOn(component['adminService'], 'deleteTrack').and.returnValue(
      throwError(() => new Error('fail'))
    );
    component.onDeleteTrack(1, 'T', artist.id, mockRelease.id);
    expect(component.error()).toBe('Failed to delete track');
    expect(component.deletingTrackId()).toBeNull();
  });

  it('should update track streams and reload artists', () => {
    spyOn(component['adminService'], 'updateTrackStreams').and.returnValue(
      of({ ...mockTrack, streams: 10 })
    );
    const reloadSpy = spyOn<any>(component, 'loadAllArtists');
    component.artists.set([{ ...mockArtist }]);
    component.onUpdateTrackStreams(1, 10);
    expect(reloadSpy).toHaveBeenCalled();
    expect(component.artists()[0].releases[0].tracks![0].streams).toBe(10);
  });

  it('should handle error when updating track streams fails', () => {
    spyOn(component['adminService'], 'updateTrackStreams').and.returnValue(
      throwError(() => new Error('fail'))
    );
    component.artists.set([{ ...mockArtist }]);
    component.onUpdateTrackStreams(1, 10);
    expect(component.error()).toBe('Failed to update track streams');
  });

  it('should update release status and update state', () => {
    spyOn(component['adminService'], 'updateReleaseStatus').and.returnValue(
      of({ ...mockRelease, status: 'APPROVED' as const })
    );
    const artist = { ...mockArtist };
    component.artists.set([artist]);
    component.onReleaseStatusChange('APPROVED', mockRelease, artist);
    expect(component.artists()[0].releases[0].status).toBe('APPROVED');
    expect(component.deletingReleaseId()).toBeNull();
  });

  it('should handle error when updating release status fails', () => {
    spyOn(component['adminService'], 'updateReleaseStatus').and.returnValue(
      throwError(() => new Error('fail'))
    );
    const artist = { ...mockArtist };
    component.artists.set([artist]);
    component.onReleaseStatusChange('APPROVED', mockRelease, artist);
    expect(component.error()).toBe('Failed to update release status');
    expect(component.deletingReleaseId()).toBeNull();
  });

  it('should handle stream change from input event', () => {
    const spy = spyOn(component, 'onUpdateTrackStreams');
    const event = { target: { value: '42' } } as any;
    component.handleStreamChange(event, 1);
    expect(spy).toHaveBeenCalledWith(1, 42);
  });

  it('should set error on invalid stream input', () => {
    const event = { target: null } as any;
    component.handleStreamChange(event, 1);
    expect(component.error()).toBe('Invalid input element or value');
  });

  it('should refresh data by calling loadAllArtists', () => {
    const spy = spyOn<any>(component, 'loadAllArtists');
    component.refreshData();
    expect(spy).toHaveBeenCalled();
  });

  it('should not delete artist if confirmation is cancelled', () => {
    spyOn(window, 'confirm').and.returnValue(false);
    const artistsBefore = [...component.artists()];
    const deleteSpy = spyOn(component['adminService'], 'deleteUser');
    component.onDeleteArtist(1, 'A');
    expect(deleteSpy).not.toHaveBeenCalled();
    expect(component.artists()).toEqual(artistsBefore);
  });

  it('should not delete release if confirmation is cancelled', () => {
    spyOn(window, 'confirm').and.returnValue(false);
    const artistsBefore = [...component.artists()];
    const deleteSpy = spyOn(component['adminService'], 'deleteRelease');
    component.onDeleteRelease(1, 'R', 1);
    expect(deleteSpy).not.toHaveBeenCalled();
    expect(component.artists()).toEqual(artistsBefore);
  });

  it('should not delete track if confirmation is cancelled', () => {
    spyOn(window, 'confirm').and.returnValue(false);
    const artistsBefore = [...component.artists()];
    const deleteSpy = spyOn(component['adminService'], 'deleteTrack');
    component.onDeleteTrack(1, 'T', 1, 1);
    expect(deleteSpy).not.toHaveBeenCalled();
    expect(component.artists()).toEqual(artistsBefore);
  });

  it('should not update release status if new status is same as current', () => {
    component.artists.set([...mockArtists]);
    const artist = { ...component.artists()[0] };
    const release = artist.releases[0];
    const updateSpy = spyOn(component['adminService'], 'updateReleaseStatus');
    component.onReleaseStatusChange(release.status, release, artist);
    expect(updateSpy).not.toHaveBeenCalled();
  });

  it('should set error and not call update on handleStreamChange with empty value', () => {
    const spy = spyOn(component, 'onUpdateTrackStreams');
    const event = { target: { value: '' } } as any;
    component.handleStreamChange(event, 1);
    expect(spy).not.toHaveBeenCalled();
    expect(component.error()).toBe('Invalid input element or value');
  });
});
