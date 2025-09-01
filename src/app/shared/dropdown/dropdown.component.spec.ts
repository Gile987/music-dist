
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DropdownComponent } from './dropdown.component';
import { Component } from '@angular/core';
import { By } from '@angular/platform-browser';

@Component({
  standalone: true,
  imports: [DropdownComponent],
  template: `
    <app-dropdown [value]="value" [disabled]="disabled" (valueChange)="onValueChange($event)">
      <option value="">Select</option>
      <option value="1">One</option>
      <option value="2">Two</option>
    </app-dropdown>
  `
})
class TestHostComponent {
  value: string | number | null = '';
  disabled = false;
  changedValue: string | number | null = null;
  onValueChange(val: string | number) { this.changedValue = val; }
}

describe('DropdownComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DropdownComponent, TestHostComponent]
    }).compileComponents();
    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should render select with options', () => {
    const select = fixture.debugElement.query(By.css('select'));
    expect(select).toBeTruthy();
    const options = select.nativeElement.querySelectorAll('option');
    expect(options.length).toBe(3);
    expect(options[0].textContent).toContain('Select');
    expect(options[1].textContent).toContain('One');
    expect(options[2].textContent).toContain('Two');
  });

  it('should bind value input', () => {
    host.value = '2';
    fixture.detectChanges();
    const select = fixture.debugElement.query(By.css('select'));
    expect(select.nativeElement.value).toBe('2');
  });

  it('should disable select when disabled is true', () => {
    host.disabled = true;
    fixture.detectChanges();
    const select = fixture.debugElement.query(By.css('select'));
    expect(select.nativeElement.disabled).toBeTrue();
  });

  it('should enable select when disabled is false', () => {
    host.disabled = false;
    fixture.detectChanges();
    const select = fixture.debugElement.query(By.css('select'));
    expect(select.nativeElement.disabled).toBeFalse();
  });

  it('should emit valueChange on selection', () => {
    const select = fixture.debugElement.query(By.css('select'));
    select.nativeElement.value = '1';
    select.nativeElement.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    expect(host.changedValue).toBe('1');
  });

    it('should use default value if none provided', () => {
    @Component({
      standalone: true,
      imports: [DropdownComponent],
      template: `<app-dropdown><option value="">Select</option></app-dropdown>`
    })
    class DefaultHost {
    }
    const defaultFixture = TestBed.createComponent(DefaultHost);
    defaultFixture.detectChanges();
    const select = defaultFixture.nativeElement.querySelector('select');
    expect(select.value).toBe('');
  });

  it('should emit string value even if number is passed', () => {
    host.value = 2;
    fixture.detectChanges();
    const select = fixture.debugElement.query(By.css('select'));
    select.nativeElement.value = '2';
    select.nativeElement.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    expect(typeof host.changedValue).toBe('string');
    expect(host.changedValue).toBe('2');
  });

  it('should not emit valueChange when disabled', () => {
    host.disabled = true;
    fixture.detectChanges();
    const select = fixture.debugElement.query(By.css('select'));
    host.changedValue = null;
    select.nativeElement.value = '1';
    fixture.detectChanges();
    expect(host.changedValue).toBeNull();
  });

  it('should render complex ng-content', () => {
    @Component({
      standalone: true,
      imports: [DropdownComponent],
      template: `<app-dropdown><option value="a" selected>Alpha</option><option value="b"><b>Beta</b></option></app-dropdown>`
    })
    class ContentHost {}
    const contentFixture = TestBed.createComponent(ContentHost);
    contentFixture.detectChanges();
    const select = contentFixture.nativeElement.querySelector('select');
    expect(select.querySelector('option[value="a"]')).not.toBeNull();
    expect(select.querySelector('option[value="b"] b')).not.toBeNull();
  });
});
