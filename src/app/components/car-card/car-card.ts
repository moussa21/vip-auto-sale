import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CurrencyPipe, NgIf } from '@angular/common';
import { CarSummary } from '../../models/car.model';

@Component({
  selector: 'app-car-card',
  imports: [RouterLink, CurrencyPipe, NgIf],
  templateUrl: './car-card.html',
  styleUrl: './car-card.scss'
})
export class CarCard {
  @Input({ required: true }) car!: CarSummary;

  get formattedKm(): string {
    return this.car.kilometrage != null
      ? this.car.kilometrage.toLocaleString('fr-FR') + ' km'
      : '—';
  }
}
