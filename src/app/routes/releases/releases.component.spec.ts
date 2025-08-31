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
});
