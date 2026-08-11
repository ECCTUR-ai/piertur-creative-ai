import { describe, it, expect } from 'vitest';
import { campaignFormSchema, defaultCampaignData } from '../lib/validation/campaignSchema';
import { formatPrice, formatDuration, formatCurrencySymbol } from '../lib/utils/formatters';
import { templatesList, getTemplateById } from '../lib/templates';
import { generateCyprusPriceFocusedCanvas } from '../lib/templates/cyprus-price-focused';

describe('Piertur Creative AI Core Tests', () => {
  it('should validate campaign form correctly using Zod schema', () => {
    const validResult = campaignFormSchema.safeParse(defaultCampaignData);
    expect(validResult.success).toBe(true);

    const invalidResult = campaignFormSchema.safeParse({
      ...defaultCampaignData,
      title: '', // Empty title should fail
      price: -10, // Negative price should fail
    });
    expect(invalidResult.success).toBe(false);
  });

  it('should format prices and durations properly according to Turkish locale', () => {
    expect(formatPrice(25249)).toBe('25.249');
    expect(formatPrice(1500000)).toBe('1.500.000');
    expect(formatCurrencySymbol('TL')).toBe('TL');
    expect(formatCurrencySymbol('EUR')).toBe('€');

    expect(formatDuration(3, 4)).toBe('3 Gece 4 Gün');
    expect(formatDuration(3)).toBe('3 Gece Otel Konaklamalı');
  });

  it('should load all 5 MVP Story templates and generate valid canvas elements', () => {
    expect(templatesList.length).toBe(5);

    const template1 = getTemplateById('template-01-price-focused');
    expect(template1).toBeDefined();
    expect(template1.name).toContain('Fiyat Odaklı');

    const canvasData = generateCyprusPriceFocusedCanvas(defaultCampaignData);
    expect(canvasData.backgroundColor).toBe('#082E63');
    expect(canvasData.elements.length).toBeGreaterThan(10);

    // Verify critical elements are text layers (NOT baked into image)
    const textLayers = canvasData.elements.filter((el) => el.type === 'text');
    expect(textLayers.length).toBeGreaterThan(5);

    const titleLayer = textLayers.find((l) => l.text === 'KIBRIS TURLARI');
    expect(titleLayer).toBeDefined();

    const priceLayer = textLayers.find((l) => l.text?.includes('25.249 TL'));
    expect(priceLayer).toBeDefined();
  });
});
