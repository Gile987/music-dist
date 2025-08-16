
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { StatCardComponent } from '../../components/stat-card/stat-card.component';
import { ButtonComponent } from '../../shared/button.component';

@Component({
  selector: 'app-landing',
  imports: [CommonModule, RouterLink, StatCardComponent, ButtonComponent],
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent {}
