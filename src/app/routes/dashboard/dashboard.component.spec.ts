import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardComponent } from './dashboard.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { ReleaseService } from '../../core/services/release.service';
import { RoyaltyService } from '../../core/services/royalty.service';
import { AuthService } from '../../core/services/auth.service';
import { of, Subject } from 'rxjs';
import { Release } from '../../core/interfaces/release.interface';
import { Royalty } from '../../core/interfaces/royalty.interface';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let releaseServiceSpy: jasmine.SpyObj<ReleaseService>;
  let royaltyServiceSpy: jasmine.SpyObj<RoyaltyService>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let userSubject: Subject<any>;

  const mockReleases: Release[] = [
    { id: 1, title: 'Release 1', status: 'APPROVED', releaseDate: '', streams: 100, tracks: [ { id: 10, title: 'T1', duration: 100, fileUrl: 'f', streams: 50 } ] },
    { id: 2, title: 'Release 2', status: 'APPROVED', releaseDate: '', streams: 200, tracks: [ { id: 20, title: 'T2', duration: 100, fileUrl: 'f', streams: 150 } ] }
  ];
  const mockRoyalties: Royalty[] = [
    { id: 1, amount: 50, period: '2025-08', trackId: 10, artistId: 1 },
    { id: 2, amount: 30, period: '2025-08', trackId: 20, artistId: 1 }
  ];
  const mockUser = { id: 1 };

  beforeEach(async () => {
    releaseServiceSpy = jasmine.createSpyObj('ReleaseService', ['getReleasesByArtist']);
    royaltyServiceSpy = jasmine.createSpyObj('RoyaltyService', ['getRoyaltiesByArtist']);
    userSubject = new Subject();
    authServiceSpy = jasmine.createSpyObj('AuthService', [], { user$: userSubject.asObservable() });

    await TestBed.configureTestingModule({
      imports: [DashboardComponent, HttpClientTestingModule],
      providers: [
        { provide: ReleaseService, useValue: releaseServiceSpy },
        { provide: RoyaltyService, useValue: royaltyServiceSpy },
        { provide: AuthService, useValue: authServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set totalReleases, totalStreams, and monthlyRevenue after data loads', () => {
    releaseServiceSpy.getReleasesByArtist.and.returnValue(of(mockReleases));
    royaltyServiceSpy.getRoyaltiesByArtist.and.returnValue(of(mockRoyalties));
    userSubject.next(mockUser);
    component['loadDashboardData']();
    expect(component.totalReleases).toBe(2);
    expect(component.totalStreams).toBe(200);
    expect(component.monthlyRevenue).toBe(80);
  });

  it('should not fetch data if user is missing', () => {
    spyOn(component as any, 'fetchReleasesAndRoyalties');
    userSubject.next(undefined);
    component['loadDashboardData']();
    expect((component as any).fetchReleasesAndRoyalties).not.toHaveBeenCalled();
  });


  it('should set totalReleases correctly', () => {
    component['setTotalReleases']([]);
    expect(component.totalReleases).toBe(0);
    component['setTotalReleases'](mockReleases);
    expect(component.totalReleases).toBe(2);
  });

  it('should set totalStreams correctly with/without tracks', () => {
    const releasesWithNoTracks = [
      { id: 1, title: 'R', status: 'APPROVED', releaseDate: '', streams: 0 },
      { id: 2, title: 'R2', status: 'APPROVED', releaseDate: '', streams: 0 }
    ];
    component['setTotalStreams'](releasesWithNoTracks as any);
    expect(component.totalStreams).toBe(0);
    component['setTotalStreams'](mockReleases);
    expect(component.totalStreams).toBe(200);
  });

  it('should set monthlyRevenue for current month/year only', () => {
    const now = new Date();
    const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const royalties = [
      { id: 1, amount: 10, period: thisMonth, trackId: 1, artistId: 1 },
      { id: 2, amount: 20, period: '2000-01', trackId: 2, artistId: 1 }
    ];
    component['setMonthlyRevenue'](royalties as any);
    expect(component.monthlyRevenue).toBe(10);
  });

  it('should not throw if chart refs are missing', () => {
    expect(() => component['renderRevenueChart']([])).not.toThrow();
    expect(() => component['renderRevenueByReleaseChart']([], [])).not.toThrow();
    expect(() => component['renderTopTracksChart']([])).not.toThrow();
  });

  it('fetchReleasesAndRoyalties should update state and call chart methods', () => {
    spyOn(component as any, 'setTotalReleases').and.callThrough();
    spyOn(component as any, 'setTotalStreams').and.callThrough();
    spyOn(component as any, 'setMonthlyRevenue').and.callThrough();
    spyOn(component as any, 'renderRevenueChart').and.callThrough();
    spyOn(component as any, 'renderRevenueByReleaseChart').and.callThrough();
    spyOn(component as any, 'renderTopTracksChart').and.callThrough();
    releaseServiceSpy.getReleasesByArtist.and.returnValue(of(mockReleases));
    royaltyServiceSpy.getRoyaltiesByArtist.and.returnValue(of(mockRoyalties));
    (component as any).fetchReleasesAndRoyalties(1);
    expect((component as any).setTotalReleases).toHaveBeenCalled();
    expect((component as any).setTotalStreams).toHaveBeenCalled();
    expect((component as any).setMonthlyRevenue).toHaveBeenCalled();
    expect((component as any).renderRevenueChart).toHaveBeenCalled();
    expect((component as any).renderRevenueByReleaseChart).toHaveBeenCalled();
    expect((component as any).renderTopTracksChart).toHaveBeenCalled();
  });
});
