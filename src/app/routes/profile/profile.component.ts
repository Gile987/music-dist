import { Component, signal, OnInit, OnDestroy, inject, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserInfoCardComponent } from '../../shared/user-info-card/user-info-card.component';
import { AuthService } from '../../core/services/auth.service';
import { UserProfile } from '../../core/interfaces/user-profile.interface';
import { ButtonComponent } from '../../shared/button/button.component';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-profile',
  imports: [CommonModule, ReactiveFormsModule, UserInfoCardComponent, ButtonComponent],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit, OnDestroy {
  private readonly authService: AuthService = inject(AuthService);
  private readonly fb: FormBuilder = inject(FormBuilder);
  private readonly destroy$: Subject<void> = new Subject<void>();

  readonly editForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]]
  });
  
  readonly passwordForm: FormGroup = this.fb.group({
    currentPassword: ['', [Validators.required, Validators.minLength(6)]],
    confirmCurrentPassword: ['', [Validators.required, Validators.minLength(6)]],
    newPassword: ['', [Validators.required, Validators.minLength(6)]]
  });

  user: WritableSignal<UserProfile | null> = signal<UserProfile | null>(null);
  avatarUrl: WritableSignal<string> = signal<string>('https://www.gravatar.com/avatar/?d=mp');
  isEditing: WritableSignal<boolean> = signal<boolean>(false);
  isLoading: WritableSignal<boolean> = signal<boolean>(false);
  showPasswordForm: WritableSignal<boolean> = signal<boolean>(false);
  successMessage: WritableSignal<string> = signal<string>('');
  errorMessage: WritableSignal<string> = signal<string>('');

  ngOnInit(): void {
    this.loadProfile();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadProfile(): void {
    this.authService.getProfile()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
      next: (profile) => {
        this.user.set(profile);
        this.avatarUrl.set(`https://i.pravatar.cc/150?u=${encodeURIComponent(profile.email)}`);
        this.editForm.patchValue({
          name: profile.name,
          email: profile.email
        });
      },
      error: () => {
        this.user.set(null);
        this.errorMessage.set('Failed to load profile');
      }
    });
  }

  public startEditing(): void {
    this.isEditing.set(true);
    this.clearMessages();
  }

  public cancelEditing(): void {
    this.isEditing.set(false);
    this.showPasswordForm.set(false);
    this.clearMessages();
    const currentUser = this.user();
    if (currentUser) {
      this.editForm.patchValue({
        name: currentUser.name,
        email: currentUser.email
      });
    }
    this.passwordForm.reset();
  }

  public saveProfile(): void {
    if (this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }

    const currentUser = this.user();
    const currentAuthUser = this.authService.userValue;
    if (!currentUser || !currentAuthUser) {
      this.errorMessage.set('User not found');
      return;
    }

    this.isLoading.set(true);
    this.clearMessages();

    const updates = this.editForm.value;
    this.authService.updateUser(currentAuthUser.id.toString(), updates)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
      next: (updatedProfile) => {
        this.user.set(updatedProfile);
        this.avatarUrl.set(`https://i.pravatar.cc/150?u=${encodeURIComponent(updatedProfile.email)}`);
        this.isEditing.set(false);
        this.isLoading.set(false);
        this.successMessage.set('Profile updated successfully');
      },
      error: (error) => {
        this.isLoading.set(false);
        this.errorMessage.set(error.error?.message || 'Failed to update profile');
      }
    });
  }

  public togglePasswordForm(): void {
    this.showPasswordForm.set(!this.showPasswordForm());
    this.clearMessages();
    this.passwordForm.reset();
  }

  public updatePassword(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    if (this.passwordForm.value.currentPassword !== this.passwordForm.value.confirmCurrentPassword) {
      this.errorMessage.set('Current passwords do not match');
      return;
    }

    const currentAuthUser = this.authService.userValue;
    if (!currentAuthUser) {
      this.errorMessage.set('User not found');
      return;
    }

    this.isLoading.set(true);
    this.clearMessages();

    this.authService.updateUser(currentAuthUser.id.toString(), { password: this.passwordForm.value.newPassword })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
      next: () => {
        this.isLoading.set(false);
        this.showPasswordForm.set(false);
        this.passwordForm.reset();
        this.successMessage.set('Password updated successfully');
      },
      error: (error) => {
        this.isLoading.set(false);
        this.errorMessage.set(error.error?.message || 'Failed to update password');
      }
    });
  }

  private clearMessages(): void {
    this.successMessage.set('');
    this.errorMessage.set('');
  }
}
