import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgFor, NgIf } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { CarService, ProduitCreateRequest } from '../../services/car.service';
import { PhotoUploader } from '../../components/photo-uploader/photo-uploader';
import { BRAND_LIST, CAR_BRANDS, GUINEAN_CITIES } from '../../models/car-brands';

@Component({
  selector: 'app-car-create',
  imports: [FormsModule, NgFor, NgIf, RouterLink, PhotoUploader],
  templateUrl: './car-create.html',
  styleUrl: './car-create.scss'
})
export class CarCreate implements OnInit {
  photos: File[] = [];
  uploading = false;
  error     = '';
  success   = false;
  geoLoading  = false;
  geoDetected = false;

  form = {
    marque: '', modele: '', prix: 0,
    annee: new Date().getFullYear(), kilometrage: 0,
    description: '', carburant: '', transmission: '',
    ville: ''
  };

  readonly carburants    = ['Essence', 'Diesel', 'Hybride', 'Électrique', 'GPL'];
  readonly transmissions = ['Manuelle', 'Automatique'];
  readonly currentYear   = new Date().getFullYear();
  readonly brands        = BRAND_LIST;

  modelOptions: string[] = [];

  /* City autocomplete */
  cityInput       = '';
  citySuggestions: string[] = [];
  showSuggestions = false;
  highlightedIdx  = -1;

  constructor(
    private auth: AuthService,
    private carService: CarService,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit() {
    if (!this.auth.isLoggedIn) this.router.navigate(['/connexion']);
    this.detectCity();
  }

  onBrandChange() {
    this.form.modele = '';
    this.modelOptions = this.form.marque ? (CAR_BRANDS[this.form.marque] ?? []) : [];
  }

  /* ── City autocomplete ── */
  onCityInput() {
    const q = this.cityInput.trim().toLowerCase();
    if (q.length < 1) { this.citySuggestions = []; this.showSuggestions = false; return; }
    this.citySuggestions = GUINEAN_CITIES.filter(c => c.toLowerCase().startsWith(q)).slice(0, 6);
    this.showSuggestions = this.citySuggestions.length > 0;
    this.highlightedIdx = -1;
    this.form.ville = this.cityInput.trim();
  }

  onCityKeydown(event: KeyboardEvent) {
    if (!this.showSuggestions) return;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.highlightedIdx = Math.min(this.highlightedIdx + 1, this.citySuggestions.length - 1);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.highlightedIdx = Math.max(this.highlightedIdx - 1, -1);
    } else if (event.key === 'Enter' && this.highlightedIdx >= 0) {
      event.preventDefault();
      this.selectCity(this.citySuggestions[this.highlightedIdx]);
    } else if (event.key === 'Escape') {
      this.showSuggestions = false;
    }
  }

  selectCity(city: string) {
    this.cityInput = city;
    this.form.ville = city;
    this.showSuggestions = false;
    this.highlightedIdx = -1;
  }

  onCityBlur() {
    setTimeout(() => { this.showSuggestions = false; }, 180);
    this.form.ville = this.cityInput.trim();
  }

  private detectCity() {
    if (!('geolocation' in navigator)) return;
    this.geoLoading = true;
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const { latitude: lat, longitude: lon } = coords;
        this.http.get<any>(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`,
          { headers: { 'Accept-Language': 'fr' } }
        ).subscribe({
          next: (data) => {
            const a = data?.address ?? {};
            const city = a.city ?? a.town ?? a.municipality ?? a.village ?? a.county ?? '';
            if (city && !this.form.ville) {
              this.form.ville = city;
              this.cityInput  = city;
              this.geoDetected = true;
            }
            this.geoLoading = false;
          },
          error: () => { this.geoLoading = false; }
        });
      },
      () => { this.geoLoading = false; }
    );
  }

  onPhotosChange(files: File[]) { this.photos = files; }

  submit() {
    this.error = '';
    if (!this.isValid()) return;

    const request: ProduitCreateRequest = {
      designation:          `${this.form.marque} ${this.form.modele}`.trim(),
      categorie:            'vehicule',
      marque:               this.form.marque     || undefined,
      modele:               this.form.modele     || undefined,
      annee:                this.form.annee      || undefined,
      kilometrage:          this.form.kilometrage || undefined,
      carburant:            this.form.carburant   || undefined,
      transmission:         this.form.transmission || undefined,
      description:          this.form.description  || undefined,
      prixVente:            this.form.prix,
      publieSurMarketplace: true
    };

    this.uploading = true;
    this.carService.create(request, this.photos).subscribe({
      next: (produit) => {
        this.uploading = false;
        this.success   = true;
        if (produit.id) setTimeout(() => this.router.navigate(['/cars', produit.id]), 1500);
      },
      error: (e) => {
        this.uploading = false;
        this.error = e.error?.message ?? 'Erreur lors de la publication. Réessayez.';
      }
    });
  }

  private isValid(): boolean {
    if (!this.form.marque.trim())  { this.error = 'La marque est obligatoire.';  return false; }
    if (!this.form.modele.trim())  { this.error = 'Le modèle est obligatoire.';  return false; }
    if (this.form.prix <= 0)       { this.error = 'Le prix doit être positif.';  return false; }
    return true;
  }

  logout() { this.auth.logout(); }
}
