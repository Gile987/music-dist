import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LandingComponent } from './landing.component';
import { RouterTestingModule } from '@angular/router/testing';
import { StatCardComponent } from '../../components/stat-card/stat-card.component';
import { ButtonComponent } from '../../shared/button/button.component';

describe('LandingComponent', () => {
  let component: LandingComponent;
  let fixture: ComponentFixture<LandingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LandingComponent, RouterTestingModule, StatCardComponent, ButtonComponent]
    }).compileComponents();
    fixture = TestBed.createComponent(LandingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render hero section with title and buttons', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.hero h1')?.textContent).toContain('Distribute Your Music Everywhere');
    expect(compiled.querySelector('.hero-actions app-button[variant="primary"]')?.textContent).toContain('Get Started Free');
    expect(compiled.querySelector('.hero-actions app-button[variant="secondary"]')?.textContent).toContain('Login');
  });

  it('should render all stat cards', () => {
    const cards = fixture.nativeElement.querySelectorAll('app-stat-card');
    expect(cards.length).toBe(4);
  });

  it('should render features, how-it-works, testimonials, faq, and cta sections', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.features')).toBeTruthy();
    expect(compiled.querySelector('.how-it-works')).toBeTruthy();
    expect(compiled.querySelector('.testimonials')).toBeTruthy();
    expect(compiled.querySelector('.faq')).toBeTruthy();
    expect(compiled.querySelector('.cta')).toBeTruthy();
  });

  it('should render all FAQ items', () => {
    const faqs = fixture.nativeElement.querySelectorAll('.faq-item');
    expect(faqs.length).toBe(4);
  });

  it('should render all testimonials', () => {
    const testimonials = fixture.nativeElement.querySelectorAll('.testimonial-list blockquote');
    expect(testimonials.length).toBe(3);
  });
});
