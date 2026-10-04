import { PickupRequest, DriverProfile } from '../types';
import { toPersianDigits, formatTomans } from './persian';
import { CITIES } from '../data/cities';

/**
 * Trigger download of CSV data with proper UTF-8 BOM so Persian text opens properly in Excel.
 */
export function downloadCsv(filename: string, rows: (string | number)[][]): void {
  // UTF-8 BOM
  const BOM = '\uFEFF';
  
  const csvContent = rows
    .map((row) =>
      row
        .map((cell) => {
          if (cell === null || cell === undefined) return '""';
          const str = String(cell).replace(/"/g, '""');
          return `"${str}"`;
        })
        .join(',')
    )
    .join('\r\n');

  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export requests data to CSV
 */
export function exportRequestsToCsv(requests: PickupRequest[], filename = 'pakino-requests-report.csv'): void {
  const headers = [
    'کد رهگیری',
    'نام شهروند',
    'شماره تماس',
    'شهر',
    'محله و آدرس',
    'نوع درخواست',
    'نحوه تسویه',
    'موسسه خیریه (در صورت اهدا)',
    'وزن برآوردی (kg)',
    'وزن واقعی باسکول (kg)',
    'مبلغ پرداختی (تومان)',
    'کد پیگیری کارت‌به‌کارت',
    'سفیر راننده',
    'پلاک خودرو',
    'تاریخ و روز',
    'بازه زمانی',
    'شماره شانس قرعه‌کشی',
    'وضعیت سفارش',
    'تبدیل به خیریه در محل',
    'علت لغو (در صورت انصراف)',
    'لغو شده توسط'
  ];

  const rows = requests.map((r) => [
    r.trackingCode,
    r.userName,
    r.userPhone,
    r.cityName,
    `${r.address.neighborhood || ''} - ${r.address.street || ''}`,
    r.type === 'charity' ? 'نیکوکاری' : 'تسویه نقدی',
    r.payoutMethod === 'direct_card_transfer'
      ? 'کارت‌به‌کارت مستقیم'
      : r.payoutMethod === 'cash_on_delivery'
      ? 'نقد در محل'
      : 'کیف پول',
    r.charityName || '-',
    r.estimatedKg || 0,
    r.actualKg || r.estimatedKg || 0,
    r.cashPaidTomans || r.approximatePayoutTomans || 0,
    r.cardTransferRefCode || '-',
    r.driverName || '-',
    r.vehiclePlate || '-',
    r.dateStr,
    r.timeSlot,
    r.lotteryTicketNumber,
    r.status === 'collected'
      ? 'تحویل و تسویه شده'
      : r.status === 'assigned'
      ? 'در حال مراجعه سفیر'
      : r.status === 'cancelled'
      ? 'لغو شده'
      : 'در انتظار',
    r.convertedToCharityMidway ? 'بله' : 'خیر',
    r.cancellationDetails?.reason || '-',
    r.cancellationDetails?.cancelledBy || '-'
  ]);

  downloadCsv(filename, [headers, ...rows]);
}

/**
 * Export drivers performance data to CSV
 */
export function exportDriversToCsv(drivers: DriverProfile[], filename = 'pakino-fleet-report.csv'): void {
  const headers = [
    'کد شناسایی سفیر',
    'نام و نام خانوادگی',
    'شماره تماس',
    'کدملی',
    'شهر خدمت',
    'نوع خودرو',
    'شماره پلاک',
    'وضعیت حساب',
    'وضعیت برخط',
    'مجموع پسماند جمع‌آوری‌شده (kg)',
    'تعداد ماموریت‌های موفق',
    'امتیاز و ستاره',
    'تعداد ارزیابی‌ها',
    'تعداد اخطار انضباطی',
    'تاریخ شروع همکاری'
  ];

  const rows = drivers.map((d) => [
    d.id,
    d.name,
    d.phone,
    d.nationalId,
    CITIES[d.cityId]?.name || d.cityId,
    d.vehicleType,
    d.plateNumber,
    d.status === 'active' ? 'فعال' : d.status === 'warning' ? 'دارای اخطار' : 'تعلیق',
    d.isOnline ? 'آنلاین' : 'آفلاین',
    d.totalCollectedKg,
    d.totalCompletedPickups,
    d.rating,
    d.ratingCount,
    d.warningCount || 0,
    d.joinedDateStr || '۱۴۰۵'
  ]);

  downloadCsv(filename, [headers, ...rows]);
}

/**
 * Export citizen charity donations breakdown to CSV
 */
export function exportCharityDonationsToCsv(requests: PickupRequest[], filename = 'pakino-charity-donations.csv'): void {
  const donationRequests = requests.filter(
    (r) => r.type === 'charity' || r.convertedToCharityMidway || (r.charityName && r.charityName.trim() !== '')
  );

  const headers = [
    'کد رهگیری',
    'نام شهروند',
    'شماره تماس',
    'شهر',
    'طرح نیکوکاری هدف',
    'وزن اهدایی پسماند (kg)',
    'ارزش ریالی اهدا (تومان)',
    'نحوه ثبت اهدا',
    'سفیر مسئول جمع‌آوری',
    'تاریخ و زمان',
    'وضعیت تحویل'
  ];

  const rows = donationRequests.map((r) => [
    r.trackingCode,
    r.userName,
    r.userPhone,
    r.cityName,
    r.charityName || 'طرح نیکوکاری عمومی',
    r.actualKg || r.estimatedKg || 0,
    r.cashPaidTomans || r.approximatePayoutTomans || (r.actualKg || r.estimatedKg || 0) * 15000,
    r.convertedToCharityMidway ? 'تبدیل در محل توزین' : 'ثبت اولیه شهروند',
    r.driverName || '-',
    r.dateStr,
    r.status === 'collected' ? 'تحویل شده' : r.status === 'assigned' ? 'در حال جمع‌آوری' : 'در انتظار'
  ]);

  downloadCsv(filename, [headers, ...rows]);
}
