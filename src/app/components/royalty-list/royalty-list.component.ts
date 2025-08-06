import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RoyaltyItemComponent } from '../royalty-item/royalty-item.component';
import { Royalty } from '../../core/interfaces/royalty.interface';

@Component({
  selector: 'app-royalty-list',
  imports: [CommonModule, RoyaltyItemComponent],
  templateUrl: './royalty-list.component.html',
  styleUrls: ['./royalty-list.component.scss']
})
export class RoyaltyListComponent {
  @Input() royalties: Royalty[] = [];
}
