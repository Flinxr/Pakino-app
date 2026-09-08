import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

interface DriverMapCardProps {
  lat: number;
  lng: number;
  userName: string;
  street: string;
  cityName: string;
}

export const DriverMapCard: React.FC<DriverMapCardProps> = ({
  lat,
  lng,
  userName,
  street,
  cityName
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const map = L.map(mapContainerRef.current, {
      center: [lat, lng],
      zoom: 15,
      zoomControl: false,
      attributionControl: false
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19
    }).addTo(map);

    const customIcon = L.divIcon({
      className: 'driver-dest-pin',
      html: `
        <div style="position: relative; display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -100%);">
          <div style="background: #0284c7; color: white; padding: 5px 10px; border-radius: 9999px; font-weight: 800; font-size: 11px; box-shadow: 0 4px 12px rgba(0,0,0,0.3); white-space: nowrap; border: 2px solid #ffffff;">
            <span>📍 مقصد: ${userName}</span>
          </div>
          <div style="width: 12px; height: 12px; background: #0284c7; transform: rotate(45deg); margin-top: -6px; border-right: 2px solid #fff; border-bottom: 2px solid #fff;"></div>
        </div>
      `,
      iconSize: [0, 0],
      iconAnchor: [0, 0]
    });

    L.marker([lat, lng], { icon: customIcon }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [lat, lng, userName]);

  return (
    <div className="relative w-full h-44 sm:h-52 rounded-2xl overflow-hidden border border-slate-200 shadow-inner">
      <div ref={mapContainerRef} className="w-full h-full" />
      <div className="absolute top-2 right-2 z-20 bg-white/95 px-2.5 py-1 rounded-xl shadow-xs border border-slate-200 text-[10px] font-extrabold text-slate-800">
        شهر {cityName}
      </div>
    </div>
  );
};
