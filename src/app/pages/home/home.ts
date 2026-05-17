import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { CarService } from '../../services/car.service';
import { CarSummary, CarFilters } from '../../models/car.model';
import { CarCard } from '../../components/car-card/car-card';
import { SearchFilters } from '../../components/search-filters/search-filters';

@Component({
  selector: 'app-home',
  imports: [NgFor, NgIf, CarCard, SearchFilters],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home implements OnInit {
  cars: CarSummary[] = [];
  loading = true;
  error = false;
  activeFilters: CarFilters = {};
  skeletons = Array(6);

  constructor(private carService: CarService) {}

  ngOnInit() { this.loadCars(); }

  loadCars() {
    this.loading = true;
    this.error = false;
    this.carService.search(this.activeFilters).subscribe({
      next:  cars => { this.cars = cars; this.loading = false; },
      error: ()   => { this.error = true; this.loading = false; }
    });
  }

  onFiltersChange(filters: CarFilters) {
    this.activeFilters = filters;
    const el = document.getElementById('catalogue');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
    this.loadCars();
  }

  get hasActiveFilters(): boolean {
    return !!(this.activeFilters.city || this.activeFilters.brand || this.activeFilters.model);
  }

  trackById(_: number, car: CarSummary) { return car.id; }
}
