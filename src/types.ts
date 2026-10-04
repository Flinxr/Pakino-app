export type CityId = 'noorabad' | 'kazeroon';

export interface CityInfo {
  id: CityId;
  name: string;
  fullName: string;
  province: string;
  center: { lat: number; lng: number };
  zoom: number;
  maxRadiusKm: number;
  neighborhoods: string[];
  charities: string[];
  supportPhone?: string;
}

export type RecyclingType = 'charity' | 'cash';

export type TimeSlotId = 'morning' | 'afternoon' | 'evening';

export interface TimeSlot {
  id: TimeSlotId;
  label: string;
  timeRange: string;
  iconName: string;
}

export type RequestStatus = 'pending' | 'assigned' | 'collected' | 'cancelled';

export interface WasteCategory {
  id: string;
  name: string;
  icon: string;
  ratePerKgTomans: number;
  description?: string;
  examples?: string;
}

export interface WalletTransaction {
  id: string;
  type: 'credit' | 'debit';
  title: string;
  amountTomans: number;
  dateStr: string;
  createdAt: string;
  status: 'completed' | 'processing';
  referenceId?: string;
  description?: string;
}

export interface WithdrawalRequest {
  id: string;
  amountTomans: number;
  cardNumberOrSheba: string;
  bankName: string;
  accountHolder: string;
  dateStr: string;
  createdAt: string;
  status: 'pending' | 'completed';
  trackingNumber: string;
}

export interface SavedLocation {
  id: string;
  title: string; // e.g. "منزل", "محل کار", "انبار"
  icon: string;
  lat: number;
  lng: number;
  street: string;
  neighborhood?: string;
  plaque?: string;
  unit?: string;
  notes?: string;
}

export interface WeighedItem {
  categoryId: string;
  categoryName: string;
  weightKg: number;
  ratePerKgTomans: number;
  subtotalTomans: number;
}

export interface CancellationInfo {
  cancelledBy: 'citizen' | 'driver' | 'admin';
  cancelledById?: string;
  cancelledByName?: string;
  cancelledAt: string; // ISO string
  reason?: string;
  previousDriverId?: string;
  previousDriverName?: string;
  citizenId?: string;
  citizenName?: string;
  citizenPhone?: string;
}

export interface RequestStatusLog {
  id: string;
  status: RequestStatus;
  statusTitle: string;
  timestamp: string; // ISO string
  changedByRole: 'citizen' | 'driver' | 'admin' | 'system';
  changedByName?: string;
  note?: string;
}

export interface DriverRatingFeedback {
  requestId: string;
  driverId: string;
  driverName: string;
  rating: number; // 1 to 5
  comment?: string;
  createdAt: string;
  anonymous?: boolean;
}

export interface PickupRequest {
  id: string; // e.g. "1021"
  trackingCode: string; // e.g. "PK-1021"
  userId: string;
  userName: string;
  userPhone: string;
  cityId: CityId;
  cityName: string;
  type: RecyclingType;
  payoutMethod?: 'direct_card_transfer' | 'cash_on_delivery' | 'wallet';
  dateStr: string; // e.g. "شنبه ۱۷ شهریور ۱۴۰۵"
  rawDateKey?: string;
  dayOfWeek: string;
  timeSlot: string; // e.g. "۹ تا ۱۲"
  timeSlotId: TimeSlotId;
  estimatedKg: number;
  actualKg?: number;
  categories: string[];
  approximatePayoutTomans: number;
  address: {
    lat: number;
    lng: number;
    street: string;
    neighborhood?: string;
    plaque?: string;
    unit?: string;
    notes?: string;
    isInsideBoundary: boolean;
  };
  status: RequestStatus;
  createdAt: string;
  lotteryTicketNumber: string;
  charityName?: string;
  charityProjectId?: string;
  charityDonationAmountTomans?: number;
  driverId?: string;
  driverName?: string;
  driverPhone?: string;
  vehicleModel?: string; // e.g. "وانت پراید سفید"
  vehiclePlate?: string; // e.g. "ایران ۷۳ - ۴۵۶ ج ۱۲"
  collectedAt?: string;
  cashPaidTomans?: number;
  paymentModeUsed?: 'direct_card' | 'cash' | 'wallet';
  finalPayoutTomans?: number;
  categoryNames?: string[];
  neighborhood?: string;
  charityProjectName?: string;
  scheduledDate?: string;
  timeSlotLabel?: string;
  driverNote?: string; // Driver custom note on request
  issueFlag?: 'none' | 'citizen_absent' | 'waste_unprepared' | 'wrong_address';
  rating?: number; // 1-5 stars citizen feedback to driver
  ratingComment?: string;
  driverRatingToCitizen?: number; // 1-5 stars driver feedback to citizen
  driverNoteToCitizen?: string;
  citizenRatingToDriver?: number; // 1-5 stars citizen feedback to driver
  citizenCommentToDriver?: string;
  cancellationDetails?: CancellationInfo;
  cancellationHistory?: CancellationInfo[];
  statusHistory?: RequestStatusLog[];
  weighedItems?: WeighedItem[];
  convertedToCharityMidway?: boolean;
  convertedToCharityAt?: string;
  convertedToCharityNote?: string;
  convertedToCharityCharityName?: string;
  cardTransferRefCode?: string;
}

export interface UserProfile {
  id: string;
  phone: string;
  firstName: string;
  lastName: string;
  cityId: CityId;
  walletBalanceTomans: number;
  totalKgRecycled: number;
  totalDonatedKg: number;
  totalEarnedTomans: number;
  lotteryPoints: number;
  isRegistered: boolean;
  savedCardNumber?: string;
  savedSheba?: string;
  savedAccountHolder?: string;
  savedLocations?: SavedLocation[];
  password?: string; // رمز عبور ورود شهروند
  rating?: number; // Average 1.0 to 5.0
  ratingCount?: number;
  status?: 'active' | 'warning' | 'suspended';
  statusMessage?: string;
  warningCount?: number;
  isVip?: boolean;
}

export interface DriverActivityLog {
  id: string;
  driverId: string;
  driverName: string;
  timeStr: string;
  dateStr: string;
  locationStr: string;
  neighborhood: string;
  cityName: string;
  citizenName: string;
  citizenPhone: string;
  kgCollected: number;
  categories: string[];
  type: RecyclingType;
  charityName?: string;
  payoutTomans: number;
  paymentMode: string;
  storyNarrative: string; // عامیانه و روان
  status: 'completed' | 'reported_issue';
  issueDetails?: string;
  createdAt: string;
}

export interface DriverProfile {
  id: string;
  name: string;
  phone: string;
  nationalId: string; // For reference
  pinCode: string; // 4-digit PIN set by Admin
  password?: string; // رمز ورود راننده تعیین شده توسط مدیریت
  vehicleType: string; // e.g. "وانت پراید سفید"
  plateNumber: string; // e.g. "ایران ۷۳ - ۴۵۶ ج ۱۲"
  cityId: CityId;
  isOnline: boolean;
  totalCompletedPickups: number;
  totalCollectedKg: number;
  rating: number; // e.g. 4.8
  ratingCount: number;
  avatarUrl?: string;
  currentLocation?: { lat: number; lng: number };
  joinedDateStr?: string;
  status?: 'active' | 'inactive' | 'warning' | 'suspended' | 'on_leave';
  statusMessage?: string;
  warningCount?: number;
  activityLogs?: DriverActivityLog[];
}

export interface CharityProject {
  id: string;
  title: string;
  cityId: CityId;
  cityName: string;
  category: 'playground' | 'school' | 'health' | 'greenery';
  description: string;
  targetAmountTomans: number;
  raisedAmountTomans: number;
  totalContributors: number;
  progressPercent: number;
  badge: string;
}

export interface LotteryWinner {
  id: string;
  drawPeriod: string; // e.g. "قرعه‌کشی مرداد ۱۴۰۵"
  winnerName: string;
  userPhoneMasked: string; // e.g. "۰۹۱۷***۴۵۶۷"
  prizeTitle: string; // e.g. "ربع سکه بهار آزادی"
  prizeTier: 'first' | 'second' | 'third' | 'special';
  ticketCode: string;
  cityId: CityId;
  cityName: string;
  awardedAt: string;
  status?: 'claimed' | 'absent' | 'replaced' | 'pending';
  isAbsent?: boolean;
  absentMarkedAt?: string;
  absentReason?: string;
  replacementForWinnerId?: string;
  replacedByWinnerId?: string;
}

export interface LotteryPrizeConfig {
  id: string;
  rankTitle: string; // e.g. "نفر اول", "نفر دوم", "نفر سوم", "جوایز عمومی"
  tier: 'first' | 'second' | 'third' | 'general' | 'special';
  prizeName: string; // e.g. "ربع سکه بهار آزادی"
  winnersCount: number; // e.g. 1, 3, 10
  iconEmoji: string; // "🥇", "🥈", "🥉", "🎁"
  sponsorOrNote?: string;
}

export interface ScheduledLottery {
  id: string;
  title: string; // e.g. "قرعه‌کشی بزرگ طلایی مهرماه ۱۴۰۵"
  periodCode: string; // e.g. "DRAW-1405-07"
  cityId?: CityId | 'all';
  targetDrawDateStr: string; // e.g. "جمعه ۱۸ مهر ۱۴۰۵"
  countdownDays: number;
  status: 'upcoming' | 'in_progress' | 'completed' | 'archived';
  prizes: LotteryPrizeConfig[];
  totalEligibleTicketsCount: number;
  isTicketsResetForThisPeriod: boolean;
  ticketsResetAnnouncement?: string;
  createdAt: string;
}

export interface LiveEventLottery {
  id: string;
  eventCode: string; // e.g. "110", "724", "GOLD2026"
  eventTitle: string; // e.g. "جشن بزرگ روز پدر و پاکیاران نورآباد"
  description: string;
  cityId: CityId | 'all';
  isActive: boolean;
  prizeSummary: string;
  prizesList?: string[];
  eventDateStr?: string;
  startDate?: string; // YYYY-MM-DD
  startTime?: string; // HH:mm
  endDate?: string; // YYYY-MM-DD
  endTime?: string; // HH:mm
  status?: 'active' | 'scheduled' | 'ended';
  locationVenue?: string;
  participantsCount: number;
  registeredPhoneNumbers: string[];
}

export interface AdminCapacitySetting {
  cityId: CityId;
  dateKey: string; // YYYY-MM-DD or day name
  slotId: TimeSlotId;
  maxCapacityKg: number; // default 400
  isHolidayShutdown: boolean;
  emergencyLimitKg?: number;
}

export interface TicketMessage {
  id: string;
  sender: 'citizen' | 'admin';
  senderName: string;
  text: string;
  createdAt: string;
}

export interface FeedbackItem {
  id: string;
  ticketNumber?: string;
  userName: string;
  userPhone: string;
  cityId: CityId;
  category: 'suggestion' | 'complaint' | 'question' | 'driver_tip' | 'other';
  message: string;
  createdAt: string;
  status: 'received' | 'in_review' | 'answered' | 'closed';
  driverId?: string;
  isAnonymous?: boolean;
  adminReply?: string;
  repliedAt?: string;
  repliedBy?: string;
  messages?: TicketMessage[];
}

export interface CitizenPollOption {
  id: string;
  text: string;
  votesCount: number;
}

export interface CitizenPoll {
  id: string;
  title: string;
  description?: string;
  cityId: CityId | 'all';
  isActive: boolean;
  startDate: string;
  endDate: string;
  options: CitizenPollOption[];
  totalVotes: number;
  votedUserIds?: string[];
  category?: 'service_quality' | 'schedule' | 'app_features' | 'general';
}

export interface HeroSlide {
  id: string;
  tag: string;
  tagColor?: string;
  title: string;
  subtitle: string;
  highlightText: string;
  bgGradient: string;
  bgColor?: string;
  textColor?: 'light' | 'dark';
  iconName: string;
  actionText?: string;
  actionType: 'pickup' | 'lottery' | 'wallet' | 'share' | 'feedback' | 'charity' | 'custom_url';
  customUrl?: string;
  isActive: boolean;
  order: number;
  imageUrl?: string;
  aspectRatio?: 'tall' | 'square' | 'banner' | 'wide';
  presetType?: 'minimal_banner' | 'gradient_card' | 'photo_overlay' | 'glass';
  linkUrl?: string;
  linkLabel?: string;
}

// ══════════════════════════════════════════════════════════════════════
// PHASE D: COMPREHENSIVE EVENT LOGGING & DRIVER DAILY STATISTICS TYPES
// ══════════════════════════════════════════════════════════════════════

export type AppActorRole = 'citizen' | 'driver' | 'admin' | 'system';

export type AppEntityType = 
  | 'request'
  | 'user'
  | 'driver'
  | 'charity'
  | 'lottery'
  | 'shift'
  | 'tariff'
  | 'hero_slide'
  | 'feedback'
  | 'system';

export type AppEventType = 
  | 'request_created'                     // ثبت درخواست نوبت توسط شهروند
  | 'request_assigned'                    // پذیرش درخواست توسط راننده
  | 'request_batch_assigned'              // پذیرش گروهی درخواست‌ها توسط راننده
  | 'request_cancelled_citizen'           // لغو نوبت توسط شهروند با درج علت
  | 'request_cancelled_driver'            // انصراف راننده از پذیرش نوبت (بازگشت به صف)
  | 'request_cancelled_admin'             // لغو نوبت توسط مدیریت سامانه
  | 'request_trip_started'                // آغاز حرکت راننده به سمت مبدأ
  | 'request_type_converted_to_charity'   // تبدیل نوع درخواست به نیکوکاری در میانه فرایند
  | 'request_weighed_and_completed'       // توزین، تسویه و تکمیل سفارش توسط راننده
  | 'weight_and_payout_recorded'          // ثبت تفکیکی وزن و مبلغ (نقدی / کارت / نیکوکاری)
  | 'driver_issue_flagged'                // گزارش عدم حضور یا مشکل توسط راننده
  | 'user_registered'                     // ثبت‌نام کاربر یا شهروند جدید
  | 'user_logged_in'                      // ورود موفق کاربر به سامانه
  | 'user_logged_out'                     // خروج کاربر از سامانه
  | 'driver_logged_in'                    // ورود سفیر راننده به پنل ناوگان
  | 'admin_logged_in'                     // ورود به پنل مدیریت
  | 'lottery_event_entered'               // ثبت شماره در قرعه‌کشی مناسبتی زنده
  | 'driver_rated_by_citizen'             // ثبت امتیاز و نظر شهروند برای راننده
  | 'citizen_feedback_submitted'          // ارسال پیام، پیشنهاد یا انتقاد توسط شهروند
  | 'shifts_matrix_updated'               // ویرایش و ذخیره ماتریس شیفت‌های ۷×۴ یا استثنائات
  | 'waste_tariffs_updated'               // به‌روزرسانی نرخ و تعرفه مصوب اقلام بازیافتی
  | 'hero_slides_updated'                 // به‌روزرسانی اسلایدها و بنرهای صفحه نخست
  | 'lottery_period_created'              // ایجاد دوره جدید قرعه‌کشی
  | 'lottery_winner_drawn';               // انتخاب برنده یا ثبت وضعیت برنده غایب

export interface AppEventLog {
  id: string;
  eventType: AppEventType;
  actorId: string;
  actorRole: AppActorRole;
  actorName: string;
  entityId: string;
  entityType: AppEntityType;
  details: Record<string, any>;
  timestamp: string; // ISO 8601
  cityId?: CityId;
  cityName?: string;
  ipOrDevice?: string;
}

export interface DriverDailyStatRecord {
  driverId: string;
  driverName: string;
  dateKey: string; // e.g. "1405-06-17" or "2026-09-08"
  dateStr: string; // Persian date string e.g. "شنبه ۱۷ شهریور ۱۴۰۵"
  cityId: CityId;
  cityName: string;
  totalKg: number;
  completedRequestsCount: number;
  directCardAmountTomans: number;
  cashAmountTomans: number;
  charityAmountsByCharity: Record<string, number>; // { [charityName: string]: amountTomans }
  totalCharityAmountTomans: number;
  totalPayoutTomans: number;
  requestsIds: string[];
}


