import React, { useEffect, useRef } from 'react';
import { MapPin, Navigation, AlertTriangle, CheckCircle2, Crosshair } from 'lucide-react';
import { CityId } from '../types';
import { CITIES } from '../data/cities';
import { checkInsideCityBoundary, toPersianDigits } from '../utils/persian';
import L from 'leaflet';

interface InteractiveMapProps {
  cityId: CityId;
  selectedCoords?: { lat: number; lng: number };
  centerLat?: number;
  centerLng?: number;
  onCoordsChange?: (coords: { lat: number; lng: number }, isInside: boolean) => void;
  onPositionChange?: (lat: number, lng: number, isInside: boolean) => void;
  selectedNeighborhood?: string;
  onNeighborhoodSelect?: (name: string) => void;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  cityId,
  selectedCoords,
  centerLat,
  centerLng,
  onCoordsChange,
  onPositionChange,
  selectedNeighborhood,
  onNeighborhoodSelect
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const circleRef = useRef<L.Circle | null>(null);

  const city = CITIES[cityId] || CITIES.noorabad;

  // Safe coordinates extraction with fallback to city center
  const activeLat = selectedCoords?.lat ?? centerLat ?? city.center.lat;
  const activeLng = selectedCoords?.lng ?? centerLng ?? city.center.lng;

  const boundaryCheck = checkInsideCityBoundary(cityId, activeLat, activeLng);

  const notifyChange = (lat: number, lng: number) => {
    const check = checkInsideCityBoundary(cityId, lat, lng);
    if (onCoordsChange) {
      onCoordsChange({ lat, lng }, check.isInside);
    }
    if (onPositionChange) {
      onPositionChange(lat, lng, check.isInside);
    }
  };

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Check if map already initialized
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const map = L.map(mapContainerRef.current, {
      center: [activeLat, activeLng],
      zoom: 14,
      zoomControl: false
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // OpenStreetMap standard tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(map);

    // Create custom pin icon
    const customIcon = L.divIcon({
      className: 'custom-map-pin',
      html: `
        <div style="position: relative; display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -100%);">
          <div style="background-color: #059669; color: white; padding: 6px 12px; border-radius: 9999px; font-weight: 800; font-size: 11px; box-shadow: 0 4px 12px rgba(0,0,0,0.25); white-space: nowrap; border: 2px solid #ffffff; display: flex; align-items: center; gap: 4px;">
            <span>محل تحویل بازیافت</span>
          </div>
          <div style="width: 14px; height: 14px; background: #059669; transform: rotate(45deg); margin-top: -7px; border-right: 2px solid #fff; border-bottom: 2px solid #fff;"></div>
          <div style="width: 8px; height: 8px; background: rgba(0,0,0,0.3); border-radius: 50%; margin-top: 2px; filter: blur(1px);"></div>
        </div>
      `,
      iconSize: [0, 0],
      iconAnchor: [0, 0]
    });

    const marker = L.marker([activeLat, activeLng], {
      icon: customIcon,
      draggable: true
    }).addTo(map);

    // Add service boundary circle
    const circle = L.circle([city.center.lat, city.center.lng], {
      radius: city.maxRadiusKm * 1000,
      color: '#10b981',
      fillColor: '#10b981',
      fillOpacity: 0.08,
      weight: 2,
      dashArray: '6, 6'
    }).addTo(map);

    // Map click handler
    map.on('click', (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      marker.setLatLng([lat, lng]);
      notifyChange(lat, lng);
    });

    // Marker drag handler
    marker.on('dragend', () => {
      const pos = marker.getLatLng();
      notifyChange(pos.lat, pos.lng);
    });

    mapInstanceRef.current = map;
    markerRef.current = marker;
    circleRef.current = circle;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [cityId]);

  // Sync marker and center when coords props change
  useEffect(() => {
    if (mapInstanceRef.current && markerRef.current) {
      markerRef.current.setLatLng([activeLat, activeLng]);
    }
  }, [activeLat, activeLng]);

  // Recenter to city or neighborhood
  const handleRecenter = (lat: number, lng: number) => {
    if (mapInstanceRef.current && markerRef.current) {
      mapInstanceRef.current.flyTo([lat, lng], 15, { duration: 1 });
      markerRef.current.setLatLng([lat, lng]);
      notifyChange(lat, lng);
    }
  };

  // Find user geolocation
  const handleCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          handleRecenter(lat, lng);
        },
        () => {
          // fallback to city center
          handleRecenter(city.center.lat, city.center.lng);
        }
      );
    }
  };

  return (
    <div className="space-y-3">
      {/* Neighborhood chips */}
      <div>
        <div className="text-[11px] font-bold text-slate-500 mb-1.5 flex items-center justify-between">
          <span>محله‌های پرتقاضا در {city.name}:</span>
          <span className="text-[10px] text-emerald-600">انتخاب سریع محله</span>
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {city.neighborhoods.slice(0, 6).map((neighborhood, idx) => {
            // slight offsets for visual differentiation
            const offsetLat = city.center.lat + (idx % 2 === 0 ? 0.003 * idx : -0.003 * idx);
            const offsetLng = city.center.lng + (idx % 3 === 0 ? 0.004 * idx : -0.004 * idx);
            const isSelected = selectedNeighborhood === neighborhood;

            return (
              <button
                key={neighborhood}
                type="button"
                onClick={() => {
                  onNeighborhoodSelect?.(neighborhood);
                  handleRecenter(offsetLat, offsetLng);
                }}
                className={`text-xs px-3 py-1.5 rounded-xl border whitespace-nowrap transition flex items-center gap-1 cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-600 text-white border-emerald-600 font-bold shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-300'
                }`}
              >
                <MapPin className="w-3 h-3" />
                <span>{neighborhood}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Map Container */}
      <div className="relative w-full h-64 sm:h-72 rounded-3xl overflow-hidden border-2 border-slate-200 shadow-inner">
        <div ref={mapContainerRef} className="w-full h-full" />

        {/* GPS Current Location button */}
        <button
          type="button"
          onClick={handleCurrentLocation}
          title="موقعیت فعلی من"
          className="absolute top-3 left-3 z-20 bg-white/95 hover:bg-white text-slate-800 p-2.5 rounded-2xl shadow-md border border-slate-200 flex items-center gap-1.5 text-xs font-bold transition cursor-pointer"
        >
          <Crosshair className="w-4 h-4 text-emerald-600" />
          <span className="hidden sm:inline">موقعیت من</span>
        </button>

        {/* Reset to city center */}
        <button
          type="button"
          onClick={() => handleRecenter(city.center.lat, city.center.lng)}
          className="absolute top-3 right-3 z-20 bg-white/95 hover:bg-white text-slate-800 px-3 py-2 rounded-2xl shadow-md border border-slate-200 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
        >
          <Navigation className="w-3.5 h-3.5 text-slate-600" />
          <span>مرکز {city.name}</span>
        </button>
      </div>

      {/* Geofencing Status Warning or Success */}
      {boundaryCheck.isInside ? (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs text-emerald-900">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-bold">موقعیت در محدوده مجاز شهری {city.name} قرار دارد.</span>
          </div>
          <span className="text-[11px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-semibold">
            فاصله تا مرکز: {toPersianDigits(boundaryCheck.distanceKm.toFixed(1))} کیلومتر
          </span>
        </div>
      ) : (
        <div className="p-3 bg-rose-50 border-2 border-rose-300 rounded-2xl flex items-start gap-2.5 text-xs text-rose-800 animate-bounce">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-extrabold text-rose-900">
              خارج از محدوده خدمات شهری {city.name}!
            </p>
            <p className="mt-0.5 text-rose-700 leading-relaxed">
              جمع‌آوری پسماند پاکینو فقط در محدوده مجاز شهری امکان‌پذیر است. لطفاً پین نقشه را به داخل محدوده شهری منتقل فرمایید (حداکثر شعاع خدمات: {toPersianDigits(boundaryCheck.maxRadiusKm)} کیلومتر).
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
