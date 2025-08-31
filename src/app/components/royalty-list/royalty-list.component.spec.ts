import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoyaltyListComponent } from './royalty-list.component';

describe('RoyaltyListComponent', () => {
  let component: RoyaltyListComponent;
  let fixture: ComponentFixture<RoyaltyListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoyaltyListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RoyaltyListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should group royalties by release on input change', () => {
    const releases = [
      { id: 1, title: 'Release 1', status: 'PENDING', releaseDate: '', streams: 0, tracks: [ { id: 10, title: 'T1', duration: 100, fileUrl: 'f' } ] },
      { id: 2, title: 'Release 2', status: 'PENDING', releaseDate: '', streams: 0, tracks: [ { id: 20, title: 'T2', duration: 100, fileUrl: 'f' } ] }
    ];
    const royalties = [
      { id: 1, amount: 50, period: '2025-08', trackId: 10, artistId: 1 },
      { id: 2, amount: 30, period: '2025-08', trackId: 20, artistId: 1 }
    ];
    component.releases = releases as any;
    component.royalties = royalties as any;
    component.ngOnChanges({ royalties: true, releases: true } as any);
    expect(component.grouped.length).toBe(2);
    expect(component.grouped[0].releaseId).toBe(1);
    expect(component.grouped[1].releaseId).toBe(2);
    expect(component.grouped[0].totalRoyalty).toBe(50);
    expect(component.grouped[1].totalRoyalty).toBe(30);
  });

  it('should not group if no royalties match releases', () => {
    component.releases = [
      { id: 1, title: 'Release 1', status: 'PENDING', releaseDate: '', streams: 0, tracks: [ { id: 10, title: 'T1', duration: 100, fileUrl: 'f' } ] }
    ] as any;
    component.royalties = [
      { id: 1, amount: 50, period: '2025-08', trackId: 99, artistId: 1 }
    ] as any;
    component.ngOnChanges({ royalties: true, releases: true } as any);
    expect(component.grouped.length).toBe(0);
  });

  it('should group multiple royalties for the same release', () => {
    component.releases = [
      { id: 1, title: 'Release 1', status: 'PENDING', releaseDate: '', streams: 0, tracks: [ { id: 10, title: 'T1', duration: 100, fileUrl: 'f' }, { id: 11, title: 'T2', duration: 100, fileUrl: 'f' } ] }
    ] as any;
    component.royalties = [
      { id: 1, amount: 50, period: '2025-08', trackId: 10, artistId: 1 },
      { id: 2, amount: 30, period: '2025-08', trackId: 11, artistId: 1 }
    ] as any;
    component.ngOnChanges({ royalties: true, releases: true } as any);
    expect(component.grouped.length).toBe(1);
    expect(component.grouped[0].releaseId).toBe(1);
    expect(component.grouped[0].totalRoyalty).toBe(80);
    expect(component.grouped[0].royalties.length).toBe(2);
  });
});
