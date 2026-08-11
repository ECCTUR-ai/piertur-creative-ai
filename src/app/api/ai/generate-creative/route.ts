import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import {
  buildPriceHeroPrompt,
  buildDestinationHeroPrompt,
  buildCampaignHeroPrompt,
  CreativePayload,
} from '@/lib/ai/creativePromptBuilder';
import { generateAllVariants } from '@/lib/templates/variantGenerator';
import { CampaignInfo, DesignModel } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const payload: CreativePayload = body.payload || body;
    const requestedVariant = body.variant as 'PRICE_FOCUSED' | 'DESTINATION_FOCUSED' | 'DEAL_FOCUSED' | undefined;
    const isStrict = Boolean(
      body.strictMode || payload.strictMode || process.env.OPENAI_STRICT_TEST_MODE === 'true'
    );

    const apiKey = process.env.OPENAI_API_KEY;
    const targetModel = process.env.OPENAI_IMAGE_MODEL || 'gpt-image-2';

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

    // If OPENAI_API_KEY is missing
    if (!apiKey || apiKey.trim() === '') {
      if (isStrict) {
        return NextResponse.json(
          {
            success: false,
            aiSuccess: false,
            generationSource: 'failed',
            model: targetModel,
            fallbackReason: 'OPENAI_API_KEY environment variable is not configured on server.',
            error: 'Strict Test Mode: OPENAI_API_KEY missing.',
          },
          { status: 400 }
        );
      }

      const fallbackVariants: DesignModel[] = generateAllVariants(campaignInfo).map((v) => ({
        ...v,
        generationSource: 'fallback' as const,
        model: 'V2 Master Template Engine',
        aiSuccess: false,
        fallbackReason: 'OPENAI_API_KEY is not configured in server environment.',
      }));

      return NextResponse.json({
        success: true,
        aiSuccess: false,
        generationSource: 'fallback',
        model: 'V2 Master Template Engine',
        fallbackReason: 'OPENAI_API_KEY is not configured in server environment.',
        variants: fallbackVariants,
      });
    }

    // Initialize official OpenAI SDK
    const openai = new OpenAI({ apiKey });

    // Image API execution helper
    const executeOpenAIImage = async (promptText: string) => {
      // Append reference photo context to prompt if user uploaded a reference image
      let finalPrompt = promptText;
      if (payload.uploadedImage) {
        finalPrompt += ` Base image reference provided: Preserving ${payload.campaignTitle} destination atmosphere.`;
      }

      return await openai.images.generate({
        model: targetModel,
        prompt: finalPrompt,
        n: 1,
        size: targetModel.includes('dall-e-3') || targetModel.includes('gpt-image') ? '1024x1792' : '1024x1024',
      });
    };

    // Single Variant Regeneration
    if (requestedVariant) {
      let prompt = buildPriceHeroPrompt(payload);
      if (requestedVariant === 'DESTINATION_FOCUSED') prompt = buildDestinationHeroPrompt(payload);
      if (requestedVariant === 'DEAL_FOCUSED') prompt = buildCampaignHeroPrompt(payload);

      try {
        const response = await executeOpenAIImage(prompt);
        const imageUrl = response?.data?.[0]?.url || payload.uploadedImage;
        const updatedCampaign = { ...campaignInfo, backgroundImageUrl: imageUrl };
        const allVariants = generateAllVariants(updatedCampaign);
        const targetVariant = allVariants.find((v) => v.variantType === requestedVariant) || allVariants[0];

        const finalVariant: DesignModel = {
          ...targetVariant,
          generationSource: 'openai',
          model: targetModel,
          aiSuccess: true,
          fallbackReason: null,
        };

        return NextResponse.json({
          success: true,
          aiSuccess: true,
          generationSource: 'openai',
          model: targetModel,
          fallbackReason: null,
          variant: finalVariant,
        });
      } catch (err: unknown) {
        const errorMsg = (err as Error)?.message || 'OpenAI API call failed';
        if (isStrict) {
          return NextResponse.json(
            {
              success: false,
              aiSuccess: false,
              generationSource: 'failed',
              model: targetModel,
              fallbackReason: errorMsg,
              error: errorMsg,
            },
            { status: 500 }
          );
        }

        const fallbackVariant = generateAllVariants(campaignInfo).find((v) => v.variantType === requestedVariant);
        return NextResponse.json({
          success: true,
          aiSuccess: false,
          generationSource: 'fallback',
          model: targetModel,
          fallbackReason: errorMsg,
          variant: fallbackVariant ? { ...fallbackVariant, generationSource: 'fallback', aiSuccess: false } : null,
        });
      }
    }

    // Generate 3 AI Prompts for batch creation
    const promptPrice = buildPriceHeroPrompt(payload);
    const promptDest = buildDestinationHeroPrompt(payload);
    const promptDeal = buildCampaignHeroPrompt(payload);

    try {
      const [resPrice, resDest, resDeal] = await Promise.allSettled([
        executeOpenAIImage(promptPrice),
        executeOpenAIImage(promptDest),
        executeOpenAIImage(promptDeal),
      ]);

      const urlPrice = resPrice.status === 'fulfilled' ? resPrice.value?.data?.[0]?.url : undefined;
      const urlDest = resDest.status === 'fulfilled' ? resDest.value?.data?.[0]?.url : undefined;
      const urlDeal = resDeal.status === 'fulfilled' ? resDeal.value?.data?.[0]?.url : undefined;

      const priceFailedReason = resPrice.status === 'rejected' ? resPrice.reason?.message : null;
      const destFailedReason = resDest.status === 'rejected' ? resDest.reason?.message : null;
      const dealFailedReason = resDeal.status === 'rejected' ? resDeal.reason?.message : null;

      const anyAiSuccess = Boolean(urlPrice || urlDest || urlDeal);

      if (isStrict && !anyAiSuccess) {
        return NextResponse.json(
          {
            success: false,
            aiSuccess: false,
            generationSource: 'failed',
            model: targetModel,
            fallbackReason: priceFailedReason || destFailedReason || dealFailedReason || 'All 3 OpenAI image calls failed',
            error: priceFailedReason || destFailedReason || dealFailedReason || 'All 3 OpenAI image calls failed',
          },
          { status: 500 }
        );
      }

      const baseVariants = generateAllVariants(campaignInfo).map((v, idx) => {
        let isVariantAiSuccess = false;
        let aiUrl: string | undefined = undefined;

        if (idx === 0 && urlPrice) {
          isVariantAiSuccess = true;
          aiUrl = urlPrice;
        } else if (idx === 1 && urlDest) {
          isVariantAiSuccess = true;
          aiUrl = urlDest;
        } else if (idx === 2 && urlDeal) {
          isVariantAiSuccess = true;
          aiUrl = urlDeal;
        }

        const variantObj = { ...v };
        if (aiUrl) {
          variantObj.thumbnail = aiUrl;
          const bgLayer = variantObj.canvasData.elements.find((el) => el.id === 'bg-image');
          if (bgLayer) bgLayer.src = aiUrl;
        }

        return {
          ...variantObj,
          generationSource: (isVariantAiSuccess ? 'openai' : 'fallback') as 'openai' | 'fallback',
          model: targetModel,
          aiSuccess: isVariantAiSuccess,
          fallbackReason: isVariantAiSuccess ? null : priceFailedReason || destFailedReason || dealFailedReason,
        };
      });

      return NextResponse.json({
        success: true,
        aiSuccess: anyAiSuccess,
        generationSource: anyAiSuccess ? 'openai' : 'fallback',
        model: targetModel,
        fallbackReason: anyAiSuccess ? null : priceFailedReason || destFailedReason || dealFailedReason,
        message: anyAiSuccess ? 'OpenAI AI Kreatifler üretildi.' : 'Fallback Kurumsal Şablonlar üretildi.',
        variants: baseVariants,
      });
    } catch (err: unknown) {
      const errorMsg = (err as Error)?.message || 'OpenAI API execution error';
      if (isStrict) {
        return NextResponse.json(
          {
            success: false,
            aiSuccess: false,
            generationSource: 'failed',
            model: targetModel,
            fallbackReason: errorMsg,
            error: errorMsg,
          },
          { status: 500 }
        );
      }

      const fallbackVariants = generateAllVariants(campaignInfo).map((v) => ({
        ...v,
        generationSource: 'fallback' as const,
        model: targetModel,
        aiSuccess: false,
        fallbackReason: errorMsg,
      }));

      return NextResponse.json({
        success: true,
        aiSuccess: false,
        generationSource: 'fallback',
        model: targetModel,
        fallbackReason: errorMsg,
        variants: fallbackVariants,
      });
    }
  } catch (error: unknown) {
    const errorMsg = (error as Error)?.message || 'Unknown server error';
    return NextResponse.json(
      {
        success: false,
        aiSuccess: false,
        generationSource: 'failed',
        error: errorMsg,
      },
      { status: 500 }
    );
  }
}
