import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { ButtonComponent } from '../../shared/button/button.component';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['login']);
    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        ReactiveFormsModule,
        LoginComponent,
        ButtonComponent,
      ],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: FormBuilder, useClass: FormBuilder },
        provideRouter([]),
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have invalid form when empty', () => {
    expect(component.form.invalid).toBeTrue();
    expect(component.form.get('email')?.errors?.['required']).toBeTrue();
    expect(component.form.get('password')?.errors?.['required']).toBeTrue();
  });

  it('should show email error for invalid email', () => {
    component.form.setValue({ email: 'not-an-email', password: 'password' });
    expect(component.form.get('email')?.errors?.['email']).toBeTrue();
  });

  it('should call AuthService.login and navigate on success', () => {
    const email = 'test@example.com';
    const password = 'password';
    component.form.setValue({ email, password });
    (authServiceSpy.login as jasmine.Spy).and.returnValue({
      pipe: () => ({
        subscribe: (handlers: any) => handlers.next(),
      }),
    } as any);
    const router = TestBed.inject(Router) as any;
    router.navigateByUrl = jasmine.createSpy('navigateByUrl');
    component.submit();
    expect(authServiceSpy.login).toHaveBeenCalledWith(email, password);
    expect(router.navigateByUrl).toHaveBeenCalledWith('/dashboard');
  });

  it('should not submit if form is invalid', () => {
    component.form.setValue({ email: '', password: '' });
    component.submit();
    expect(authServiceSpy.login).not.toHaveBeenCalled();
  });

  it('should set error and reset loading on login error', () => {
    const email = 'fail@example.com';
    const password = 'badpass';
    component.form.setValue({ email, password });
    (authServiceSpy.login as jasmine.Spy).and.returnValue({
      pipe: () => ({
        subscribe: (handlers: any) => handlers.error(),
      }),
    } as any);
    component.submit();
    expect(component.error()).toBe('Invalid email or password');
    expect(component.loading()).toBeFalse();
  });

  it('should set loading true during submit and reset on error', () => {
    const email = 'test2@example.com';
    const password = 'password2';
    component.form.setValue({ email, password });
    let errorHandler: any;
    (authServiceSpy.login as jasmine.Spy).and.returnValue({
      pipe: () => ({
        subscribe: (handlers: any) => {
          errorHandler = handlers.error;
        },
      }),
    } as any);
    component.submit();
    expect(component.loading()).toBeTrue();
    errorHandler();
    expect(component.loading()).toBeFalse();
  });

  it('should reset error and loading on new submit', () => {
    component.error.set('Some error');
    component.loading.set(true);
    component.form.setValue({ email: 'reset@example.com', password: 'reset' });
    (authServiceSpy.login as jasmine.Spy).and.returnValue({
      pipe: () => ({
        subscribe: (handlers: any) => handlers.next(),
      }),
    } as any);
    component.submit();
    expect(component.error()).toBeNull();
    expect(component.loading()).toBeTrue();
  });
  it('should display error message in DOM when error is set', () => {
    component.error.set('Test error');
    fixture.detectChanges();
    const errorElem = fixture.nativeElement.querySelector('.error');
    expect(errorElem?.textContent).toContain('Test error');
  });

  it('should disable login button when loading is true', () => {
    component.loading.set(true);
    fixture.detectChanges();
    const button: HTMLButtonElement = fixture.nativeElement.querySelector(
      'button[type="submit"]'
    );
    expect(button.disabled).toBeTrue();
  });

  it('should call submit() when form is submitted via form submit event', () => {
    spyOn(component, 'submit');
    fixture.detectChanges();
    const form: HTMLFormElement = fixture.nativeElement.querySelector('form');
    form.dispatchEvent(new Event('submit'));
    fixture.detectChanges();
    expect(component.submit).toHaveBeenCalled();
  });

  it('should handle unexpected AuthService errors gracefully', () => {
    const email = 'user@example.com';
    const password = 'password';
    component.form.setValue({ email, password });
    (authServiceSpy.login as jasmine.Spy).and.returnValue({
      pipe: () => ({
        subscribe: (handlers: any) => handlers.error(new Error('Server error')),
      }),
    } as any);
    component.submit();
    expect(component.error()).toBe('Invalid email or password');
    expect(component.loading()).toBeFalse();
  });
});
