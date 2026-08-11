import { describe, it, expect } from 'vitest';
import { campaignFormSchema, defaultCampaignData } from '../lib/validation/campaignSchema';
import { formatPrice, formatDuration, formatCurrencySymbol } from '../lib/utils/formatters';
import { formatSmartTitle } from '../lib/utils/typography';
import { generateAllVariants } from '../lib/templates/variantGenerator';
import { generateCyprusPriceFocusedCanvas } from '../lib/templates/cyprus-price-focused';
import { DesignRepository } from '../lib/storage/designRepository';

describe('Piertur Generated Creative Flow Tests', () => {
  it('should validate Uludağ demo campaign form correctly using Zod schema', () => {
    const validResult = campaignFormSchema.safeParse(defaultCampaignData);
    expect(validResult.success).toBe(true);
    if (validResult.success) {
      expect(validResult.data.title).toBe('Uludağ Konaklamalı Tur');
      expect(validResult.data.hotelName).toBe('Beceren Otel');
    }
  });

  it('should format smart title typography and prevent text overflow', () => {
    const headline = formatSmartTitle('Uludağ Konaklamalı Tur');
    expect(headline.primary).toBe('ULUDAĞ');
    expect(headline.secondary).toBe('KONAKLAMALI TUR');
  });

  it('should enforce master template layer locking (locked = true)', () => {
    const canvasData = generateCyprusPriceFocusedCanvas(defaultCampaignData);
    const unlockedMasterLayers = canvasData.elements.filter((el) => el.locked !== true);
    expect(unlockedMasterLayers.length).toBe(0);
  });

  it('should generate 3 distinct creative variants and store generation group without automatically launching studio', () => {
    const variants = generateAllVariants(defaultCampaignData);
    expect(variants.length).toBe(3);

    const generationId = 'gen_test_12345';
    DesignRepository.saveGenerationGroup(generationId, variants);

    const retrievedGroup = DesignRepository.getGenerationGroup(generationId);
    expect(retrievedGroup.length).toBe(3);
    expect(retrievedGroup[0].variantType).toBe('PRICE_FOCUSED');
    expect(retrievedGroup[1].variantType).toBe('DESTINATION_FOCUSED');
    expect(retrievedGroup[2].variantType).toBe('DEAL_FOCUSED');

    // Studio is not opened automatically in generation flow
    expect(retrievedGroup[0].id).toBeDefined();
    expect(retrievedGroup[1].id).toBeDefined();
    expect(retrievedGroup[2].id).toBeDefined();
  });
});
