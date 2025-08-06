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
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
