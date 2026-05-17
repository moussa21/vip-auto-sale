import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';
import { HttpEventType } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { CarService, CarCreateRequest } from '../../services/car.service';
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
  progress  = 0;
  error     = '';
  success   = false;

  form: CarCreateRequest = {
    marque: '', modele: '', ville: '', prix: 0,
    annee: new Date().getFullYear(), kilometrage: 0,
    description: '', carburant: '', transmission: '',
    vendeurNom: '', vendeurTel: '', vendeurEmail: '', vendeurVille: ''
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
    const user = this.auth.currentUser();
    if (user) {
      this.form.vendeurNom = `${user.prenom} ${user.nom}`;
    }
  }

  onPhotosChange(files: File[]) { this.photos = files; }

  submit() {
    this.error = '';
    if (!this.isValid()) return;

    this.uploading = true;
    this.progress  = 0;

    this.carService.create(this.form, this.photos).subscribe({
      next: event => {
        if (event.type === HttpEventType.UploadProgress && event.total) {
          this.progress = Math.round(100 * event.loaded / event.total);
        }
        if (event.type === HttpEventType.Response) {
          this.uploading = false;
          this.success   = true;
          const id = (event.body as any)?.id;
          if (id) setTimeout(() => this.router.navigate(['/cars', id]), 1500);
        }
      },
      error: e => {
        this.uploading = false;
        this.error = e.error?.message ?? 'Erreur lors de la publication. Réessayez.';
      }
    });
  }

  private isValid(): boolean {
    if (!this.form.marque.trim())     { this.error = 'La marque est obligatoire.'; return false; }
    if (!this.form.modele.trim())     { this.error = 'Le modèle est obligatoire.'; return false; }
    if (!this.form.ville.trim())      { this.error = 'La ville est obligatoire.'; return false; }
    if (this.form.prix <= 0)          { this.error = 'Le prix doit être positif.'; return false; }
    if (!this.form.vendeurNom.trim()) { this.error = 'Votre nom est obligatoire.'; return false; }
    if (!this.form.vendeurTel.trim()) { this.error = 'Votre téléphone est obligatoire.'; return false; }
    return true;
  }

  logout() { this.auth.logout(); }
}
