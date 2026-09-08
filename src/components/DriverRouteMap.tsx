import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { PickupRequest } from '../types';
import { toPersianDigits } from '../utils/persian';

interface DriverRouteMapProps {
  requests: PickupRequest[];
  cityCenter: { lat: number; lng: number };
  onSelectRequest?: (req: PickupRequest) => void;
  selectedRequestId?: string | null;
}

export const DriverRouteMap: React.FC<DriverRouteMapProps> = ({
  requests,
  cityCenter,
  onSelectRequest,
  selectedRequestId
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersGroupRef = useRef<L.FeatureGroup | null>(null);
  const polylineRef = useRef<L.Polyline | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [cityCenter.lat, cityCenter.lng],
        zoom: 14,
        zoomControl: false,
        attributionControl: false
      });

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19
      }).addTo(map);

      markersGroupRef.current = L.featureGroup().addTo(map);
      mapInstanceRef.current = map;
    } else {
      mapInstanceRef.current.setView([cityCenter.lat, cityCenter.lng]);
    }

    return () => {
      // Keep instance or cleanup on unmount
    };
  }, [cityCenter.lat, cityCenter.lng]);

  // Update Markers & Connecting Route Line
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !markersGroupRef.current) return;

    markersGroupRef.current.clearLayers();
    if (polylineRef.current) {
      polylineRef.current.remove();
      polylineRef.current = null;
    }

    if (requests.length === 0) return;

    const latlngs: [number, number][] = [];

    requests.forEach((req, index) => {
      const { lat, lng } = req.address;
      latlngs.push([lat, lng]);

      const isSelected = selectedRequestId === req.id;
      const isAssigned = req.status === 'assigned';
      const stopNumber = toPersianDigits(index + 1);

      // Red pin with stop sequence number and pulsing ring
      const customPinHtml = `
        <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer; transform: translate(-50%, -100%);">
          <div style="
            background: ${isSelected ? '#dc2626' : isAssigned ? '#0284c7' : '#ef4444'}; 
            color: white; 
            padding: 4px 8px; 
            border-radius: 9999px; 
            font-weight: 900; 
            font-size: 11px; 
            box-shadow: 0 4px 14px rgba(239,68,68,0.5); 
            white-space: nowrap; 
            border: 2px solid #ffffff;
            display: flex;
            align-items: center;
            gap: 4px;
          ">
            <span style="background: rgba(0,0,0,0.25); border-radius: 9999px; width: 16px; height: 16px; display: inline-flex; align-items: center; justify-content: center; font-size: 10px;">${stopNumber}</span>
            <span>${req.userName} (${toPersianDigits(req.estimatedKg)} کیلو)</span>
          </div>
          <div style="
            width: 14px; 
            height: 14px; 
            background: ${isSelected ? '#dc2626' : isAssigned ? '#0284c7' : '#ef4444'}; 
            transform: rotate(45deg); 
            margin-top: -7px; 
            border-right: 2px solid #fff; 
            border-bottom: 2px solid #fff;
          "></div>
          <div style="
            position: absolute;
            bottom: -6px;
            width: 12px;
            height: 6px;
            background: rgba(0,0,0,0.3);
            border-radius: 50%;
          "></div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: `driver-stop-marker-${req.id}`,
        html: customPinHtml,
        iconSize: [0, 0],
        iconAnchor: [0, 0]
      });

      const marker = L.marker([lat, lng], { icon: customIcon });

      const popupContent = `
        <div style="direction: rtl; text-align: right; font-family: inherit; padding: 4px;">
          <div style="font-weight: 800; color: #0f172a; font-size: 13px; margin-bottom: 4px;">
            نوبت ${stopNumber}: ${req.userName}
          </div>
          <div style="font-size: 11px; color: #475569; margin-bottom: 4px;">
            📞 تلفن: <span style="direction: ltr; font-weight: bold;">${toPersianDigits(req.userPhone)}</span>
          </div>
          <div style="font-size: 11px; color: #475569; margin-bottom: 4px;">
            ⚖️ وزن بار: <strong>${toPersianDigits(req.estimatedKg)} کیلوگرم</strong> (${req.type === 'charity' ? 'نیکوکاری' : 'نقدی'})
          </div>
          <div style="font-size: 10px; color: #64748b; line-height: 1.4;">
            📍 ${req.address.street}
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);
      marker.on('click', () => {
        if (onSelectRequest) {
          onSelectRequest(req);
        }
      });

      markersGroupRef.current?.addLayer(marker);
    });

    // Draw dashed red connection line between stops
    if (latlngs.length > 1) {
      polylineRef.current = L.polyline(latlngs, {
        color: '#ef4444',
        weight: 3.5,
        opacity: 0.8,
        dashArray: '8, 8',
        lineCap: 'round'
      }).addTo(map);
    }

    // Fit bounds
    if (latlngs.length > 0) {
      const bounds = L.latLngBounds(latlngs);
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 16 });
    }
  }, [requests, selectedRequestId, onSelectRequest]);

  return (
    <div className="relative w-full h-72 sm:h-96 rounded-3xl overflow-hidden border-2 border-rose-500/40 shadow-lg bg-slate-100">
      <div ref={mapContainerRef} className="w-full h-full" />
      
      {/* Overlay Badge */}
      <div className="absolute top-3 right-3 z-20 bg-slate-900/90 text-white backdrop-blur-md px-3 py-1.5 rounded-2xl shadow-md border border-slate-700 flex items-center gap-2 text-xs font-bold">
        <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
        <span className="w-2.5 h-2.5 rounded-full bg-rose-500 -mr-4.5"></span>
        <span>نقشه مسیر سفر راننده (نقاط قرمز توقف)</span>
        <span className="bg-rose-500 text-white text-[10px] font-mono px-1.5 py-0.2 rounded-full">
          {toPersianDigits(requests.length)} نقطه
        </span>
      </div>

      {requests.length > 0 && (
        <div className="absolute bottom-3 left-3 z-20 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-md border border-slate-200 text-[11px] text-slate-700 font-bold hidden sm:flex items-center gap-1.5">
          <span>ترتیب نقاط به صورت خودکار بهینه‌سازی شده است</span>
        </div>
      )}
    </div>
  );
};
