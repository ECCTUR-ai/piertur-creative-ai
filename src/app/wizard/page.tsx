'use client';

import React from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { WizardFlow } from '@/components/wizard/WizardFlow';

export default function WizardPage() {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title="Yeni Tasarım Sihirbazı"
          subtitle="Tur, otel ve kampanya kreatifinizi 5 kolay adımda oluşturun."
          showNewButton={false}
        />

        <main className="p-8 flex-1">
          <WizardFlow />
        </main>
      </div>
    </div>
  );
}
