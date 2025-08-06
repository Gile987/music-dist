import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoyaltyListComponent } from './royalty-list.component';

describe('RoyaltyListComponent', () => {
  let component: RoyaltyListComponent;
  let fixture: ComponentFixture<RoyaltyListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoyaltyListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RoyaltyListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
