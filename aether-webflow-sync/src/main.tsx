import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import './styles/style.css';

import AetherHeroNoShadow from './components/AetherHeroNoShadow';
import AetherHighlights from './components/AetherHighlights';
import AetherCloserLook from './components/AetherCloserLook';
import Aether3DConfigurator from './components/Aether3DConfigurator';
import AetherPerformance from './components/AetherPerformance';
import AetherIphoneDrive from './components/AetherIphoneDrive';
import AetherLoader from './components/AetherLoader';

function AetherApp() {
  return (
    <>
      <AetherLoader />
      <AetherHeroNoShadow />
      <AetherHighlights />
      <AetherCloserLook />
      <Aether3DConfigurator />
      <AetherPerformance />
      <AetherIphoneDrive />
    </>
  );
}

const rootElement = document.getElementById('aether-main-wrapper');
if (rootElement) {
  // If the root element has children, it's likely pre-rendered by Vite-Plugin-Prerender
  if (rootElement.hasChildNodes()) {
    hydrateRoot(
      rootElement,
      <StrictMode>
        <AetherApp />
      </StrictMode>
    );
  } else {
    createRoot(rootElement).render(
      <StrictMode>
        <AetherApp />
      </StrictMode>
    );
  }
}

// Expose to window for external control (Webflow)
(window as any).AetherReact = {
  isMounted: !!rootElement
};
