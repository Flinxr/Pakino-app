import { AppEventLog, AppEventType, DriverDailyStatRecord, PickupRequest, CityId } from '../types';

const STORAGE_KEY = 'pakino_event_logs';

export const EVENT_TYPE_LABELS: Record<AppEventType, { label: string; badgeColor: string; category: string }> = {
  request_created: {
    label: 'ثبت نوبت توسط شهروند',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    category: 'درخواست‌ها'
  },
  request_assigned: {
    label: 'پذیرش توسط راننده',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-300',
    category: 'رانندگان'
  },
  request_batch_assigned: {
    label: 'پذیرش گروهی نوبت‌ها',
    badgeColor: 'bg-sky-100 text-sky-800 border-sky-300',
    category: 'رانندگان'
  },
  request_cancelled_citizen: {
    label: 'لغو نوبت توسط شهروند',
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-300',
    category: 'لغوها'
  },
  request_cancelled_driver: {
    label: 'انصراف راننده (بازگشت به صف)',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
    category: 'لغوها'
  },
  request_cancelled_admin: {
    label: 'لغو نوبت توسط مدیر',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-300',
    category: 'لغوها'
  },
  request_trip_started: {
    label: 'شروع حرکت سفیر به سمت مبدأ',
    badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-300',
    category: 'رانندگان'
  },
  request_type_converted_to_charity: {
    label: 'تبدیل تسویه به نیکوکاری',
    badgeColor: 'bg-teal-100 text-teal-800 border-teal-300',
    category: 'تسویه‌ها'
  },
  request_weighed_and_completed: {
    label: 'توزین و تکمیل نهایی سفارش',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    category: 'تکمیل'
  },
  weight_and_payout_recorded: {
    label: 'ثبت وزن و مبلغ تسویه',
    badgeColor: 'bg-cyan-100 text-cyan-800 border-cyan-300',
    category: 'تسویه‌ها'
  },
  driver_issue_flagged: {
    label: 'گزارش عدم تحویل / غیبت',
    badgeColor: 'bg-orange-100 text-orange-800 border-orange-300',
    category: 'رانندگان'
  },
  user_registered: {
    label: 'ثبت‌نام شهروند جدید',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-300',
    category: 'کاربران'
  },
  user_logged_in: {
    label: 'ورود موفق شهروند',
    badgeColor: 'bg-slate-100 text-slate-800 border-slate-300',
    category: 'کاربران'
  },
  user_logged_out: {
    label: 'خروج کاربر از سامانه',
    badgeColor: 'bg-slate-100 text-slate-700 border-slate-200',
    category: 'کاربران'
  },
  driver_logged_in: {
    label: 'ورود سفیر راننده',
    badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-300',
    category: 'رانندگان'
  },
  admin_logged_in: {
    label: 'ورود به پنل مدیریت',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-300',
    category: 'مدیریت'
  },
  lottery_event_entered: {
    label: 'ثبت‌نام در قرعه‌کشی مناسبتی',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
    category: 'قرعه‌کشی'
  },
  driver_rated_by_citizen: {
    label: 'ثبت امتیاز و نظر برای سفیر',
    badgeColor: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    category: 'نظرات'
  },
  citizen_feedback_submitted: {
    label: 'ارسال پیام پشتیبانی / پیشنهاد',
    badgeColor: 'bg-violet-100 text-violet-800 border-violet-300',
    category: 'نظرات'
  },
  shifts_matrix_updated: {
    label: 'به‌روزرسانی شیفت‌ها و ظرفیت',
    badgeColor: 'bg-fuchsia-100 text-fuchsia-800 border-fuchsia-300',
    category: 'مدیریت'
  },
  waste_tariffs_updated: {
    label: 'تغییر نرخ مصوب اقلام بازیافتی',
    badgeColor: 'bg-green-100 text-green-800 border-green-300',
    category: 'مدیریت'
  },
  hero_slides_updated: {
    label: 'ویرایش بنرها و اسلایدرها',
    badgeColor: 'bg-sky-100 text-sky-800 border-sky-300',
    category: 'مدیریت'
  },
  lottery_period_created: {
    label: 'ایجاد دوره جدید قرعه‌کشی',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
    category: 'قرعه‌کشی'
  },
  lottery_winner_drawn: {
    label: 'انجام قرعه‌کشی / حذف برنده غایب',
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-300',
    category: 'قرعه‌کشی'
  }
};

// Initial Realistic Historical Events
export const INITIAL_EVENT_LOGS: AppEventLog[] = [
  {
    id: 'evt-1001',
    eventType: 'request_created',
    actorId: 'usr-101',
    actorRole: 'citizen',
    actorName: 'علی حسینی',
    entityId: '1021',
    entityType: 'request',
    cityId: 'noorabad',
    cityName: 'نورآباد ممسنی',
    timestamp: new Date(Date.now() - 3600000 * 28).toISOString(),
    details: {
      trackingCode: 'PK-1021',
      type: 'charity',
      charityName: 'موسسه خیریه حضرت امام علی (ع) ممسنی',
      estimatedKg: 15,
      categories: ['پلاستیک و بطری پت', 'کارتن، مقوا و کاغذ باطله'],
      address: 'میدان امام خمینی، کوی گلستان، پلاک ۱۲',
      payoutMethod: 'direct_card_transfer'
    }
  },
  {
    id: 'evt-1002',
    eventType: 'request_assigned',
    actorId: 'drv-101',
    actorRole: 'driver',
    actorName: 'سفیر علی رضایی',
    entityId: '1021',
    entityType: 'request',
    cityId: 'noorabad',
    cityName: 'نورآباد ممسنی',
    timestamp: new Date(Date.now() - 3600000 * 25).toISOString(),
    details: {
      trackingCode: 'PK-1021',
      driverPhone: '09171239988',
      vehiclePlate: 'ایران ۷۳ - ۴۵۶ ج ۱۲'
    }
  },
  {
    id: 'evt-1003',
    eventType: 'request_created',
    actorId: 'user-2',
    actorRole: 'citizen',
    actorName: 'رضا کازرونی',
    entityId: '1020',
    entityType: 'request',
    cityId: 'kazeroon',
    cityName: 'کازرون',
    timestamp: new Date(Date.now() - 3600000 * 22).toISOString(),
    details: {
      trackingCode: 'PK-1020',
      type: 'cash',
      estimatedKg: 20,
      categories: ['کارتن و مقوا', 'پلاستیک'],
      address: 'میدان شهدا، خیابان سلمان فارسی، کوچه ۵',
      payoutMethod: 'direct_card_transfer'
    }
  },
  {
    id: 'evt-1004',
    eventType: 'request_assigned',
    actorId: 'drv-102',
    actorRole: 'driver',
    actorName: 'سفیر حسین محمودی',
    entityId: '1020',
    entityType: 'request',
    cityId: 'kazeroon',
    cityName: 'کازرون',
    timestamp: new Date(Date.now() - 3600000 * 20).toISOString(),
    details: {
      trackingCode: 'PK-1020',
      driverPhone: '09172223344',
      vehiclePlate: 'ایران ۷۳ - ۸۹۲ ب ۳۴'
    }
  },
  {
    id: 'evt-1005',
    eventType: 'request_weighed_and_completed',
    actorId: 'drv-101',
    actorRole: 'driver',
    actorName: 'سفیر علی رضایی',
    entityId: '1019',
    entityType: 'request',
    cityId: 'noorabad',
    cityName: 'نورآباد ممسنی',
    timestamp: new Date(Date.now() - 3600000 * 18).toISOString(),
    details: {
      trackingCode: 'PK-1019',
      actualKg: 18.5,
      type: 'cash',
      paymentModeUsed: 'direct_card',
      cashPaidTomans: 280000,
      cardTransferRefCode: 'TRF-98213-BSI',
      driverRatingToCitizen: 5,
      driverNote: 'کارتن‌ها و قوطی‌ها کاملاً تمیز و تفکیک شده بودند.'
    }
  },
  {
    id: 'evt-1006',
    eventType: 'weight_and_payout_recorded',
    actorId: 'drv-101',
    actorRole: 'driver',
    actorName: 'سفیر علی رضایی',
    entityId: '1019',
    entityType: 'request',
    cityId: 'noorabad',
    cityName: 'نورآباد ممسنی',
    timestamp: new Date(Date.now() - 3600000 * 18).toISOString(),
    details: {
      actualKg: 18.5,
      directCardAmountTomans: 280000,
      cashAmountTomans: 0,
      charityAmountTomans: 0,
      cardTransferRefCode: 'TRF-98213-BSI'
    }
  },
  {
    id: 'evt-1007',
    eventType: 'driver_rated_by_citizen',
    actorId: 'usr-101',
    actorRole: 'citizen',
    actorName: 'علی حسینی',
    entityId: 'drv-101',
    entityType: 'driver',
    cityId: 'noorabad',
    cityName: 'نورآباد ممسنی',
    timestamp: new Date(Date.now() - 3600000 * 17).toISOString(),
    details: {
      driverName: 'سفیر علی رضایی',
      rating: 5,
      comment: 'سفیر بسیار خوش‌برخورد، وقت‌شناس و با باسکول دیجیتال دقیق بود.'
    }
  },
  {
    id: 'evt-1008',
    eventType: 'request_cancelled_citizen',
    actorId: 'usr-105',
    actorRole: 'citizen',
    actorName: 'محمدرضا محمودی',
    entityId: '1027',
    entityType: 'request',
    cityId: 'kazeroon',
    cityName: 'کازرون',
    timestamp: new Date(Date.now() - 3600000 * 14).toISOString(),
    details: {
      trackingCode: 'PK-1027',
      reason: 'تغییر برنامه کاری و عدم حضور در منزل در ساعت مقرر',
      previousStatus: 'pending'
    }
  },
  {
    id: 'evt-1009',
    eventType: 'request_cancelled_driver',
    actorId: 'drv-101',
    actorRole: 'driver',
    actorName: 'سفیر علی رضایی',
    entityId: '1023',
    entityType: 'request',
    cityId: 'noorabad',
    cityName: 'نورآباد ممسنی',
    timestamp: new Date(Date.now() - 3600000 * 12).toISOString(),
    details: {
      trackingCode: 'PK-1023',
      citizenName: 'محمد کریمی',
      reason: 'نقص فنی ناگهانی لاستیک وانت بار و ارجاع نوبت به صف سایر سفیران',
      returnedToQueue: true
    }
  },
  {
    id: 'evt-1010',
    eventType: 'request_type_converted_to_charity',
    actorId: 'drv-102',
    actorRole: 'driver',
    actorName: 'سفیر حسین محمودی',
    entityId: '1025',
    entityType: 'request',
    cityId: 'kazeroon',
    cityName: 'کازرون',
    timestamp: new Date(Date.now() - 3600000 * 10).toISOString(),
    details: {
      trackingCode: 'PK-1025',
      originalType: 'cash',
      newType: 'charity',
      charityName: 'موسسه خیریه انصارالحجه کازرون',
      charityAmountTomans: 525000,
      note: 'شهروند پس از وزن‌کشی تمایل پیدا کرد کل وجه را به نیت نیازمندان کازرون اهدا نماید.'
    }
  },
  {
    id: 'evt-1011',
    eventType: 'request_weighed_and_completed',
    actorId: 'drv-102',
    actorRole: 'driver',
    actorName: 'سفیر حسین محمودی',
    entityId: '1025',
    entityType: 'request',
    cityId: 'kazeroon',
    cityName: 'کازرون',
    timestamp: new Date(Date.now() - 3600000 * 9).toISOString(),
    details: {
      trackingCode: 'PK-1025',
      actualKg: 35,
      type: 'charity',
      charityName: 'موسسه خیریه انصارالحجه کازرون',
      cashPaidTomans: 0,
      charityDonationAmountTomans: 525000,
      driverRatingToCitizen: 5
    }
  },
  {
    id: 'evt-1012',
    eventType: 'shifts_matrix_updated',
    actorId: 'admin-01',
    actorRole: 'admin',
    actorName: 'مدیریت ارشد پاکینو',
    entityId: 'shift-matrix',
    entityType: 'shift',
    cityId: 'noorabad',
    cityName: 'نورآباد ممسنی',
    timestamp: new Date(Date.now() - 3600000 * 8).toISOString(),
    details: {
      action: 'افزایش سقف پذیرش وزنی شیفت عصر پنجشنبه به ۶۰۰ کیلوگرم و ثبت استثنای تعطیلی'
    }
  },
  {
    id: 'evt-1013',
    eventType: 'lottery_event_entered',
    actorId: 'usr-104',
    actorRole: 'citizen',
    actorName: 'سارا کریمی',
    entityId: 'live-lottery-110',
    entityType: 'lottery',
    cityId: 'noorabad',
    cityName: 'نورآباد ممسنی',
    timestamp: new Date(Date.now() - 3600000 * 6).toISOString(),
    details: {
      eventCode: '110',
      eventTitle: 'جشن بزرگ روز پدر و پاکیاران نورآباد',
      phoneMasked: '۰۹۱۷۵۵۵۴۴۳۳'
    }
  },
  {
    id: 'evt-1014',
    eventType: 'waste_tariffs_updated',
    actorId: 'admin-01',
    actorRole: 'admin',
    actorName: 'مدیریت ارشد پاکینو',
    entityId: 'tariff-plastic',
    entityType: 'tariff',
    cityId: 'noorabad',
    cityName: 'نورآباد ممسنی',
    timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
    details: {
      category: 'پلاستیک و بطری پت',
      oldRate: 14000,
      newRate: 16000,
      increasePercentage: 14.2
    }
  },
  {
    id: 'evt-1015',
    eventType: 'user_registered',
    actorId: 'usr-108',
    actorRole: 'citizen',
    actorName: 'پژمان نیکنام',
    entityId: 'usr-108',
    entityType: 'user',
    cityId: 'noorabad',
    cityName: 'نورآباد ممسنی',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    details: {
      phone: '09177112233',
      initialBonusPoints: 50
    }
  }
];

// Read from LocalStorage or seed initial
export const getStoredEventLogs = (): AppEventLog[] => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    } catch (e) {
      console.error('Failed to parse event logs from localStorage:', e);
    }
  }
  // Store initial seed
  localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_EVENT_LOGS));
  return INITIAL_EVENT_LOGS;
};

// Save to LocalStorage
export const saveEventLogs = (logs: AppEventLog[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
  } catch (e) {
    console.error('Failed to save event logs to localStorage:', e);
  }
};

// Log a single application event
export const logAppEvent = (
  eventData: Omit<AppEventLog, 'id' | 'timestamp'>
): AppEventLog => {
  const newLog: AppEventLog = {
    ...eventData,
    id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toISOString()
  };

  try {
    const existing = getStoredEventLogs();
    const updated = [newLog, ...existing];
    // Keep max 1000 events in localStorage for optimal performance
    const capped = updated.slice(0, 1000);
    saveEventLogs(capped);

    // Dispatch custom DOM event so any open listener updates instantly
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('pakino_event_logged', { detail: newLog }));
    }
  } catch (e) {
    console.error('Error logging app event:', e);
  }

  return newLog;
};

// Calculate Driver Daily Stats for Item 7
export const calculateDriverDailyStats = (
  requests: PickupRequest[]
): DriverDailyStatRecord[] => {
  const completed = (requests || []).filter(
    (r) => r.status === 'collected' && (r.driverName || r.driverId)
  );

  // Group by driverId + date (normalized date string or collectedAt)
  const map: Record<string, DriverDailyStatRecord> = {};

  completed.forEach((req) => {
    const driverId = req.driverId || 'drv-101';
    const driverName = req.driverName || 'سفیر پاکینو';
    const dateStr = req.dateStr || 'نامشخص';
    // Create consistent date key
    const dateKey = req.collectedAt 
      ? req.collectedAt.substring(0, 10) 
      : req.createdAt ? req.createdAt.substring(0, 10) : dateStr;

    const groupKey = `${driverId}__${dateKey}`;

    if (!map[groupKey]) {
      map[groupKey] = {
        driverId,
        driverName,
        dateKey,
        dateStr,
        cityId: req.cityId,
        cityName: req.cityName,
        totalKg: 0,
        completedRequestsCount: 0,
        directCardAmountTomans: 0,
        cashAmountTomans: 0,
        charityAmountsByCharity: {},
        totalCharityAmountTomans: 0,
        totalPayoutTomans: 0,
        requestsIds: []
      };
    }

    const stat = map[groupKey];
    stat.completedRequestsCount += 1;
    stat.requestsIds.push(req.id);

    const kg = req.actualKg || req.estimatedKg || 0;
    stat.totalKg += kg;

    const payout = req.cashPaidTomans || req.approximatePayoutTomans || 0;

    if (req.type === 'charity') {
      const charityName = req.charityName || 'خیریه عمومی';
      stat.charityAmountsByCharity[charityName] = (stat.charityAmountsByCharity[charityName] || 0) + payout;
      stat.totalCharityAmountTomans += payout;
    } else {
      if (req.paymentModeUsed === 'cash') {
        stat.cashAmountTomans += payout;
      } else {
        // default direct card
        stat.directCardAmountTomans += payout;
      }
    }

    stat.totalPayoutTomans += payout;
  });

  // Convert to array and sort by date descending
  return Object.values(map).sort((a, b) => b.dateKey.localeCompare(a.dateKey));
};

// Export to CSV
export const exportLogsToCSV = (logs: AppEventLog[]): string => {
  const header = ['شناسه رویداد', 'زمان', 'نوع رویداد', 'بازیگر', 'نقش', 'موجودیت', 'شناسه موجودیت', 'شهر', 'جزئیات'].join(',');
  const rows = logs.map((l) => {
    const eventLabel = EVENT_TYPE_LABELS[l.eventType]?.label || l.eventType;
    const actorRoleFa = l.actorRole === 'citizen' ? 'شهروند' : l.actorRole === 'driver' ? 'راننده' : l.actorRole === 'admin' ? 'مدیر' : 'سیستم';
    const dateFormatted = new Date(l.timestamp).toLocaleString('fa-IR');
    const detailsStr = `"${JSON.stringify(l.details).replace(/"/g, '""')}"`;
    return [
      l.id,
      `"${dateFormatted}"`,
      `"${eventLabel}"`,
      `"${l.actorName}"`,
      `"${actorRoleFa}"`,
      `"${l.entityType}"`,
      `"${l.entityId}"`,
      `"${l.cityName || ''}"`,
      detailsStr
    ].join(',');
  });

  return '\uFEFF' + [header, ...rows].join('\n');
};

// Export to JSON string
export const exportLogsToJSON = (logs: AppEventLog[]): string => {
  return JSON.stringify(logs, null, 2);
};
