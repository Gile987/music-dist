import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RoyaltyListComponent } from '../../components/royalty-list/royalty-list.component';
import { Royalty } from '../../core/interfaces/royalty.interface';

@Component({
  selector: 'app-royalties',
  imports: [CommonModule, RoyaltyListComponent],
  templateUrl: './royalties.component.html',
  styleUrls: ['./royalties.component.scss']
})
export class RoyaltiesComponent {
  royalties: Royalty[] = [
  {
    id: 1,
    title: 'Summer Vibes',
    date: '2025-06-15',
    streams: 100000,
    rate: 0.0035,
    total: 350,
    status: 'paid'
  },
  {
    id: 2,
    title: 'Winter Chill',
    date: '2025-07-01',
    streams: 50000,
    rate: 0.0035,
    total: 175,
    status: 'pending'
  }
];
}
