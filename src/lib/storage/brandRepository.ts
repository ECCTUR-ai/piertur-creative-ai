/**
 * Piertur Corporate Brand Kit Persistence Repository
 */

export interface PierturBrandKit {
  logoUrl?: string;
  primaryNavy: string;
  brandYellow: string;
  accentRed: string;
  brandWhite: string;
  fontFamily: string;
  website: string;
  socialHandle: string;
  phone: string;
}

const DEFAULT_BRAND_KIT: PierturBrandKit = {
  logoUrl: '',
  primaryNavy: '#082E63',
  brandYellow: '#FFB21C',
  accentRed: '#E31C24',
  brandWhite: '#FFFFFF',
  fontFamily: 'Montserrat, sans-serif',
  website: 'piertur.com',
  socialHandle: '@piertur',
  phone: '444 0 743',
};

const BRAND_KEY = 'piertur_brand_kit_config';

export class BrandRepository {
  static getBrandKit(): PierturBrandKit {
    if (typeof window === 'undefined') return DEFAULT_BRAND_KIT;
    try {
      const stored = localStorage.getItem(BRAND_KEY);
      if (!stored) return DEFAULT_BRAND_KIT;
      return { ...DEFAULT_BRAND_KIT, ...JSON.parse(stored) };
    } catch {
      return DEFAULT_BRAND_KIT;
    }
  }

  static saveBrandKit(kit: Partial<PierturBrandKit>): PierturBrandKit {
    const updated = { ...this.getBrandKit(), ...kit };
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(BRAND_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to save Brand Kit to LocalStorage', e);
      }
    }
    return updated;
  }
}
