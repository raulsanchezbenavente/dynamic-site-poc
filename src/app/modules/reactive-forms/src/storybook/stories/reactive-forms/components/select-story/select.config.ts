import type { RfErrorMessageSingleComponent } from '../../../../../lib/components/common/rf-error-messages/models/rf-error-messages.model';
import type { RfListOption } from '../../../../../lib/components/rf-list/models/rf-list-option.model';
import type { RfSelectClasses } from '../../../../../lib/components/rf-select/models/rf-select-classes.model';

interface CityCoords {
  lat: number;
  lon: number;
}

const CITY_COORDS: Record<string, CityCoords> = {
  Madrid: { lat: 40.4168, lon: -3.7038 },
  París: { lat: 48.8566, lon: 2.3522 },
  'New York': { lat: 40.7128, lon: -74.006 },
  Tokyo: { lat: 35.6762, lon: 139.6503 },
  Berlin: { lat: 52.52, lon: 13.405 },
  Roma: { lat: 41.9028, lon: 12.4964 },
  'Buenos Aires': { lat: -34.6037, lon: -58.3816 },
  Miami: { lat: 25.7617, lon: -80.1918 },
  Sydney: { lat: -33.8688, lon: 151.2093 },
  'Abu Dhabi': { lat: 24.4539, lon: 54.3773 },
};

const getDistanceKm = (from: CityCoords, to: CityCoords): number => {
  const toRad = (deg: number) => deg * (Math.PI / 180);
  const R = 6371; // km
  const dLat = toRad(to.lat - from.lat);
  const dLon = toRad(to.lon - from.lon);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(from.lat)) * Math.cos(toRad(to.lat)) * Math.sin(dLon / 2) ** 2;

  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
};

const getSmartRouteOption = (fromCity: string, fromFlag: string, toCity: string, toFlag: string): string => {
  const from = CITY_COORDS[fromCity];
  const to = CITY_COORDS[toCity];
  const distance = getDistanceKm(from, to);
  const rangeIcon = distance < 3000 ? '✈️' : '🚀';

  return `
    <div class="d-flex align-items-center gap-1 route-option">
      <img src="${fromFlag}" alt="${fromCity}" width="32" height="24" class="flag">
      <span>${fromCity}</span>
      <span class="arrow">➡️</span>
      <img src="${toFlag}" alt="${toCity}" width="32" height="24" class="flag">
      <span>${toCity}</span>
      <span class="ms-2 plane">${rangeIcon}</span>
    </div>`;
};

export const SELECT_CUSTOM_CLASSES: RfSelectClasses = {
  button: 'button-select-custom text-white fs-2 fw-bold button-list-custom',
  containerItemSelected: 'container-selected-height-custom',
  list: {
    drop: 'list-custom-class',
    filter: 'list-custom-filter-class',
    option: 'list-custom-option-class',
    errorMessages: { message: 'fs-2 fw-bold' },
  },
};

export const ROUTE_OPTIONS: RfListOption[] = [
  {
    value: 'mad-par',
    content: getSmartRouteOption('Madrid', 'https://flagcdn.com/w40/es.png', 'París', 'https://flagcdn.com/w40/fr.png'),
  },
  {
    value: 'nyc-tok',
    content: getSmartRouteOption(
      'New York',
      'https://flagcdn.com/w40/us.png',
      'Tokyo',
      'https://flagcdn.com/w40/jp.png'
    ),
  },
  {
    value: 'ber-rom',
    content: getSmartRouteOption('Berlin', 'https://flagcdn.com/w40/de.png', 'Roma', 'https://flagcdn.com/w40/it.png'),
  },
  {
    value: 'bue-mia',
    content: getSmartRouteOption(
      'Buenos Aires',
      'https://flagcdn.com/w40/ar.png',
      'Miami',
      'https://flagcdn.com/w40/us.png'
    ),
  },
  {
    value: 'syd-auh',
    content: getSmartRouteOption(
      'Sydney',
      'https://flagcdn.com/w40/au.png',
      'Abu Dhabi',
      'https://flagcdn.com/w40/ae.png'
    ),
  },
];

export const SELECT_ERROR_MESSAGES: RfErrorMessageSingleComponent = {
  required: 'You must select one element',
};
