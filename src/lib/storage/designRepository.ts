import { DesignModel, CampaignInfo } from '@/types';
import { defaultCampaignData } from '../validation/campaignSchema';
import { generateCyprusPriceFocusedCanvas } from '../templates/cyprus-price-focused';
import { generateCyprusDestinationFocusedCanvas } from '../templates/cyprus-destination-focused';

const STORAGE_KEY = 'piertur_creative_designs_v1';

export const initialMockDesigns: DesignModel[] = [
  {
    id: 'des_kibris_story_01',
    name: 'Kıbrıs Turları - Fiyat Odaklı Story',
    type: 'TUR',
    format: 'IG_STORY',
    width: 1080,
    height: 1920,
    thumbnail:
      'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=300&q=80',
    campaignData: defaultCampaignData as CampaignInfo,
    canvasData: generateCyprusPriceFocusedCanvas(defaultCampaignData as CampaignInfo),
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
  {
    id: 'des_kibris_dest_02',
    name: 'Girne Sahil & Otel Kampanyası',
    type: 'OTEL',
    format: 'IG_STORY',
    width: 1080,
    height: 1920,
    thumbnail:
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=300&q=80',
    campaignData: {
      ...defaultCampaignData,
      title: 'GİRNE OTEL FIRSATLARI',
      subtitle: 'Denize Sıfır 5 Yıldızlı Lüks Tatil',
      price: 18450,
    } as CampaignInfo,
    canvasData: generateCyprusDestinationFocusedCanvas({
      ...defaultCampaignData,
      title: 'GİRNE OTEL FIRSATLARI',
      subtitle: 'Denize Sıfır 5 Yıldızlı Lüks Tatil',
      price: 18450,
    } as CampaignInfo),
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
];

export class DesignRepository {
  public static getAll(): DesignModel[] {
    if (typeof window === 'undefined') return initialMockDesigns;

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(initialMockDesigns));
        return initialMockDesigns;
      }
      return JSON.parse(stored) as DesignModel[];
    } catch (e) {
      console.error('Failed to read designs from LocalStorage', e);
      return initialMockDesigns;
    }
  }

  public static getById(id: string): DesignModel | null {
    const all = this.getAll();
    return all.find((item) => item.id === id) || null;
  }

  public static save(design: DesignModel): void {
    if (typeof window === 'undefined') return;

    try {
      const all = this.getAll();
      const existingIdx = all.findIndex((item) => item.id === design.id);

      const updatedDesign = {
        ...design,
        updatedAt: new Date().toISOString(),
      };

      if (existingIdx >= 0) {
        all[existingIdx] = updatedDesign;
      } else {
        all.unshift(updatedDesign);
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    } catch (e) {
      console.error('Failed to save design to LocalStorage', e);
    }
  }

  public static delete(id: string): void {
    if (typeof window === 'undefined') return;

    try {
      const all = this.getAll();
      const filtered = all.filter((item) => item.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    } catch (e) {
      console.error('Failed to delete design', e);
    }
  }

  public static duplicate(id: string): DesignModel | null {
    const original = this.getById(id);
    if (!original) return null;

    const duplicated: DesignModel = {
      ...original,
      id: 'piertur_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now(),
      name: `${original.name} (Kopya)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.save(duplicated);
    return duplicated;
  }
}
