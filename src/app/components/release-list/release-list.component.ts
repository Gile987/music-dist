import { Component, Input } from '@angular/core';
import { ReleaseItemComponent } from '../release-item/release-item.component';
import { Release } from '../../core/interfaces/release.interface';

@Component({
  selector: 'app-release-list',
  imports: [ReleaseItemComponent],
  templateUrl: './release-list.component.html',
  styleUrls: ['./release-list.component.scss']
})
export class ReleaseListComponent {
  @Input() releases: Release[] = [];
}
