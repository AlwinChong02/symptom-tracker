"use client";

import { FC, useCallback, useEffect, useRef, useState } from 'react';
import { GoogleMap, InfoWindowF, MarkerF, useLoadScript } from '@react-google-maps/api';
import type { ClinicMapProps, LatLngLiteral, ClinicMarker, LocationType } from '@/types/clinic';

const containerStyle = { width: '100%', height: '520px' };
const libraries: ("places")[] = ["places"];

const locationTypeConfig = {
  clinic: { keyword: 'clinic', type: 'doctor', label: 'Clinics', icon: '🏥' },
  pharmacy: { keyword: 'pharmacy', type: 'pharmacy', label: 'Pharmacies', icon: '💊' },
  hospital: { keyword: 'hospital', type: 'hospital', label: 'Hospitals', icon: '🏨' },
};

const ClinicMap: FC<ClinicMapProps> = ({ onError }) => {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries,
  });

  const [center, setCenter] = useState<LatLngLiteral | null>(null);
  const [markers, setMarkers] = useState<ClinicMarker[]>([]);
  const [selected, setSelected] = useState<ClinicMarker | null>(null);
  const [selectedType, setSelectedType] = useState<LocationType>('clinic');
  const [loading, setLoading] = useState(false);
  const mapRef = useRef<any>(null);

  useEffect(() => {
    if (loadError) onError('Failed to load Google Maps.');
  }, [loadError, onError]);

  // Get device location
  useEffect(() => {
    if (!isLoaded) return;
    if (!navigator.geolocation) {
      onError('Geolocation is not supported by your browser. Showing a default location.');
      setCenter({ lat: 1.3521, lng: 103.8198 }); // Default: Singapore
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCenter({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      () => {
        onError('Location permission denied. Showing a default location.');
        setCenter({ lat: 1.3521, lng: 103.8198 });
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [isLoaded, onError]);

  const onMapLoad = useCallback((map: any) => {
    mapRef.current = map;
  }, []);

  // Search for locations near the center using Places API
  const searchNearbyPlaces = useCallback((locationType: LocationType) => {
    if (!isLoaded || !mapRef.current || !center) return;
    const google = (window as any).google;
    if (!google?.maps?.places) return;

    setLoading(true);
    const config = locationTypeConfig[locationType];
    const service = new google.maps.places.PlacesService(mapRef.current);
    const request = {
      location: center,
      radius: 3000,
      keyword: config.keyword,
      type: config.type,
    };

    service.nearbySearch(request, (results: any, status: any) => {
      setLoading(false);
      if (status !== google.maps.places.PlacesServiceStatus.OK || !results) {
        onError(`No ${config.label.toLowerCase()} found nearby.`);
        setMarkers([]);
        return;
      }
      const ms: ClinicMarker[] = results
        .filter((r: any) => r.geometry?.location)
        .map((r: any) => ({
          id: r.place_id || r.name,
          position: { lat: r.geometry.location.lat(), lng: r.geometry.location.lng() },
          name: r.name || config.label.slice(0, -1),
          address: r.vicinity || r.formatted_address,
          rating: r.rating,
          placeId: r.place_id,
        }));
      setMarkers(ms);

      const bounds = new google.maps.LatLngBounds();
      bounds.extend(center);
      ms.forEach((m) => bounds.extend(m.position));
      mapRef.current.fitBounds(bounds);
    });
  }, [center, isLoaded, onError]);

  // Initial search when center is available
  useEffect(() => {
    if (center) {
      searchNearbyPlaces(selectedType);
    }
  }, [center, searchNearbyPlaces, selectedType]);

  const handleTypeChange = (type: LocationType) => {
    setSelectedType(type);
    setSelected(null);
    searchNearbyPlaces(type);
  };

  if (!isLoaded) return <div className="text-center p-8 bg-white/60 rounded-lg">Loading map…</div>;
  if (!center) return <div className="text-center p-8 bg-white/60 rounded-lg">Locating…</div>;

  return (
    <div className="space-y-4">
      {/* Location Type Filter Buttons */}
      <div className="flex flex-wrap gap-2 justify-center">
        {(Object.keys(locationTypeConfig) as LocationType[]).map((type) => {
          const config = locationTypeConfig[type];
          return (
            <button
              key={type}
              onClick={() => handleTypeChange(type)}
              disabled={loading}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedType === type
                  ? 'bg-green-600 text-white shadow-md'
                  : 'bg-white/80 text-gray-700 hover:bg-white border border-gray-200'
              } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <span className="text-lg">{config.icon}</span>
              <span>{config.label}</span>
              {loading && selectedType === type && (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              )}
            </button>
          );
        })}
      </div>

      <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm">
        <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={14}
        onLoad={onMapLoad}
        options={{
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
        }}
      >
        {/* User location */}
        <MarkerF position={center} icon={{
          path: (window as any).google?.maps?.SymbolPath?.CIRCLE,
          scale: 6,
          fillColor: '#2563eb',
          fillOpacity: 1,
          strokeWeight: 2,
          strokeColor: '#ffffff',
        }} />

        {/* Clinic markers */}
        {markers.map((m) => (
          <MarkerF key={m.id} position={m.position} onClick={() => setSelected(m)} />
        ))}

        {selected && (
          <InfoWindowF position={selected.position} onCloseClick={() => setSelected(null)}>
            <div className="max-w-xs">
              <h3 className="font-semibold text-gray-800">{selected.name}</h3>
              {selected.address && (
                <p className="text-sm text-gray-600 mb-1">{selected.address}</p>
              )}
              {typeof selected.rating === 'number' && (
                <p className="text-sm text-gray-700">Rating: {selected.rating.toFixed(1)} ★</p>
              )}
              {selected.placeId && (
                <a
                  className="text-sm text-indigo-600 hover:underline"
                  href={`https://www.google.com/maps/place/?q=place_id:${selected.placeId}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open in Google Maps
                </a>
              )}
            </div>
          </InfoWindowF>
        )}
      </GoogleMap>
      </div>
    </div>
  );
};

export default ClinicMap;
