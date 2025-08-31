export type LatLngLiteral = { lat: number; lng: number };

export type ClinicMarker = {
  id: string;
  position: LatLngLiteral;
  name: string;
  address?: string;
  rating?: number;
  placeId?: string;
};

export type LocationType = 'clinic' | 'pharmacy' | 'hospital';

export interface ClinicMapProps {
  onError: (message: string) => void;
}
