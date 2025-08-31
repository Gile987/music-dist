import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserInfoCardComponent } from './user-info-card.component';

describe('UserInfoCardComponent', () => {
  let component: UserInfoCardComponent;
  let fixture: ComponentFixture<UserInfoCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserInfoCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserInfoCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    component.name = 'Alice';
    component.email = 'alice@example.com';
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should render name, email, and avatar', () => {
    component.name = 'Bob';
    component.email = 'bob@example.com';
    component.avatarUrl = 'avatar.png';
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.name')?.textContent).toContain('Bob');
    expect(compiled.querySelector('.email')?.textContent).toContain('bob@example.com');
    const img = compiled.querySelector('img.avatar') as HTMLImageElement;
    expect(img.src).toContain('avatar.png');
  });

  it('should use default avatar if none provided', () => {
    component.name = 'Charlie';
    component.email = 'charlie@example.com';
    component.avatarUrl = undefined as any;
    fixture.detectChanges();
    const img = fixture.nativeElement.querySelector('img.avatar') as HTMLImageElement;
    expect(img.src).toContain('gravatar.com/avatar');
  });

  it('should render role if provided', () => {
    component.name = 'Dana';
    component.email = 'dana@example.com';
    component.role = 'admin';
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.meta')?.textContent).toContain('Role: admin');
  });

  it('should not render role if not provided', () => {
    component.name = 'Eve';
    component.email = 'eve@example.com';
    component.role = undefined;
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.meta')?.textContent).not.toContain('Role:');
  });

  it('should render joined date if provided', () => {
    component.name = 'Frank';
    component.email = 'frank@example.com';
    component.joinedDate = '2023-01-01';
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.meta')?.textContent).toContain('Joined:');
    expect(compiled.querySelector('.meta')?.textContent).toMatch(/2023/);
  });

  it('should not render joined date if not provided', () => {
    component.name = 'Grace';
    component.email = 'grace@example.com';
    component.joinedDate = undefined;
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const metas = compiled.querySelectorAll('.meta');
    expect(Array.from(metas).some(m => m.textContent?.includes('Joined:'))).toBeFalse();
  });
});
