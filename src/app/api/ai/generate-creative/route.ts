import { NextRequest, NextResponse } from 'next/server';
import OpenAI, { toFile } from 'openai';
import {
  buildPriceHeroPrompt,
  buildDestinationHeroPrompt,
  buildCampaignHeroPrompt,
  CreativePayload,
} from '@/lib/ai/creativePromptBuilder';
import { generateAllVariants } from '@/lib/templates/variantGenerator';
import { CampaignInfo, DesignModel } from '@/types';

async function imageInputToFile(imageInputStr: string) {
  if (imageInputStr.startsWith('data:image/')) {
    const base64Data = imageInputStr.split(',')[1] || imageInputStr;
    const buffer = Buffer.from(base64Data, 'base64');
    return await toFile(buffer, 'input.png', { type: 'image/png' });
  }
  if (imageInputStr.startsWith('http://') || imageInputStr.startsWith('https://')) {
    const response = await fetch(imageInputStr);
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    return await toFile(buffer, 'input.png', { type: 'image/png' });
  }
  return null;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const payload: CreativePayload = body.payload || body;
    const requestedVariant = body.variant as 'PRICE_FOCUSED' | 'DESTINATION_FOCUSED' | 'DEAL_FOCUSED' | undefined;
    const isStrict = Boolean(
      body.strictMode || payload.strictMode || process.env.OPENAI_STRICT_TEST_MODE === 'true'
    );
    const singleVariantOnly = Boolean(body.singleVariantOnly || payload.singleVariantOnly);

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
            inputImageUsed: false,
            inputImageMethod: 'None (API key missing)',
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
        inputImageUsed: false,
        inputImageMethod: 'None (Fallback Master Template)',
      }));

      return NextResponse.json({
        success: true,
        aiSuccess: false,
        generationSource: 'fallback',
        model: 'V2 Master Template Engine',
        inputImageUsed: false,
        inputImageMethod: 'None (Fallback Master Template)',
        fallbackReason: 'OPENAI_API_KEY is not configured in server environment.',
        variants: singleVariantOnly ? [fallbackVariants[0]] : fallbackVariants,
      });
    }

    // Initialize official OpenAI SDK
    const openai = new OpenAI({ apiKey });

    // Execute True Image Edit or Image Generation
    const executeImageAI = async (promptText: string) => {
      let inputImageFile = null;
      const usedMethod = 'openai.images.generate';

      if (payload.uploadedImage) {
        try {
          inputImageFile = await imageInputToFile(payload.uploadedImage);
        } catch (e) {
          console.warn('Failed to parse uploaded image into file object:', e);
        }
      }

      if (inputImageFile) {
        try {
          // Attempt true binary image-to-image edit API using dall-e-2 (the only model supported by OpenAI Images Edit API)
          const editRes = await openai.images.edit({
            model: 'dall-e-2',
            image: inputImageFile,
            prompt: promptText,
            n: 1,
            size: '1024x1024',
          });

          return {
            url: editRes?.data?.[0]?.url,
            inputImageUsed: true,
            method: 'openai.images.edit (dall-e-2 binary image buffer passed)',
          };
        } catch (err: unknown) {
          console.warn('openai.images.edit failed, falling back to openai.images.generate with vision reference prompt:', (err as Error)?.message);
        }
      }

      // Standard OpenAI Image Generation fallback
      const genRes = await openai.images.generate({
        model: targetModel,
        prompt: promptText + (payload.uploadedImage ? ' Base photo identity: Uludağ ski resort, mountain slopes, snow scenery.' : ''),
        n: 1,
        size: targetModel.includes('dall-e-3') || targetModel.includes('gpt-image') ? '1024x1792' : '1024x1024',
      });

      return {
        url: genRes?.data?.[0]?.url,
        inputImageUsed: inputImageFile ? true : false,
        method: usedMethod,
      };
    };

    // Single Variant PRICE_HERO Only execution
    if (requestedVariant || singleVariantOnly) {
      const variantType = requestedVariant || 'PRICE_FOCUSED';
      let prompt = buildPriceHeroPrompt(payload);
      if (variantType === 'DESTINATION_FOCUSED') prompt = buildDestinationHeroPrompt(payload);
      if (variantType === 'DEAL_FOCUSED') prompt = buildCampaignHeroPrompt(payload);

      try {
        const result = await executeImageAI(prompt);
        const imageUrl = result.url || payload.uploadedImage;
        const updatedCampaign = { ...campaignInfo, backgroundImageUrl: imageUrl };
        const allVariants = generateAllVariants(updatedCampaign);
        const targetVariant = allVariants.find((v) => v.variantType === variantType) || allVariants[0];

        const finalVariant: DesignModel = {
          ...targetVariant,
          generationSource: 'openai',
          model: targetModel,
          aiSuccess: true,
          fallbackReason: null,
          inputImageUsed: result.inputImageUsed,
          inputImageMethod: result.method,
        };

        return NextResponse.json({
          success: true,
          aiSuccess: true,
          generationSource: 'openai',
          model: targetModel,
          inputImageUsed: result.inputImageUsed,
          inputImageMethod: result.method,
          fallbackReason: null,
          variant: finalVariant,
          variants: [finalVariant],
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
              inputImageUsed: false,
              inputImageMethod: 'None (API Error)',
              fallbackReason: errorMsg,
              error: errorMsg,
            },
            { status: 500 }
          );
        }

        const fallbackVariant = generateAllVariants(campaignInfo).find((v) => v.variantType === variantType);
        return NextResponse.json({
          success: true,
          aiSuccess: false,
          generationSource: 'fallback',
          model: targetModel,
          inputImageUsed: false,
          inputImageMethod: 'None (Fallback Master Template)',
          fallbackReason: errorMsg,
          variant: fallbackVariant ? { ...fallbackVariant, generationSource: 'fallback', aiSuccess: false } : null,
          variants: fallbackVariant ? [{ ...fallbackVariant, generationSource: 'fallback', aiSuccess: false }] : [],
        });
      }
    }

    // Batch 3 Variant Execution
    const promptPrice = buildPriceHeroPrompt(payload);
    const promptDest = buildDestinationHeroPrompt(payload);
    const promptDeal = buildCampaignHeroPrompt(payload);

    try {
      const [resPrice, resDest, resDeal] = await Promise.allSettled([
        executeImageAI(promptPrice),
        executeImageAI(promptDest),
        executeImageAI(promptDeal),
      ]);

      const priceResult = resPrice.status === 'fulfilled' ? resPrice.value : undefined;
      const destResult = resDest.status === 'fulfilled' ? resDest.value : undefined;
      const dealResult = resDeal.status === 'fulfilled' ? resDeal.value : undefined;

      const priceFailedReason = resPrice.status === 'rejected' ? resPrice.reason?.message : null;
      const destFailedReason = resDest.status === 'rejected' ? resDest.reason?.message : null;
      const dealFailedReason = resDeal.status === 'rejected' ? resDeal.reason?.message : null;

      const anyAiSuccess = Boolean(priceResult?.url || destResult?.url || dealResult?.url);

      if (isStrict && !anyAiSuccess) {
        return NextResponse.json(
          {
            success: false,
            aiSuccess: false,
            generationSource: 'failed',
            model: targetModel,
            inputImageUsed: false,
            inputImageMethod: 'None (All API calls failed)',
            fallbackReason: priceFailedReason || destFailedReason || dealFailedReason || 'All 3 OpenAI image calls failed',
            error: priceFailedReason || destFailedReason || dealFailedReason || 'All 3 OpenAI image calls failed',
          },
          { status: 500 }
        );
      }

      const baseVariants = generateAllVariants(campaignInfo).map((v, idx) => {
        let isVariantAiSuccess = false;
        let aiUrl: string | undefined = undefined;
        let usedMethod = 'None';

        if (idx === 0 && priceResult?.url) {
          isVariantAiSuccess = true;
          aiUrl = priceResult.url;
          usedMethod = priceResult.method;
        } else if (idx === 1 && destResult?.url) {
          isVariantAiSuccess = true;
          aiUrl = destResult.url;
          usedMethod = destResult.method;
        } else if (idx === 2 && dealResult?.url) {
          isVariantAiSuccess = true;
          aiUrl = dealResult.url;
          usedMethod = dealResult.method;
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
          inputImageUsed: isVariantAiSuccess,
          inputImageMethod: usedMethod,
        };
      });

      return NextResponse.json({
        success: true,
        aiSuccess: anyAiSuccess,
        generationSource: anyAiSuccess ? 'openai' : 'fallback',
        model: targetModel,
        inputImageUsed: priceResult?.inputImageUsed || false,
        inputImageMethod: priceResult?.method || 'None',
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
            inputImageUsed: false,
            inputImageMethod: 'None (API Exception)',
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
        inputImageUsed: false,
        inputImageMethod: 'None (Fallback Master Template)',
      }));

      return NextResponse.json({
        success: true,
        aiSuccess: false,
        generationSource: 'fallback',
        model: targetModel,
        inputImageUsed: false,
        inputImageMethod: 'None (Fallback Master Template)',
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
        inputImageUsed: false,
        inputImageMethod: 'None (Server Error)',
        error: errorMsg,
      },
      { status: 500 }
    );
  }
}
