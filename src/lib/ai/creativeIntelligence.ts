/**
 * Creative Intelligence Layer for Piertur Creative AI
 * Analyzes campaign input and determines destination archetype, visual mood, and art-direction strategy.
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

export interface CreativeAnalysis {
  destinationType: 'ski' | 'beach' | 'cultural' | 'city' | 'mice' | 'general';
  visualMood: string;
  lightingStyle: string;
  colorAccents: string;
  priceImportance: 'high' | 'medium';
  urgency: 'high' | 'medium';
}

export function analyzeCampaignContext(campaignTitle: string, tags: string[] = [], badgeText = ''): CreativeAnalysis {
  const titleLower = campaignTitle.toLowerCase();
  const tagsStr = tags.join(' ').toLowerCase();
  const badgeLower = badgeText.toLowerCase();

  // Ski / Winter Alpine
  if (
    titleLower.includes('uludağ') ||
    titleLower.includes('kayak') ||
    titleLower.includes('palandöken') ||
    titleLower.includes('kartalkaya') ||
    tagsStr.includes('kayak')
  ) {
    return {
      destinationType: 'ski',
      visualMood: 'alpine winter snowy mountain atmosphere, energetic ski slope commercial lighting',
      lightingStyle: 'crisp alpine sunlight on fresh snow with deep blue sky shadows',
      colorAccents: 'Piertur navy (#082E63), warm gold (#FFB21C), vivid red (#E31C24)',
      priceImportance: 'high',
      urgency: badgeLower.includes('dakika') || badgeLower.includes('fırsat') ? 'high' : 'medium',
    };
  }

  // Beach / Island / Resort
  if (
    titleLower.includes('kıbrıs') ||
    titleLower.includes('antalya') ||
    titleLower.includes('bodrum') ||
    titleLower.includes('fethiye') ||
    tagsStr.includes('deniz') ||
    tagsStr.includes('plaj')
  ) {
    return {
      destinationType: 'beach',
      visualMood: 'turquoise Mediterranean coastal luxury, sun-drenched golden hour resort energy',
      lightingStyle: 'warm golden hour sun flare with deep cyan water contrasts',
      colorAccents: 'deep azure navy (#082E63), tropical yellow (#FFB21C), coral red (#E31C24)',
      priceImportance: 'high',
      urgency: 'medium',
    };
  }

  // Cultural / Heritage / Excursion
  if (titleLower.includes('kapadokya') || titleLower.includes('karadeniz') || titleLower.includes('GAP') || titleLower.includes('tur')) {
    return {
      destinationType: 'cultural',
      visualMood: 'historic landscape magazine editorial, majestic landscape framing',
      lightingStyle: 'dramatic sunset horizon lighting with rich warm earth tones',
      colorAccents: 'navy (#082E63), terracotta gold (#FFB21C), crimson (#E31C24)',
      priceImportance: 'medium',
      urgency: 'medium',
    };
  }

  // MICE / Corporate Event
  if (titleLower.includes('kongre') || titleLower.includes('mice') || titleLower.includes('toplantı')) {
    return {
      destinationType: 'mice',
      visualMood: 'high-end executive conference, modern architectural glass and steel sophistication',
      lightingStyle: 'sleek indoor ambient lighting with crisp spotlight highlights',
      colorAccents: 'royal navy (#082E63), metallic gold (#FFB21C)',
      priceImportance: 'medium',
      urgency: 'medium',
    };
  }

  // Default General Tourism
  return {
    destinationType: 'general',
    visualMood: 'premium commercial travel photography, vibrant agency-grade social media composition',
    lightingStyle: 'bright commercial daytime lighting with rich saturation',
    colorAccents: 'Piertur navy (#082E63), warm yellow (#FFB21C), vibrant red (#E31C24)',
    priceImportance: 'high',
    urgency: 'medium',
  };
}
