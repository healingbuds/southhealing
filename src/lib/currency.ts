// Currency utility for country-based formatting
// Maps country codes to their respective currencies

const currencyMap: Record<string, string> = {
  PT: 'EUR',
  ZA: 'ZAR',
  GB: 'GBP',
  TH: 'THB',
  US: 'USD',
};

const currencySymbols: Record<string, string> = {
  EUR: '€',
  ZAR: 'R',
  GBP: '£',
  THB: '฿',
  USD: '$',
};

export function getCurrencyForCountry(countryCode: string): string {
  return currencyMap[countryCode] || 'EUR';
}

export function getCurrencySymbol(currencyCode: string): string {
  return currencySymbols[currencyCode] || currencyCode;
}

export function formatPrice(
  amount: number,
  countryCode: string = 'PT',
  options?: { showSymbol?: boolean }
): string {
  const currency = getCurrencyForCountry(countryCode);
  const { showSymbol = true } = options || {};
  
  try {
    // Use Intl.NumberFormat for locale-aware formatting
    const formatter = new Intl.NumberFormat(getLocaleForCountry(countryCode), {
      style: showSymbol ? 'currency' : 'decimal',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    
    return formatter.format(amount);
  } catch {
    // Fallback to simple formatting
    const symbol = getCurrencySymbol(currency);
    return `${symbol}${amount.toFixed(2)}`;
  }
}

function getLocaleForCountry(countryCode: string): string {
  const localeMap: Record<string, string> = {
    PT: 'pt-PT',
    ZA: 'en-ZA',
    GB: 'en-GB',
    TH: 'th-TH',
    US: 'en-US',
  };
  return localeMap[countryCode] || 'en-GB';
}
