import React from 'react';
import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { StorySection } from '@/components/StorySection';
import { TastingNotesSection } from '@/components/TastingNotesSection';
import { DesignGallery } from '@/components/DesignGallery';
import { PledgeSection } from '@/components/PledgeSection';
import { ScarcitySection } from '@/components/ScarcitySection';
import { FaqAccordion } from '@/components/FaqAccordion';
import { Footer } from '@/components/Footer';

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col bg-ink text-ivory">
      <Header />
      <Hero />
      <StorySection />
      <TastingNotesSection />
      <DesignGallery />
      <PledgeSection />
      <ScarcitySection />
      <FaqAccordion />
      <Footer />
    </main>
  );
}
