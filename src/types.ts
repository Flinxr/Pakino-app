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
}

export interface WalletTransaction {
  id: string;
  type: 'credit' | 'debit';
  title: string;
  amountTomans: number;
  dateStr: string;
  createdAt: string;
  status: 'completed' | 'processing';
  referenceId?: string; // e.g. Pickup Request ID or Bank Ref
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

export interface PickupRequest {
  id: string; // e.g. "1021"
  trackingCode: string; // e.g. "PK-1021"
  userId: string;
  userName: string;
  userPhone: string;
  cityId: CityId;
  cityName: string;
  type: RecyclingType;
  payoutMethod?: 'wallet' | 'cash_on_delivery';
  dateStr: string; // e.g. "شنبه ۱۷ شهریور ۱۴۰۵"
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
  driverId?: string;
  driverName?: string;
  driverPhone?: string;
  collectedAt?: string;
  cashPaidTomans?: number;
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
}

export interface DriverProfile {
  id: string;
  name: string;
  phone: string;
  vehicleType: string;
  plateNumber: string;
  cityId: CityId;
  isOnline: boolean;
  totalCompletedPickups: number;
  rating: number;
}

export interface FeedbackItem {
  id: string;
  userName: string;
  userPhone: string;
  cityId: CityId;
  category: 'suggestion' | 'complaint' | 'question' | 'other';
  message: string;
  createdAt: string;
  status: 'received' | 'answered';
}
