import { describe, it, expect } from 'vitest';
import { campaignFormSchema, defaultCampaignData } from '../lib/validation/campaignSchema';
import { formatPrice, formatCurrencySymbol } from '../lib/utils/formatters';
import { formatSmartTitle } from '../lib/utils/typography';
import { generateAllVariants } from '../lib/templates/variantGenerator';
import { generateCyprusPriceFocusedCanvas } from '../lib/templates/cyprus-price-focused';
import {
  buildPriceHeroPrompt,
  buildDestinationHeroPrompt,
  buildCampaignHeroPrompt,
} from '../lib/ai/creativePromptBuilder';
import { DesignRepository } from '../lib/storage/designRepository';

describe('Piertur OpenAI Integration & Hybrid Creative System Tests', () => {
  it('should validate Uludağ demo campaign form correctly using Zod schema', () => {
    const validResult = campaignFormSchema.safeParse(defaultCampaignData);
    expect(validResult.success).toBe(true);
    if (validResult.success) {
      expect(validResult.data.title).toBe('Uludağ Konaklamalı Tur');
      expect(validResult.data.hotelName).toBe('Beceren Otel');
    }
  });

  it('should build 3 distinct OpenAI creative prompts with Piertur brand context', () => {
    const payload = {
      campaignTitle: 'Uludağ Konaklamalı Tur',
      hotelName: 'Beceren Otel',
      nights: 2,
      days: 3,
      price: 25249,
      departureCities: ['İstanbul', 'Ankara', 'İzmir', 'Bursa'],
      benefits: ['Kayak Pistlerine Yakın'],
    };

    const promptA = buildPriceHeroPrompt(payload);
    const promptB = buildDestinationHeroPrompt(payload);
    const promptC = buildCampaignHeroPrompt(payload);

    expect(promptA).toContain('PRICE HERO VARIANT');
    expect(promptB).toContain('DESTINATION HERO VARIANT');
    expect(promptC).toContain('CAMPAIGN HERO VARIANT');

    expect(promptA).toContain('#082E63');
    expect(promptB).toContain('Piertur');
  });

  it('should guarantee exact deterministic price rendering on Canvas layers', () => {
    const canvasData = generateCyprusPriceFocusedCanvas(defaultCampaignData);
    const priceFormatted = `${formatPrice(defaultCampaignData.price)} ${formatCurrencySymbol(
      defaultCampaignData.currency
    )}`;

    expect(priceFormatted).toBe('25.249 TL');

    const priceLayer = canvasData.elements.find((el) => el.text === '25.249 TL');
    expect(priceLayer).toBeDefined();
    expect(priceLayer?.locked).toBe(true);
  });

  it('should support generation group storage and fallback generation when API key is unconfigured', () => {
    const variants = generateAllVariants(defaultCampaignData);
    expect(variants.length).toBe(3);

    const genId = 'gen_test_fallback_99';
    DesignRepository.saveGenerationGroup(genId, variants);

    const loaded = DesignRepository.getGenerationGroup(genId);
    expect(loaded.length).toBe(3);
    expect(loaded[0].variantType).toBe('PRICE_FOCUSED');
  });
});
