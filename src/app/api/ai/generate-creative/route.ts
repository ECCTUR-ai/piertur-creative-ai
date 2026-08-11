import { NextRequest, NextResponse } from 'next/server';
import OpenAI, { toFile } from 'openai';
import { CampaignInfo, CanvasData, DesignModel } from '@/types';
import { generateAllVariants } from '@/lib/templates/variantGenerator';
import {
  buildPriceHeroPrompt,
  buildDestinationHeroPrompt,
  buildCampaignHeroPrompt,
  CreativePayload,
} from '@/lib/ai/creativePromptBuilder';
import { generateCyprusPriceFocusedCanvas } from '@/lib/templates/cyprus-price-focused';
import { generateCyprusDestinationFocusedCanvas } from '@/lib/templates/cyprus-destination-focused';
import { generateCyprusLastminuteCanvas } from '@/lib/templates/cyprus-lastminute';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const payload: CreativePayload = body.payload || {};
    const strictMode: boolean = body.strictMode || process.env.OPENAI_STRICT_TEST_MODE === 'true';
    const singleVariantOnly: boolean = body.singleVariantOnly || false;
    const requestedVariant: string = body.variant || 'PRICE_FOCUSED';

    const apiKey = process.env.OPENAI_API_KEY;
    const targetModel = process.env.OPENAI_IMAGE_MODEL || 'gpt-image-2';

    // Construct campaign info object
    const campaignData: CampaignInfo = {
      title: payload.campaignTitle || 'Uludağ Konaklamalı Tur',
      subtitle: payload.subtitle || 'Türkiye nin En Sevilen Kayak Rotası',
      hotelName: payload.hotelName || 'Beceren Otel',
      nights: payload.nights || 2,
      days: payload.days || 3,
      boardType: payload.boardType || 'Yarım Pansiyon',
      price: payload.price || 25249,
      currency: (payload.currency as 'TL' | 'EUR' | 'USD') || 'TL',
      pricePrefix: payload.pricePrefix || 'Kişi Başı',
      priceSuffix: payload.priceSuffix || "'den başlayan fiyatlarla",
      departureCities: payload.departureCities || ['İstanbul', 'Ankara', 'İzmir', 'Bursa'],
      tags: payload.benefits || ['Kayak Pistlerine Yakın', 'Yemek İmkanı', 'Ulaşım Dahil', 'Seyahat Sigortası'],
      badgeText: payload.campaignBadge || 'SON DAKİKA FIRSATI',
      ctaText: payload.cta || 'HEMEN REZERVASYON YAP',
      ctaUrl: payload.website || 'piertur.com',
      backgroundImageUrl: payload.uploadedImage,
    };

    if (!apiKey) {
      if (strictMode) {
        return NextResponse.json(
          { error: 'OPENAI_API_KEY is required in strict test mode' },
          { status: 500 }
        );
      }
      return NextResponse.json({
        success: true,
        aiSuccess: false,
        generationSource: 'fallback',
        fallbackReason: 'OPENAI_API_KEY env var missing',
        variants: generateAllVariants(campaignData),
      });
    }

    const openai = new OpenAI({ apiKey });

    // Binary Image Preparation for official openai.images.edit() method
    let imageFile: Awaited<ReturnType<typeof toFile>> | null = null;
    let inputImageBytes = 0;

    if (payload.uploadedImage) {
      try {
        if (payload.uploadedImage.startsWith('data:image/')) {
          const base64Data = payload.uploadedImage.split(',')[1];
          const buffer = Buffer.from(base64Data, 'base64');
          inputImageBytes = buffer.length;
          imageFile = await toFile(buffer, 'reference.png', { type: 'image/png' });
        } else if (payload.uploadedImage.startsWith('http')) {
          const imgRes = await fetch(payload.uploadedImage);
          if (imgRes.ok) {
            const arrayBuf = await imgRes.arrayBuffer();
            const buffer = Buffer.from(arrayBuf);
            inputImageBytes = buffer.length;
            imageFile = await toFile(buffer, 'reference.png', { type: 'image/png' });
          }
        }
      } catch (err) {
        console.error('Image binary buffer conversion error', err);
      }
    }

    // Single Variant Execution vs Multi-Variant Generation
    const startTime = Date.now();

    const generateSingleVariant = async (
      type: 'PRICE_FOCUSED' | 'DESTINATION_FOCUSED' | 'DEAL_FOCUSED',
      promptText: string,
      canvasGenerator: (c: CampaignInfo) => CanvasData,
      suffix: string
    ): Promise<DesignModel> => {
      let aiImageUrl: string | null = null;
      let aiSuccess = false;
      let duration = 0;
      let errorMsg: string | null = null;

      try {
        const reqStart = Date.now();
        if (imageFile) {
          const editRes = await openai.images.edit({
            model: targetModel,
            image: imageFile,
            prompt: promptText,
            n: 1,
            size: '1024x1536',
          });
          aiImageUrl = editRes.data?.[0]?.url || null;
          aiSuccess = !!aiImageUrl;
        } else {
          const genRes = await openai.images.generate({
            model: targetModel,
            prompt: promptText,
            n: 1,
            size: '1024x1536',
          });
          aiImageUrl = genRes.data?.[0]?.url || null;
          aiSuccess = !!aiImageUrl;
        }
        duration = Date.now() - reqStart;
      } catch (e: unknown) {
        const errObj = e as Error;
        console.error(`OpenAI image execution failed for ${type}`, errObj);
        errorMsg = errObj?.message || 'OpenAI API Error';
        if (strictMode) throw e;
      }

      const activeBgUrl = aiImageUrl || campaignData.backgroundImageUrl || 'https://images.unsplash.com/photo-1551524559-8af4e6624178';
      const updatedCampaign = { ...campaignData, backgroundImageUrl: activeBgUrl };
      const canvasData = canvasGenerator(updatedCampaign);

      return {
        id: `piertur_${Date.now()}_${suffix}`,
        name: `${campaignData.title} - ${
          type === 'PRICE_FOCUSED'
            ? 'Fiyat Odaklı'
            : type === 'DESTINATION_FOCUSED'
            ? 'Destinasyon Odaklı'
            : 'Fırsat Odaklı'
        }`,
        type: 'TUR',
        format: 'IG_STORY',
        width: 1080,
        height: 1920,
        thumbnail: activeBgUrl,
        campaignData: updatedCampaign,
        canvasData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        variantType: type,
        generationSource: aiSuccess ? 'openai' : 'fallback',
        model: targetModel,
        endpoint: '/v1/images/edits',
        aiSuccess,
        fallbackReason: errorMsg,
        inputImageUsed: !!imageFile,
        inputImageMethod: 'openai.images.edit',
        inputImageBytes,
        durationMs: duration,
      };
    };

    if (singleVariantOnly) {
      const prompt =
        requestedVariant === 'DESTINATION_FOCUSED'
          ? buildDestinationHeroPrompt(payload)
          : requestedVariant === 'DEAL_FOCUSED'
          ? buildCampaignHeroPrompt(payload)
          : buildPriceHeroPrompt(payload);

      const generator =
        requestedVariant === 'DESTINATION_FOCUSED'
          ? generateCyprusDestinationFocusedCanvas
          : requestedVariant === 'DEAL_FOCUSED'
          ? generateCyprusLastminuteCanvas
          : generateCyprusPriceFocusedCanvas;

      const variant = await generateSingleVariant(
        (requestedVariant as 'PRICE_FOCUSED' | 'DESTINATION_FOCUSED' | 'DEAL_FOCUSED') || 'PRICE_FOCUSED',
        prompt,
        generator,
        requestedVariant.toLowerCase()
      );

      return NextResponse.json({
        success: true,
        aiSuccess: variant.aiSuccess,
        generationSource: variant.generationSource,
        model: targetModel,
        endpoint: '/v1/images/edits',
        inputImageUsed: variant.inputImageUsed,
        inputImageMethod: 'openai.images.edit',
        inputImageBytes,
        durationMs: Date.now() - startTime,
        fallback: !variant.aiSuccess,
        variant,
        variants: [variant],
      });
    }

    // Generate 3 Distinct AI Variants sequentially
    const priceVariant = await generateSingleVariant(
      'PRICE_FOCUSED',
      buildPriceHeroPrompt(payload),
      generateCyprusPriceFocusedCanvas,
      'price'
    );

    const destVariant = await generateSingleVariant(
      'DESTINATION_FOCUSED',
      buildDestinationHeroPrompt(payload),
      generateCyprusDestinationFocusedCanvas,
      'dest'
    );

    const dealVariant = await generateSingleVariant(
      'DEAL_FOCUSED',
      buildCampaignHeroPrompt(payload),
      generateCyprusLastminuteCanvas,
      'deal'
    );

    const variants = [priceVariant, destVariant, dealVariant];
    const overallSuccess = variants.some((v) => v.aiSuccess);

    return NextResponse.json({
      success: true,
      aiSuccess: overallSuccess,
      generationSource: overallSuccess ? 'openai' : 'fallback',
      model: targetModel,
      endpoint: '/v1/images/edits',
      inputImageUsed: !!imageFile,
      inputImageMethod: 'openai.images.edit',
      inputImageBytes,
      durationMs: Date.now() - startTime,
      fallback: !overallSuccess,
      variants,
    });
  } catch (error: unknown) {
    const errObj = error as Error;
    console.error('API /generate-creative error', errObj);
    return NextResponse.json(
      { error: errObj?.message || 'Server error', aiSuccess: false, fallback: true },
      { status: 500 }
    );
  }
}
