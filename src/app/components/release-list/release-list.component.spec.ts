import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReleaseListComponent } from './release-list.component';

describe('ReleaseListComponent', () => {
  let component: ReleaseListComponent;
  let fixture: ComponentFixture<ReleaseListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReleaseListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReleaseListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit editRelease when onEdit is called', () => {
    spyOn(component.editRelease, 'emit');
    const release = { id: 1, title: 'Test', status: 'PENDING', releaseDate: '', streams: 0 } as any;
    component.onEdit(release);
    expect(component.editRelease.emit).toHaveBeenCalledWith(release);
  });

  it('should emit releaseDeleted and remove release from list when onReleaseDeleted is called', () => {
    spyOn(component.releaseDeleted, 'emit');
    component.releases = [
      { id: 1, title: 'A', status: 'PENDING', releaseDate: '', streams: 0 },
      { id: 2, title: 'B', status: 'PENDING', releaseDate: '', streams: 0 }
    ] as any;
    component.onReleaseDeleted(1);
    expect(component.releaseDeleted.emit).toHaveBeenCalledWith(1);
    expect(component.releases.length).toBe(1);
    expect(component.releases[0].id).toBe(2);
  });

  it('should render empty state if no releases', () => {
    component.releases = [];
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('No Releases Yet');
  });
});
