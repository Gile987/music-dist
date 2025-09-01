
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegisterComponent } from './register.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { provideRouter, Router } from '@angular/router';
import { ButtonComponent } from '../../shared/button/button.component';


describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let httpSpy: any;
  let router: Router;

  beforeEach(async () => {
    httpSpy = jasmine.createSpyObj('HttpClient', ['post']);
    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        ReactiveFormsModule,
        RegisterComponent,
        ButtonComponent
      ],
      providers: [
  { provide: FormBuilder, useClass: FormBuilder },
  { provide: HttpClient, useValue: httpSpy },
  provideRouter([])
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have invalid form when empty', () => {
    expect(component.form.invalid).toBeTrue();
    expect(component.form.get('name')?.errors?.['required']).toBeTrue();
    expect(component.form.get('email')?.errors?.['required']).toBeTrue();
    expect(component.form.get('password')?.errors?.['required']).toBeTrue();
  });

  it('should show email error for invalid email', () => {
    component.form.setValue({ name: 'Test', email: 'not-an-email', password: 'password' });
    expect(component.form.get('email')?.errors?.['email']).toBeTrue();
  });

  it('should not submit if form is invalid', () => {
    component.form.setValue({ name: '', email: '', password: '' });
    component.submit();
    expect(httpSpy.post).not.toHaveBeenCalled();
  });

  it('should call http.post and set success on valid submit', () => {
    component.form.setValue({ name: 'Test', email: 'test@example.com', password: 'password' });
    httpSpy.post.and.returnValue({
      pipe: () => ({
        subscribe: (handlers: any) => handlers.next()
      })
    });
    spyOn(window, 'setTimeout').and.callFake((fn: any) => { fn(); return 1; });
    spyOn(router, 'navigateByUrl');
    component.submit();
    expect(httpSpy.post).toHaveBeenCalledWith('/api/auth/register', jasmine.objectContaining({ name: 'Test', email: 'test@example.com', password: 'password', role: 'artist' }));
    expect(component.success()).toBeTrue();
    expect(router.navigateByUrl).toHaveBeenCalledWith('/login');
  });

  it('should set error and reset loading on http error', () => {
    component.form.setValue({ name: 'Test', email: 'test@example.com', password: 'password' });
    httpSpy.post.and.returnValue({
      pipe: () => ({
        subscribe: (handlers: any) => handlers.error({ error: { message: 'Registration failed' } })
      })
    });
    component.submit();
    expect(component.error()).toBe('Registration failed');
    expect(component.loading()).toBeFalse();
  });

    it('should mark name as invalid if too long', () => {
  const longName = 'a'.repeat(51);
  component.form.setValue({ name: longName, email: 'test@example.com', password: 'password' });
  expect(component.form.get('name')?.errors?.['maxlength']).toBeTruthy();
  expect(component.form.invalid).toBeTrue();
  });

  it('should mark password as invalid if too short', () => {
  component.form.setValue({ name: 'Test', email: 'test@example.com', password: '123' });
  expect(component.form.get('password')?.errors?.['minlength']).toBeTruthy();
  expect(component.form.invalid).toBeTrue();
  });

  it('should display error message in DOM when error is set', () => {
    component.error.set('Test error');
    fixture.detectChanges();
    const errorElem = fixture.nativeElement.querySelector('.error');
    expect(errorElem?.textContent).toContain('Test error');
  });

  it('should display success message in DOM when success is true', () => {
    component.success.set(true);
    fixture.detectChanges();
    const successElem = fixture.nativeElement.querySelector('.success');
    expect(successElem).not.toBeNull();
  });

  it('should disable submit button when loading is true', () => {
    component.loading.set(true);
    fixture.detectChanges();
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button[type="submit"]');
    expect(button.disabled).toBeTrue();
  });

  it('should set loading true during submit and false after error', () => {
    component.form.setValue({ name: 'Test', email: 'test@example.com', password: 'password' });
    httpSpy.post.and.returnValue({
      pipe: () => ({
        subscribe: (handlers: any) => handlers.error({ error: { message: 'fail' } })
      })
    });
    component.submit();
    expect(component.loading()).toBeFalse();
    expect(component.error()).toBe('fail');
  });

  it('should clear redirect timeout on destroy', () => {
    spyOn(window, 'clearTimeout');
    component['redirectTimeout'] = 123;
    component.ngOnDestroy();
    expect(window.clearTimeout).toHaveBeenCalledWith(123);
  });
});
