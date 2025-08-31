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
});
