import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface LoginRequest  { identifiant: string; motDePasse: string; }
export interface LoginResponse {
  token: string; id: number; prenom: string; nom: string;
  identifiant: string; role: string; magasinId?: number; magasinNom?: string; typeMagasin?: string;
}
export interface RegisterRequest {
  nomMagasin: string;
  typeMagasin: string;
  prenom: string;
  nom: string;
  identifiant: string;
  motDePasse: string;
  telephone?: string;
  email?: string;
  ville?: string;
  pays?: string;
  adresse?: string;
}
export interface ResetPasswordRequest {
  identifiant: string;
  telephone: string;
  nouveauMotDePasse: string;
}

const TOKEN_KEY = 'vip_auto_token';
const USER_KEY  = 'vip_auto_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly base = `${environment.apiUrl}/auth`;
  private readonly inscriptionBase = `${environment.apiUrl}/inscription`;
  readonly currentUser = signal<LoginResponse | null>(this.loadUser());

  constructor(private http: HttpClient, private router: Router) {}

  login(credentials: LoginRequest) {
    return this.http.post<LoginResponse>(`${this.base}/connexion`, credentials).pipe(
      tap(res => this.saveSession(res))
    );
  }

  register(data: RegisterRequest) {
    return this.http.post<LoginResponse>(this.inscriptionBase, data).pipe(
      tap(res => this.saveSession(res))
    );
  }

  resetPassword(data: ResetPasswordRequest) {
    return this.http.post<{ message: string }>(`${this.base}/reset-password`, data);
  }

  checkIdentifiant(identifiant: string) {
    return this.http.get<{ disponible: boolean }>(`${this.inscriptionBase}/check-identifiant?identifiant=${encodeURIComponent(identifiant)}`);
  }

  logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.currentUser.set(null);
    this.router.navigate(['/']);
  }

  get token(): string | null { return localStorage.getItem(TOKEN_KEY); }
  get isLoggedIn(): boolean   { return !!this.token; }

  private saveSession(res: LoginResponse) {
    localStorage.setItem(TOKEN_KEY, res.token);
    localStorage.setItem(USER_KEY, JSON.stringify(res));
    this.currentUser.set(res);
  }

  private loadUser(): LoginResponse | null {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }
}
