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

console.log('--- Aether App Initializing ---');

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
  console.log('--- Root Element Found, Starting Mount/Hydration ---');
  try {
    // If the root element has children, it's likely pre-rendered by Vite-Plugin-Prerender
    if (rootElement.hasChildNodes()) {
      console.log('--- Hydrating Pre-rendered Content ---');
      hydrateRoot(
        rootElement,
        <StrictMode>
          <AetherApp />
        </StrictMode>
      );
    } else {
      console.log('--- Creating New Root ---');
      createRoot(rootElement).render(
        <StrictMode>
          <AetherApp />
        </StrictMode>
      );
    }
    console.log('--- Mount/Hydration Complete ---');
  } catch (err) {
    console.error('--- Aether App Mount Failed ---', err);
  }
} else {
  console.warn('--- Aether App Root Element (#aether-main-wrapper) Not Found ---');
}

// Global error listener for easier debugging in external environments (Webflow)
window.addEventListener('error', (event) => {
  console.error('--- Global Entry Error Caught ---', event.message, event.filename, event.lineno);
});

// Expose to window for external control (Webflow)
(window as any).AetherReact = {
  isMounted: !!rootElement,
  version: '1.0.1'
};
