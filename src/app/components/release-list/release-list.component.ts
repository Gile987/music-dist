import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReleaseItemComponent } from '../release-item/release-item.component';
import { Release } from '../../core/interfaces/release.interface';

@Component({
  selector: 'app-release-list',
  standalone: true,
  imports: [CommonModule, ReleaseItemComponent],
  templateUrl: './release-list.component.html',
  styleUrls: ['./release-list.component.scss']
})
export class ReleaseListComponent {
  @Input() releases: Release[] = [];
  @Output() editRelease = new EventEmitter<Release>();
  @Output() releaseDeleted = new EventEmitter<number>();

  onEdit(r: Release): void {
    this.editRelease.emit(r);
  }
  
  onReleaseDeleted(releaseId: number): void {
    this.releaseDeleted.emit(releaseId);
    // Remove the release from the local array
    this.releases = this.releases.filter(release => release.id !== releaseId);
  }
}
