export interface CarSummary {
  id: number;
  marque: string;
  modele: string;
  ville: string;
  prix: number;
  annee: number;
  kilometrage: number;
  carburant: string | null;
  transmission: string | null;
  photoCouverture: string | null;
  creeLe: string;
}

export interface SellerInfo {
  nom: string;
  telephone: string;
  email: string | null;
  ville: string | null;
}

export interface CarDetail {
  id: number;
  marque: string;
  modele: string;
  ville: string;
  prix: number;
  annee: number;
  kilometrage: number;
  description: string | null;
  carburant: string | null;
  transmission: string | null;
  photos: string[];
  vendeur: SellerInfo;
  creeLe: string;
}

export interface CarFilters {
  city?: string;
  brand?: string;
  model?: string;
}
