import { TemplateModel } from '@/types';
import { generateCyprusPriceFocusedCanvas } from './cyprus-price-focused';
import { generateCyprusDestinationFocusedCanvas } from './cyprus-destination-focused';
import { generateCyprusPremiumCanvas } from './cyprus-premium';
import { generateCyprusLastminuteCanvas } from './cyprus-lastminute';
import { generateCyprusMinimalCanvas } from './cyprus-minimal';

export const templatesList: TemplateModel[] = [
  {
    id: 'template-01-price-focused',
    name: 'Template 01: Fiyat Odaklı',
    tagline: 'Kıbrıs Reklam Kampanyaları için Özel Tasarım',
    category: 'Tur',
    badge: 'Öne Çıkan Ajans Şablonu',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=400&q=80',
    defaultBgUrl:
      'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1080&q=80',
    generateCanvasData: generateCyprusPriceFocusedCanvas,
  },
  {
    id: 'template-02-destination-focused',
    name: 'Template 02: Destinasyon Odaklı',
    tagline: 'Görsel Ağırlıklı Tatil ve Sahil Teması',
    category: 'Tur',
    badge: 'Popüler',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80',
    defaultBgUrl:
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1080&q=80',
    generateCanvasData: generateCyprusDestinationFocusedCanvas,
  },
  {
    id: 'template-03-premium',
    name: 'Template 03: Premium',
    tagline: '5 Yıldızlı Otel ve Lüks Konaklama Tasarımı',
    category: 'Otel',
    badge: 'Lüks',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=400&q=80',
    defaultBgUrl:
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1080&q=80',
    generateCanvasData: generateCyprusPremiumCanvas,
  },
  {
    id: 'template-04-last-minute',
    name: 'Template 04: Son Dakika / Fırsat',
    tagline: 'Acil İndirim ve Kontenjan Kampanyaları',
    category: 'Kampanya',
    badge: 'Acil Fırsat',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1512100356356-de1b84283e18?auto=format&fit=crop&w=400&q=80',
    defaultBgUrl:
      'https://images.unsplash.com/photo-1512100356356-de1b84283e18?auto=format&fit=crop&w=1080&q=80',
    generateCanvasData: generateCyprusLastminuteCanvas,
  },
  {
    id: 'template-05-minimal',
    name: 'Template 05: Minimal',
    tagline: 'Sade, Modern ve Net Tipografik Tasarım',
    category: 'Kampanya',
    badge: 'Sade',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&w=400&q=80',
    defaultBgUrl:
      'https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&w=1080&q=80',
    generateCanvasData: generateCyprusMinimalCanvas,
  },
];

export function getTemplateById(id: string): TemplateModel {
  return templatesList.find((t) => t.id === id) || templatesList[0];
}
