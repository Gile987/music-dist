import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReleaseItemComponent } from './release-item.component';
import { TrackService } from '../../core/services/track.service';
import { ReleaseService } from '../../core/services/release.service';

describe('ReleaseItemComponent', () => {
  let component: ReleaseItemComponent;
  let fixture: ComponentFixture<ReleaseItemComponent>;


  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReleaseItemComponent],
      providers: [
        { provide: TrackService, useValue: {} },
        { provide: ReleaseService, useValue: {} }
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
});
