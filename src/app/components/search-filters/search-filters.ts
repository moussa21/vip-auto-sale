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

  ville  = '';
  search = '';

  ngOnInit() {
    this.ville  = this.initialFilters.ville  ?? '';
    this.search = this.initialFilters.search ?? '';
  }

  doSearch() {
    this.filtersChange.emit({
      ville:  this.ville.trim()  || undefined,
      search: this.search.trim() || undefined
    });
  }

  reset() {
    this.ville = this.search = '';
    this.filtersChange.emit({});
  }
}