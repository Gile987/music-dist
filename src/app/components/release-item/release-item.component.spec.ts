import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReleaseItemComponent } from './release-item.component';
import { TrackService } from '../../core/services/track.service';
import { ReleaseService } from '../../core/services/release.service';

describe('ReleaseItemComponent', () => {
  let component: ReleaseItemComponent;
  let fixture: ComponentFixture<ReleaseItemComponent>;


  let mockReleaseService: any;
  beforeEach(async () => {
    mockReleaseService = {
      deleteRelease: jasmine.createSpy('deleteRelease')
    };
    await TestBed.configureTestingModule({
      imports: [ReleaseItemComponent],
      providers: [
        { provide: TrackService, useValue: {} },
        { provide: ReleaseService, useValue: mockReleaseService }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReleaseItemComponent);
    component = fixture.componentInstance;
    component.release = {
      id: 1,
      title: 'Test Release',
      status: 'PENDING',
      releaseDate: new Date().toISOString(),
    } as any;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit edit event when onEditClick is called', () => {
    spyOn(component.edit, 'emit');
    component.onEditClick();
    expect(component.edit.emit).toHaveBeenCalledWith(component.release);
  });

  it('should emit deleted event after successful delete', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    mockReleaseService.deleteRelease.and.returnValue({
      pipe: () => ({
        subscribe: (handlers: any) => handlers.next()
      })
    } as any);
    spyOn(component.deleted, 'emit');
    component.onDeleteClick();
    expect(component.deleted.emit).toHaveBeenCalledWith(component.release.id);
  });

  it('should not call deleteRelease if confirm is false', () => {
    spyOn(window, 'confirm').and.returnValue(false);
    component.onDeleteClick();
    expect(mockReleaseService.deleteRelease).not.toHaveBeenCalled();
  });

  it('should toggle showTracks and call loadTracks if needed', () => {
    const loadTracksSpy = spyOn<any>(component, 'loadTracks');
    component.showTracks = false;
    component.tracksLoaded = false;
    component.toggleTracks();
    expect(component.showTracks).toBeTrue();
    expect(loadTracksSpy).toHaveBeenCalled();
  });

  it('should remove track from tracks on onTrackDeleted', () => {
    component.tracks = [
      { id: 1, title: 'Track 1', duration: 100, fileUrl: 'url1' },
      { id: 2, title: 'Track 2', duration: 200, fileUrl: 'url2' }
    ];
    component.onTrackDeleted(1);
    expect(component.tracks.length).toBe(1);
    expect(component.tracks[0].id).toBe(2);
  });

  it('should initialize tracks and tracksLoaded in ngOnInit if release has tracks', () => {
    const testTracks = [
      { id: 1, title: 'Track 1', duration: 100, fileUrl: 'url1' }
    ];
    component.release = {
      ...component.release,
      tracks: testTracks
    };
    component.ngOnInit();
    expect(component.tracks).toEqual(testTracks);
    expect(component.tracksLoaded).toBeTrue();
  });
});
