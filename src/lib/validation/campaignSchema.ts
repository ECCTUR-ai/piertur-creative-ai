import { z } from 'zod';

export const campaignFormSchema = z.object({
  title: z
    .string()
    .min(2, { message: 'Kampanya başlığı en az 2 karakter olmalıdır.' })
    .max(50, { message: 'Kampanya başlığı en fazla 50 karakter olabilir.' }),
  subtitle: z
    .string()
    .min(2, { message: 'Alt başlık en az 2 karakter olmalıdır.' })
    .max(80, { message: 'Alt başlık en fazla 80 karakter olabilir.' }),
  hotelName: z.string().optional(),
  boardType: z.string().optional(),
  badgeText: z.string().optional(),
  nights: z.number().min(1, { message: 'Gece sayısı en az 1 olmalıdır.' }).max(30),
  days: z.number().min(1, { message: 'Gün sayısı en az 1 olmalıdır.' }).max(31),
  price: z.number().min(1, { message: 'Geçerli bir fiyat giriniz.' }),
  currency: z.enum(['TL', 'EUR', 'USD']),
  pricePrefix: z.string().max(30),
  priceSuffix: z.string().max(60),
  departureCities: z
    .array(z.string())
    .min(1, { message: 'En az bir çıkış şehri seçiniz.' }),
  tags: z
    .array(z.string())
    .min(1, { message: 'En az bir kampanya avantajı ekleyiniz.' }),
  ctaText: z.string().min(2, { message: 'CTA butonu yazısı gereklidir.' }),
  ctaUrl: z.string().url({ message: 'Geçerli bir URL giriniz.' }),
  backgroundImageUrl: z.string().optional(),
});

export type CampaignFormData = z.infer<typeof campaignFormSchema>;

export const defaultCampaignData: CampaignFormData = {
  title: 'Uludağ Konaklamalı Tur',
  subtitle: "Türkiye'nin En Sevilen Kayak ve Kış Tatil Rotası",
  hotelName: 'Beceren Otel',
  boardType: 'Yarım Pansiyon',
  badgeText: 'SON DAKİKA FIRSATI',
  nights: 2,
  days: 3,
  price: 25249,
  currency: 'TL',
  pricePrefix: 'Kişi Başı',
  priceSuffix: "'den başlayan fiyatlarla",
  departureCities: ['İstanbul', 'Ankara', 'İzmir', 'Bursa'],
  tags: [
    'Kayak Pistlerine Yakın',
    'Yemek İmkanı',
    'Ulaşım Dahil',
    'Seyahat Sigortası',
    '7/24 Destek',
  ],
  ctaText: 'HEMEN REZERVASYON YAP',
  ctaUrl: 'https://piertur.com',
  backgroundImageUrl:
    'https://images.unsplash.com/photo-1551524559-8af4e6624178?auto=format&fit=crop&w=1080&q=80',
};
