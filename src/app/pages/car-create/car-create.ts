import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { CarService, ProduitCreateRequest } from '../../services/car.service';
import { PhotoUploader } from '../../components/photo-uploader/photo-uploader';

@Component({
  selector: 'app-car-create',
  imports: [FormsModule, NgIf, RouterLink, PhotoUploader],
  templateUrl: './car-create.html',
  styleUrl: './car-create.scss'
})
export class CarCreate implements OnInit {
  photos: File[] = [];
  uploading = false;
  error     = '';
  success   = false;

  form = {
    marque: '', modele: '', prix: 0,
    annee: new Date().getFullYear(), kilometrage: 0,
    description: '', carburant: '', transmission: ''
  };

  readonly carburants    = ['Essence', 'Diesel', 'Hybride', 'Électrique', 'GPL'];
  readonly transmissions = ['Manuelle', 'Automatique'];
  readonly currentYear   = new Date().getFullYear();

  constructor(
    private auth: AuthService,
    private carService: CarService,
    private router: Router
  ) {}

  ngOnInit() {
    if (!this.auth.isLoggedIn) this.router.navigate(['/connexion']);
  }

  onPhotosChange(files: File[]) { this.photos = files; }

  submit() {
    this.error = '';
    if (!this.isValid()) return;

    const request: ProduitCreateRequest = {
      designation:          `${this.form.marque} ${this.form.modele}`.trim(),
      categorie:            'vehicule',
      marque:               this.form.marque   || undefined,
      modele:               this.form.modele   || undefined,
      annee:                this.form.annee    || undefined,
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
