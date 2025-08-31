import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReleasesComponent } from './releases.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('ReleasesComponent', () => {
  let component: ReleasesComponent;
  let fixture: ComponentFixture<ReleasesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReleasesComponent, HttpClientTestingModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReleasesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
