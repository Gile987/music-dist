
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { StatCardComponent } from '../../components/stat-card/stat-card.component';
import { ButtonComponent } from '../../shared/button/button.component';

@Component({
  selector: 'app-landing',
  imports: [RouterLink, StatCardComponent, ButtonComponent],
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent {}
