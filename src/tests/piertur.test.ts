import { describe, it, expect } from 'vitest';
import { defaultCampaignData } from '../lib/validation/campaignSchema';
import { formatPrice, formatCurrencySymbol } from '../lib/utils/formatters';
import { analyzeCampaignContext } from '../lib/ai/creativeIntelligence';
import {
  buildPriceHeroPrompt,
  buildDestinationHeroPrompt,
  buildCampaignHeroPrompt,
} from '../lib/ai/creativePromptBuilder';
import { generateCyprusPriceFocusedCanvas } from '../lib/templates/cyprus-price-focused';
import { generateCyprusDestinationFocusedCanvas } from '../lib/templates/cyprus-destination-focused';
import { generateCyprusLastminuteCanvas } from '../lib/templates/cyprus-lastminute';
import { BrandRepository } from '../lib/storage/brandRepository';

describe('Piertur Final GPT Image 2 Creative Director Architecture Tests', () => {
  it('should analyze Uludağ ski campaign context using Creative Intelligence Layer', () => {
    const analysis = analyzeCampaignContext('Uludağ Konaklamalı Tur', ['Kayak Pistlerine Yakın'], 'Son Dakika FIRSATI');
    expect(analysis.destinationType).toBe('ski');
    expect(analysis.visualMood).toContain('alpine winter');
  });

  it('should generate 3 distinct prompts for PRICE HERO, DESTINATION HERO, and CAMPAIGN HERO', () => {
    const payload = {
      campaignTitle: 'Uludağ Konaklamalı Tur',
      hotelName: 'Beceren Otel',
      nights: 2,
      days: 3,
      price: 25249,
      departureCities: ['İstanbul', 'Ankara', 'İzmir', 'Bursa'],
      benefits: ['Kayak Pistlerine Yakın'],
    };

    const prompt1 = buildPriceHeroPrompt(payload);
    const prompt2 = buildDestinationHeroPrompt(payload);
    const prompt3 = buildCampaignHeroPrompt(payload);

    expect(prompt1).toContain('conversion-focused');
    expect(prompt2).toContain('luxury editorial travel magazine');
    expect(prompt3).toContain('flash-deal promotional tourism campaign');
  });

  it('should build valid 1080x1920 canvas layers for all 3 variant compositors', () => {
    const canvas1 = generateCyprusPriceFocusedCanvas(defaultCampaignData);
    const canvas2 = generateCyprusDestinationFocusedCanvas(defaultCampaignData);
    const canvas3 = generateCyprusLastminuteCanvas(defaultCampaignData);

    expect(canvas1.elements.length).toBeGreaterThan(10);
    expect(canvas2.elements.length).toBeGreaterThan(5);
    expect(canvas3.elements.length).toBeGreaterThan(5);

    const priceFormatted = `${formatPrice(defaultCampaignData.price)} ${formatCurrencySymbol(
      defaultCampaignData.currency
    )}`;
    expect(priceFormatted).toBe('25.249 TL');
  });

  it('should manage BrandKit transparent logo state via BrandRepository', () => {
    const kit = BrandRepository.saveBrandKit({ logoUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==' });
    expect(kit.logoUrl).toContain('data:image/png');
  });
});
