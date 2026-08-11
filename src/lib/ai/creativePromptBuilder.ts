/**
 * Centralized OpenAI GPT Image Creative Prompt Builder for Piertur Creative AI
 */

export interface CreativePayload {
  campaignType?: string;
  campaignTitle: string;
  subtitle?: string;
  hotelName?: string;
  nights: number;
  days: number;
  boardType?: string;
  price: number;
  currency?: string;
  pricePrefix?: string;
  priceSuffix?: string;
  departureCities: string[];
  benefits: string[];
  campaignBadge?: string;
  cta?: string;
  website?: string;
  uploadedImage?: string;
  strictMode?: boolean;
  singleVariantOnly?: boolean;
}

export function buildPriceHeroPrompt(payload: CreativePayload): string {
  return `
Preserve the actual destination, mountain geometry, ski slopes, buildings, chairlifts and general photographic identity of the supplied image (${payload.campaignTitle}).
Transform it into: premium Turkish tour operator advertising, agency-grade social media campaign, sophisticated travel editorial composition, full bleed destination photography, layered navy (#082E63) / warm yellow (#FFB21C) / controlled red (#E31C24) graphic accents, subtle diagonal graphic forms, premium depth and lighting, sophisticated negative space, strong visual hierarchy, modern travel advertising.
CRITICAL INSTRUCTION: Clean areas reserved for real typography. No fake logo. No fake text. No fake prices. No random hotel names.
`.trim();
}

export function buildDestinationHeroPrompt(payload: CreativePayload): string {
  return `
Preserve the natural scenery and photographic identity of the supplied image (${payload.campaignTitle}). Transform it into an editorial travel magazine 9:16 advertisement artwork. Do not render any logos, text, or letters. Create clean typography safe-zones.
`.trim();
}

export function buildCampaignHeroPrompt(payload: CreativePayload): string {
  return `
Preserve the key photographic subjects of the supplied image (${payload.campaignTitle}). Transform it into an urgent flash-deal campaign advertisement background with bold red and yellow accent geometry. Do not render logos or typography.
`.trim();
}
