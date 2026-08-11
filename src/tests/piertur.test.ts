import { describe, it, expect } from 'vitest';
import { campaignFormSchema, defaultCampaignData } from '../lib/validation/campaignSchema';
import { formatPrice, formatDuration, formatCurrencySymbol } from '../lib/utils/formatters';
import { formatSmartTitle } from '../lib/utils/typography';
import { generateAllVariants } from '../lib/templates/variantGenerator';
import { generateCyprusPriceFocusedCanvas } from '../lib/templates/cyprus-price-focused';

describe('Piertur Corporate Master Creative System Tests', () => {
  it('should validate Uludağ demo campaign form correctly using Zod schema', () => {
    const validResult = campaignFormSchema.safeParse(defaultCampaignData);
    expect(validResult.success).toBe(true);
    if (validResult.success) {
      expect(validResult.data.title).toBe('Uludağ Konaklamalı Tur');
      expect(validResult.data.hotelName).toBe('Beceren Otel');
      expect(validResult.data.boardType).toBe('Yarım Pansiyon');
    }
  });

  it('should format smart title typography and prevent text overflow', () => {
    const headline = formatSmartTitle('Uludağ Konaklamalı Tur');
    expect(headline.primary).toBe('ULUDAĞ');
    expect(headline.secondary).toBe('KONAKLAMALI TUR');
    expect(headline.primaryFontSize).toBe(100);

    const longTitle = formatSmartTitle('BÜYÜK GAP VE KARS DOĞU EKSPRESİ KÜLTÜR TURU');
    expect(longTitle.primary).toBe('BÜYÜK');
    expect(longTitle.primaryFontSize).toBe(100);
  });

  it('should enforce master template layer locking (locked = true)', () => {
    const canvasData = generateCyprusPriceFocusedCanvas(defaultCampaignData);
    expect(canvasData.backgroundColor).toBe('#082E63');

    // All structural master layers must be locked
    const unlockedMasterLayers = canvasData.elements.filter((el) => el.locked !== true);
    expect(unlockedMasterLayers.length).toBe(0);

    const titleLayer = canvasData.elements.find((el) => el.text === 'ULUDAĞ');
    expect(titleLayer).toBeDefined();
    expect(titleLayer?.locked).toBe(true);

    const hotelLayer = canvasData.elements.find((el) => el.text?.includes('BECEREN OTEL'));
    expect(hotelLayer).toBeDefined();
    expect(hotelLayer?.locked).toBe(true);
  });

  it('should automatically generate 3 distinct creative variants from a single campaign payload', () => {
    const variants = generateAllVariants(defaultCampaignData);
    expect(variants.length).toBe(3);

    expect(variants[0].variantType).toBe('PRICE_FOCUSED');
    expect(variants[1].variantType).toBe('DESTINATION_FOCUSED');
    expect(variants[2].variantType).toBe('DEAL_FOCUSED');

    variants.forEach((variant) => {
      expect(variant.width).toBe(1080);
      expect(variant.height).toBe(1920);
      expect(variant.canvasData.elements.length).toBeGreaterThan(8);
    });
  });
});
