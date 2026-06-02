import { Component, signal, computed } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgIf, NgFor } from '@angular/common';
import { debounceTime, distinctUntilChanged, Subject, switchMap } from 'rxjs';
import { AuthService, RegisterRequest } from '../../services/auth.service';
import { GUINEAN_CITIES } from '../../models/car-brands';

type ProfileType = 'particulier' | 'professionnel';

@Component({
  selector: 'app-inscription',
  imports: [FormsModule, NgIf, NgFor, RouterLink],
  templateUrl: './inscription.html',
  styleUrl: './inscription.scss'
})
export class Inscription {
  profileType: ProfileType = 'particulier';

  prenom       = '';
  nom          = '';
  identifiant  = '';
  motDePasse   = '';
  confirmation = '';
  nomEntreprise = '';
  adresse      = '';
  ville        = '';
  pays         = 'Guinée';
  telephone    = '';
  email        = '';

  loading      = false;
  error        = '';
  success      = '';

  showPwd      = false;
  showConfPwd  = false;

  identifiantStatus: 'idle' | 'checking' | 'ok' | 'taken' = 'idle';
  private identifiantInput$ = new Subject<string>();

  citySuggestions: string[] = [];
  showCitySuggestions = false;

  constructor(private auth: AuthService, private router: Router) {
    if (auth.isLoggedIn) router.navigate(['/annonces/nouveau']);
    this.identifiantInput$.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      switchMap(val => {
        if (val.length < 3) { this.identifiantStatus = 'idle'; return []; }
        this.identifiantStatus = 'checking';
        return this.auth.checkIdentifiant(val);
      })
    ).subscribe({
      next: (res: any) => {
        this.identifiantStatus = res?.disponible ? 'ok' : 'taken';
      },
      error: () => { this.identifiantStatus = 'idle'; }
    });
  }

  onIdentifiantChange(val: string) {
    this.identifiantInput$.next(val);
  }

  onCityInput() {
    const q = this.ville.trim().toLowerCase();
    if (!q) { this.citySuggestions = []; this.showCitySuggestions = false; return; }
    this.citySuggestions = GUINEAN_CITIES.filter(c => c.toLowerCase().includes(q)).slice(0, 6);
    this.showCitySuggestions = this.citySuggestions.length > 0;
  }

  selectCity(city: string) {
    this.ville = city;
    this.showCitySuggestions = false;
  }

  closeCitySuggestions() {
    setTimeout(() => { this.showCitySuggestions = false; }, 180);
  }

  setProfile(type: ProfileType) {
    this.profileType = type;
    this.error = '';
  }

  get nomMagasin(): string {
    return this.profileType === 'professionnel'
      ? this.nomEntreprise
      : `Annonces de ${this.prenom} ${this.nom}`.trim();
  }

  submit() {
    this.error = '';
    if (!this.prenom || !this.nom || !this.identifiant || !this.motDePasse) {
      this.error = 'Veuillez remplir tous les champs obligatoires.'; return;
    }
    if (this.profileType === 'professionnel' && !this.nomEntreprise) {
      this.error = 'Veuillez indiquer le nom de votre entreprise.'; return;
    }
    if (!this.telephone) {
      this.error = 'Le numéro de téléphone est obligatoire.'; return;
    }
    if (this.motDePasse.length < 4) {
      this.error = 'Le mot de passe doit contenir au moins 4 caractères.'; return;
    }
    if (this.motDePasse !== this.confirmation) {
      this.error = 'Les mots de passe ne correspondent pas.'; return;
    }
    if (this.identifiantStatus === 'taken') {
      this.error = 'Cet identifiant est déjà utilisé.'; return;
    }

    this.loading = true;
    const payload: RegisterRequest = {
      nomMagasin:  this.nomMagasin || `Annonces de ${this.prenom} ${this.nom}`,
      typeMagasin: 'VENTE_VOITURE',
      prenom:      this.prenom,
      nom:         this.nom,
      identifiant: this.identifiant,
      motDePasse:  this.motDePasse,
      telephone:   this.telephone || undefined,
      email:       this.email || undefined,
      adresse:     this.adresse || undefined,
      ville:       this.ville || undefined,
      pays:        this.pays || undefined,
    };

    this.auth.register(payload).subscribe({
      next: () => this.router.navigate(['/annonces/nouveau']),
      error: e => {
        this.error = e.status === 409
          ? 'Cet identifiant est déjà utilisé.'
          : e.error?.message || 'Erreur lors de la création du compte. Réessayez.';
        this.loading = false;
      }
    });
  }
}
