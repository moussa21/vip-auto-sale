import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { CarDetail, CarFilters, CarSummary } from '../models/car.model';

export interface ProduitCreateRequest {
  designation: string;
  categorie: string;
  marque?: string;
  modele?: string;
  annee?: number;
  kilometrage?: number;
  carburant?: string;
  transmission?: string;
  description?: string;
  prixVente: number;
  publieSurMarketplace: boolean;
}

@Injectable({ providedIn: 'root' })
export class CarService {
  private readonly marketBase = `${environment.apiUrl}/produits/marketplace`;
  private readonly produitBase = `${environment.apiUrl}/produits`;

  constructor(private http: HttpClient) {}

  search(filters: CarFilters = {}): Observable<CarSummary[]> {
    let params = new HttpParams().set('typeProduit', 'auto');
    if (filters.ville)  params = params.set('ville',  filters.ville);
    if (filters.search) params = params.set('search', filters.search);
    return this.http.get<CarSummary[]>(this.marketBase, { params });
  }

  getById(id: number): Observable<CarDetail> {
    return this.http.get<CarDetail>(`${this.marketBase}/${id}`);
  }

  create(data: ProduitCreateRequest, photos: File[]): Observable<{ id: number }> {
    return new Observable(observer => {
      this.http.post<{ id: number }>(this.produitBase, data).subscribe({
        next: (produit) => {
          if (photos.length === 0) {
            observer.next(produit);
            observer.complete();
            return;
          }
          const fd = new FormData();
          photos.forEach(f => fd.append('photos', f));
          this.http.post(`${this.produitBase}/${produit.id}/photos`, fd).subscribe({
            next: () => { observer.next(produit); observer.complete(); },
            error: (e) => {
              // Photos failed but produit was created — still navigate to it
              observer.next(produit);
              observer.complete();
            }
          });
        },
        error: (e) => observer.error(e)
      });
    });
  }
}
