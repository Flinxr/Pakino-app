import { 
  CityInfo, 
  WasteCategory, 
  TimeSlot, 
  CharityProject, 
  LotteryWinner, 
  LiveEventLottery, 
  DriverProfile,
  ScheduledLottery,
  UserProfile,
  HeroSlide
} from '../types';

export const CITIES: Record<string, CityInfo> = {
  noorabad: {
    id: 'noorabad',
    name: 'نورآباد ممسنی',
    fullName: 'نورآباد ممسنی (استان فارس)',
    province: 'فارس',
    center: { lat: 30.1147, lng: 51.5218 },
    zoom: 14,
    maxRadiusKm: 4.8, // Geofence boundary around city
    neighborhoods: [
      'میدان امام خمینی',
      'شهرک اسکان',
      'بلوار امام خمینی',
      'کوی گلستان',
      'فرهنگ‌شهر',
      'خیابان فرمانداری',
      'خیابان پزشکان',
      'بلوار هفت تیر',
      'شهرک فرهنگیان',
      'میدان مصلی',
      'کوی شهرداری'
    ],
    charities: [
      'موسسه خیریه حضرت امام علی (ع) ممسنی',
      'مجمع خیرین سلامت نورآباد',
      'صندوق حمایت از کودکان نیازمند ممسنی',
      'خیریه آبشار عاطفه‌های نورآباد'
    ]
  },
  kazeroon: {
    id: 'kazeroon',
    name: 'کازرون',
    fullName: 'کازرون (استان فارس)',
    province: 'فارس',
    center: { lat: 29.6195, lng: 51.6541 },
    zoom: 14,
    maxRadiusKm: 5.5, // Geofence boundary around city
    neighborhoods: [
      'میدان شهدا',
      'خیابان سلمان فارسی',
      'بلوار ارتش',
      'شهرک پردیس',
      'خیابان نطنج',
      'میدان فلسطین',
      'بلوار شهید مطهری',
      'کوی علیا',
      'خیابان باهنر',
      'خیابان قدمگاه',
      'شهرک کوثر',
      'خیابان شریعتی',
      'بلوار جمهوری اسلامی',
      'شهرک امام رضا (ع)',
      'خیابان ابواسحاق'
    ],
    charities: [
      'موسسه خیریه انصارالحجه کازرون',
      'انجمن حمایت از بیماران خاص کازرون',
      'مرکز نیکوکاری امام حسن مجتبی (ع)',
      'خیریه سفره مهربانی کازرون'
    ]
  }
};

export const WASTE_CATEGORIES: WasteCategory[] = [
  { 
    id: 'plastic', 
    name: 'پلاستیک و بطری پت (PET)', 
    icon: '🧴', 
    ratePerKgTomans: 16000,
    description: 'شامل بطری‌های آب معدنی، نوشابه، ظروف شوینده و نایلون تمیز',
    examples: 'بطری آب، دبه ماست، گالن روغن، قوطی شامپو'
  },
  { 
    id: 'cardboard', 
    name: 'کارتن، مقوا و کاغذ باطله', 
    icon: '📦', 
    ratePerKgTomans: 9000,
    description: 'انواع جعبه‌های بسته‌بندی پستی، کتاب، دفترچه و روزنامه‌های خشک',
    examples: 'کارتن دیجی‌کالا، شانه تخم‌مرغ، روزنامه، کتاب‌های درسی کهنه'
  },
  { 
    id: 'metal', 
    name: 'قوطی فلزی، آلومینیوم و آهن', 
    icon: '🥫', 
    ratePerKgTomans: 35000,
    description: 'قوطی‌های رسی نوشیدنی، ظروف کنسرو، لوله‌های فلزی و ضایعات آهنی سبک',
    examples: 'قوطی رانی، تن ماهی، قوطی رب گوجه، پروفیل سبک'
  },
  { 
    id: 'glass', 
    name: 'شیشه و ظروف شیشه‌ای', 
    icon: '🍾', 
    ratePerKgTomans: 4000,
    description: 'انواع بطری‌های آبلیمو، شیشه‌های سس و ظروف شیشه‌ای سالم یا شکسته',
    examples: 'شیشه مربا، شیشه سس مایونز، بطری شربت'
  },
  { 
    id: 'bread', 
    name: 'نان خشک و ضایعات خشک', 
    icon: '🍞', 
    ratePerKgTomans: 7000,
    description: 'نان خشک عاری از کپک و ضایعات خوراکی خشک برای مصرف خوراک دام محلی',
    examples: 'نان لواش، نان تیری، نان سنگک و بربری خشک شده'
  },
  { 
    id: 'electronics', 
    name: 'برد الکترونیکی و لوازم برقی کهنه', 
    icon: '🔌', 
    ratePerKgTomans: 45000,
    description: 'برد کامپیوتر، رادیو، کابل‌های مسی کهنه و لوازم برقی سوخته منزل',
    examples: 'کابل شارژر، کیس قدیمی، سشوار خراب، ترانس و رادیو کهنه'
  }
];

export const TIME_SLOTS: TimeSlot[] = [
  { id: 'morning', label: 'صبح', timeRange: '۹ تا ۱۲', iconName: 'Sun' },
  { id: 'afternoon', label: 'عصر', timeRange: '۱۵ تا ۱۸', iconName: 'Sunset' },
  { id: 'evening', label: 'شب', timeRange: '۱۸ تا ۲۱', iconName: 'Moon' }
];

export const CHARITY_PROJECTS: CharityProject[] = [
  {
    id: 'proj-playground-noorabad',
    title: 'تجهیز و نصب تاب و سرسره استاندارد پارک کودک نورآباد',
    cityId: 'noorabad',
    cityName: 'نورآباد ممسنی',
    category: 'playground',
    description: 'نصب وسایل بازی پلی‌اتیلنی ایمن برای کودکان محله‌های کم‌برخوردار اسکان و گلستان نورآباد از محل پسماندهای اهدایی شهروندان.',
    targetAmountTomans: 45000000,
    raisedAmountTomans: 31800000,
    totalContributors: 142,
    progressPercent: 70,
    badge: 'پروژه شاخص شهروندی'
  },
  {
    id: 'proj-school-kazeroon',
    title: 'تأمین کیف، دفتر و بسته تحصیلی کودکان کازرون',
    cityId: 'kazeroon',
    cityName: 'کازرون',
    category: 'school',
    description: 'تهیه لوازم‌التحریر تولید داخل و بسته‌های آموزشی برای ۱۰۰ دانش‌آموز مستعد با مشارکت عواید بازیافت کاغذ و کارتن.',
    targetAmountTomans: 25000000,
    raisedAmountTomans: 19500000,
    totalContributors: 88,
    progressPercent: 78,
    badge: 'آموزش و پرورش'
  },
  {
    id: 'proj-greenery-mamasani',
    title: 'کاشت نهال بلوط و احیای جنگل‌های زاگرس ممسنی',
    cityId: 'noorabad',
    cityName: 'نورآباد ممسنی',
    category: 'greenery',
    description: 'طرح هر کیلو بازیافت = ۱ بذر بلوط در کوهستان ممسنی با همکاری تشکل‌های حامی محیط زیست بومی.',
    targetAmountTomans: 15000000,
    raisedAmountTomans: 13200000,
    totalContributors: 96,
    progressPercent: 88,
    badge: 'طبیعت و بلوط'
  }
];

export const PAST_LOTTERY_WINNERS: LotteryWinner[] = [
  {
    id: 'win-1',
    drawPeriod: 'دوره مرداد ۱۴۰۵',
    winnerName: 'رضا گودرزی',
    userPhoneMasked: '۰۹۱۷***۲۲۴۵',
    prizeTitle: 'ربع سکه بهار آزادی',
    prizeTier: 'first',
    ticketCode: 'PK-M88410',
    cityId: 'noorabad',
    cityName: 'نورآباد ممسنی',
    awardedAt: '۱۴۰۵/۰۵/۳۰'
  },
  {
    id: 'win-2',
    drawPeriod: 'دوره مرداد ۱۴۰۵',
    winnerName: 'سارا کاظمی',
    userPhoneMasked: '۰۹۱۷***۶۷۸۹',
    prizeTitle: 'کارت هدیه ۵,۰۰۰,۰۰۰ تومانی',
    prizeTier: 'second',
    ticketCode: 'PK-K10943',
    cityId: 'kazeroon',
    cityName: 'کازرون',
    awardedAt: '۱۴۰۵/۰۵/۳۰'
  },
  {
    id: 'win-3',
    drawPeriod: 'دوره تیر ۱۴۰۵ (ویژه عید غدیر)',
    winnerName: 'محمد حسینی',
    userPhoneMasked: '۰۹۱۷***۵۵۱۰',
    prizeTitle: 'دستگاه خردکن برقی و تصفیه آب',
    prizeTier: 'third',
    ticketCode: 'PK-T77301',
    cityId: 'noorabad',
    cityName: 'نورآباد ممسنی',
    awardedAt: '۱۴۰۵/۰۴/۲۵'
  }
];

export const ACTIVE_LIVE_LOTTERY: LiveEventLottery = {
  id: 'live-event-110',
  eventCode: '110',
  eventTitle: 'جشن بزرگ روز پدر و تقدیر از پاکیاران نورآباد و کازرون',
  description: 'کد ۱۱۰ را در جشن حضوری وارد کنید تا بدون نیاز به تحویل بار، مستقیماً در گردونه جوایز طلایی ثبت‌نام شوید.',
  cityId: 'all',
  isActive: true,
  prizeSummary: '۵ عدد نیم سکه بهار آزادی + ۱۰ کارت هدیه نقدی ۲ میلیون تومانی + ۲۰ پکیج خانگی',
  prizesList: [
    '۵ عدد نیم سکه بهار آزادی برای ۵ شهروند خوش‌شانس',
    '۱۰ کارت هدیه نقدی ۲ میلیون تومانی',
    '۲۰ عدد پکیج سطل تفکیک هوشمند خانگی'
  ],
  eventDateStr: 'جمعه ۲۸ شهریور ۱۴۰۵ - ساعت ۱۸:۳۰',
  locationVenue: 'سالن همایش‌های رازی ممسنی و فرهنگسرای کازرون',
  participantsCount: 384,
  registeredPhoneNumbers: ['09171234567', '09179998877', '09173332211', '09179876543']
};

export const INITIAL_SCHEDULED_LOTTERIES: ScheduledLottery[] = [
  {
    id: 'lottery-draw-1405-07',
    title: 'قرعه‌کشی طلایی بزرگ مهرماه ۱۴۰۵ (دوره پاییز)',
    periodCode: 'DRAW-FALL-1405',
    cityId: 'all',
    targetDrawDateStr: 'جمعه ۲۵ مهر ۱۴۰۵',
    countdownDays: 34,
    status: 'upcoming',
    totalEligibleTicketsCount: 1420,
    isTicketsResetForThisPeriod: false,
    ticketsResetAnnouncement: 'تمام کدهای شانس مربوط به دوره‌های شهریور و قبل از آن بایگانی شدند و کدهای جدید از ۱ مهر فعال گردیده‌اند.',
    createdAt: new Date().toISOString(),
    prizes: [
      {
        id: 'prz-1',
        rankTitle: 'جایزه نفر اول (جایزه بزرگ)',
        tier: 'first',
        prizeName: 'یک عدد ربع سکه بهار آزادی + گوشی هوشمند Galaxy',
        winnersCount: 1,
        iconEmoji: '🥇',
        sponsorOrNote: 'اهدا شده توسط مجمع خیرین سلامت و شهرداری'
      },
      {
        id: 'prz-2',
        rankTitle: 'جوایز نفرات دوم',
        tier: 'second',
        prizeName: '۳ کارت هدیه نقدی ۵ میلیون تومانی',
        winnersCount: 3,
        iconEmoji: '🥈',
        sponsorOrNote: 'واریز آنی به حساب برندگان'
      },
      {
        id: 'prz-3',
        rankTitle: 'جوایز نفرات سوم',
        tier: 'third',
        prizeName: '۱۰ دستگاه خردکن برقی تفال و لوازم خانگی',
        winnersCount: 10,
        iconEmoji: '🥉',
        sponsorOrNote: 'ویژه فعال‌ترین حامیان طرح نیکوکاری'
      },
      {
        id: 'prz-4',
        rankTitle: 'جوایز عمومی و تشویقی',
        tier: 'general',
        prizeName: '۵۰ پکیج کامل سطل‌های تفکیک و بن خرید ملزومات',
        winnersCount: 50,
        iconEmoji: '🎁',
        sponsorOrNote: 'قرعه‌کشی خودکار بین تمام کاربران فعال'
      }
    ]
  }
];

export const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
];

export const INITIAL_DRIVERS: DriverProfile[] = [
  {
    id: 'drv-101',
    name: 'سفیر علی رضایی',
    phone: '09171239988',
    nationalId: '2360123456',
    pinCode: '1234',
    password: '1234',
    vehicleType: 'وانت پراید مسقف مجهز به باسکول',
    plateNumber: 'ایران ۷۳ - ۴۵۶ ج ۱۲',
    cityId: 'noorabad',
    isOnline: true,
    totalCompletedPickups: 64,
    totalCollectedKg: 890,
    rating: 4.9,
    ratingCount: 52,
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    joinedDateStr: '۱۴۰۴/۰۸/۱۰',
    status: 'active',
    activityLogs: [
      {
        id: 'log-1',
        driverId: 'drv-101',
        driverName: 'سفیر علی رضایی',
        timeStr: 'ساعت ۰۹:۱۵ صبح',
        dateStr: '۱۷ شهریور ۱۴۰۵',
        locationStr: 'میدان امام، کوی گلستان، پلاک ۱۲',
        neighborhood: 'کوی گلستان',
        cityName: 'نورآباد ممسنی',
        citizenName: 'علی حسینی',
        citizenPhone: '09171234567',
        kgCollected: 15,
        categories: ['کارتن', 'پلاستیک و بطری'],
        type: 'charity',
        charityName: 'موسسه خیریه حضرت امام علی (ع) ممسنی',
        payoutTomans: 225000,
        paymentMode: 'طرح نیکوکاری (اهدای عواید)',
        storyNarrative: 'ساعت ۹:۱۵ صبح رسید کوی گلستان پلاک ۱۲؛ حاج علی بار کارتن و پت رو مرتب بسته‌بندی کرده بود. ترازو زد ۱۵ کیلو صاف، ثبت شد برای خیریه امام علی و رسید دیجیتال براش صادر شد.',
        status: 'completed',
        createdAt: new Date().toISOString()
      },
      {
        id: 'log-2',
        driverId: 'drv-101',
        driverName: 'سفیر علی رضایی',
        timeStr: 'ساعت ۱۰:۴۰ صبح',
        dateStr: '۱۷ شهریور ۱۴۰۵',
        locationStr: 'خیابان شهید بهشتی، جنب آتش نشانی',
        neighborhood: 'خیابان شهید بهشتی',
        cityName: 'نورآباد ممسنی',
        citizenName: 'فاطمه احمدی',
        citizenPhone: '09173332211',
        kgCollected: 25,
        categories: ['کارتن و مقوا', 'شیشه', 'پلاستیک'],
        type: 'cash',
        payoutTomans: 375000,
        paymentMode: 'شارژ آنی کیف پول',
        storyNarrative: 'ساعت ۱۰:۴۰ رفت جلوی آتش‌نشانی خیابان بهشتی، ۲۵ کیلو ضایعات مقوا و شیشه خانم احمدی رو با باسکول وزن کرد، ۳۷۵ هزار تومن درجا به کیف پولش نشست و بارگیری کرد.',
        status: 'completed',
        createdAt: new Date(Date.now() - 3600000).toISOString()
      },
      {
        id: 'log-3',
        driverId: 'drv-101',
        driverName: 'سفیر علی رضایی',
        timeStr: 'ساعت ۱۱:۵۰ ظهر',
        dateStr: '۱۶ شهریور ۱۴۰۵',
        locationStr: 'بلوار امام خمینی، روبروی فرمانداری',
        neighborhood: 'بلوار امام خمینی',
        cityName: 'نورآباد ممسنی',
        citizenName: 'امیر مرادی',
        citizenPhone: '09177771234',
        kgCollected: 18.5,
        categories: ['آهن و فلزات', 'ضایعات پلاستیک'],
        type: 'cash',
        payoutTomans: 280000,
        paymentMode: 'کارت‌به‌کارت مستقیم در محل',
        storyNarrative: 'ساعت ۱۱:۵۰ رفت روبروی فرمانداری ممسنی؛ ۱۸.۵ کیلو فلزات داشت که وزن شد، ۲۸۰ هزار تومن نقداً از کارت راننده به حساب شهروند پایا شد و شهروند خیلی راضی بود.',
        status: 'completed',
        createdAt: new Date(Date.now() - 86400000).toISOString()
      },
      {
        id: 'log-4',
        driverId: 'drv-101',
        driverName: 'سفیر علی رضایی',
        timeStr: 'ساعت ۱۶:۱۰ عصر',
        dateStr: '۱۵ شهریور ۱۴۰۵',
        locationStr: 'شهرک اسکان، کوچه یاس ۴',
        neighborhood: 'شهرک اسکان',
        cityName: 'نورآباد ممسنی',
        citizenName: 'سعید گودرزی',
        citizenPhone: '09178889900',
        kgCollected: 0,
        categories: [],
        type: 'cash',
        payoutTomans: 0,
        paymentMode: '-',
        storyNarrative: 'ساعت ۴ عصر رفت شهرک اسکان کوچه یاس ۴؛ زنگ واحد زده شد ولی متاسفانه شهروند منزل تشریف نداشت و تلفن رو جواب نداد، عدم حضور ثبت شد تا برای فردا هماهنگ شه.',
        status: 'reported_issue',
        issueDetails: 'عدم حضور شهروند در محل و عدم پاسخ به تماس تلفنی',
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
      }
    ]
  },
  {
    id: 'drv-102',
    name: 'سفیر حسین کاظمی',
    phone: '09174448899',
    nationalId: '2370987654',
    pinCode: '5678',
    password: '5678',
    vehicleType: 'وانت نیسان آبی مجهز به باسکول دیجیتال',
    plateNumber: 'ایران ۷۳ - ۱۲۳ ط ۴۵',
    cityId: 'kazeroon',
    isOnline: true,
    totalCompletedPickups: 48,
    totalCollectedKg: 1240,
    rating: 4.8,
    ratingCount: 39,
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    joinedDateStr: '۱۴۰۴/۰۹/۱۵',
    status: 'active',
    activityLogs: [
      {
        id: 'log-201',
        driverId: 'drv-102',
        driverName: 'سفیر حسین کاظمی',
        timeStr: 'ساعت ۰۸:۴۵ صبح',
        dateStr: '۱۷ شهریور ۱۴۰۵',
        locationStr: 'میدان شهدا، خیابان سلمان فارسی، کوچه ۵',
        neighborhood: 'میدان شهدا',
        cityName: 'کازرون',
        citizenName: 'رضا کازرونی',
        citizenPhone: '09179876543',
        kgCollected: 20,
        categories: ['کارتن', 'پلاستیک فشرده'],
        type: 'cash',
        payoutTomans: 300000,
        paymentMode: 'کیف پول پاکینو',
        storyNarrative: 'ساعت ۸:۴۵ صبح اول شیفت رسید کوچه ۵ سلمان فارسی کازرون؛ آقا رضا ۲۰ کیلو کارتن و قوطی پت آماده کرده بود. باسکول زد ۲۰ کیلو تمیز، ۳۰۰ هزار تومن نشست تو کیف پولش و خوش و بش کردن.',
        status: 'completed',
        createdAt: new Date().toISOString()
      },
      {
        id: 'log-202',
        driverId: 'drv-102',
        driverName: 'سفیر حسین کاظمی',
        timeStr: 'ساعت ۱۰:۱۵ صبح',
        dateStr: '۱۷ شهریور ۱۴۰۵',
        locationStr: 'خیابان نطنج، جنب درمانگاه امام سجاد',
        neighborhood: 'خیابان نطنج',
        cityName: 'کازرون',
        citizenName: 'مهدی شفیعی',
        citizenPhone: '09174443322',
        kgCollected: 35,
        categories: ['فلزات سنگین', 'پلاستیک', 'بردهای الکترونیکی'],
        type: 'charity',
        charityName: 'موسسه خیریه قمر بنی هاشم کازرون',
        payoutTomans: 525000,
        paymentMode: 'طرح نیکوکاری (اهدای عواید)',
        storyNarrative: 'ساعت ۱۰:۱۵ رفت خیابان نطنج جنب درمانگاه؛ آقا مهدی ۳۵ کیلو ضایعات مس و آهن و پلاستیک تفکیک کرده بود. کل مبلغ ۵۲۵ تومن اهدا شد به خیریه قمر بنی‌هاشم کازرون و ۷۰ شانس قرعه‌کشی طلایی گرفت.',
        status: 'completed',
        createdAt: new Date(Date.now() - 7200000).toISOString()
      },
      {
        id: 'log-203',
        driverId: 'drv-102',
        driverName: 'سفیر حسین کاظمی',
        timeStr: 'ساعت ۱۳:۳۰ ظهر',
        dateStr: '۱۶ شهریور ۱۴۰۵',
        locationStr: 'بلوار شهید مطهری، کوچه گل‌ها',
        neighborhood: 'بلوار شهید مطهری',
        cityName: 'کازرون',
        citizenName: 'صادق دهقان',
        citizenPhone: '09175556677',
        kgCollected: 42,
        categories: ['کارتن انبار', 'نایلون شرینک'],
        type: 'cash',
        payoutTomans: 630000,
        paymentMode: 'کارت‌به‌کارت آنی',
        storyNarrative: 'ساعت ۱:۳۰ ظهر رفت انبار بلوار مطهری؛ ۴۲ کیلو مقوا و نایلون تمیز رو بالا کشید و ۶۳۰ هزار تومن واریز شد. بار به مرکز تفکیک اصلی کازرون منتقل شد.',
        status: 'completed',
        createdAt: new Date(Date.now() - 86400000).toISOString()
      }
    ]
  },
  {
    id: 'drv-103',
    name: 'سفیر محمد احمدی',
    phone: '09175551122',
    nationalId: '2369871234',
    pinCode: '3344',
    password: '3344',
    vehicleType: 'وانت آریسان مجهز به کفه و چادر',
    plateNumber: 'ایران ۷۳ - ۷۸۹ س ۳۳',
    cityId: 'kazeroon',
    isOnline: true,
    totalCompletedPickups: 32,
    totalCollectedKg: 680,
    rating: 4.7,
    ratingCount: 26,
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    joinedDateStr: '۱۴۰۴/۱۰/۰۱',
    status: 'active',
    activityLogs: [
      {
        id: 'log-301',
        driverId: 'drv-103',
        driverName: 'سفیر محمد احمدی',
        timeStr: 'ساعت ۱۰:۰۰ صبح',
        dateStr: '۱۶ شهریور ۱۴۰۵',
        locationStr: 'کازرون، میدان شهدا، خیابان ابواسحاق',
        neighborhood: 'خیابان ابواسحاق',
        cityName: 'کازرون',
        citizenName: 'مریم مرادی',
        citizenPhone: '09176662233',
        kgCollected: 22,
        categories: ['پلاستیک', 'شیشه'],
        type: 'cash',
        payoutTomans: 330000,
        paymentMode: 'کیف پول',
        storyNarrative: 'ساعت ۱۰ رفت خیابان ابواسحاق کازرون، ۲۲ کیلوگرم بطری آب‌معدنی و شیشه تفکیک‌شده گرفت و وجه بلافاصله منظور گردید.',
        status: 'completed',
        createdAt: new Date().toISOString()
      }
    ]
  }
];

export const INITIAL_USERS_LIST: UserProfile[] = [
  {
    id: 'usr-101',
    phone: '09171234567',
    password: '123456',
    firstName: 'علی',
    lastName: 'حسینی',
    cityId: 'noorabad',
    walletBalanceTomans: 330000,
    totalKgRecycled: 48,
    totalDonatedKg: 15,
    totalEarnedTomans: 495000,
    lotteryPoints: 120,
    isRegistered: true,
    savedCardNumber: '6037 9971 8823 4410',
    savedAccountHolder: 'علی حسینی',
    status: 'active',
    warningCount: 0,
    isVip: true
  },
  {
    id: 'user-1',
    phone: '09173332211',
    password: '123456',
    firstName: 'فاطمه',
    lastName: 'احمدی',
    cityId: 'noorabad',
    walletBalanceTomans: 375000,
    totalKgRecycled: 52,
    totalDonatedKg: 0,
    totalEarnedTomans: 780000,
    lotteryPoints: 95,
    isRegistered: true,
    savedCardNumber: '5892 1012 3344 5566',
    savedAccountHolder: 'فاطمه احمدی',
    status: 'active',
    warningCount: 0
  },
  {
    id: 'user-2',
    phone: '09179876543',
    password: '123456',
    firstName: 'رضا',
    lastName: 'کازرونی',
    cityId: 'kazeroon',
    walletBalanceTomans: 300000,
    totalKgRecycled: 65,
    totalDonatedKg: 20,
    totalEarnedTomans: 675000,
    lotteryPoints: 150,
    isRegistered: true,
    savedCardNumber: '6104 3378 9988 1122',
    savedAccountHolder: 'رضا کازرونی',
    status: 'active',
    warningCount: 0,
    isVip: true
  },
  {
    id: 'user-3',
    phone: '09174443322',
    password: '123456',
    firstName: 'مهدی',
    lastName: 'شفیعی',
    cityId: 'kazeroon',
    walletBalanceTomans: 0,
    totalKgRecycled: 85,
    totalDonatedKg: 85,
    totalEarnedTomans: 0,
    lotteryPoints: 210,
    isRegistered: true,
    status: 'active',
    warningCount: 0,
    isVip: true
  },
  {
    id: 'user-4',
    phone: '09176662233',
    password: '123456',
    firstName: 'مریم',
    lastName: 'مرادی',
    cityId: 'kazeroon',
    walletBalanceTomans: 330000,
    totalKgRecycled: 22,
    totalDonatedKg: 0,
    totalEarnedTomans: 330000,
    lotteryPoints: 44,
    isRegistered: true,
    status: 'active',
    warningCount: 0
  },
  {
    id: 'user-5',
    phone: '09177778899',
    password: '123456',
    firstName: 'جواد',
    lastName: 'ممسنی',
    cityId: 'noorabad',
    walletBalanceTomans: 120000,
    totalKgRecycled: 18,
    totalDonatedKg: 5,
    totalEarnedTomans: 270000,
    lotteryPoints: 36,
    isRegistered: true,
    status: 'warning',
    warningCount: 1
  }
];

export const FAQ_ITEMS = [
  {
    q: 'حداقل وزن مجاز برای ثبت درخواست چقدر است؟',
    a: 'حداقل وزن تفکیک شده ۵ کیلوگرم است. برای وزن‌های کمتر به علت هزینه اعزام ناوگان، پس از تجمیع پسماند ثبت سفارش فرمایید.'
  },
  {
    q: 'مبلغ بازیافت در حالت نقدی چگونه پرداخت می‌شود؟',
    a: 'پس از حضور راننده پاکینو و وزن‌کشی با ترازوی دیجیتال، وجه مربوطه در محل کارت‌به‌کارت آنی می‌شود یا به کیف پول درون‌برنامه‌ای اضافه می‌گردد.'
  },
  {
    q: 'عواید حالت نیکوکاری چگونه صرف می‌شود؟',
    a: 'عواید بازیافت مستقیماً صرف پروژه‌های عام‌المنفعه محلی (نظیر تجهیز پارک کودکان نورآباد و کازرون) و خیریه‌ها شده و گواهی نیکوکاری + ۲ برابر شانس قرعه‌کشی به شما تعلق می‌گیرد.'
  },
  {
    q: 'آیا راننده درب واحد می‌آید یا درب ساختمان؟',
    a: 'راننده پاکینو هنگام رسیدن به محل با شما تماس می‌گیرد و هماهنگی لازم جهت تحویل آسان انجام می‌شود.'
  },
  {
    q: 'قرعه‌کشی پاکینو چگونه برگزار می‌شود؟',
    a: 'به ازای هر ۱ کیلوگرم بازیافت نقدی ۱ شانس و هر ۱ کیلوگرم بازیافت نیکوکاری ۲ شانس دریافت می‌کنید.'
  }
];

export const INITIAL_HERO_SLIDES: HeroSlide[] = [
  {
    id: 'slide-1',
    tag: 'سامانه جمع‌آوری در محل',
    tagColor: 'bg-emerald-500/30 text-emerald-100 border border-emerald-400/30',
    title: 'سامانه هوشمند جمع‌آوری پسماند خشک در محل',
    subtitle: 'اعزام سفیر پاکیار با ترازوی دیجیتال و پرداخت آنی یا اهدای نیکوکاری',
    highlightText: 'تحویل آسان درب منزل یا محل کار شما',
    bgGradient: 'from-emerald-900 via-emerald-800 to-teal-900',
    textColor: 'light',
    iconName: 'Recycle',
    actionText: 'ثبت فوری جمع‌آوری',
    actionType: 'pickup',
    isActive: true,
    order: 1
  },
  {
    id: 'slide-2',
    tag: 'جشنواره جوایز طلایی',
    tagColor: 'bg-amber-500/30 text-amber-100 border border-amber-400/30',
    title: 'هر کیلو بازیافت = ۱ شانس در قرعه‌کشی ماهانه',
    subtitle: 'اهدای ربع سکه، کارت هدیه نقدی ۵ میلیونی و لوازم خانگی به شهروندان برتر',
    highlightText: '۲ برابر شانس بیشتر در صورت انتخاب حالت نیکوکاری',
    bgGradient: 'from-amber-900 via-amber-800 to-yellow-950',
    textColor: 'light',
    iconName: 'Trophy',
    actionText: 'مشاهده جوایز و کدها',
    actionType: 'lottery',
    isActive: true,
    order: 2
  },
  {
    id: 'slide-3',
    tag: 'مسئولیت اجتماعی و محیط‌زیست',
    tagColor: 'bg-teal-500/30 text-teal-100 border border-teal-400/30',
    title: 'تجهیز پارک‌های کودک و احیای بلوط زاگرس',
    subtitle: 'تبدیل ضایعات بازیافتی به تاب، سرسره و نهال‌های سبز برای شهر عزیزمان',
    highlightText: 'شفافیت ۱۰۰٪ عواید با گواهی رسمی نیکوکاری',
    bgGradient: 'from-teal-950 via-slate-900 to-emerald-950',
    textColor: 'light',
    iconName: 'HeartHandshake',
    actionText: 'مشارکت در طرح‌های شهری',
    actionType: 'pickup',
    isActive: true,
    order: 3
  }
];


