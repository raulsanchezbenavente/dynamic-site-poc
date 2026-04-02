import { Injectable } from '@angular/core';
import { RfListOption } from 'reactive-forms';

export type CountryResult = string | string[];
export const AMBIGUOUS_PREFIX_COUNTRIES = [
  '1', // NANP (US, CA, Caribbean, territories)
  '7', // Russia / Kazakhstan
  '39', // Italy / Vatican
  '44', // United Kingdom / dependencies
  '61', // Australia / dependencies
  '262', // Réunion / Mayotte
  '290', // Saint Helena / Tristan da Cunha
  '358', // Finland / Åland
  '590', // Guadeloupe / Saint Barthélemy / Saint Martin
  '599', // Curaçao / Caribbean Netherlands
  '672', // Australian Antarctic Territory / Norfolk Island
];
@Injectable({ providedIn: 'root' })
export class PhoneCountryService {
  // --- NANP table of territories/countries with their own NPA (not US/CA) ---
  private readonly NANP_AREA_TO_ISO: Record<string, string> = {
    // Caribbean + territories and possessions
    '242': 'BS', // Bahamas
    '246': 'BB', // Barbados
    '264': 'AI', // Anguilla
    '268': 'AG', // Antigua and Barbuda
    '284': 'VG', // British Virgin Islands
    '340': 'VI', // U.S. Virgin Islands
    '345': 'KY', // Cayman Islands
    '441': 'BM', // Bermuda
    '473': 'GD', // Grenada
    '649': 'TC', // Turks and Caicos
    '664': 'MS', // Montserrat
    '670': 'MP', // N. Mariana Islands (US)
    '671': 'GU', // Guam (US)
    '684': 'AS', // American Samoa (US)
    '721': 'SX', // Sint Maarten
    '758': 'LC', // Saint Lucia
    '767': 'DM', // Dominica
    '784': 'VC', // Saint Vincent and the Grenadines
    '787': 'PR',
    '939': 'PR', // Puerto Rico (US)
    '809': 'DO',
    '829': 'DO',
    '849': 'DO', // Dominican Republic
    '868': 'TT', // Trinidad and Tobago
    '876': 'JM', // Jamaica
  };

  // --- Updatable list of Canadian NPAs to disambiguate US/CA ---
  // ⚠️ Keep this list up to date (sources: CNAC/NANPA). Add new overlays as they are assigned.
  private readonly CANADA_NPAS = new Set<string>([
    // Atlantic
    '902',
    '782', // NS/PE
    '506', // NB
    '709', // NL
    // Québec
    '418',
    '581',
    '367', // Quebec City and surroundings
    '514',
    '438',
    '263', // Montréal (263 is a new overlay in some sources; remove if unused)
    '450',
    '579',
    '354',
    '468', // South/East QC (verify 354/468 as needed)
    '819',
    '873',
    '468', // West/North QC (468 regional overlay; remove if not applicable)
    // Ontario
    '613',
    '343',
    '753',
    '354', // Ottawa/Eastern ON (new overlay 354)
    '705',
    '249',
    '683',
    '742', // Northern/Eastern ON (683/742 overlays)
    '807', // NW Ontario
    '416',
    '647',
    '437', // Toronto
    '905',
    '289',
    '365', // GTA peripheral
    '519',
    '226',
    '548', // SW Ontario
    // Prairies
    '204',
    '431',
    '584', // Manitoba (new overlay 584 in some references)
    '306',
    '639',
    '474', // Saskatchewan (overlay 474)
    '403',
    '587',
    '825',
    '368', // Alberta (province-wide overlay 368)
    '780',
    '587',
    '825', // Alberta (Edmonton)
    // British Columbia
    '604',
    '778',
    '236',
    '672', // BC (incl. Vancouver)
    // Territories
    '867', // YT/NT/NU
  ]);

  // --- Public API ---
  /**
   * Returns the ISO2 country or countries from prefix and phone number (no spaces).
   * @param prefix International prefix, with or without '+', e.g.: "+1" | "1" | "+44"
   * @param phone  Rest of the number, digits only, e.g.: "2125551234"
   */
  public countryFromPrefix(prefix: string, phone: string): CountryResult {
    const cc = this.normalizePrefix(prefix);
    const rest = this.normalizeDigits(phone);
    if (!cc || !rest) return [];

    switch (cc) {
      case '1':
        return this.handleNANP(rest);
      case '7':
        return this.handle7(rest);
      case '39':
        return this.handle39(rest);
      case '44':
        return this.handle44(rest);
      case '61':
        return this.handle61(rest);
      case '262':
        return this.handle262(rest);
      case '290':
        return rest.startsWith('8') ? 'TA' : 'SH';
      case '358':
        return rest.startsWith('18') ? 'AX' : 'FI';
      case '590':
        return ['GP', 'BL', 'MF'];
      case '599':
        return rest.startsWith('9') ? 'CW' : 'BQ';
      case '672':
        return this.handle672(rest);
      default:
        return [];
    }
  }

  private handleNANP(rest: string): CountryResult {
    if (rest.length < 3) return ['US', 'CA'];
    const npa = rest.slice(0, 3);
    if (this.NANP_AREA_TO_ISO[npa]) return this.NANP_AREA_TO_ISO[npa];
    if (this.CANADA_NPAS.has(npa)) return 'CA';
    return 'US';
  }

  private handle7(rest: string): CountryResult {
    const d = rest[0] ?? '';
    return d === '6' || d === '7' ? 'KZ' : 'RU';
  }

  private handle39(rest: string): CountryResult {
    return rest.startsWith('06698') || (rest.startsWith('06') && rest.slice(2, 5) === '698') ? 'VA' : 'IT';
  }

  private handle44(rest: string): CountryResult {
    if (rest.startsWith('1624')) return 'IM';
    if (rest.startsWith('1481')) return 'GG';
    if (rest.startsWith('1534')) return 'JE';
    return 'GB';
  }

  private handle61(rest: string): CountryResult {
    if (rest.startsWith('89164')) return 'CX';
    if (rest.startsWith('89162')) return 'CC';
    return 'AU';
  }

  private handle262(rest: string): CountryResult {
    const tri = rest.slice(0, 3);
    return tri === '269' || tri === '639' ? 'YT' : 'RE';
  }

  private handle672(rest: string): CountryResult {
    const d = rest[0] ?? '';
    if (d === '1') return 'AQ';
    if (d === '3') return 'NF';
    return ['AQ', 'NF'];
  }

  private normalizePrefix(p: string): string | null {
    if (!p) return null;
    const s = p.replaceAll(/\s+/g, '').replace(/^\+/, '');
    return /^\d{1,3}$/.test(s) ? s : null;
  }

  private normalizeDigits(d: string): string | null {
    if (!d) return null;
    const s = d.replaceAll(/\s+/g, '');
    return /^\d+$/.test(s) ? s : null;
  }

  public getCountryNameByPrefix(list: RfListOption[], prefix: string | number): string | null {
    const norm = String(prefix).replaceAll(/\D/g, '');
    if (!norm) return null;
    const found = list.find((it) => String(it?.value).replaceAll(/\D/g, '') === norm);
    if (!found) return null;
    const re = /^(.+?)\s*\(\d+\)\s*$/;
    const textString = found.content as string;
    const match = re.exec(textString);
    return (match ? match[1] : textString).trim();
  }

  private normalizeStr(s: string): string {
    return s
      .normalize('NFD')
      .replaceAll(/[\u0300-\u036f]/g, '')
      .replaceAll(/\s*\([^)]*\)\s*/g, ' ')
      .replaceAll(/\s+/g, ' ')
      .trim()
      .toLowerCase();
  }

  public getCountryCodeByName(list: RfListOption[], country: string): string | null {
    const target = this.normalizeStr(country);
    const found = list.find((it) => {
      const content = typeof it.content === 'string' ? it.content : '';
      return this.normalizeStr(content) === target;
    });
    return found ? String(found.value) : null;
  }
}
