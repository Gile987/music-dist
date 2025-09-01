import { RouterTestingModule } from '@angular/router/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { LayoutComponent } from './layout.component';
import { of, Subject } from 'rxjs';
import { fakeAsync, tick } from '@angular/core/testing';
import { AuthService } from '../../core/services/auth.service';
import { AuthUser } from '../../core/interfaces/auth.interface';
import { BehaviorSubject } from 'rxjs';

describe('LayoutComponent', () => {
  let component: LayoutComponent;
  let fixture: ComponentFixture<LayoutComponent>;
  let authServiceMock: jasmine.SpyObj<AuthService>;
  let userSubject: BehaviorSubject<AuthUser | null>;
  let isAuthenticatedSubject: BehaviorSubject<boolean>;

  beforeEach(async () => {
    userSubject = new BehaviorSubject<AuthUser | null>(null);
    isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
    authServiceMock = jasmine.createSpyObj<AuthService>(
      'AuthService',
      ['logout'],
      {
        user$: userSubject.asObservable(),
        isAuthenticated$: isAuthenticatedSubject.asObservable(),
      }
    );
    authServiceMock.logout.and.returnValue(of(void 0));

    await TestBed.configureTestingModule({
      imports: [LayoutComponent, HttpClientTestingModule, RouterTestingModule],
      providers: [{ provide: AuthService, useValue: authServiceMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(LayoutComponent);
    component = fixture.componentInstance;
    fixture.autoDetectChanges(true);
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should display the user’s name when authenticated', fakeAsync(() => {
    userSubject.next({
      id: 2,
      email: 'artist@test.com',
      name: 'Artist',
      role: 'artist',
    });
    isAuthenticatedSubject.next(true);
    tick();
    const welcome = fixture.nativeElement.querySelector('.welcome-text');
    expect(welcome).not.toBeNull();
    expect(welcome?.textContent).toContain('Artist');
  }));

  it('should show the admin link if the user is an admin', fakeAsync(() => {
    userSubject.next({
      id: 1,
      email: 'admin@test.com',
      name: 'Admin',
      role: 'admin',
    });
    isAuthenticatedSubject.next(true);
    tick();
    const adminLink = fixture.nativeElement.querySelector('.admin-link');
    expect(adminLink).not.toBeNull();
    expect(adminLink?.textContent).toContain('Admin Panel');
  }));

  it('should not show the admin link if the user is not an admin', fakeAsync(() => {
    userSubject.next({
      id: 2,
      email: 'artist@test.com',
      name: 'Artist',
      role: 'artist',
    });
    isAuthenticatedSubject.next(true);
    tick();
    const adminLink = fixture.nativeElement.querySelector('.admin-link');
    expect(adminLink).toBeNull();
  }));

  it('should call logout on AuthService when logout button is clicked', fakeAsync(() => {
    userSubject.next({
      id: 2,
      email: 'artist@test.com',
      name: 'Artist',
      role: 'artist',
    });
    isAuthenticatedSubject.next(true);
    tick();
    const btn = fixture.nativeElement.querySelector('.logout-btn');
    expect(btn).not.toBeNull();
    btn?.click();
    expect(authServiceMock.logout).toHaveBeenCalled();
  }));

  it('should show the login button if not authenticated', fakeAsync(() => {
    userSubject.next(null);
    isAuthenticatedSubject.next(false);
    tick();
    const loginBtn = fixture.nativeElement.querySelector('.login-btn');
    expect(loginBtn).not.toBeNull();
    expect(loginBtn?.textContent).toContain('Login');
  }));
});
