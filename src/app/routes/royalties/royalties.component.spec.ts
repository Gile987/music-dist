import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoyaltiesComponent } from './royalties.component';

describe('RoyaltiesComponent', () => {
  let component: RoyaltiesComponent;
  let fixture: ComponentFixture<RoyaltiesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoyaltiesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RoyaltiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
