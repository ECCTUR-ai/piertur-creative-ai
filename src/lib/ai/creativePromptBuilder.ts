/**
 * Centralized OpenAI GPT Image Creative Prompt Builder for Piertur Creative AI
 * Generates dynamic art-directed prompts using the Creative Intelligence Layer.
 */

import { analyzeCampaignContext, CreativePayload } from './creativeIntelligence';

export type { CreativePayload };

export function buildPriceHeroPrompt(payload: CreativePayload): string {
  const ctx = analyzeCampaignContext(payload.campaignTitle, payload.benefits, payload.campaignBadge);

  return `
Transform the supplied ${payload.campaignTitle} destination photograph into a premium agency-grade Turkish travel advertising composition for Instagram Story.

Preserve the authentic ${payload.campaignTitle} destination and photographic identity.
Destination Mood: ${ctx.visualMood}.
Lighting: ${ctx.lightingStyle}.
Color Accents: Piertur Navy (#082E63), Warm Gold (#FFB21C), Conversion Red (#E31C24), White (#FFFFFF).

Create a sophisticated full-bleed commercial travel campaign visual with cinematic atmosphere, dimensional lighting, premium editorial composition and strong depth.
The photograph must remain dominant across the entire canvas.

CRITICAL VISUAL DIRECTIVES:
- Do NOT divide the photograph into horizontal sections.
- Do NOT create website cards, dashboard panels, UI boxes, pricing cards or app interface elements.
- Create intentional negative space for a large destination headline in the upper-left/upper-middle region and a large price statement in the lower-middle region.
- Integrate subtle Piertur navy, yellow and red visual accents into the photography using gradients, elegant geometric shapes and campaign-style graphic direction.
- The result should look like a professionally art-directed travel agency campaign created by a senior advertising designer.

CRITICAL NEGATIVE DIRECTIVES:
- No logos.
- No fake brands.
- No readable text.
- No generated typography.
- No price.
- Leave sophisticated clean typography-safe areas for deterministic overlays.
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
