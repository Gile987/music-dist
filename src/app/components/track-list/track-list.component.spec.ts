import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TrackListComponent } from './track-list.component';
import { Track } from '../../core/interfaces/track.interface';
import { TrackService } from '../../core/services/track.service';
import { of, throwError } from 'rxjs';
import { By } from '@angular/platform-browser';

const mockTracks: Track[] = [
  { id: 1, title: 'Track 1', duration: 120, fileUrl: 'url1', isrc: 'ISRC1', streams: 100 },
  { id: 2, title: 'Track 2', duration: 150, fileUrl: 'url2', isrc: 'ISRC2', streams: 200 }
];

describe('TrackListComponent', () => {
  let component: TrackListComponent;
  let fixture: ComponentFixture<TrackListComponent>;
  let trackServiceSpy: jasmine.SpyObj<TrackService>;

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('TrackService', ['deleteTrack']);
    await TestBed.configureTestingModule({
      imports: [TrackListComponent],
      providers: [
        { provide: TrackService, useValue: spy }
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(TrackListComponent);
    component = fixture.componentInstance;
    trackServiceSpy = TestBed.inject(TrackService) as jasmine.SpyObj<TrackService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render a list of tracks', () => {
    component.tracks = mockTracks;
    fixture.detectChanges();
    const items = fixture.nativeElement.querySelectorAll('app-track-item');
    expect(items.length).toBe(2);
  });

  it('should show empty state if no tracks', () => {
    component.tracks = [];
    fixture.detectChanges();
    const empty = fixture.nativeElement.querySelector('.no-tracks');
    expect(empty).toBeTruthy();
    expect(empty.textContent).toContain('No tracks available');
  });

  it('should call deleteTrack and emit event on confirm', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    trackServiceSpy.deleteTrack.and.returnValue(of(void 0));
    spyOn(component.trackDeleted, 'emit');
    component.tracks = mockTracks;
    fixture.detectChanges();
    component.onDeleteTrack(mockTracks[0]);
    expect(trackServiceSpy.deleteTrack).toHaveBeenCalledWith(1);
    expect(component.trackDeleted.emit).toHaveBeenCalledWith(1);
  });

  it('should not call deleteTrack if confirm is false', () => {
    spyOn(window, 'confirm').and.returnValue(false);
    trackServiceSpy.deleteTrack.and.returnValue(of(void 0));
    component.tracks = mockTracks;
    fixture.detectChanges();
    component.onDeleteTrack(mockTracks[0]);
    expect(trackServiceSpy.deleteTrack).not.toHaveBeenCalled();
  });

  it('should alert on delete error', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    spyOn(window, 'alert');
    trackServiceSpy.deleteTrack.and.returnValue(throwError(() => new Error('fail')));
    component.tracks = mockTracks;
    fixture.detectChanges();
    component.onDeleteTrack(mockTracks[0]);
    expect(window.alert).toHaveBeenCalledWith('Failed to delete track. Please try again.');
  });
});
