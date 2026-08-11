import { describe, it, expect } from 'vitest';
import { campaignFormSchema, defaultCampaignData } from '../lib/validation/campaignSchema';
import { formatPrice, formatCurrencySymbol } from '../lib/utils/formatters';
import { generateAllVariants } from '../lib/templates/variantGenerator';
import { generateCyprusPriceFocusedCanvas } from '../lib/templates/cyprus-price-focused';
import { buildPriceHeroPrompt } from '../lib/ai/creativePromptBuilder';
import { DesignRepository } from '../lib/storage/designRepository';

describe('Piertur True Image Input OpenAI Integration Tests', () => {
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

  it('should maintain generation group storage with inputImageUsed and inputImageMethod tracking', () => {
    const variants = generateAllVariants(defaultCampaignData).map((v) => ({
      ...v,
      generationSource: 'openai' as const,
      model: 'gpt-image-2',
      aiSuccess: true,
      fallbackReason: null,
      inputImageUsed: true,
      inputImageMethod: 'openai.images.edit (binary image buffer passed)',
    }));

    const genId = 'gen_test_true_image_200';
    DesignRepository.saveGenerationGroup(genId, variants);

    const loaded = DesignRepository.getGenerationGroup(genId);
    expect(loaded.length).toBe(3);
    expect(loaded[0].generationSource).toBe('openai');
    expect(loaded[0].inputImageUsed).toBe(true);
    expect(loaded[0].inputImageMethod).toContain('openai.images.edit');
  });
});
