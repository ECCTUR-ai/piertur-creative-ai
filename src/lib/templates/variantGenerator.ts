import { CampaignInfo, DesignModel } from '@/types';
import { generateCyprusPriceFocusedCanvas } from './cyprus-price-focused';
import { generateCyprusDestinationFocusedCanvas } from './cyprus-destination-focused';
import { generateCyprusLastminuteCanvas } from './cyprus-lastminute';
import { generateId } from '../utils/formatters';

export function generateAllVariants(campaign: CampaignInfo): DesignModel[] {
  const bgUrl =
    campaign.backgroundImageUrl ||
    'https://images.unsplash.com/photo-1551524559-8af4e6624178?auto=format&fit=crop&w=1080&q=80';

  const variant1: DesignModel = {
    id: generateId() + '_price',
    name: `${campaign.title} - Fiyat Odaklı`,
    type: 'TUR',
    format: 'IG_STORY',
    width: 1080,
    height: 1920,
    thumbnail: bgUrl,
    campaignData: campaign,
    canvasData: generateCyprusPriceFocusedCanvas(campaign),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    variantType: 'PRICE_FOCUSED',
  };

  const variant2: DesignModel = {
    id: generateId() + '_dest',
    name: `${campaign.title} - Destinasyon Odaklı`,
    type: 'TUR',
    format: 'IG_STORY',
    width: 1080,
    height: 1920,
    thumbnail: bgUrl,
    campaignData: campaign,
    canvasData: generateCyprusDestinationFocusedCanvas(campaign),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    variantType: 'DESTINATION_FOCUSED',
  };

  const variant3: DesignModel = {
    id: generateId() + '_deal',
    name: `${campaign.title} - Fırsat Odaklı`,
    type: 'TUR',
    format: 'IG_STORY',
    width: 1080,
    height: 1920,
    thumbnail: bgUrl,
    campaignData: campaign,
    canvasData: generateCyprusLastminuteCanvas(campaign),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    variantType: 'DEAL_FOCUSED',
  };

  return [variant1, variant2, variant3];
}
