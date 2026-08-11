import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import {
  buildPriceHeroPrompt,
  buildDestinationHeroPrompt,
  buildCampaignHeroPrompt,
  CreativePayload,
} from '@/lib/ai/creativePromptBuilder';
import { generateAllVariants } from '@/lib/templates/variantGenerator';
import { CampaignInfo } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const payload: CreativePayload = body.payload || body;
    const requestedVariant = body.variant as 'PRICE_FOCUSED' | 'DESTINATION_FOCUSED' | 'DEAL_FOCUSED' | undefined;

    const apiKey = process.env.OPENAI_API_KEY;

    // Convert CreativePayload to CampaignInfo for canvas rendering
    const campaignInfo: CampaignInfo = {
      title: payload.campaignTitle || 'Uludağ Konaklamalı Tur',
      subtitle: payload.subtitle || "Türkiye'nin En Sevilen Kayak Rotası",
      hotelName: payload.hotelName || 'Beceren Otel',
      boardType: payload.boardType || 'Yarım Pansiyon',
      badgeText: payload.campaignBadge || 'SON DAKİKA FIRSATI',
      nights: payload.nights || 2,
      days: payload.days || 3,
      price: payload.price || 25249,
      currency: (payload.currency as 'TL' | 'EUR' | 'USD') || 'TL',
      pricePrefix: payload.pricePrefix || 'Kişi Başı',
      priceSuffix: payload.priceSuffix || "'den başlayan fiyatlarla",
      departureCities: payload.departureCities || ['İstanbul', 'Ankara', 'İzmir', 'Bursa'],
      tags: payload.benefits || [
        'Kayak Pistlerine Yakın',
        'Yemek İmkanı',
        'Ulaşım Dahil',
        'Seyahat Sigortası',
        '7/24 Destek',
      ],
      ctaText: payload.cta || 'HEMEN REZERVASYON YAP',
      ctaUrl: payload.website || 'https://piertur.com',
      backgroundImageUrl: payload.uploadedImage,
    };

    // If OPENAI_API_KEY is missing, gracefully use Master Template Fallback Engine
    if (!apiKey || apiKey.trim() === '') {
      const fallbackVariants = generateAllVariants(campaignInfo);

      return NextResponse.json({
        success: true,
        fallback: true,
        message: 'AI servisine ulaşılamadı (API Key yapılandırılmadı). Kurumsal şablon kullanılarak tasarım oluşturuldu.',
        variants: fallbackVariants,
      });
    }

    // Initialize official OpenAI SDK
    const openai = new OpenAI({ apiKey });
    const model = process.env.OPENAI_IMAGE_MODEL || 'dall-e-3';

    // If single variant requested for regeneration
    if (requestedVariant) {
      let prompt = buildPriceHeroPrompt(payload);
      if (requestedVariant === 'DESTINATION_FOCUSED') prompt = buildDestinationHeroPrompt(payload);
      if (requestedVariant === 'DEAL_FOCUSED') prompt = buildCampaignHeroPrompt(payload);

      const response = await openai.images.generate({
        model,
        prompt,
        n: 1,
        size: '1024x1792', // Closest to 9:16 vertical story
        quality: 'standard',
      });

      const imageUrl = response?.data?.[0]?.url || payload.uploadedImage;
      const updatedCampaign = { ...campaignInfo, backgroundImageUrl: imageUrl };
      const allVariants = generateAllVariants(updatedCampaign);
      const targetVariant = allVariants.find((v) => v.variantType === requestedVariant) || allVariants[0];

      return NextResponse.json({
        success: true,
        fallback: false,
        variant: targetVariant,
      });
    }

    // Generate 3 AI Prompts
    const promptPrice = buildPriceHeroPrompt(payload);
    const promptDest = buildDestinationHeroPrompt(payload);
    const promptDeal = buildCampaignHeroPrompt(payload);

    // Call OpenAI API for the 3 variants concurrently
    const [resPrice, resDest, resDeal] = await Promise.allSettled([
      openai.images.generate({ model, prompt: promptPrice, n: 1, size: '1024x1792', quality: 'standard' }),
      openai.images.generate({ model, prompt: promptDest, n: 1, size: '1024x1792', quality: 'standard' }),
      openai.images.generate({ model, prompt: promptDeal, n: 1, size: '1024x1792', quality: 'standard' }),
    ]);

    const urlPrice = resPrice.status === 'fulfilled' ? resPrice.value?.data?.[0]?.url : undefined;
    const urlDest = resDest.status === 'fulfilled' ? resDest.value?.data?.[0]?.url : undefined;
    const urlDeal = resDeal.status === 'fulfilled' ? resDeal.value?.data?.[0]?.url : undefined;

    const baseVariants = generateAllVariants(campaignInfo);

    if (urlPrice) {
      baseVariants[0].thumbnail = urlPrice;
      const bgLayer = baseVariants[0].canvasData.elements.find((el) => el.id === 'bg-image');
      if (bgLayer) bgLayer.src = urlPrice;
    }
    if (urlDest) {
      baseVariants[1].thumbnail = urlDest;
      const bgLayer = baseVariants[1].canvasData.elements.find((el) => el.id === 'bg-image');
      if (bgLayer) bgLayer.src = urlDest;
    }
    if (urlDeal) {
      baseVariants[2].thumbnail = urlDeal;
      const bgLayer = baseVariants[2].canvasData.elements.find((el) => el.id === 'bg-image');
      if (bgLayer) bgLayer.src = urlDeal;
    }

    return NextResponse.json({
      success: true,
      fallback: false,
      message: '3 AI Kreatif başarıyla üretildi.',
      variants: baseVariants,
    });
  } catch (error: unknown) {
    console.error('OpenAI Creative API Error:', error);

    // Graceful fallback response on API error/timeout/rate-limit
    return NextResponse.json({
      success: false,
      fallback: true,
      error: 'Tasarım oluşturulamadı. Lütfen tekrar deneyin.',
      rawMessage: (error as Error)?.message || 'Unknown OpenAI error',
    }, { status: 500 });
  }
}
