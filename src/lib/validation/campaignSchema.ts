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
  title: 'KIBRIS TURLARI',
  subtitle: "Akdeniz'in En Gözde Rotası!",
  nights: 3,
  days: 4,
  price: 25249,
  currency: 'TL',
  pricePrefix: 'Kişi Başı',
  priceSuffix: "'den başlayan fiyatlarla",
  departureCities: ['İstanbul', 'Ankara', 'İzmir', 'Adana'],
  tags: [
    'Vade Farksız Taksit',
    'Kupon Fırsatı',
    '5★ Otel Seçeneği',
    'Direkt Uçuş',
    'Erken Rezervasyon',
    '7/24 Destek',
  ],
  ctaText: 'HEMEN İNCELE',
  ctaUrl: 'https://piertur.com',
  backgroundImageUrl:
    'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1080&q=80',
};
