import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NgFor, NgIf, CurrencyPipe } from '@angular/common';
import { CarService } from '../../services/car.service';
import { CarDetail as CarDetailModel } from '../../models/car.model';

@Component({
  selector: 'app-car-detail',
  imports: [NgFor, NgIf, CurrencyPipe, RouterLink],
  templateUrl: './car-detail.html',
  styleUrl: './car-detail.scss'
})
export class CarDetail implements OnInit {
  car: CarDetailModel | null = null;
  loading = true;
  error = false;
  activePhoto = 0;

  constructor(private route: ActivatedRoute, private carService: CarService) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.carService.getById(id).subscribe({
      next:  car => { this.car = car; this.loading = false; },
      error: ()  => { this.error = true; this.loading = false; }
    });
  }

  selectPhoto(index: number) { this.activePhoto = index; }

  get currentPhoto(): string | null {
    return this.car?.photos?.[this.activePhoto] ?? null;
  }

  get formattedKm(): string {
    return this.car?.kilometrage != null
      ? this.car.kilometrage.toLocaleString('fr-FR') + ' km'
      : '—';
  }
}
