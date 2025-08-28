import { Component, Input } from '@angular/core';
import { Royalty } from '../../core/interfaces/royalty.interface';
import { AppCurrencyPipe } from '../../shared/pipes/currency.pipe';

@Component({
  selector: 'app-royalty-item',
  imports: [AppCurrencyPipe],
  templateUrl: './royalty-item.component.html',
  styleUrls: ['./royalty-item.component.scss']
})
export class RoyaltyItemComponent {
  @Input({ required: true }) royalty!: Royalty;
}
