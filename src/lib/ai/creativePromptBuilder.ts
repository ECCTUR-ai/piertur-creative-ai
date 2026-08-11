/**
 * Centralized OpenAI Creative Prompt Builder for Piertur Creative AI
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
}

const BRAND_CONTEXT = `
Brand: Piertur (Premium Turkish Travel Operator & Creative AI Studio).
Visual Guidelines:
- Primary Color: Deep Corporate Navy Blue (#082E63)
- Accent Colors: Warm Sun Yellow (#FFB21C), Crisp White (#FFFFFF), Limited High-Impact Red (#E31C24)
- Aspect Ratio: 9:16 Vertical Story / Reels Ad Format (1080x1920 px)
- Aesthetic: Modern editorial travel operator social media advertisement, clean layered ad shapes, smooth gradient overlays, contrast vignette for readability.
- CRITICAL DESIGNATED ZONES: Leave top 20% clear for headline overlay, middle 40% for hero destination photo, lower 30% for price card frame, bottom 10% for CTA & footer.
- Avoid: Generic Canva placeholders, illegible gibberish text, fake logos, cluttered neon, cheap clip-art.
`;

export function buildPriceHeroPrompt(payload: CreativePayload): string {
  return `
Create a high-converting 9:16 social media travel ad background composition for Piertur.
Destination/Tour: ${payload.campaignTitle}
Hotel: ${payload.hotelName || 'Lüks Otel'} (${payload.nights} Gece / ${payload.days} Gün)
Focus: PRICE HERO VARIANT (Variant A)
Prominently structure a sleek deep navy card frame in the lower third reserved for price callout.
Include rich layered background artwork based on ${payload.campaignTitle} destination with soft dark vignette at top and bottom.
${BRAND_CONTEXT}
`.trim();
}

export function buildDestinationHeroPrompt(payload: CreativePayload): string {
  return `
Create an editorial travel magazine 9:16 social media ad background composition for Piertur.
Destination/Tour: ${payload.campaignTitle}
Focus: DESTINATION HERO VARIANT (Variant B)
The background photo of ${payload.campaignTitle} is dominant, expansive, and breathtaking.
Minimal dark vignette overlay at bottom for title readability, floating subtle luxury price pill frame.
${BRAND_CONTEXT}
`.trim();
}

export function buildCampaignHeroPrompt(payload: CreativePayload): string {
  return `
Create an urgent flash-deal campaign 9:16 social media ad background composition for Piertur.
Badge: ${payload.campaignBadge || 'SON DAKİKA FIRSATI'}
Destination/Tour: ${payload.campaignTitle}
Focus: CAMPAIGN HERO VARIANT (Variant C)
Top red ribbon banner frame for campaign alert, bold high-impact red CTA button frame at bottom, vibrant gold and deep navy accent geometry.
${BRAND_CONTEXT}
`.trim();
}
