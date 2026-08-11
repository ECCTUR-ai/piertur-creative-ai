'use client';

import React, { useEffect, useRef } from 'react';
import { CanvasData } from '@/types';

interface LargeStoryPreviewProps {
  canvasData: CanvasData;
  name: string;
  width?: number; // Default ~340px
}

export const LargeStoryPreview: React.FC<LargeStoryPreviewProps> = ({ canvasData, width = 340 }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const NATIVE_WIDTH = 1080;
  const NATIVE_HEIGHT = 1920;
  const height = Math.round((width * 1920) / 1080);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isMounted = true;

    // Collect all image layers and preload images first to prevent async Z-index race conditions
    const imageLayers = canvasData.elements.filter((el) => el.type === 'image' && el.src);

    const imagePromises = imageLayers.map((layer) => {
      return new Promise<{ id: string; img: HTMLImageElement | null }>((resolve) => {
        if (!layer.src) return resolve({ id: layer.id, img: null });

        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve({ id: layer.id, img });
        img.onerror = () => {
          // Retry without crossOrigin if CORS blocks
          const fallbackImg = new Image();
          fallbackImg.onload = () => resolve({ id: layer.id, img: fallbackImg });
          fallbackImg.onerror = () => resolve({ id: layer.id, img: null });
          fallbackImg.src = layer.src!;
        };
        img.src = layer.src;
      });
    });

    Promise.all(imagePromises).then((loadedImages) => {
      if (!isMounted || !canvasRef.current) return;

      const imageMap = new Map<string, HTMLImageElement>();
      loadedImages.forEach((item) => {
        if (item.img) imageMap.set(item.id, item.img);
      });

      // Clear Canvas
      ctx.clearRect(0, 0, NATIVE_WIDTH, NATIVE_HEIGHT);

      // Background color
      ctx.fillStyle = canvasData.backgroundColor || '#082E63';
      ctx.fillRect(0, 0, NATIVE_WIDTH, NATIVE_HEIGHT);

      // Sort elements strictly by zIndex ascending (z-index 1 -> 23)
      const sortedLayers = [...canvasData.elements].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));

      sortedLayers.forEach((layer) => {
        if (layer.visible === false) return;

        ctx.save();
        ctx.globalAlpha = layer.opacity !== undefined ? layer.opacity : 1;

        if (layer.type === 'rect') {
          const rectW = layer.width || 100;
          const rectH = layer.height || 100;
          const radius = layer.borderRadius || 0;

          if (layer.fill?.startsWith('linear-gradient')) {
            const gradient = ctx.createLinearGradient(0, layer.y, 0, layer.y + rectH);
            gradient.addColorStop(0, 'rgba(8, 46, 99, 0.88)');
            gradient.addColorStop(0.5, 'rgba(8, 46, 99, 0.4)');
            gradient.addColorStop(1, 'rgba(8, 46, 99, 0.96)');
            ctx.fillStyle = gradient;
          } else {
            ctx.fillStyle = layer.fill || '#082E63';
          }

          ctx.beginPath();
          if (radius > 0 && ctx.roundRect) {
            ctx.roundRect(layer.x, layer.y, rectW, rectH, radius);
          } else {
            ctx.rect(layer.x, layer.y, rectW, rectH);
          }
          ctx.fill();

          if (layer.stroke && layer.strokeWidth) {
            ctx.strokeStyle = layer.stroke;
            ctx.lineWidth = layer.strokeWidth;
            ctx.stroke();
          }
        } else if (layer.type === 'text') {
          const fontSize = layer.fontSize || 32;
          const fontWeight = layer.fontWeight || '700';
          const fontFamily = layer.fontFamily || 'Montserrat, sans-serif';

          ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
          ctx.fillStyle = layer.fill || '#FFFFFF';
          ctx.textBaseline = 'top';

          if (layer.textAlign === 'center') ctx.textAlign = 'center';
          else if (layer.textAlign === 'right') ctx.textAlign = 'right';
          else ctx.textAlign = 'left';

          ctx.fillText(layer.text || '', layer.x, layer.y);
        } else if (layer.type === 'image') {
          const img = imageMap.get(layer.id);
          if (img) {
            ctx.drawImage(img, layer.x, layer.y, layer.width || 1080, layer.height || 1920);
          }
        }

        ctx.restore();
      });
    });

    return () => {
      isMounted = false;
    };
  }, [canvasData]);

  return (
    <div
      style={{ width: `${width}px`, height: `${height}px` }}
      className="relative shadow-2xl rounded-2xl overflow-hidden border border-slate-700 bg-slate-950 mx-auto"
    >
      <canvas
        ref={canvasRef}
        width={NATIVE_WIDTH}
        height={NATIVE_HEIGHT}
        style={{ width: `${width}px`, height: `${height}px` }}
        className="block"
      />
    </div>
  );
};
