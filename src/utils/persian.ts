import { CityId } from '../types';
import { CITIES } from '../data/cities';

export function toPersianDigits(n: number | string | undefined | null): string {
  if (n === undefined || n === null) return '';
  const str = String(n);
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return str.replace(/[0-9]/g, (w) => persianDigits[+w]);
}

export function formatTomans(amount: number): string {
  const formatted = amount.toLocaleString('en-US');
  return `${toPersianDigits(formatted)} تومان`;
}

// Calculate distance between two coordinates in kilometers (Haversine formula)
export function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Check if a point is within the allowed municipal service boundaries
export function checkInsideCityBoundary(cityId: CityId, lat: number, lng: number): {
  isInside: boolean;
  distanceKm: number;
  maxRadiusKm: number;
} {
  const city = CITIES[cityId] || CITIES.noorabad;
  const dist = getDistanceKm(lat, lng, city.center.lat, city.center.lng);
  return {
    isInside: dist <= city.maxRadiusKm,
    distanceKm: dist,
    maxRadiusKm: city.maxRadiusKm
  };
}

export interface DayOption {
  dayName: string; // e.g. "شنبه"
  dateStr: string; // e.g. "شنبه ۱۷ شهریور ۱۴۰۵"
  dayNumber: string; // e.g. "۱۷"
  monthName: string; // e.g. "شهریور"
  isToday: boolean;
  isTomorrow: boolean;
  rawDateKey: string;
}

// Generates upcoming 7 days with Persian names & dates
export function getUpcomingDays(): DayOption[] {
  const days: DayOption[] = [];
  const now = new Date();

  const persianDaysMap = ['یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه', 'شنبه'];
  const persianMonths = [
    'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
    'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
  ];

  for (let i = 0; i < 7; i++) {
    const targetDate = new Date(now);
    targetDate.setDate(now.getDate() + i);

    const dayOfWeekIndex = targetDate.getDay(); // 0 is Sunday, 6 is Saturday
    const dayName = persianDaysMap[dayOfWeekIndex];

    // Format in Persian Solar Calendar
    const formatter = new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    const parts = formatter.formatToParts(targetDate);
    const dayNum = parts.find((p) => p.type === 'day')?.value || '۱';
    const month = parts.find((p) => p.type === 'month')?.value || 'شهریور';
    const year = parts.find((p) => p.type === 'year')?.value || '۱۴۰۵';

    const fullStr = `${dayName} ${dayNum} ${month} ${year}`;

    days.push({
      dayName,
      dateStr: fullStr,
      dayNumber: dayNum,
      monthName: month,
      isToday: i === 0,
      isTomorrow: i === 1,
      rawDateKey: targetDate.toISOString().split('T')[0]
    });
  }

  return days;
}

// Generate unique sequential tracking code
export function generateRecyclingId(): string {
  const seed = Math.floor(1000 + Math.random() * 9000);
  return `${seed}`;
}

export function generateLotteryCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const char = chars[Math.floor(Math.random() * chars.length)];
  const num = Math.floor(10000 + Math.random() * 90000);
  return `PK-${char}${toPersianDigits(num)}`;
}
