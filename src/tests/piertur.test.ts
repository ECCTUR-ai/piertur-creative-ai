import { describe, it, expect } from 'vitest';
import { campaignFormSchema, defaultCampaignData } from '../lib/validation/campaignSchema';
import { formatPrice, formatCurrencySymbol } from '../lib/utils/formatters';
import { generateAllVariants } from '../lib/templates/variantGenerator';
import { generateCyprusPriceFocusedCanvas } from '../lib/templates/cyprus-price-focused';
import { buildPriceHeroPrompt } from '../lib/ai/creativePromptBuilder';
import { DesignRepository } from '../lib/storage/designRepository';

describe('Piertur Strict OpenAI Image Edit API (/v1/images/edits) Tests', () => {
  it('should validate Uludağ demo campaign form correctly using Zod schema', () => {
    const validResult = campaignFormSchema.safeParse(defaultCampaignData);
    expect(validResult.success).toBe(true);
    if (validResult.success) {
      expect(validResult.data.title).toBe('Uludağ Konaklamalı Tur');
      expect(validResult.data.hotelName).toBe('Beceren Otel');
    }
  });

  it('should build exact image edit prompt string preserving destination identity', () => {
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
    expect(prompt).toContain('Preserve the actual destination, mountain geometry, ski slopes');
    expect(prompt).toContain('Uludağ Konaklamalı Tur');
    expect(prompt).toContain('Beceren Otel');
  });

  it('should guarantee exact deterministic price and text rendering on Canvas layers', () => {
    const canvasData = generateCyprusPriceFocusedCanvas(defaultCampaignData);
    const priceFormatted = `${formatPrice(defaultCampaignData.price)} ${formatCurrencySymbol(
      defaultCampaignData.currency
    )}`;

    expect(priceFormatted).toBe('25.249 TL');

    const priceLayer = canvasData.elements.find((el) => el.text === '25.249 TL');
    expect(priceLayer).toBeDefined();
    expect(priceLayer?.locked).toBe(true);
  });

  it('should maintain generation group storage with endpoint /v1/images/edits and inputImageBytes tracking', () => {
    const variants = generateAllVariants(defaultCampaignData).map((v) => ({
      ...v,
      generationSource: 'openai' as const,
      model: 'gpt-image-2',
      endpoint: '/v1/images/edits',
      aiSuccess: true,
      fallbackReason: null,
      inputImageUsed: true,
      inputImageMethod: 'openai.images.edit',
      inputImageBytes: 348512,
      durationMs: 14200,
    }));

    const genId = 'gen_test_edits_endpoint_300';
    DesignRepository.saveGenerationGroup(genId, variants);

    const loaded = DesignRepository.getGenerationGroup(genId);
    expect(loaded.length).toBe(3);
    expect(loaded[0].generationSource).toBe('openai');
    expect(loaded[0].endpoint).toBe('/v1/images/edits');
    expect(loaded[0].inputImageMethod).toBe('openai.images.edit');
    expect(loaded[0].inputImageBytes).toBe(348512);
  });
});
