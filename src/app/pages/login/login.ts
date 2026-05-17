import { Component, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule, NgIf, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {
  identifiant = '';
  motDePasse  = '';
  loading     = false;
  error       = '';

  constructor(private auth: AuthService, private router: Router) {
    if (auth.isLoggedIn) router.navigate(['/annonces/nouveau']);
  }

  submit() {
    if (!this.identifiant || !this.motDePasse) { this.error = 'Remplissez tous les champs.'; return; }
    this.loading = true;
    this.error = '';
    this.auth.login({ identifiant: this.identifiant, motDePasse: this.motDePasse }).subscribe({
      next: () => this.router.navigate(['/annonces/nouveau']),
      error: e  => {
        this.error = e.status === 401 ? 'Identifiants incorrects.' : 'Erreur de connexion. Réessayez.';
        this.loading = false;
      }
    });
  }
}
