import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CarFilters } from '../../models/car.model';

@Component({
  selector: 'app-search-filters',
  imports: [FormsModule],
  templateUrl: './search-filters.html',
  styleUrl: './search-filters.scss'
})
export class SearchFilters implements OnInit {
  @Input() initialFilters: CarFilters = {};
  @Output() filtersChange = new EventEmitter<CarFilters>();

  city  = '';
  brand = '';
  model = '';

  ngOnInit() {
    this.city  = this.initialFilters.city  ?? '';
    this.brand = this.initialFilters.brand ?? '';
    this.model = this.initialFilters.model ?? '';
  }

  search() {
    this.filtersChange.emit({
      city:  this.city.trim()  || undefined,
      brand: this.brand.trim() || undefined,
      model: this.model.trim() || undefined
    });
  }

  reset() {
    this.city = this.brand = this.model = '';
    this.filtersChange.emit({});
  }
}
