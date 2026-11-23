import { useState } from 'react';
import { AdvancedToolsSuite } from './components/AdvancedToolsSuite';
import { ChecklistSection } from './components/ChecklistSection';
import { CyberMapSection } from './components/CyberMapSection';
import { DirectorySection } from './components/DirectorySection';
import { EmergencySection } from './components/EmergencySection';
import { Footer } from './components/Footer';
import { GuideSection } from './components/GuideSection';
import { HeroSection } from './components/HeroSection';
import { Navbar } from './components/Navbar';
import { QuizSection } from './components/QuizSection';
import { ThreeCyberScene } from './components/ThreeCyberScene';
import { ThreatGuideSection } from './components/ThreatGuideSection';
import { ToolsWorkbench, type ActiveToolTab } from './components/ToolsWorkbench';
import type { Lang } from './data/cyberData';

export default function App() {
  const [lang, setLang] = useState<Lang>('en');
  const [activeTool, setActiveTool] = useState<ActiveToolTab>('password');

  const handleJumpToTool = (tool: ActiveToolTab) => {
    setActiveTool(tool);
    const el = document.getElementById('tools');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar lang={lang} />
      <main>
        <HeroSection
          lang={lang}
          onChangeLang={setLang}
          onJumpToTool={handleJumpToTool}
        />
        <GuideSection lang={lang} onJumpToTool={handleJumpToTool} />
        <ToolsWorkbench
          lang={lang}
          activeTab={activeTool}
          onChangeTab={setActiveTool}
        />
        <AdvancedToolsSuite lang={lang} />
        <ThreeCyberScene lang={lang} />
        <CyberMapSection lang={lang} />
        <ThreatGuideSection lang={lang} />
        <DirectorySection lang={lang} />
        <ChecklistSection lang={lang} />
        <QuizSection lang={lang} />
        <EmergencySection lang={lang} />
      </main>
      <Footer lang={lang} onChangeLang={setLang} />
    </div>
  );
}
