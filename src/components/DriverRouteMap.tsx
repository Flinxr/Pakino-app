import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { PickupRequest } from '../types';
import { toPersianDigits } from '../utils/persian';
import { optimizeDriverRoute } from '../utils/routeOptimizer';

interface DriverRouteMapProps {
  requests: PickupRequest[];
  cityCenter: { lat: number; lng: number };
  driverLocation?: { lat: number; lng: number };
  onSelectRequest?: (req: PickupRequest) => void;
  selectedRequestId?: string | null;
  title?: string;
  heightClass?: string;
  polylineColor?: string;
}

export const DriverRouteMap: React.FC<DriverRouteMapProps> = ({
  requests,
  cityCenter,
  driverLocation,
  onSelectRequest,
  selectedRequestId,
  title,
  heightClass = 'h-72 sm:h-96'
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersGroupRef = useRef<L.FeatureGroup | null>(null);
  const [totalKm, setTotalKm] = useState<number>(0);

  const startPoint = driverLocation || cityCenter;

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [startPoint.lat, startPoint.lng],
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
      mapInstanceRef.current.setView([startPoint.lat, startPoint.lng]);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [startPoint.lat, startPoint.lng]);

  // Update Markers with Nearest Neighbor + 2-opt route optimization
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !markersGroupRef.current) return;

    markersGroupRef.current.clearLayers();

    if (requests.length === 0) {
      setTotalKm(0);
      return;
    }

    // Run Nearest Neighbor & 2-Opt TSP optimization from driver's starting location (Item 2)
    const optimization = optimizeDriverRoute(startPoint, requests);
    setTotalKm(optimization.totalDistanceKm);

    const latlngs: [number, number][] = [[startPoint.lat, startPoint.lng]];

    // 1. Add Driver Current Position Marker
    const driverPinHtml = `
      <div style="position: relative; display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -100%);">
        <div style="
          background: #2563eb; 
          color: white; 
          padding: 4px 10px; 
          border-radius: 9999px; 
          font-weight: 900; 
          font-size: 11px; 
          box-shadow: 0 4px 14px rgba(37,99,235,0.6); 
          white-space: nowrap; 
          border: 2px solid #ffffff;
          display: flex;
          align-items: center;
          gap: 4px;
        ">
          <span>🚛 شروع حرکت سفیر</span>
        </div>
        <div style="
          width: 12px; 
          height: 12px; 
          background: #2563eb; 
          transform: rotate(45deg); 
          margin-top: -6px; 
          border-right: 2px solid #fff; 
          border-bottom: 2px solid #fff;
        "></div>
      </div>
    `;
    const driverIcon = L.divIcon({
      className: 'driver-origin-marker',
      html: driverPinHtml,
      iconSize: [0, 0],
      iconAnchor: [0, 0]
    });
    const driverMarker = L.marker([startPoint.lat, startPoint.lng], { icon: driverIcon });
    driverMarker.bindPopup('<div style="direction: rtl; font-family: inherit; font-weight: bold; padding: 4px;">موقعیت شروع بهینه ناوگان سفیر</div>');
    markersGroupRef.current.addLayer(driverMarker);

    // 2. Add Optimized Sequential Stops (No dashed lines between them!)
    optimization.stops.forEach((stop) => {
      const req = stop.request;
      const { lat, lng } = req.address;
      latlngs.push([lat, lng]);

      const isSelected = selectedRequestId === req.id;
      const isAssigned = req.status === 'assigned';
      const stopNumberPersian = toPersianDigits(stop.stopSequence);

      // Pin with clear order number badge on the point
      const customPinHtml = `
        <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer; transform: translate(-50%, -100%);">
          <div style="
            background: ${isSelected ? '#dc2626' : isAssigned ? '#0284c7' : '#059669'}; 
            color: white; 
            padding: 4px 8px; 
            border-radius: 9999px; 
            font-weight: 900; 
            font-size: 11px; 
            box-shadow: 0 4px 14px rgba(0,0,0,0.35); 
            white-space: nowrap; 
            border: 2px solid #ffffff;
            display: flex;
            align-items: center;
            gap: 5px;
          ">
            <span style="
              background: #ffffff; 
              color: ${isSelected ? '#dc2626' : isAssigned ? '#0284c7' : '#059669'}; 
              border-radius: 9999px; 
              width: 18px; 
              height: 18px; 
              font-weight: 900;
              display: inline-flex; 
              align-items: center; 
              justify-content: center; 
              font-size: 11px;
            ">${stopNumberPersian}</span>
            <span>${req.userName} (${toPersianDigits(req.estimatedKg)} کیلو)</span>
          </div>
          <div style="
            width: 14px; 
            height: 14px; 
            background: ${isSelected ? '#dc2626' : isAssigned ? '#0284c7' : '#059669'}; 
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
          <div style="font-weight: 900; color: #0f172a; font-size: 13px; margin-bottom: 4px;">
            ایستگاه شماره ${stopNumberPersian}: ${req.userName}
          </div>
          <div style="font-size: 11px; color: #475569; margin-bottom: 3px;">
            📞 تلفن: <span style="direction: ltr; font-weight: bold;">${toPersianDigits(req.userPhone)}</span>
          </div>
          <div style="font-size: 11px; color: #475569; margin-bottom: 3px;">
            ⚖️ وزن بار: <strong>${toPersianDigits(req.estimatedKg)} کیلوگرم</strong> (${req.type === 'charity' ? 'نیکوکاری' : 'تسویه به شهروند'})
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

    // NOTE (Item 2): Dashed lines between points are completely removed as requested!

    // Fit bounds to show all points and driver start location
    if (latlngs.length > 0) {
      const bounds = L.latLngBounds(latlngs);
      map.fitBounds(bounds, { padding: [45, 45], maxZoom: 16 });
    }
  }, [requests, selectedRequestId, onSelectRequest, startPoint.lat, startPoint.lng]);

  return (
    <div className={`relative w-full ${heightClass} rounded-3xl overflow-hidden border-2 border-slate-300 shadow-md bg-slate-100`}>
      {/* Route Optimization Badge */}
      <div className="absolute top-3 right-3 z-10 bg-slate-900/90 backdrop-blur-md text-white px-3.5 py-1.5 rounded-2xl text-[11px] font-bold shadow-lg border border-white/20 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span>مسیر بهینه کمترین پیمایش (نزدیک‌ترین همسایه + 2-opt)</span>
        {totalKm > 0 && (
          <span className="bg-white/20 text-emerald-300 px-2 py-0.5 rounded-lg font-mono">
            {toPersianDigits(totalKm)} کیلومتر
          </span>
        )}
      </div>

      {requests.length > 0 && (
        <div className="absolute bottom-3 left-3 z-10 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-md border border-slate-200 text-[11px] text-slate-700 font-bold hidden sm:flex items-center gap-1.5">
          <span>ترتیب نقاط به صورت خودکار با الگوریتم TSP بهینه‌سازی شده است</span>
        </div>
      )}

      <div ref={mapContainerRef} className="w-full h-full" />
    </div>
  );
};
