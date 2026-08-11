/**
 * Smart Typography & Line Breaking Service for Piertur Creative AI
 */

export interface FormattedHeadline {
  primary: string;
  secondary: string;
  primaryFontSize: number;
  secondaryFontSize: number;
}

export function formatSmartTitle(rawTitle: string): FormattedHeadline {
  const cleaned = rawTitle.trim().toUpperCase();

  // Keyword extraction logic
  const keywords = ['TURU', 'TURLARI', 'PAKETİ', 'FIRSATI', 'OTELİ', 'OTELLERİ', 'KONAKLAMALI'];
  let primary = cleaned;
  let secondary = '';

  // Check if title has multiple words
  const words = cleaned.split(/\s+/);

  if (words.length > 1) {
    // If first word is destination (e.g., ULUDAĞ, KIBRIS, ANTALYA, GAP)
    primary = words[0];
    secondary = words.slice(1).join(' ');
  }

  // Calculate dynamic font sizes
  let primaryFontSize = 100;
  if (primary.length > 10) {
    primaryFontSize = 74;
  } else if (primary.length > 7) {
    primaryFontSize = 88;
  }

  let secondaryFontSize = 48;
  if (secondary.length > 20) {
    secondaryFontSize = 36;
  } else if (secondary.length > 15) {
    secondaryFontSize = 42;
  }

  return {
    primary,
    secondary,
    primaryFontSize,
    secondaryFontSize,
  };
}
