import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';
import { AuthService } from '../../services/auth.service';

type Step = 'verify' | 'reset' | 'done';

@Component({
  selector: 'app-forgot-password',
  imports: [FormsModule, NgIf, RouterLink],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.scss'
})
export class ForgotPassword {
  step: Step = 'verify';

  identifiant      = '';
  telephone        = '';
  nouveauMotDePasse = '';
  confirmation     = '';
  showPwd          = false;
  showConfPwd      = false;

  loading = false;
  error   = '';

  constructor(private auth: AuthService) {}

  verify() {
    this.error = '';
    if (!this.identifiant || !this.telephone) {
      this.error = 'Veuillez remplir tous les champs.'; return;
    }
    // Move to reset step immediately (verification happens server-side on submit)
    this.step = 'reset';
  }

  resetPassword() {
    this.error = '';
    if (!this.nouveauMotDePasse || !this.confirmation) {
      this.error = 'Veuillez remplir tous les champs.'; return;
    }
    if (this.nouveauMotDePasse.length < 4) {
      this.error = 'Le mot de passe doit contenir au moins 4 caractères.'; return;
    }
    if (this.nouveauMotDePasse !== this.confirmation) {
      this.error = 'Les mots de passe ne correspondent pas.'; return;
    }

    this.loading = true;
    this.auth.resetPassword({
      identifiant:      this.identifiant,
      telephone:        this.telephone,
      nouveauMotDePasse: this.nouveauMotDePasse
    }).subscribe({
      next: () => { this.loading = false; this.step = 'done'; },
      error: e => {
        this.error = e.status === 401
          ? 'Numéro de téléphone incorrect pour cet identifiant.'
          : e.status === 404
            ? 'Identifiant introuvable.'
            : e.error?.message || 'Erreur. Réessayez.';
        this.loading = false;
      }
    });
  }
}
