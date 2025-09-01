import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ButtonComponent } from './button.component';
import { By } from '@angular/platform-browser';

import { Component } from '@angular/core';
@Component({
  standalone: true,
  imports: [ButtonComponent],
  template: `<app-button
    [variant]="variant"
    [type]="type"
    [size]="size"
    [disabled]="disabled"
    >Click me</app-button
  >`,
})
class TestHostComponent {
  variant: 'primary' | 'secondary' = 'primary';
  type: 'button' | 'submit' = 'button';
  size: 'default' | 'large' | 'small' = 'default';
  disabled = false;
}

describe('ButtonComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ButtonComponent, TestHostComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should render button with content', () => {
    const btn = fixture.debugElement.query(By.css('button'));
    expect(btn.nativeElement.textContent).toContain('Click me');
  });

  it('should apply correct variant class', () => {
    host.variant = 'secondary';
    fixture.detectChanges();
    const btn = fixture.debugElement.query(By.css('button'));
    expect(btn.nativeElement.classList).toContain('secondary');
  });

  it('should apply correct size class', () => {
    host.size = 'large';
    fixture.detectChanges();
    const btn = fixture.debugElement.query(By.css('button'));
    expect(btn.nativeElement.classList).toContain('large');
  });

  it('should set type attribute', () => {
    host.type = 'submit';
    fixture.detectChanges();
    const btn = fixture.debugElement.query(By.css('button'));
    expect(btn.nativeElement.getAttribute('type')).toBe('submit');
  });

  it('should disable the button when disabled is true', () => {
    host.disabled = true;
    fixture.detectChanges();
    const btn = fixture.debugElement.query(By.css('button'));
    expect(btn.nativeElement.disabled).toBeTrue();
    expect(btn.nativeElement.classList).toContain('disabled');
  });

  it('should enable the button when disabled is false', () => {
    host.disabled = false;
    fixture.detectChanges();
    const btn = fixture.debugElement.query(By.css('button'));
    expect(btn.nativeElement.disabled).toBeFalse();
  });

  it('should use default values for variant, type, and size', () => {
    const defaultFixture = TestBed.createComponent(ButtonComponent);
    defaultFixture.detectChanges();
    const btn = defaultFixture.nativeElement.querySelector('button');
    expect(btn.classList).toContain('primary');
    expect(btn.classList).toContain('default');
    expect(btn.getAttribute('type')).toBe('button');
  });

  it('should project complex HTML content', () => {
    @Component({
      standalone: true,
      imports: [ButtonComponent],
      template: `<app-button
        ><span class="icon"></span><b>Bold</b> <i>Italic</i></app-button
      >`,
    })
    class ContentHost {}
    const contentFixture = TestBed.createComponent(ContentHost);
    contentFixture.detectChanges();
    const btn = contentFixture.nativeElement.querySelector('button');
    expect(btn.querySelector('.icon')).not.toBeNull();
    expect(btn.querySelector('b')).not.toBeNull();
    expect(btn.querySelector('i')).not.toBeNull();
  });
});
