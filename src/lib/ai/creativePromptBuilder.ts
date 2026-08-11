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
}

const BRAND_CONTEXT = `
Brand Context: Piertur (Premium Turkish Travel Operator & Creative AI Studio).
Visual Guidelines:
- Primary Color: Deep Corporate Navy Blue (#082E63)
- Accent Colors: Warm Sun Yellow (#FFB21C), Crisp White (#FFFFFF), Limited High-Impact Red (#E31C24)
- Aspect Ratio: 9:16 Vertical Story / Reels Ad Format (1080x1920 px)
- Art Direction: High-end social media travel advertising artwork, rich layered shapes, smooth lighting, contrast vignette.
- CRITICAL INSTRUCTION FOR AI IMAGE ENGINE: DO NOT RENDER ANY TEXT, TYPOGRAPHY, LETTERS, OR FAKE BRAND LOGOS. LEAVE CLEAN DESIGNATED GRAPHIC SAFE-ZONES FOR OVERLAY COMPOSITOR.
`;

export function buildPriceHeroPrompt(payload: CreativePayload): string {
  return `
Create a high-converting 9:16 social media travel ad background composition for Piertur.
Destination/Tour Focus: ${payload.campaignTitle} (${payload.hotelName || 'Lüks Otel'})
Variant: PRICE HERO (Variant A)
Prominently structure a sleek deep navy card frame in the lower third reserved for price callout overlay.
Preserve the authentic atmosphere of ${payload.campaignTitle} destination with soft dark readability vignette at top and bottom.
${BRAND_CONTEXT}
`.trim();
}

export function buildDestinationHeroPrompt(payload: CreativePayload): string {
  return `
Create an editorial travel magazine 9:16 social media ad background composition for Piertur.
Destination/Tour Focus: ${payload.campaignTitle}
Variant: DESTINATION HERO (Variant B)
The background imagery of ${payload.campaignTitle} is dominant, expansive, and breathtaking.
Minimal dark vignette overlay at bottom, floating subtle luxury frame zone.
${BRAND_CONTEXT}
`.trim();
}

export function buildCampaignHeroPrompt(payload: CreativePayload): string {
  return `
Create an urgent flash-deal campaign 9:16 social media ad background composition for Piertur.
Badge Concept: ${payload.campaignBadge || 'SON DAKİKA FIRSATI'}
Destination/Tour Focus: ${payload.campaignTitle}
Variant: CAMPAIGN HERO (Variant C)
Top red ribbon banner frame, bold high-impact red CTA button frame zone at bottom, vibrant gold and deep navy accent geometry.
${BRAND_CONTEXT}
`.trim();
}
