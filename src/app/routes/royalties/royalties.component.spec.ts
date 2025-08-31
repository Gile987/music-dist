import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RoyaltiesComponent } from './royalties.component';

describe('RoyaltiesComponent', () => {
  let component: RoyaltiesComponent;
  let fixture: ComponentFixture<RoyaltiesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoyaltiesComponent, HttpClientTestingModule]
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
