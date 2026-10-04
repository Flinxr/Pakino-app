/**
 * Bank detection and validation helper for Iranian banking system (شتاب).
 */

export interface BankInfo {
  bankName: string;
  color: string;
  bgGradient: string;
  textColor: string;
  logoText: string;
}

const BANK_PREFIXES: Record<string, BankInfo> = {
  '603799': { bankName: 'بانک ملی ایران', color: '#004d40', bgGradient: 'from-emerald-800 to-teal-900', textColor: 'text-white', logoText: 'ملی' },
  '589210': { bankName: 'بانک سپه', color: '#1a237e', bgGradient: 'from-blue-900 to-indigo-950', textColor: 'text-white', logoText: 'سپه' },
  '627648': { bankName: 'بانک توسعه صادرات', color: '#1b5e20', bgGradient: 'from-emerald-900 to-green-950', textColor: 'text-white', logoText: 'صادرات توسعه' },
  '207177': { bankName: 'بانک توسعه صادرات', color: '#1b5e20', bgGradient: 'from-emerald-900 to-green-950', textColor: 'text-white', logoText: 'صادرات توسعه' },
  '627961': { bankName: 'بانک صنعت و معدن', color: '#b71c1c', bgGradient: 'from-red-900 to-amber-950', textColor: 'text-white', logoText: 'صنعت و معدن' },
  '603770': { bankName: 'بانک کشاورزی', color: '#2e7d32', bgGradient: 'from-green-800 to-emerald-950', textColor: 'text-white', logoText: 'کشاورزی' },
  '628023': { bankName: 'بانک مسکن', color: '#e65100', bgGradient: 'from-orange-800 to-amber-900', textColor: 'text-white', logoText: 'مسکن' },
  '627760': { bankName: 'پست بانک ایران', color: '#006064', bgGradient: 'from-teal-800 to-cyan-950', textColor: 'text-white', logoText: 'پست بانک' },
  '502908': { bankName: 'بانک توسعه تعاون', color: '#004d40', bgGradient: 'from-teal-900 to-emerald-950', textColor: 'text-white', logoText: 'توسعه تعاون' },
  '627412': { bankName: 'بانک اقتصاد نوین', color: '#4a148c', bgGradient: 'from-purple-900 to-indigo-950', textColor: 'text-white', logoText: 'اقتصاد نوین' },
  '622106': { bankName: 'بانک پارسیان', color: '#b71c1c', bgGradient: 'from-rose-900 to-red-950', textColor: 'text-white', logoText: 'پارسیان' },
  '502229': { bankName: 'بانک پاسارگاد', color: '#ffb300', bgGradient: 'from-amber-700 to-yellow-900', textColor: 'text-white', logoText: 'پاسارگاد' },
  '627488': { bankName: 'بانک کارآفرین', color: '#00838f', bgGradient: 'from-cyan-900 to-teal-950', textColor: 'text-white', logoText: 'کارآفرین' },
  '621986': { bankName: 'بانک سامان', color: '#0288d1', bgGradient: 'from-sky-800 to-blue-950', textColor: 'text-white', logoText: 'سامان' },
  '639346': { bankName: 'بانک سینا', color: '#004d40', bgGradient: 'from-emerald-900 to-teal-950', textColor: 'text-white', logoText: 'سینا' },
  '639607': { bankName: 'بانک سرمایه', color: '#00695c', bgGradient: 'from-teal-800 to-slate-900', textColor: 'text-white', logoText: 'سرمایه' },
  '502806': { bankName: 'بانک شهر', color: '#c2185b', bgGradient: 'from-pink-900 to-rose-950', textColor: 'text-white', logoText: 'شهر' },
  '502938': { bankName: 'بانک دی', color: '#e65100', bgGradient: 'from-orange-900 to-stone-900', textColor: 'text-white', logoText: 'دی' },
  '603769': { bankName: 'بانک صادرات ایران', color: '#1a237e', bgGradient: 'from-blue-900 to-slate-950', textColor: 'text-white', logoText: 'صادرات' },
  '610433': { bankName: 'بانک ملت', color: '#b71c1c', bgGradient: 'from-red-800 to-rose-950', textColor: 'text-white', logoText: 'ملت' },
  '627353': { bankName: 'بانک تجارت', color: '#004d40', bgGradient: 'from-teal-800 to-emerald-950', textColor: 'text-white', logoText: 'تجارت' },
  '589463': { bankName: 'بانک رفاه کارگران', color: '#1565c0', bgGradient: 'from-blue-800 to-cyan-950', textColor: 'text-white', logoText: 'رفاه' },
  '627381': { bankName: 'بانک انصار', color: '#2e7d32', bgGradient: 'from-emerald-900 to-teal-950', textColor: 'text-white', logoText: 'انصار' },
  '639370': { bankName: 'بانک مهر اقتصاد', color: '#37474f', bgGradient: 'from-slate-800 to-slate-950', textColor: 'text-white', logoText: 'مهر اقتصاد' },
  '606373': { bankName: 'بانک قرض‌الحسنه مهر ایران', color: '#1b5e20', bgGradient: 'from-green-800 to-teal-950', textColor: 'text-white', logoText: 'مهر ایران' },
  '504172': { bankName: 'بانک قرض‌الحسنه رسالت', color: '#1a237e', bgGradient: 'from-indigo-900 to-blue-950', textColor: 'text-white', logoText: 'رسالت' },
  '636214': { bankName: 'بانک آینده', color: '#4e342e', bgGradient: 'from-amber-900 to-stone-950', textColor: 'text-white', logoText: 'آینده' },
  '505785': { bankName: 'بانک ایران زمین', color: '#4527a0', bgGradient: 'from-purple-900 to-slate-950', textColor: 'text-white', logoText: 'ایران زمین' },
  '505416': { bankName: 'بانک گردشگری', color: '#bf360c', bgGradient: 'from-orange-900 to-red-950', textColor: 'text-white', logoText: 'گردشگری' }
};

/**
 * Clean digits from non-numeric characters (Persian/Arabic to English conversion)
 */
export function normalizeDigits(input: string): string {
  if (!input) return '';
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  
  let result = input;
  for (let i = 0; i < 10; i++) {
    result = result.replace(new RegExp(persianDigits[i], 'g'), String(i));
    result = result.replace(new RegExp(arabicDigits[i], 'g'), String(i));
  }
  return result.replace(/[^0-9]/g, '');
}

/**
 * Identify Bank by 6-digit Card Prefix
 */
export function detectBankFromCard(cardNumber: string): BankInfo | null {
  const digits = normalizeDigits(cardNumber);
  if (digits.length < 6) return null;
  const prefix = digits.substring(0, 6);
  return BANK_PREFIXES[prefix] || null;
}

/**
 * Validate Iranian 16-digit debit card with Luhn Algorithm
 */
export function isValidCardNumber(cardNumber: string): boolean {
  const digits = normalizeDigits(cardNumber);
  if (digits.length !== 16) return false;

  let sum = 0;
  for (let i = 0; i < 16; i++) {
    let digit = parseInt(digits[i], 10);
    if (i % 2 === 0) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
  }
  return sum % 10 === 0;
}

/**
 * Format 16-digit card number with dashes or spaces: 6037-9912-3456-7890
 */
export function formatCardNumber(cardNumber: string, separator = ' - '): string {
  const digits = normalizeDigits(cardNumber);
  if (!digits) return '';
  const parts: string[] = [];
  for (let i = 0; i < digits.length; i += 4) {
    parts.push(digits.substring(i, i + 4));
  }
  return parts.join(separator);
}

/**
 * Validate Sheba IBAN (IR followed by 24 digits)
 */
export function isValidSheba(sheba: string): boolean {
  const clean = sheba.toUpperCase().replace(/\s+/g, '');
  if (!clean.startsWith('IR')) return false;
  const digitsOnly = normalizeDigits(clean.substring(2));
  if (digitsOnly.length !== 24) return false;

  // ISO 7064 Mod 97-10 check
  // IR translates to 1827
  const rearranged = digitsOnly + '1827' + digitsOnly.substring(0, 2);
  let remainder = 0;
  for (let i = 0; i < rearranged.length; i++) {
    remainder = (remainder * 10 + parseInt(rearranged[i], 10)) % 97;
  }
  return remainder === 1;
}

/**
 * Format Sheba IBAN: IR12 3456 7890 1234 5678 9012 34
 */
export function formatSheba(sheba: string): string {
  const clean = sheba.toUpperCase().replace(/[^0-9A-Z]/g, '');
  const digits = normalizeDigits(clean.replace('IR', ''));
  if (!digits) return 'IR';
  
  let formatted = 'IR';
  for (let i = 0; i < digits.length; i += 4) {
    formatted += (i === 0 ? '' : ' ') + digits.substring(i, i + 4);
  }
  return formatted;
}

/**
 * Validate Iranian 10-digit National Code (کد ملی)
 */
export function isValidIranianNationalCode(code: string): boolean {
  const digits = normalizeDigits(code);
  if (digits.length !== 10) return false;

  // Disallow repetitive dummy patterns like 0000000000, 1111111111, etc.
  if (/^(\d)\1{9}$/.test(digits)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(digits[i], 10) * (10 - i);
  }

  const remainder = sum % 11;
  const checkDigit = parseInt(digits[9], 10);

  if (remainder < 2) {
    return checkDigit === remainder;
  } else {
    return checkDigit === 11 - remainder;
  }
}
