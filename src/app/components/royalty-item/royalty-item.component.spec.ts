import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RoyaltyItemComponent } from './royalty-item.component';

describe('RoyaltyItemComponent', () => {
  let component: RoyaltyItemComponent;
  let fixture: ComponentFixture<RoyaltyItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoyaltyItemComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RoyaltyItemComponent);
    component = fixture.componentInstance;
    component.royalty = {
      id: 1,
      amount: 100,
      period: '2025-08',
      trackId: 1,
      artistId: 1,
      track: { id: 1, title: 'Test Track' },
      artist: { id: 1, name: 'Test Artist' }
    } as any;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render track title, period, and amount', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Test Track');
    expect(compiled.textContent).toContain('2025-08');
    expect(compiled.textContent).toContain('royalty');
  });

  it('should render "Unknown Track" if royalty.track is missing', () => {
    component.royalty = {
      id: 2,
      amount: 50,
      period: '2025-07',
      trackId: 2,
      artistId: 2,
      artist: { id: 2, name: 'Other Artist' }
    } as any;
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Unknown Track');
    expect(compiled.textContent).toContain('2025-07');
  });
});
