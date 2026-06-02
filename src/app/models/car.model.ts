export interface MagasinVendeurInfo {
  nom: string;
  telephone: string | null;
  ville: string | null;
  pays: string | null;
}

export interface CarSummary {
  id: number;
  typeProduit: string;
  designation: string;
  marque: string | null;
  modele: string | null;
  annee: number | null;
  prix: number;
  kilometrage: number | null;
  carburant: string | null;
  transmission: string | null;
  photoCouverture: string | null;
  villeVendeur: string | null;
  creeLe: string;
}

export interface CarDetail {
  id: number;
  typeProduit: string;
  designation: string;
  marque: string | null;
  modele: string | null;
  annee: number | null;
  prix: number;
  kilometrage: number | null;
  description: string | null;
  carburant: string | null;
  transmission: string | null;
  nombrePortes: number | null;
  photos: string[];
  vendeur: MagasinVendeurInfo;
  creeLe: string;
}

export interface CarFilters {
  ville?: string;
  marque?: string;
  modele?: string;
  search?: string;
}
