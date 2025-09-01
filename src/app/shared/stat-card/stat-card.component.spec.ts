import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatCardComponent } from './stat-card.component';

describe('StatCardComponent', () => {
  let component: StatCardComponent;
  let fixture: ComponentFixture<StatCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StatCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the title and value', () => {
    component.title = 'Total Streams';
    component.value = 12345;
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.title')?.textContent).toContain('Total Streams');
    expect(compiled.querySelector('.value')?.textContent).toContain('12345');
  });

  it('should render the icon if provided', () => {
    component.icon = '🎵';
    component.title = 'Tracks';
    component.value = 10;
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.icon')?.textContent).toContain('🎵');
  });

  it('should use the default icon if none is provided', () => {
    component.icon = undefined as any;
    component.title = 'Default';
    component.value = 1;
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.icon')?.textContent).toContain('📊');
  });
});
