/**
 * Centralized OpenAI GPT Image Creative Prompt Builder for Piertur Creative AI
 * Generates 3 distinct art-directed prompts using the Creative Intelligence Layer.
 */

import { analyzeCampaignContext, CreativePayload } from './creativeIntelligence';

export type { CreativePayload };

export function buildPriceHeroPrompt(payload: CreativePayload): string {
  const ctx = analyzeCampaignContext(payload.campaignTitle, payload.benefits, payload.campaignBadge);

  return `
Create a complete agency-grade conversion-focused social media advertising background based on the supplied photograph (${payload.campaignTitle}).
Destination Mood: ${ctx.visualMood}.
Lighting: ${ctx.lightingStyle}.
Color Palette: Piertur Navy (#082E63), Warm Gold (#FFB21C), Conversion Red (#E31C24), White (#FFFFFF).

Art Direction Requirements:
- Transform the photography into a high-converting Turkish tour operator commercial story campaign.
- Maintain subject-safe composition where the upper top area is dark and clean for destination title overlays, and the lower bottom area has atmospheric dark navy vignetting for price typography callouts.
- Add subtle diagonal geometric graphic lines in navy and gold.
- CRITICAL RULES: No fake text, no fake logos, no fake price numbers, no random hotel labels. Clean safe-zones reserved for precision typography.
`.trim();
}

export function buildDestinationHeroPrompt(payload: CreativePayload): string {
  const ctx = analyzeCampaignContext(payload.campaignTitle, payload.benefits, payload.campaignBadge);

  return `
Create a high-end luxury editorial travel magazine advertisement background based on the supplied photograph (${payload.campaignTitle}).
Destination Mood: ${ctx.visualMood}, cinematic atmosphere, expansive negative space, high-fashion travel photography styling.
Lighting: ${ctx.lightingStyle}, subtle lens flare, deep cinematic contrast.
Color Palette: Deep Piertur Navy (#082E63), Champagne Gold (#FFB21C), Soft White.

Art Direction Requirements:
- Photography-first editorial layout. Destination is the hero.
- Clean typography safe-zones at top third and bottom quarter.
- CRITICAL RULES: No fake text, no fake logos, no fake price numbers. Clean safe-zones reserved for precision typography.
`.trim();
}

export function buildCampaignHeroPrompt(payload: CreativePayload): string {
  const ctx = analyzeCampaignContext(payload.campaignTitle, payload.benefits, payload.campaignBadge);

  return `
Create an urgent flash-deal promotional tourism campaign advertisement background based on the supplied photograph (${payload.campaignTitle}).
Destination Mood: ${ctx.visualMood}, high-energy promotional advertising, dynamic speed lines, urgent campaign badging area.
Lighting: ${ctx.lightingStyle}, high contrast commercial lighting.
Color Palette: Bold Red (#E31C24), Electric Gold (#FFB21C), Deep Navy (#082E63).

Art Direction Requirements:
- Promotion-first campaign layout with energetic diagonal badging geometries at top right and bottom CTA zone.
- Photography remains visible and vibrant through the center.
- CRITICAL RULES: No fake text, no fake logos, no fake price numbers. Clean safe-zones reserved for precision typography.
`.trim();
}
