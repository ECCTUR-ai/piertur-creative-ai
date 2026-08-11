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

async function parseImageInputToBuffer(imageInputStr: string): Promise<{ buffer: Buffer; bytes: number } | null> {
  if (!imageInputStr || imageInputStr.trim() === '') return null;

  if (imageInputStr.startsWith('data:image/')) {
    const base64Data = imageInputStr.split(',')[1] || imageInputStr;
    const buffer = Buffer.from(base64Data, 'base64');
    return { buffer, bytes: buffer.length };
  }
  if (imageInputStr.startsWith('http://') || imageInputStr.startsWith('https://')) {
    const response = await fetch(imageInputStr);
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    return { buffer, bytes: buffer.length };
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
            endpoint: '/v1/images/edits',
            inputImageUsed: false,
            inputImageMethod: 'openai.images.edit',
            inputImageBytes: 0,
            durationMs: 0,
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
        endpoint: 'none',
        aiSuccess: false,
        fallbackReason: 'OPENAI_API_KEY is not configured in server environment.',
        inputImageUsed: false,
        inputImageMethod: 'None (Fallback Master Template)',
        inputImageBytes: 0,
      }));

      return NextResponse.json({
        success: true,
        aiSuccess: false,
        generationSource: 'fallback',
        model: 'V2 Master Template Engine',
        endpoint: 'none',
        inputImageUsed: false,
        inputImageMethod: 'None (Fallback Master Template)',
        inputImageBytes: 0,
        fallbackReason: 'OPENAI_API_KEY is not configured in server environment.',
        variants: singleVariantOnly ? [fallbackVariants[0]] : fallbackVariants,
      });
    }

    // Initialize official OpenAI SDK
    const openai = new OpenAI({ apiKey });

    // Strict Image Edit execution helper using POST /v1/images/edits via openai.images.edit()
    const executeStrictImageEdit = async (promptText: string) => {
      const parsedImage = payload.uploadedImage
        ? await parseImageInputToBuffer(payload.uploadedImage)
        : null;

      if (!parsedImage) {
        throw new Error('Image input payload (uploadedImage) is required for openai.images.edit (/v1/images/edits).');
      }

      const imageFile = await toFile(parsedImage.buffer, 'reference.png', { type: 'image/png' });
      const startTime = Date.now();

      // Call official SDK openai.images.edit() method mapping to POST /v1/images/edits
      const editRes = await openai.images.edit({
        model: targetModel,
        image: imageFile,
        prompt: promptText,
        n: 1,
        size: '1024x1024',
      });

      const durationMs = Date.now() - startTime;

      return {
        url: editRes?.data?.[0]?.url,
        inputImageUsed: true,
        inputImageMethod: 'openai.images.edit',
        endpoint: '/v1/images/edits',
        inputImageBytes: parsedImage.bytes,
        durationMs,
      };
    };

    // Single Variant PRICE_HERO Only execution
    if (requestedVariant || singleVariantOnly) {
      const variantType = requestedVariant || 'PRICE_FOCUSED';
      let prompt = buildPriceHeroPrompt(payload);
      if (variantType === 'DESTINATION_FOCUSED') prompt = buildDestinationHeroPrompt(payload);
      if (variantType === 'DEAL_FOCUSED') prompt = buildCampaignHeroPrompt(payload);

      try {
        const result = await executeStrictImageEdit(prompt);
        const imageUrl = result.url || payload.uploadedImage;
        const updatedCampaign = { ...campaignInfo, backgroundImageUrl: imageUrl };
        const allVariants = generateAllVariants(updatedCampaign);
        const targetVariant = allVariants.find((v) => v.variantType === variantType) || allVariants[0];

        const finalVariant: DesignModel = {
          ...targetVariant,
          generationSource: 'openai',
          model: targetModel,
          endpoint: result.endpoint,
          aiSuccess: true,
          fallbackReason: null,
          inputImageUsed: result.inputImageUsed,
          inputImageMethod: result.inputImageMethod,
          inputImageBytes: result.inputImageBytes,
          durationMs: result.durationMs,
        };

        return NextResponse.json({
          success: true,
          aiSuccess: true,
          generationSource: 'openai',
          model: targetModel,
          endpoint: result.endpoint,
          inputImageUsed: result.inputImageUsed,
          inputImageMethod: result.inputImageMethod,
          inputImageBytes: result.inputImageBytes,
          durationMs: result.durationMs,
          fallback: false,
          fallbackReason: null,
          variant: finalVariant,
          variants: [finalVariant],
        });
      } catch (err: unknown) {
        const errorMsg = (err as Error)?.message || 'OpenAI openai.images.edit call failed';
        if (isStrict) {
          return NextResponse.json(
            {
              success: false,
              aiSuccess: false,
              generationSource: 'failed',
              model: targetModel,
              endpoint: '/v1/images/edits',
              inputImageUsed: true,
              inputImageMethod: 'openai.images.edit',
              inputImageBytes: payload.uploadedImage ? payload.uploadedImage.length : 0,
              durationMs: 0,
              fallback: false,
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
          endpoint: '/v1/images/edits',
          inputImageUsed: true,
          inputImageMethod: 'openai.images.edit',
          inputImageBytes: payload.uploadedImage ? payload.uploadedImage.length : 0,
          durationMs: 0,
          fallback: true,
          fallbackReason: errorMsg,
          variant: fallbackVariant ? { ...fallbackVariant, generationSource: 'fallback', aiSuccess: false } : null,
          variants: fallbackVariant ? [{ ...fallbackVariant, generationSource: 'fallback', aiSuccess: false }] : [],
        });
      }
    }

    // Batch 3 Variant Execution using openai.images.edit
    const promptPrice = buildPriceHeroPrompt(payload);
    const promptDest = buildDestinationHeroPrompt(payload);
    const promptDeal = buildCampaignHeroPrompt(payload);

    try {
      const [resPrice, resDest, resDeal] = await Promise.allSettled([
        executeStrictImageEdit(promptPrice),
        executeStrictImageEdit(promptDest),
        executeStrictImageEdit(promptDeal),
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
            endpoint: '/v1/images/edits',
            inputImageUsed: true,
            inputImageMethod: 'openai.images.edit',
            fallback: false,
            fallbackReason: priceFailedReason || destFailedReason || dealFailedReason || 'All openai.images.edit calls failed',
            error: priceFailedReason || destFailedReason || dealFailedReason || 'All openai.images.edit calls failed',
          },
          { status: 500 }
        );
      }

      const baseVariants = generateAllVariants(campaignInfo).map((v, idx) => {
        let isVariantAiSuccess = false;
        let aiUrl: string | undefined = undefined;
        let usedBytes = 0;
        let usedDuration = 0;

        if (idx === 0 && priceResult?.url) {
          isVariantAiSuccess = true;
          aiUrl = priceResult.url;
          usedBytes = priceResult.inputImageBytes;
          usedDuration = priceResult.durationMs;
        } else if (idx === 1 && destResult?.url) {
          isVariantAiSuccess = true;
          aiUrl = destResult.url;
          usedBytes = destResult.inputImageBytes;
          usedDuration = destResult.durationMs;
        } else if (idx === 2 && dealResult?.url) {
          isVariantAiSuccess = true;
          aiUrl = dealResult.url;
          usedBytes = dealResult.inputImageBytes;
          usedDuration = dealResult.durationMs;
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
          endpoint: '/v1/images/edits',
          aiSuccess: isVariantAiSuccess,
          fallbackReason: isVariantAiSuccess ? null : priceFailedReason || destFailedReason || dealFailedReason,
          inputImageUsed: true,
          inputImageMethod: 'openai.images.edit',
          inputImageBytes: usedBytes,
          durationMs: usedDuration,
        };
      });

      return NextResponse.json({
        success: true,
        aiSuccess: anyAiSuccess,
        generationSource: anyAiSuccess ? 'openai' : 'fallback',
        model: targetModel,
        endpoint: '/v1/images/edits',
        inputImageUsed: true,
        inputImageMethod: 'openai.images.edit',
        inputImageBytes: priceResult?.inputImageBytes || 0,
        durationMs: priceResult?.durationMs || 0,
        fallback: !anyAiSuccess,
        fallbackReason: anyAiSuccess ? null : priceFailedReason || destFailedReason || dealFailedReason,
        message: anyAiSuccess ? 'OpenAI openai.images.edit Kreatifler üretildi.' : 'Fallback Kurumsal Şablonlar üretildi.',
        variants: baseVariants,
      });
    } catch (err: unknown) {
      const errorMsg = (err as Error)?.message || 'OpenAI openai.images.edit execution error';
      if (isStrict) {
        return NextResponse.json(
          {
            success: false,
            aiSuccess: false,
            generationSource: 'failed',
            model: targetModel,
            endpoint: '/v1/images/edits',
            inputImageUsed: true,
            inputImageMethod: 'openai.images.edit',
            fallback: false,
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
        endpoint: '/v1/images/edits',
        aiSuccess: false,
        fallbackReason: errorMsg,
        inputImageUsed: true,
        inputImageMethod: 'openai.images.edit',
      }));

      return NextResponse.json({
        success: true,
        aiSuccess: false,
        generationSource: 'fallback',
        model: targetModel,
        endpoint: '/v1/images/edits',
        inputImageUsed: true,
        inputImageMethod: 'openai.images.edit',
        fallback: true,
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
        endpoint: '/v1/images/edits',
        inputImageUsed: true,
        inputImageMethod: 'openai.images.edit',
        error: errorMsg,
      },
      { status: 500 }
    );
  }
}
