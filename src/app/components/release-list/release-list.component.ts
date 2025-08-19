import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReleaseItemComponent } from '../release-item/release-item.component';
import { Release } from '../../core/interfaces/release.interface';

@Component({
  selector: 'app-release-list',
  imports: [CommonModule, ReleaseItemComponent],
  templateUrl: './release-list.component.html',
  styleUrls: ['./release-list.component.scss']
})
export class ReleaseListComponent {
  @Input() releases: Release[] = [];
  @Output() editRelease: EventEmitter<Release> = new EventEmitter<Release>();
  @Output() releaseDeleted: EventEmitter<number> = new EventEmitter<number>();

  public onEdit(release: Release): void {
    this.editRelease.emit(release);
  }
  
  public onReleaseDeleted(releaseId: number): void {
    this.releaseDeleted.emit(releaseId);
    this.releases = this.releases.filter((release: Release): boolean => release.id !== releaseId);
  }
}
