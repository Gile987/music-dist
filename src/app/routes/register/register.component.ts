import { Component, signal, inject, OnDestroy, WritableSignal } from '@angular/core';
import { ButtonComponent } from '../../shared/button/button.component';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink, ButtonComponent],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnDestroy {
  private readonly fb: FormBuilder = inject(FormBuilder);
  private readonly http: HttpClient = inject(HttpClient);
  private readonly router: Router = inject(Router);
  private readonly destroy$: Subject<void> = new Subject<void>();
  private redirectTimeout?: number;

  readonly form: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(50)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  loading: WritableSignal<boolean> = signal<boolean>(false);
  error: WritableSignal<string | null> = signal<string | null>(null);
  success: WritableSignal<boolean> = signal<boolean>(false);

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.redirectTimeout) {
      clearTimeout(this.redirectTimeout);
    }
  }

  submit(): void {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set(null);
    this.success.set(false);
    const { name, email, password } = this.form.value;
    this.http.post('/api/auth/register', { name, email, password, role: 'artist' })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
      next: () => {
        this.success.set(true);
        this.redirectTimeout = window.setTimeout(() => this.router.navigateByUrl('/login'), 1500);
      },
      error: (err) => {
        this.error.set(err?.error?.message || 'Registration failed.');
        this.loading.set(false);
      }
    });
  }
}
