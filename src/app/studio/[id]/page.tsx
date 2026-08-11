'use client';

import React, { useState } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { DesignModel } from '@/types';
import { DesignRepository } from '@/lib/storage/designRepository';
import { CreativeStudio } from '@/components/studio/CreativeStudio';

export default function StudioPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const id = params?.id as string;
  const autoDownload = searchParams?.get('autoDownload') === 'true';

  const [design] = useState<DesignModel | null>(() => {
    if (!id) return DesignRepository.getAll()[0] || null;
    return DesignRepository.getById(id) || DesignRepository.getAll()[0] || null;
  });

  if (!design) {
    return (
      <div className="h-screen w-screen bg-slate-950 flex items-center justify-center text-white p-6">
        <div className="text-center">
          <h2 className="text-xl font-bold text-[#E31C24]">Tasarım Bulunamadı</h2>
          <p className="text-xs text-slate-400 mt-2 mb-6">
            İstenen tasarım mevcut değil veya silinmiş olabilir.
          </p>
          <button
            type="button"
            onClick={() => router.push('/dashboard')}
            className="bg-[#082E63] text-white px-6 py-2.5 rounded-xl font-bold text-xs"
          >
            Dashboard&apos;a Dön
          </button>
        </div>
      </div>
    );
  }

  return <CreativeStudio initialDesign={design} autoDownload={autoDownload} />;
}
