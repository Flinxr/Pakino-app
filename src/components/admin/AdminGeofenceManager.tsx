import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import { 
  MapPin, 
  Save, 
  RotateCcw, 
  Plus, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  ShieldCheck, 
  Info,
  Navigation,
  Crosshair
} from 'lucide-react';
import { CityId } from '../../types';
import { CITIES } from '../../data/cities';
import { 
  getCityPolygon, 
  saveCityPolygon, 
  resetCityPolygon, 
  isPointInPolygon, 
  CoordinatePair 
} from '../../utils/polygonGeofence';
import { toPersianDigits } from '../../utils/persian';

interface AdminGeofenceManagerProps {
  currentCity: CityId;
}

export const AdminGeofenceManager: React.FC<AdminGeofenceManagerProps> = ({
  currentCity: initialCity
}) => {
  const [selectedCity, setSelectedCity] = useState<CityId>(initialCity);
  const [polygonCoords, setPolygonCoords] = useState<CoordinatePair[]>(() => getCityPolygon(initialCity));
  const [isSavedNotice, setIsSavedNotice] = useState(false);
  const [testPoint, setTestPoint] = useState<{ lat: number; lng: number; isInside: boolean } | null>(null);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const polygonLayerRef = useRef<L.Polygon | null>(null);
  const vertexMarkersGroupRef = useRef<L.FeatureGroup | null>(null);
  const testMarkerRef = useRef<L.Marker | null>(null);

  const city = CITIES[selectedCity] || CITIES.noorabad;

  // When city selector changes
  useEffect(() => {
    const coords = getCityPolygon(selectedCity);
    setPolygonCoords(coords);
    setTestPoint(null);
  }, [selectedCity]);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [city.center.lat, city.center.lng],
        zoom: 13,
        zoomControl: false,
        attributionControl: false
      });

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19
      }).addTo(map);

      polygonLayerRef.current = L.polygon(polygonCoords, {
        color: '#059669',
        fillColor: '#10b981',
        fillOpacity: 0.15,
        weight: 3
      }).addTo(map);

      vertexMarkersGroupRef.current = L.featureGroup().addTo(map);

      // Click map to test point or add vertex
      map.on('click', (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        // Test point in polygon
        const inside = isPointInPolygon([lat, lng], polygonCoords);
        setTestPoint({ lat, lng, isInside: inside });
      });

      mapInstanceRef.current = map;
    } else {
      mapInstanceRef.current.setView([city.center.lat, city.center.lng], 13);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [selectedCity]);

  // Update polygon & draggable vertex markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !polygonLayerRef.current || !vertexMarkersGroupRef.current) return;

    polygonLayerRef.current.setLatLngs(polygonCoords);
    vertexMarkersGroupRef.current.clearLayers();

    polygonCoords.forEach((coord, idx) => {
      const vertexIconHtml = `
        <div style="
          width: 22px; 
          height: 22px; 
          background: #059669; 
          color: white; 
          border: 2px solid white; 
          border-radius: 50%; 
          font-weight: 900; 
          font-size: 10px; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          box-shadow: 0 2px 8px rgba(0,0,0,0.4); 
          cursor: grab;
        ">
          ${toPersianDigits(idx + 1)}
        </div>
      `;
      const icon = L.divIcon({
        className: `vertex-icon-${idx}`,
        html: vertexIconHtml,
        iconSize: [22, 22],
        iconAnchor: [11, 11]
      });

      const marker = L.marker([coord[0], coord[1]], {
        icon,
        draggable: true
      });

      marker.on('drag', (e) => {
        const newPos = (e.target as L.Marker).getLatLng();
        setPolygonCoords((prev) => {
          const updated = [...prev];
          updated[idx] = [newPos.lat, newPos.lng];
          polygonLayerRef.current?.setLatLngs(updated);
          return updated;
        });
      });

      marker.bindPopup(`
        <div style="direction: rtl; font-family: inherit; font-size: 11px;">
          <strong>رأس شماره ${toPersianDigits(idx + 1)}</strong>
          <div>مختصات: ${coord[0].toFixed(4)}, ${coord[1].toFixed(4)}</div>
          <div style="color: #64748b; margin-top: 4px;">برای جابجایی بکشید (Drag)</div>
        </div>
      `);

      vertexMarkersGroupRef.current?.addLayer(marker);
    });

    // Update test point marker if exists
    if (testPoint) {
      if (testMarkerRef.current) {
        testMarkerRef.current.remove();
      }
      const testIconHtml = `
        <div style="
          background: ${testPoint.isInside ? '#10b981' : '#ef4444'}; 
          color: white; 
          padding: 3px 8px; 
          border-radius: 9999px; 
          font-weight: bold; 
          font-size: 10px; 
          border: 2px solid white; 
          box-shadow: 0 4px 10px rgba(0,0,0,0.3);
          white-space: nowrap;
          transform: translate(-50%, -100%);
        ">
          ${testPoint.isInside ? '✅ داخل محدوده سرویس' : '❌ خارج از محدوده'}
        </div>
      `;
      const testIcon = L.divIcon({
        className: 'test-pt-icon',
        html: testIconHtml,
        iconSize: [0, 0],
        iconAnchor: [0, 0]
      });
      const tMarker = L.marker([testPoint.lat, testPoint.lng], { icon: testIcon }).addTo(map);
      testMarkerRef.current = tMarker;
    }
  }, [polygonCoords, testPoint]);

  const handleSave = () => {
    saveCityPolygon(selectedCity, polygonCoords);
    setIsSavedNotice(true);
    setTimeout(() => setIsSavedNotice(false), 3000);
  };

  const handleReset = () => {
    const def = resetCityPolygon(selectedCity);
    setPolygonCoords(def);
    setTestPoint(null);
  };

  const handleAddVertex = () => {
    // Add point midway between first and last or near center
    if (polygonCoords.length < 3) return;
    const last = polygonCoords[polygonCoords.length - 1];
    const first = polygonCoords[0];
    const newLat = (last[0] + first[0]) / 2;
    const newLng = (last[1] + first[1]) / 2;
    setPolygonCoords((prev) => [...prev, [newLat, newLng]]);
  };

  const handleRemoveLastVertex = () => {
    if (polygonCoords.length <= 3) {
      alert('حداقل ۳ رأس برای تشکیل چندضلعی محدوده شهری الزامی است.');
      return;
    }
    setPolygonCoords((prev) => prev.slice(0, -1));
  };

  return (
    <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4 animate-in fade-in text-right">
      {/* Header and City Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <h3 className="font-black text-sm sm:text-base text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <span>ویرایشگر محدوده سرویس‌دهی شهری (چندضلعی Geofencing)</span>
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            تعیین رئوس چندضلعی مجاز خدمات‌رسانی ناوگان پاکینو و الگوریتم هوشمند Ray-Casting
          </p>
        </div>

        {/* City Toggle Buttons */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setSelectedCity('noorabad')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer ${
              selectedCity === 'noorabad'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            نورآباد ممسنی
          </button>
          <button
            type="button"
            onClick={() => setSelectedCity('kazeroon')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer ${
              selectedCity === 'kazeroon'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            کازرون
          </button>
        </div>
      </div>

      {/* Action Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 bg-slate-50 p-3 rounded-2xl border border-slate-200 text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleAddVertex}
            className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-800 rounded-xl border border-slate-300 font-bold flex items-center gap-1 cursor-pointer transition shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-600" />
            <span>افزودن رأس جدید</span>
          </button>

          <button
            type="button"
            onClick={handleRemoveLastVertex}
            className="px-3 py-1.5 bg-white hover:bg-slate-100 text-rose-700 rounded-xl border border-slate-300 font-bold flex items-center gap-1 cursor-pointer transition shadow-2xs"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>حذف آخرین رأس ({toPersianDigits(polygonCoords.length)})</span>
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-600 rounded-xl border border-slate-300 font-bold flex items-center gap-1 cursor-pointer transition shadow-2xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>بازنشانی به پیش‌فرض رسمی</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {isSavedNotice && (
            <span className="text-xs text-emerald-700 font-bold flex items-center gap-1 animate-in fade-in">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>محدوده با موفقیت ذخیره شد</span>
            </span>
          )}

          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black flex items-center gap-1.5 shadow-md cursor-pointer transition"
          >
            <Save className="w-4 h-4" />
            <span>ذخیره چندضلعی محدوده</span>
          </button>
        </div>
      </div>

      {/* Guide Banner */}
      <div className="bg-emerald-50/70 border border-emerald-200 p-3 rounded-2xl text-xs text-emerald-950 flex items-start gap-2">
        <Info className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong>راهنمای ویرایش:</strong> برای تغییر محدوده، دایره‌های سبز رنگ شماره‌دار (رئوس چندضلعی) را روی نقشه با موس یا لمس جابجا کنید. با کلیک روی هر نقطه از نقشه، وضعیت سرویس‌دهی آن نقطه بلافاصله بررسی و نمایش داده می‌شود.
        </div>
      </div>

      {/* Interactive Leaflet Map for Polygon */}
      <div className="relative w-full h-80 sm:h-96 rounded-2xl overflow-hidden border border-slate-300 shadow-inner bg-slate-100">
        <div ref={mapContainerRef} className="w-full h-full" />
      </div>

      {/* Vertices Coordinate List */}
      <div className="space-y-2 pt-1">
        <h4 className="font-black text-xs text-slate-800 flex items-center gap-1.5">
          <Crosshair className="w-4 h-4 text-slate-600" />
          <span>مختصات دقیق رئوس چندضلعی ({toPersianDigits(polygonCoords.length)} نقطه مرزی):</span>
        </h4>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 text-xs">
          {polygonCoords.map((coord, idx) => (
            <div key={idx} className="bg-slate-50 p-2 rounded-xl border border-slate-200 flex items-center justify-between">
              <span className="font-bold text-slate-700">رأس {toPersianDigits(idx + 1)}:</span>
              <span className="font-mono text-[11px] text-slate-600" dir="ltr">
                {coord[0].toFixed(4)}, {coord[1].toFixed(4)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
