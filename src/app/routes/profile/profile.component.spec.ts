import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ProfileComponent } from './profile.component';
import { AuthService } from '../../core/services/auth.service';
import { of } from 'rxjs';

describe('ProfileComponent', () => {
  let component: ProfileComponent;
  let fixture: ComponentFixture<ProfileComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj(
      'AuthService',
      ['getProfile', 'updateUser'],
      { userValue: { id: 1 } }
    );
    authServiceSpy.getProfile.and.returnValue(
      of({
        name: 'Test User',
        email: 'test@example.com',
        role: 'artist' as 'artist',
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z',
      })
    );
    await TestBed.configureTestingModule({
      imports: [ProfileComponent, HttpClientTestingModule],
      providers: [{ provide: AuthService, useValue: authServiceSpy }],
    }).compileComponents();
    fixture = TestBed.createComponent(ProfileComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should load user profile on init and populate form', () => {
    const mockProfile = {
      name: 'Test User',
      email: 'test@example.com',
      role: 'artist' as 'artist',
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z',
    };
    authServiceSpy.getProfile.and.returnValue(of(mockProfile));
    fixture.detectChanges();
    expect(component.user()).toEqual(mockProfile);
    expect(component.editForm.value.name).toBe('Test User');
    expect(component.editForm.value.email).toBe('test@example.com');
  });

  it('should handle profile load error and set error message', () => {
    authServiceSpy.getProfile.and.returnValue({
      pipe: () => ({
        subscribe: ({ error }: any) => error(),
      }),
    } as any);
    fixture = TestBed.createComponent(ProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component.user()).toBeNull();
    expect(component.errorMessage()).toBe('Failed to load profile');
  });

  it('should start and cancel editing, restoring form values', () => {
    fixture.detectChanges();
    component.startEditing();
    expect(component.isEditing()).toBeTrue();
    component.editForm.patchValue({
      name: 'Changed',
      email: 'changed@example.com',
    });
    component.cancelEditing();
    expect(component.isEditing()).toBeFalse();
    expect(component.editForm.value.name).toBe('Test User');
    expect(component.editForm.value.email).toBe('test@example.com');
  });

  it('should save profile changes and set success message', () => {
    fixture.detectChanges();
    component.startEditing();
    component.editForm.patchValue({
      name: 'New Name',
      email: 'new@example.com',
    });
    const updatedProfile = {
      name: 'New Name',
      email: 'new@example.com',
      role: 'artist' as 'artist',
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-02T00:00:00Z',
    };
    authServiceSpy.updateUser.and.returnValue({
      pipe: () => ({
        subscribe: ({ next }: any) => next(updatedProfile),
      }),
    } as any);
    component.saveProfile();
    expect(authServiceSpy.updateUser).toHaveBeenCalled();
    expect(component.user()).toEqual(updatedProfile);
    expect(component.successMessage()).toBe('Profile updated successfully');
    expect(component.isEditing()).toBeFalse();
    expect(component.isLoading()).toBeFalse();
  });

  it('should set error message if saveProfile fails', () => {
    fixture.detectChanges();
    component.startEditing();
    component.editForm.patchValue({
      name: 'Bad Name',
      email: 'bad@example.com',
    });
    authServiceSpy.updateUser.and.returnValue({
      pipe: () => ({
        subscribe: ({ error }: any) =>
          error({ error: { message: 'Update failed' } }),
      }),
    } as any);
    component.saveProfile();
    expect(component.errorMessage()).toBe('Update failed');
    expect(component.isLoading()).toBeFalse();
  });

  it('should show error if password form passwords do not match', () => {
    fixture.detectChanges();
    component.togglePasswordForm();
    component.passwordForm.patchValue({
      currentPassword: 'abc123',
      confirmCurrentPassword: 'different',
      newPassword: 'newpass123',
    });
    component.updatePassword();
    expect(component.errorMessage()).toBe('Current passwords do not match');
    expect(component.isLoading()).toBeFalse();
  });

  it('should update password and set success message', () => {
    fixture.detectChanges();
    component.togglePasswordForm();
    component.passwordForm.patchValue({
      currentPassword: 'abc123',
      confirmCurrentPassword: 'abc123',
      newPassword: 'newpass123',
    });
    authServiceSpy.updateUser.and.returnValue({
      pipe: () => ({
        subscribe: ({ next }: any) => next(),
      }),
    } as any);
    component.updatePassword();
    expect(component.successMessage()).toBe('Password updated successfully');
    expect(component.isLoading()).toBeFalse();
    expect(component.showPasswordForm()).toBeFalse();
    expect(component.passwordForm.value.currentPassword).toBeNull();
    expect(component.passwordForm.value.confirmCurrentPassword).toBeNull();
    expect(component.passwordForm.value.newPassword).toBeNull();
  });

  it('should not save profile if form is invalid and should mark fields as touched', () => {
    fixture.detectChanges();
    component.startEditing();
    component.editForm.patchValue({ name: '', email: 'bademail' });
    component.saveProfile();
    expect(authServiceSpy.updateUser).not.toHaveBeenCalled();
    expect(component.editForm.get('name')?.touched).toBeTrue();
    expect(component.editForm.get('email')?.touched).toBeTrue();
  });

  it('should not update password if form is invalid and should mark fields as touched', () => {
    fixture.detectChanges();
    component.togglePasswordForm();
    component.passwordForm.patchValue({
      currentPassword: '',
      confirmCurrentPassword: '',
      newPassword: '',
    });
    component.updatePassword();
    expect(authServiceSpy.updateUser).not.toHaveBeenCalled();
    expect(component.passwordForm.get('currentPassword')?.touched).toBeTrue();
    expect(
      component.passwordForm.get('confirmCurrentPassword')?.touched
    ).toBeTrue();
    expect(component.passwordForm.get('newPassword')?.touched).toBeTrue();
  });

  it('should set error message if updatePassword fails', () => {
    fixture.detectChanges();
    component.togglePasswordForm();
    component.passwordForm.patchValue({
      currentPassword: 'abc123',
      confirmCurrentPassword: 'abc123',
      newPassword: 'newpass123',
    });
    authServiceSpy.updateUser.and.returnValue({
      pipe: () => ({
        subscribe: ({ error }: any) =>
          error({ error: { message: 'Password update failed' } }),
      }),
    } as any);
    component.updatePassword();
    expect(component.errorMessage()).toBe('Password update failed');
    expect(component.isLoading()).toBeFalse();
  });

  it('should set error message if user not found on saveProfile', () => {
    fixture.detectChanges();
    component.user.set(null);
    component.startEditing();
    component.editForm.patchValue({ name: 'Any', email: 'any@example.com' });
    component.saveProfile();
    expect(component.errorMessage()).toBe('User not found');
    expect(authServiceSpy.updateUser).not.toHaveBeenCalled();
  });

  it('should set isLoading true during saveProfile and false after', () => {
    fixture.detectChanges();
    component.startEditing();
    component.editForm.patchValue({
      name: 'New Name',
      email: 'new@example.com',
    });
    let nextFn: any;
    authServiceSpy.updateUser.and.returnValue({
      pipe: () => ({
        subscribe: (handlers: any) => {
          nextFn = handlers.next;
        },
      }),
    } as any);
    component.saveProfile();
    expect(component.isLoading()).toBeTrue();
    nextFn({
      name: 'New Name',
      email: 'new@example.com',
      role: 'artist',
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-02T00:00:00Z',
    });
    expect(component.isLoading()).toBeFalse();
  });

  it('should set isLoading true during updatePassword and false after', () => {
    fixture.detectChanges();
    component.togglePasswordForm();
    component.passwordForm.patchValue({
      currentPassword: 'abc123',
      confirmCurrentPassword: 'abc123',
      newPassword: 'newpass123',
    });
    let nextFn: any;
    authServiceSpy.updateUser.and.returnValue({
      pipe: () => ({
        subscribe: (handlers: any) => {
          nextFn = handlers.next;
        },
      }),
    } as any);
    component.updatePassword();
    expect(component.isLoading()).toBeTrue();
    nextFn();
    expect(component.isLoading()).toBeFalse();
  });

  it('should set error message if user not found on updatePassword (getter override)', () => {
    fixture.detectChanges();
    component.togglePasswordForm();
    component.passwordForm.patchValue({
      currentPassword: 'abc123',
      confirmCurrentPassword: 'abc123',
      newPassword: 'newpass123',
    });
    Object.defineProperty(authServiceSpy, 'userValue', { get: () => null });
    component.updatePassword();
    expect(component.errorMessage()).toBe('User not found');
    expect(authServiceSpy.updateUser).not.toHaveBeenCalled();
  });
});
