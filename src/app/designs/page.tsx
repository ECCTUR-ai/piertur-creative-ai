'use client';

import React, { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { RecentDesignsGrid } from '@/components/dashboard/RecentDesignsGrid';
import { DesignModel } from '@/types';
import { DesignRepository } from '@/lib/storage/designRepository';

export default function DesignsPage() {
  const [designs, setDesigns] = useState<DesignModel[]>(() => DesignRepository.getAll());

  const loadDesigns = () => {
    const data = DesignRepository.getAll();
    setDesigns(data);
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title="Tasarımlarım"
          subtitle="Oluşturduğunuz tüm sosyal medya reklam kreatifleri."
          showNewButton={true}
        />

        <main className="p-8 flex-1">
          <RecentDesignsGrid designs={designs} onRefresh={loadDesigns} />
        </main>
      </div>
    </div>
  );
}
