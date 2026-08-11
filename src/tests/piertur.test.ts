import { describe, it, expect } from 'vitest';
import { campaignFormSchema, defaultCampaignData } from '../lib/validation/campaignSchema';
import { formatPrice, formatCurrencySymbol } from '../lib/utils/formatters';
import { generateAllVariants } from '../lib/templates/variantGenerator';
import { generateCyprusPriceFocusedCanvas } from '../lib/templates/cyprus-price-focused';
import { buildPriceHeroPrompt } from '../lib/ai/creativePromptBuilder';
import { DesignRepository } from '../lib/storage/designRepository';

describe('Piertur Agency-Grade PRICE_HERO Creative Tests', () => {
  it('should validate Uludağ demo campaign form correctly using Zod schema', () => {
    const validResult = campaignFormSchema.safeParse(defaultCampaignData);
    expect(validResult.success).toBe(true);
    if (validResult.success) {
      expect(validResult.data.title).toBe('Uludağ Konaklamalı Tur');
      expect(validResult.data.hotelName).toBe('Beceren Otel');
    }
  });

  it('should build exact agency-grade image edit prompt with editorial keywords', () => {
    const payload = {
      campaignTitle: 'Uludağ Konaklamalı Tur',
      hotelName: 'Beceren Otel',
      nights: 2,
      days: 3,
      price: 25249,
      departureCities: ['İstanbul', 'Ankara', 'İzmir', 'Bursa'],
      benefits: ['Kayak Pistlerine Yakın'],
    };

    const prompt = buildPriceHeroPrompt(payload);
    expect(prompt).toContain('premium Turkish tour operator advertising');
    expect(prompt).toContain('agency-grade social media campaign');
    expect(prompt).toContain('full bleed destination photography');
  });

  it('should guarantee 110px ultra-bold headline and hero price typography on Canvas layers', () => {
    const canvasData = generateCyprusPriceFocusedCanvas(defaultCampaignData);
    const priceFormatted = `${formatPrice(defaultCampaignData.price)} ${formatCurrencySymbol(
      defaultCampaignData.currency
    )}`;

    expect(priceFormatted).toBe('25.249 TL');

    const titleLayer = canvasData.elements.find((el) => el.id === 'title-primary');
    expect(titleLayer).toBeDefined();
    expect(titleLayer?.fontSize).toBe(110);

    const priceLayer = canvasData.elements.find((el) => el.id === 'price-amount');
    expect(priceLayer).toBeDefined();
    expect(priceLayer?.fontSize).toBe(120);
  });

  it('should maintain generation group storage for single PRICE_HERO variant', () => {
    const variants = generateAllVariants(defaultCampaignData).slice(0, 1).map((v) => ({
      ...v,
      generationSource: 'openai' as const,
      model: 'gpt-image-2',
      endpoint: '/v1/images/edits',
      aiSuccess: true,
      fallbackReason: null,
      inputImageUsed: true,
      inputImageMethod: 'openai.images.edit',
      inputImageBytes: 100739,
      durationMs: 28376,
    }));

    const genId = 'gen_test_agency_price_hero_400';
    DesignRepository.saveGenerationGroup(genId, variants);

    const loaded = DesignRepository.getGenerationGroup(genId);
    expect(loaded.length).toBe(1);
    expect(loaded[0].generationSource).toBe('openai');
    expect(loaded[0].endpoint).toBe('/v1/images/edits');
    expect(loaded[0].canvasData.elements.find((e) => e.id === 'title-primary')?.fontSize).toBe(110);
  });
});
