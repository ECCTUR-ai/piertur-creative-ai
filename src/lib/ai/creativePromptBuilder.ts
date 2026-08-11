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
Preserve the actual destination, mountain geometry, ski slopes, buildings, chairlifts and general photographic identity of the supplied image. Transform it into an agency-grade premium Turkish travel advertising art direction. Do not replace the location (${payload.campaignTitle}). Do not invent another hotel (${payload.hotelName || 'Beceren Otel'}). Do not render logos or final commercial text. Create graphic depth, navy (#082E63)/yellow (#FFB21C)/red (#E31C24) advertising accents and clean safe zones for deterministic typography overlays.
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
