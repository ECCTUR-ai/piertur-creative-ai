export type ContentType = 'TUR' | 'OTEL' | 'MICE' | 'KAMPANYA';

export type FormatType = 'IG_STORY' | 'IG_POST' | 'SQUARE_POST';

export interface FormatConfig {
  id: FormatType;
  name: string;
  width: number;
  height: number;
  aspectRatio: string;
  description: string;
}

export interface CampaignInfo {
  title: string;
  subtitle: string;
  nights: number;
  days: number;
  price: number;
  currency: 'TL' | 'EUR' | 'USD';
  pricePrefix: string;
  priceSuffix: string;
  departureCities: string[];
  tags: string[];
  ctaText: string;
  ctaUrl: string;
  backgroundImageUrl?: string;
}

export type LayerObjectType = 'text' | 'rect' | 'image' | 'badge' | 'logo' | 'price-card' | 'tag-group';

export interface CanvasLayer {
  id: string;
  name: string;
  type: LayerObjectType;
  x: number;
  y: number;
  width?: number;
  height?: number;
  text?: string;
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: string;
  textAlign?: 'left' | 'center' | 'right';
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  opacity?: number;
  letterSpacing?: number;
  lineHeight?: number;
  borderRadius?: number;
  src?: string;
  locked?: boolean;
  visible?: boolean;
  zIndex?: number;
  // Specific properties for photos/effects
  brightness?: number;
  contrast?: number;
  fit?: 'cover' | 'contain' | 'fill';
}

export interface CanvasData {
  backgroundColor: string;
  elements: CanvasLayer[];
}

export interface DesignModel {
  id: string;
  name: string;
  type: ContentType;
  format: FormatType;
  width: number;
  height: number;
  thumbnail: string;
  campaignData: CampaignInfo;
  canvasData: CanvasData;
  createdAt: string;
  updatedAt: string;
}

export interface TemplateModel {
  id: string;
  name: string;
  tagline: string;
  category: string;
  badge?: string;
  thumbnailUrl: string;
  defaultBgUrl: string;
  generateCanvasData: (campaign: CampaignInfo) => CanvasData;
}

export interface BrandKit {
  logoUrl: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  goldColor: string;
  fontFamily: string;
  website: string;
  phone: string;
  instagram: string;
}
