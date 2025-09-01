import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReleasesComponent } from './releases.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('ReleasesComponent', () => {
  let component: ReleasesComponent;
  let fixture: ComponentFixture<ReleasesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReleasesComponent, HttpClientTestingModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReleasesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set editedReleaseId and patch form on edit', () => {
    const release = { id: 2, title: 'Edit', status: 'PENDING', releaseDate: '2025-01-01', streams: 0 } as any;
    component.onEditRelease(release);
    expect(component.editedReleaseId()).toBe(2);
    expect(component.releaseForm.value.title).toBe('Edit');
  });

  it('should remove release from list and update stats on delete', () => {
    component.releases.set([
      { id: 1, title: 'A', status: 'PENDING', releaseDate: '', streams: 0 },
      { id: 2, title: 'B', status: 'PENDING', releaseDate: '', streams: 0 }
    ] as any);
    spyOn<any>(component, 'updateStats');
    component.onReleaseDeleted(1);
    expect(component.releases().length).toBe(1);
    expect(component.releases()[0].id).toBe(2);
    expect(component['updateStats']).toHaveBeenCalled();
  });

  it('should reset edit state and form on cancelEdit', () => {
    component.editedReleaseId.set(1);
    component.releaseForm.setValue({ title: 'X', releaseDate: '2025-01-01', coverUrl: '' });
    component.cancelEdit();
    expect(component.editedReleaseId()).toBeNull();
    expect(component.releaseForm.value.title).toBeNull();
  });

  it('should set error if not authenticated on submit', () => {
    spyOnProperty(component['authService'], 'userValue', 'get').and.returnValue(null);
    component.releaseForm.setValue({ title: 'T', releaseDate: '2025-01-01', coverUrl: '' });
    component.onSubmit();
    expect(component.error()).toBe('Not authenticated');
  });

  it('should set error if form is invalid on submit', () => {
  spyOnProperty(component['authService'], 'userValue', 'get').and.returnValue({ id: 1, email: 'a@b.com', name: 'Test', role: 'artist' });
    component.releaseForm.setValue({ title: '', releaseDate: '', coverUrl: '' });
    component.onSubmit();
    expect(component.error()).toBe('Title and release date are required');
  });
  
    it('should create a release and update state on successful submit', () => {
    const user = { id: 1, email: 'a@b.com', name: 'Test', role: 'artist' as const };
      spyOnProperty(component['authService'], 'userValue', 'get').and.returnValue(user);
      component.releaseForm.setValue({ title: 'New', releaseDate: '2025-01-01', coverUrl: '' });
      const created = { id: 3, title: 'New', releaseDate: '2025-01-01', streams: 0 };
      spyOn(component['releaseService'], 'createRelease').and.returnValue({ pipe: () => ({ subscribe: (handlers: any) => handlers.next(created) }) } as any);
      spyOn(component as any, 'updateStats');
      component.onSubmit();
      expect(component.releases().some(r => r.id === 3)).toBeTrue();
      expect(component.releaseForm.value.title).toBeNull();
      expect(component.error()).toBeNull();
      expect(component.loading()).toBeFalse();
      expect((component as any).updateStats).toHaveBeenCalled();
    });

    it('should update a release and update state on successful update', () => {
    const user = { id: 1, email: 'a@b.com', name: 'Test', role: 'artist' as const };
      spyOnProperty(component['authService'], 'userValue', 'get').and.returnValue(user);
      component.releases.set([{ id: 2, title: 'Old', releaseDate: '2025-01-01', streams: 0 }] as any);
      component.editedReleaseId.set(2);
      component.releaseForm.setValue({ title: 'Updated', releaseDate: '2025-01-01', coverUrl: '' });
      const updated = { id: 2, title: 'Updated', releaseDate: '2025-01-01', streams: 0 };
      spyOn(component['releaseService'], 'updateRelease').and.returnValue({ pipe: () => ({ subscribe: (handlers: any) => handlers.next(updated) }) } as any);
      spyOn(component as any, 'updateStats');
      component.onSubmit();
      expect(component.releases()[0].title).toBe('Updated');
      expect(component.releaseForm.value.title).toBeNull();
      expect(component.error()).toBeNull();
      expect(component.loading()).toBeFalse();
      expect(component.editedReleaseId()).toBeNull();
      expect((component as any).updateStats).toHaveBeenCalled();
    });

    it('should set error and reset loading if createRelease fails', () => {
    const user = { id: 1, email: 'a@b.com', name: 'Test', role: 'artist' as const };
      spyOnProperty(component['authService'], 'userValue', 'get').and.returnValue(user);
      component.releaseForm.setValue({ title: 'New', releaseDate: '2025-01-01', coverUrl: '' });
      spyOn(component['releaseService'], 'createRelease').and.returnValue({ pipe: () => ({ subscribe: (handlers: any) => handlers.error({}) }) } as any);
      component.onSubmit();
      expect(component.error()).toBe('Failed to create release');
      expect(component.loading()).toBeFalse();
    });

    it('should set error and reset loading if updateRelease fails', () => {
    const user = { id: 1, email: 'a@b.com', name: 'Test', role: 'artist' as const };
      spyOnProperty(component['authService'], 'userValue', 'get').and.returnValue(user);
      component.releases.set([{ id: 2, title: 'Old', releaseDate: '2025-01-01', streams: 0 }] as any);
      component.editedReleaseId.set(2);
      component.releaseForm.setValue({ title: 'Updated', releaseDate: '2025-01-01', coverUrl: '' });
      spyOn(component['releaseService'], 'updateRelease').and.returnValue({ pipe: () => ({ subscribe: (handlers: any) => handlers.error({}) }) } as any);
      component.onSubmit();
      expect(component.error()).toBe('Failed to update release');
      expect(component.loading()).toBeFalse();
    });

    it('should set loading true during submit and false after response', () => {
    const user = { id: 1, email: 'a@b.com', name: 'Test', role: 'artist' as const };
      spyOnProperty(component['authService'], 'userValue', 'get').and.returnValue(user);
      component.releaseForm.setValue({ title: 'New', releaseDate: '2025-01-01', coverUrl: '' });
      let loadingHandler: any;
      spyOn(component['releaseService'], 'createRelease').and.returnValue({ pipe: () => ({ subscribe: (handlers: any) => { loadingHandler = handlers; } }) } as any);
      component.onSubmit();
      expect(component.loading()).toBeTrue();
      loadingHandler.next({ id: 3, title: 'New', releaseDate: '2025-01-01', streams: 0 });
      expect(component.loading()).toBeFalse();
    });

    it('should fetch releases on ngOnInit if user exists', () => {
    const user = { id: 1, email: 'a@b.com', name: 'Test', role: 'artist' as const };
      spyOnProperty(component['authService'], 'userValue', 'get').and.returnValue(user);
      const fetchSpy = spyOn<any>(component, 'fetchReleases');
      component.ngOnInit();
      expect(fetchSpy).toHaveBeenCalledWith(1);
    });

    it('should subscribe to user$ on ngOnInit if user does not exist', () => {
      spyOnProperty(component['authService'], 'userValue', 'get').and.returnValue(null);
      const subSpy = spyOn<any>(component, 'subscribeToUserChanges');
      component.ngOnInit();
      expect(subSpy).toHaveBeenCalled();
    });

    it('should complete destroy$ on ngOnDestroy', () => {
      const completeSpy = spyOn(component['destroy$'], 'complete');
      component.ngOnDestroy();
      expect(completeSpy).toHaveBeenCalled();
    });
});
