import { useEffect, useState } from 'react';
import { TopBar } from './components/TopBar';
import { LayerRail } from './components/LayerRail';
import { SpanRail } from './components/SpanRail';
import { CommandPalette } from './components/CommandPalette';
import { Masthead } from './sections/Masthead';
import { HeroDashboard } from './sections/HeroDashboard';
import { Assessment } from './sections/Assessment';
import { Explorer } from './sections/Explorer';
import { OnReading } from './sections/OnReading';
import { Foreword } from './sections/Foreword';
import { Introduction } from './sections/Introduction';
import { Foundations } from './sections/Foundations';
import { NineLayersOverview } from './sections/NineLayersOverview';
import { LayerDefinitions } from './sections/LayerDefinitions';
import { CrossLayerSpans } from './sections/CrossLayerSpans';
import { RelationshipToOthers } from './sections/RelationshipToOthers';
import { Adoption } from './sections/Adoption';
import { Deferrals } from './sections/Deferrals';
import { Closing } from './sections/Closing';
import { DecisionLog } from './sections/DecisionLog';
import { UsingThisLog } from './sections/UsingThisLog';
import { Colophon } from './sections/Colophon';

export default function App() {
  const [paletteOpen, setPaletteOpen] = useState(false);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      if (e.key === '/' && target?.tagName !== 'INPUT' && target?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        setPaletteOpen(true);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white/85 relative">
      <div className="grid-dots fixed inset-0 pointer-events-none" aria-hidden="true" />
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at 20% 0%, rgba(240,81,34,0.08), transparent 55%), radial-gradient(ellipse at 80% 100%, rgba(240,81,34,0.05), transparent 45%)',
        }}
        aria-hidden="true"
      />
      <div className="relative z-10">
        <TopBar onOpenPalette={() => setPaletteOpen(true)} />
        <LayerRail />
        <SpanRail />
        <main>
          <Masthead />
          <HeroDashboard />
          <Assessment />
          <Explorer />
          <OnReading />
          <Foreword />
          <Introduction />
          <Foundations />
          <NineLayersOverview />
          <LayerDefinitions />
          <CrossLayerSpans />
          <RelationshipToOthers />
          <Adoption />
          <Deferrals />
          <Closing />
          <DecisionLog />
          <UsingThisLog />
          <Colophon />
        </main>
        <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
      </div>
    </div>
  );
}
