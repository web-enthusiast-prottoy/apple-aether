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

const AETHER_TAG = '%c AETHER ';
const AETHER_STYLE = 'background: #000; color: #fff; border-radius: 2px; padding: 2px 5px; font-weight: bold;';

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

/**
 * Verifies if the required Aether CSS variables are present in the DOM.
 */
function checkStyles() {
  const hasStyles = getComputedStyle(document.documentElement).getPropertyValue('--aether-accent').trim() !== '';
  if (!hasStyles) {
    console.error(
      `${AETHER_TAG}%c CRITICAL: Aether CSS (index.css) is missing!`,
      AETHER_STYLE,
      'color: #ff3b30; font-weight: bold;'
    );
    console.warn('Please ensure <link rel="stylesheet" href=".../index.css"> is in the <head>.');
  }
  return hasStyles;
}

console.log(`${AETHER_TAG}%c Initializing Engine...`, AETHER_STYLE, 'color: #0071e3;');

// CSS Check
checkStyles();

// Root Element Mounting Logic
let rootElement = document.getElementById('aether-main-wrapper');

if (!rootElement) {
  console.warn(
    `${AETHER_TAG}%c #aether-main-wrapper not found. Creating auto-mount fallback.`,
    AETHER_STYLE,
    'color: #ff9500;'
  );
  rootElement = document.createElement('main');
  rootElement.id = 'aether-main-wrapper';
  document.body.appendChild(rootElement);
}

if (rootElement) {
  try {
    // If the root element has children, it's likely pre-rendered
    if (rootElement.hasChildNodes()) {
      console.log(`${AETHER_TAG}%c Hydrating UI...`, AETHER_STYLE, 'color: #34c759;');
      hydrateRoot(
        rootElement,
        <StrictMode>
          <AetherApp />
        </StrictMode>
      );
    } else {
      console.log(`${AETHER_TAG}%c Mounting UI...`, AETHER_STYLE, 'color: #34c759;');
      createRoot(rootElement).render(
        <StrictMode>
          <AetherApp />
        </StrictMode>
      );
    }
  } catch (err) {
    console.error(`${AETHER_TAG}%c Mount Failed:`, AETHER_STYLE, 'color: #ff3b30;', err);
  }
}

// Global error listener for easier debugging in Webflow
window.addEventListener('error', (event) => {
  console.error(`${AETHER_TAG}%c Runtime Error: ${event.message}`, AETHER_STYLE, 'color: #ff3b30;');
});

// Expose to window for external control
(window as any).AetherReact = {
  isMounted: !!rootElement,
  version: '1.0.2',
  checkStyles: () => checkStyles()
};

