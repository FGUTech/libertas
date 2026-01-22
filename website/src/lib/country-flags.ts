/**
 * Country name to ISO 3166-1 alpha-2 code mapping
 * Used for displaying country flags from geo locations
 */

// Common country name variations mapped to ISO codes
// null values indicate global/international locations without a specific flag
const countryNameToCode: Record<string, string | null> = {
  // Major countries
  'united states': 'US',
  'usa': 'US',
  'us': 'US',
  'america': 'US',
  'united kingdom': 'GB',
  'uk': 'GB',
  'britain': 'GB',
  'great britain': 'GB',
  'england': 'GB',
  'china': 'CN',
  'russia': 'RU',
  'russian federation': 'RU',
  'germany': 'DE',
  'france': 'FR',
  'japan': 'JP',
  'india': 'IN',
  'brazil': 'BR',
  'canada': 'CA',
  'australia': 'AU',
  'italy': 'IT',
  'spain': 'ES',
  'mexico': 'MX',
  'south korea': 'KR',
  'korea': 'KR',
  'netherlands': 'NL',
  'switzerland': 'CH',
  'sweden': 'SE',
  'poland': 'PL',
  'belgium': 'BE',
  'austria': 'AT',
  'norway': 'NO',
  'denmark': 'DK',
  'finland': 'FI',
  'ireland': 'IE',
  'portugal': 'PT',
  'greece': 'GR',
  'czech republic': 'CZ',
  'czechia': 'CZ',
  'romania': 'RO',
  'hungary': 'HU',
  'ukraine': 'UA',
  'turkey': 'TR',
  'israel': 'IL',
  'saudi arabia': 'SA',
  'united arab emirates': 'AE',
  'uae': 'AE',
  'singapore': 'SG',
  'hong kong': 'HK',
  'taiwan': 'TW',
  'thailand': 'TH',
  'vietnam': 'VN',
  'indonesia': 'ID',
  'malaysia': 'MY',
  'philippines': 'PH',
  'pakistan': 'PK',
  'bangladesh': 'BD',
  'egypt': 'EG',
  'south africa': 'ZA',
  'nigeria': 'NG',
  'kenya': 'KE',
  'morocco': 'MA',
  'argentina': 'AR',
  'chile': 'CL',
  'colombia': 'CO',
  'peru': 'PE',
  'venezuela': 'VE',
  'new zealand': 'NZ',

  // Middle East & Central Asia
  'iran': 'IR',
  'iraq': 'IQ',
  'afghanistan': 'AF',
  'syria': 'SY',
  'yemen': 'YE',
  'jordan': 'JO',
  'lebanon': 'LB',
  'qatar': 'QA',
  'kuwait': 'KW',
  'bahrain': 'BH',
  'oman': 'OM',
  'kazakhstan': 'KZ',
  'uzbekistan': 'UZ',

  // Africa
  'ethiopia': 'ET',
  'ghana': 'GH',
  'tanzania': 'TZ',
  'uganda': 'UG',
  'algeria': 'DZ',
  'tunisia': 'TN',
  'libya': 'LY',
  'sudan': 'SD',
  'zimbabwe': 'ZW',
  'senegal': 'SN',
  'ivory coast': 'CI',
  "côte d'ivoire": 'CI',
  'cameroon': 'CM',
  'democratic republic of the congo': 'CD',
  'drc': 'CD',
  'congo': 'CG',

  // Southeast Asia
  'myanmar': 'MM',
  'burma': 'MM',
  'cambodia': 'KH',
  'laos': 'LA',

  // South America
  'ecuador': 'EC',
  'bolivia': 'BO',
  'paraguay': 'PY',
  'uruguay': 'UY',

  // Europe
  'belarus': 'BY',
  'bulgaria': 'BG',
  'croatia': 'HR',
  'serbia': 'RS',
  'slovakia': 'SK',
  'slovenia': 'SI',
  'estonia': 'EE',
  'latvia': 'LV',
  'lithuania': 'LT',
  'luxembourg': 'LU',
  'iceland': 'IS',
  'cyprus': 'CY',
  'malta': 'MT',
  'north macedonia': 'MK',
  'macedonia': 'MK',
  'albania': 'AL',
  'bosnia': 'BA',
  'bosnia and herzegovina': 'BA',
  'montenegro': 'ME',
  'kosovo': 'XK',
  'georgia': 'GE',
  'armenia': 'AM',
  'azerbaijan': 'AZ',
  'moldova': 'MD',

  // Central America & Caribbean
  'cuba': 'CU',
  'haiti': 'HT',
  'dominican republic': 'DO',
  'jamaica': 'JM',
  'puerto rico': 'PR',
  'costa rica': 'CR',
  'panama': 'PA',
  'guatemala': 'GT',
  'honduras': 'HN',
  'el salvador': 'SV',
  'nicaragua': 'NI',

  // Asia-Pacific
  'nepal': 'NP',
  'sri lanka': 'LK',
  'mongolia': 'MN',
  'brunei': 'BN',
  'bhutan': 'BT',
  'fiji': 'FJ',
  'papua new guinea': 'PG',

  // Special regions / territories
  'global': null,
  'worldwide': null,
  'international': null,
  'european union': 'EU',
  'eu': 'EU',
};

/**
 * Get ISO country code from country/location name
 * Returns null if not found or for global/international locations
 */
export function getCountryCode(location: string): string | null {
  const normalized = location.toLowerCase().trim();

  // Direct lookup
  if (normalized in countryNameToCode) {
    return countryNameToCode[normalized];
  }

  // Try removing common suffixes/prefixes
  const cleaned = normalized
    .replace(/^the\s+/, '')
    .replace(/\s+(republic|kingdom|federation|islands?)$/i, '');

  if (cleaned in countryNameToCode) {
    return countryNameToCode[cleaned];
  }

  return null;
}

/**
 * Check if a location has an associated country flag
 */
export function hasCountryFlag(location: string): boolean {
  return getCountryCode(location) !== null;
}
