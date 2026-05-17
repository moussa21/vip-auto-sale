import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpEvent, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { CarDetail, CarFilters, CarSummary } from '../models/car.model';

export interface CarCreateRequest {
  marque: string; modele: string; ville: string;
  prix: number; annee: number; kilometrage: number;
  description?: string; carburant?: string; transmission?: string;
  vendeurNom: string; vendeurTel: string;
  vendeurEmail?: string; vendeurVille?: string;
}

@Injectable({ providedIn: 'root' })
export class CarService {
  private readonly base = `${environment.apiUrl}/cars`;

  constructor(private http: HttpClient) {}

  search(filters: CarFilters = {}): Observable<CarSummary[]> {
    let params = new HttpParams();
    if (filters.city)  params = params.set('city',  filters.city);
    if (filters.brand) params = params.set('brand', filters.brand);
    if (filters.model) params = params.set('model', filters.model);
    return this.http.get<CarSummary[]>(this.base, { params });
  }

  getById(id: number): Observable<CarDetail> {
    return this.http.get<CarDetail>(`${this.base}/${id}`);
  }

  create(data: CarCreateRequest, photos: File[]): Observable<HttpEvent<CarDetail>> {
    const fd = new FormData();
    fd.append('car', new Blob([JSON.stringify(data)], { type: 'application/json' }));
    photos.forEach(f => fd.append('photos', f));

    const req = new HttpRequest('POST', this.base, fd, { reportProgress: true });
    return this.http.request<CarDetail>(req);
  }

  addPhotos(id: number, photos: File[]): Observable<HttpEvent<CarDetail>> {
    const fd = new FormData();
    photos.forEach(f => fd.append('photos', f));
    const req = new HttpRequest('POST', `${this.base}/${id}/photos`, fd, { reportProgress: true });
    return this.http.request<CarDetail>(req);
  }

  deletePhoto(carId: number, index: number): Observable<CarDetail> {
    return this.http.delete<CarDetail>(`${this.base}/${carId}/photos/${index}`);
  }

  deactivate(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
