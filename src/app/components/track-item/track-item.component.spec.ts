import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TrackItemComponent } from './track-item.component';
import { Track } from '../../core/interfaces/track.interface';
import { By } from '@angular/platform-browser';

describe('TrackItemComponent', () => {
  let component: TrackItemComponent;
  let fixture: ComponentFixture<TrackItemComponent>;
  const mockTrack: Track = {
    id: 1,
    title: 'Test Track',
    duration: 125,
    fileUrl: 'test.mp3',
    isrc: 'US-XXX-99-00001',
    streams: 12345
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrackItemComponent]
    }).compileComponents();
    fixture = TestBed.createComponent(TrackItemComponent);
    component = fixture.componentInstance;
    component.track = { ...mockTrack };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render track title and duration', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.track-title')?.textContent).toContain('Test Track');
    expect(compiled.querySelector('.track-duration')?.textContent).toContain('2:05');
  });

  it('should render streams if present', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.track-streams')?.textContent).toContain('12,345 streams');
  });

  it('should render ISRC if present', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.track-isrc')?.textContent).toContain('ISRC: US-XXX-99-00001');
  });

  it('should not render streams if not present', () => {
    component.track = { ...mockTrack, streams: undefined };
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.track-streams')).toBeNull();
  });

  it('should not render ISRC if not present', () => {
    component.track = { ...mockTrack, isrc: undefined };
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.track-isrc')).toBeNull();
  });

  it('should emit deleteTrack event when delete button is clicked', () => {
    spyOn(component.deleteTrack, 'emit');
    const btn = fixture.debugElement.query(By.css('.delete-btn'));
    btn.nativeElement.click();
    expect(component.deleteTrack.emit).toHaveBeenCalledWith(component.track);
  });

  it('should format duration correctly', () => {
    expect(component.formatDuration(125)).toBe('2:05');
    expect(component.formatDuration(60)).toBe('1:00');
    expect(component.formatDuration(59)).toBe('0:59');
    expect(component.formatDuration(0)).toBe('0:00');
  });
});
