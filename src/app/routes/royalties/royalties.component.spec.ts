import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RoyaltiesComponent } from './royalties.component';
import { of } from 'rxjs';

describe('RoyaltiesComponent', () => {
  let component: RoyaltiesComponent;
  let fixture: ComponentFixture<RoyaltiesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoyaltiesComponent, HttpClientTestingModule],
    }).compileComponents();

    fixture = TestBed.createComponent(RoyaltiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call loadRoyaltiesAndReleases on ngOnInit', () => {
    const spy = spyOn<any>(component, 'loadRoyaltiesAndReleases');
    component.ngOnInit();
    expect(spy).toHaveBeenCalled();
  });

  it('should fetch royalties and releases for user', () => {
    const user = {
      id: 42,
      email: 'test@example.com',
      name: 'Test User',
      role: 'artist' as const,
    };
    const royalties = [
      {
        id: 1,
        amount: 100,
        period: '2025-01',
        trackId: 1,
        artistId: 42,
        status: 'paid' as const,
      },
    ];
    const releases = [
      {
        id: 2,
        title: 'Release',
        status: 'PENDING' as const,
        releaseDate: '2025-01-01',
        streams: 0,
      },
    ];
    Object.defineProperty(component['authService'], 'user$', {
      get: () => of(user),
    });
    spyOn(component['royaltyService'], 'getAllRoyalties').and.returnValue(
      of(royalties)
    );
    spyOn(component['releaseService'], 'getReleasesByArtist').and.returnValue(
      of(releases)
    );
    (component as any).loadRoyaltiesAndReleases();
    expect(component.royalties).toEqual(royalties);
    expect(component.releases).toEqual(releases);
  });

  it('should use artistId 0 if user is null', () => {
    const royalties = [
      {
        id: 1,
        amount: 100,
        period: '2025-01',
        trackId: 1,
        artistId: 0,
        status: 'paid' as const,
      },
    ];
    const releases = [
      {
        id: 2,
        title: 'Release',
        status: 'PENDING' as const,
        releaseDate: '2025-01-01',
        streams: 0,
      },
    ];
    Object.defineProperty(component['authService'], 'user$', {
      get: () => of(null),
    });
    spyOn(component['royaltyService'], 'getAllRoyalties').and.returnValue(
      of(royalties)
    );
    const releaseSpy = spyOn(
      component['releaseService'],
      'getReleasesByArtist'
    ).and.returnValue(of(releases));
    (component as any).loadRoyaltiesAndReleases();
    expect(releaseSpy).toHaveBeenCalledWith(0);
    expect(component.royalties).toEqual(royalties);
    expect(component.releases).toEqual(releases);
  });

  it('should complete destroy$ on ngOnDestroy', () => {
    const completeSpy = spyOn(component['destroy$'], 'complete');
    component.ngOnDestroy();
    expect(completeSpy).toHaveBeenCalled();
  });
});
