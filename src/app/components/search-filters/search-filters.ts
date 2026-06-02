import { Component, EventEmitter, Input, Output, OnInit, HostListener } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgFor, NgIf } from '@angular/common';
import { CarFilters } from '../../models/car.model';
import { BRAND_LIST, CAR_BRANDS, GUINEAN_CITIES } from '../../models/car-brands';

@Component({
  selector: 'app-search-filters',
  imports: [FormsModule, NgFor, NgIf],
  templateUrl: './search-filters.html',
  styleUrl: './search-filters.scss'
})
export class SearchFilters implements OnInit {
  @Input() initialFilters: CarFilters = {};
  @Output() filtersChange = new EventEmitter<CarFilters>();

  ville  = '';
  marque = '';
  modele = '';

  readonly brands = BRAND_LIST;
  modelOptions: string[] = [];

  /* City autocomplete */
  cityInput = '';
  citySuggestions: string[] = [];
  showCitySuggestions = false;
  highlightedCity = -1;

  ngOnInit() {
    this.ville  = this.initialFilters.ville  ?? '';
    this.marque = this.initialFilters.marque ?? '';
    this.modele = this.initialFilters.modele ?? '';
    this.cityInput = this.ville;
    if (this.marque) this.updateModels();
  }

  onBrandChange() {
    this.modele = '';
    this.updateModels();
  }

  private updateModels() {
    this.modelOptions = this.marque ? (CAR_BRANDS[this.marque] ?? []) : [];
  }

  /* ── City autocomplete ── */
  onCityInput() {
    const q = this.cityInput.trim().toLowerCase();
    if (q.length < 1) { this.citySuggestions = []; this.showCitySuggestions = false; return; }
    this.citySuggestions = GUINEAN_CITIES.filter(c => c.toLowerCase().startsWith(q)).slice(0, 6);
    this.showCitySuggestions = this.citySuggestions.length > 0;
    this.highlightedCity = -1;
  }

  onCityKeydown(event: KeyboardEvent) {
    if (!this.showCitySuggestions) return;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.highlightedCity = Math.min(this.highlightedCity + 1, this.citySuggestions.length - 1);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.highlightedCity = Math.max(this.highlightedCity - 1, -1);
    } else if (event.key === 'Enter' && this.highlightedCity >= 0) {
      event.preventDefault();
      this.selectCity(this.citySuggestions[this.highlightedCity]);
    } else if (event.key === 'Escape') {
      this.closeCitySuggestions();
    }
  }

  selectCity(city: string) {
    this.cityInput = city;
    this.ville = city;
    this.closeCitySuggestions();
  }

  onCityBlur() {
    // Delay to allow click on suggestion
    setTimeout(() => this.closeCitySuggestions(), 180);
    this.ville = this.cityInput.trim();
  }

  private closeCitySuggestions() {
    this.showCitySuggestions = false;
    this.highlightedCity = -1;
  }

  @HostListener('document:click', ['$event'])
  onDocClick(e: Event) {
    if (!(e.target as HTMLElement).closest('.filter-group')) {
      this.closeCitySuggestions();
    }
  }

  doSearch() {
    this.filtersChange.emit({
      ville:  this.ville.trim()  || undefined,
      marque: this.marque        || undefined,
      modele: this.modele        || undefined
    });
  }

  reset() {
    this.ville = this.marque = this.modele = '';
    this.cityInput = '';
    this.modelOptions = [];
    this.closeCitySuggestions();
    this.filtersChange.emit({});
  }
}
