/**
 * Centralized OpenAI GPT Image Creative Prompt Builder for Piertur Creative AI
 * Generates dynamic art-directed prompts using the Creative Intelligence Layer.
 */

import { analyzeCampaignContext, CreativePayload } from './creativeIntelligence';

export type { CreativePayload };

export function buildPriceHeroPrompt(payload: CreativePayload): string {
  const ctx = analyzeCampaignContext(payload.campaignTitle, payload.benefits, payload.campaignBadge);

  return `
Transform the supplied destination photograph (${payload.campaignTitle}) into an agency-grade premium Turkish travel advertising composition.
Preserve the actual destination and photographic identity.
Destination Mood: ${ctx.visualMood}.
Lighting: ${ctx.lightingStyle}.
Color Accents: Piertur Navy (#082E63), Warm Gold (#FFB21C), Conversion Red (#E31C24), White (#FFFFFF).

Create sophisticated commercial art direction suitable for a major travel operator's Instagram Story campaign.
Use full-bleed cinematic destination photography, premium lighting, depth, sophisticated navy/gold/red visual accents and integrated promotional geometry.
The final composition should feel designed by a senior advertising art director, not a web designer.
Create intentional negative-space zones for headline, hotel information, price, campaign badge, CTA and footer.

CRITICAL NEGATIVE DIRECTIVES:
- Do not render any text.
- Do not render logos.
- Do not render prices.
- Do not invent typography.
- Do not generate watermarks.
- Avoid UI cards, dashboard aesthetics, generic rounded rectangles, web buttons and SaaS visual language.

The photograph must remain visually dominant.
Style: premium commercial travel campaign, high conversion, sophisticated but energetic, Turkish tourism advertising, editorial-meets-performance-marketing.
`.trim();
}

export function buildDestinationHeroPrompt(payload: CreativePayload): string {
  const ctx = analyzeCampaignContext(payload.campaignTitle, payload.benefits, payload.campaignBadge);

  return `
Transform the supplied destination photograph (${payload.campaignTitle}) into a high-end luxury editorial travel magazine advertisement background.
Destination Mood: ${ctx.visualMood}, cinematic atmosphere, expansive negative space, high-fashion travel photography styling.
Lighting: ${ctx.lightingStyle}, subtle lens flare, deep cinematic contrast.
Color Palette: Deep Piertur Navy (#082E63), Champagne Gold (#FFB21C), Soft White.

CRITICAL NEGATIVE DIRECTIVES:
- Do not render any text.
- Do not render logos.
- Do not render prices.
- Do not invent typography.
- Do not generate watermarks.
`.trim();
}

export function buildCampaignHeroPrompt(payload: CreativePayload): string {
  const ctx = analyzeCampaignContext(payload.campaignTitle, payload.benefits, payload.campaignBadge);

  return `
Transform the supplied destination photograph (${payload.campaignTitle}) into an urgent flash-deal promotional tourism campaign advertisement background.
Destination Mood: ${ctx.visualMood}, high-energy promotional advertising, dynamic speed lines, urgent campaign badging area.
Lighting: ${ctx.lightingStyle}, high contrast commercial lighting.
Color Palette: Bold Red (#E31C24), Electric Gold (#FFB21C), Deep Navy (#082E63).

CRITICAL NEGATIVE DIRECTIVES:
- Do not render any text.
- Do not render logos.
- Do not render prices.
- Do not invent typography.
- Do not generate watermarks.
`.trim();
}
