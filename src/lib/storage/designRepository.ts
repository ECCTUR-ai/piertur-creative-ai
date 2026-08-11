import { DesignModel, CampaignInfo } from '@/types';
import { defaultCampaignData } from '../validation/campaignSchema';
import { generateAllVariants } from '../templates/variantGenerator';

const STORAGE_KEY = 'piertur_creative_designs_v2';
const GEN_STORAGE_KEY = 'piertur_creative_generations_v1';

export const initialMockDesigns: DesignModel[] = generateAllVariants(defaultCampaignData as CampaignInfo);

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

  public static saveGenerationGroup(generationId: string, designs: DesignModel[]): void {
    if (typeof window === 'undefined') return;

    try {
      designs.forEach((d) => this.save(d));

      const storedGens = localStorage.getItem(GEN_STORAGE_KEY);
      const gensMap = storedGens ? JSON.parse(storedGens) : {};
      gensMap[generationId] = designs.map((d) => d.id);
      localStorage.setItem(GEN_STORAGE_KEY, JSON.stringify(gensMap));
    } catch (e) {
      console.error('Failed to save generation group', e);
    }
  }

  public static getGenerationGroup(generationId: string): DesignModel[] {
    const all = this.getAll();

    if (typeof window !== 'undefined') {
      try {
        const storedGens = localStorage.getItem(GEN_STORAGE_KEY);
        if (storedGens) {
          const gensMap = JSON.parse(storedGens);
          const ids: string[] = gensMap[generationId];
          if (ids && ids.length > 0) {
            const found = ids.map((id) => all.find((d) => d.id === id)).filter(Boolean) as DesignModel[];
            if (found.length > 0) return found;
          }
        }
      } catch (e) {
        console.error('Failed to read generation group', e);
      }
    }

    // Fallback to initial 3 variants
    return all.slice(0, 3);
  }
}
