import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatusBadgeComponent } from './status-badge.component';

describe('StatusBadgeComponent', () => {
  let component: StatusBadgeComponent;
  let fixture: ComponentFixture<StatusBadgeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatusBadgeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StatusBadgeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render APPROVED status with correct class', () => {
    component.status = 'APPROVED';
    fixture.detectChanges();
    const el = fixture.nativeElement.querySelector('.status-badge');
    expect(el.textContent).toContain('APPROVED');
    expect(el.classList.contains('approved')).toBeTrue();
    expect(el.classList.contains('pending')).toBeFalse();
    expect(el.classList.contains('rejected')).toBeFalse();
  });

  it('should render PENDING status with correct class', () => {
    component.status = 'PENDING';
    fixture.detectChanges();
    const el = fixture.nativeElement.querySelector('.status-badge');
    expect(el.textContent).toContain('PENDING');
    expect(el.classList.contains('pending')).toBeTrue();
    expect(el.classList.contains('approved')).toBeFalse();
    expect(el.classList.contains('rejected')).toBeFalse();
  });

  it('should render REJECTED status with correct class', () => {
    component.status = 'REJECTED';
    fixture.detectChanges();
    const el = fixture.nativeElement.querySelector('.status-badge');
    expect(el.textContent).toContain('REJECTED');
    expect(el.classList.contains('rejected')).toBeTrue();
    expect(el.classList.contains('approved')).toBeFalse();
    expect(el.classList.contains('pending')).toBeFalse();
  });

  it('should render paid royalty status with no extra class', () => {
    component.status = 'paid' as any;
    fixture.detectChanges();
    const el = fixture.nativeElement.querySelector('.status-badge');
    expect(el.textContent).toContain('paid');
    expect(el.classList.contains('approved')).toBeFalse();
    expect(el.classList.contains('pending')).toBeFalse();
    expect(el.classList.contains('rejected')).toBeFalse();
  });

  it('should render pending royalty status with no extra class', () => {
    component.status = 'pending' as any;
    fixture.detectChanges();
    const el = fixture.nativeElement.querySelector('.status-badge');
    expect(el.textContent).toContain('pending');
    expect(el.classList.contains('approved')).toBeFalse();
    expect(el.classList.contains('pending')).toBeFalse();
    expect(el.classList.contains('rejected')).toBeFalse();
  });
});
