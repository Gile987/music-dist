import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatusBadgeComponent } from '../status-badge/status-badge.component';
import { Royalty } from '../../core/interfaces/royalty.interface';
import { AppCurrencyPipe } from '../../shared/pipes/currency.pipe';

@Component({
  selector: 'app-royalty-item',
  imports: [CommonModule, StatusBadgeComponent, AppCurrencyPipe],
  templateUrl: './royalty-item.component.html',
  styleUrls: ['./royalty-item.component.scss']
})
export class RoyaltyItemComponent {
  @Input({ required: true }) royalty!: Royalty;
}
