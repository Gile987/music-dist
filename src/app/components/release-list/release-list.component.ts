import { Component, Input } from '@angular/core';
import { ReleaseItemComponent, Release } from '../release-item/release-item.component';

@Component({
  selector: 'app-release-list',
  imports: [ReleaseItemComponent],
  templateUrl: './release-list.component.html',
  styleUrls: ['./release-list.component.scss']
})
export class ReleaseListComponent {
  @Input() releases: Release[] = [];
}
