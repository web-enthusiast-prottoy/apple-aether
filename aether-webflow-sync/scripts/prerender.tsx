import React from 'react';
import { renderToString } from 'react-dom/server';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// --- Import Components ---
// In a real environment, we'd import the actual components, 
// but since they have dependencies like GSAP/Three, let's see if we can safely import them.
// Note: We might need to mock window/document if they throw.

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// This is a minimal React-like structure if the full import fails,
// but let's try importing the real ones first.
import AetherHeroNoShadow from '../src/components/AetherHeroNoShadow';
import AetherHighlights from '../src/components/AetherHighlights';
import AetherCloserLook from '../src/components/AetherCloserLook';
import Aether3DConfigurator from '../src/components/Aether3DConfigurator';
import AetherPerformance from '../src/components/AetherPerformance';
import AetherIphoneDrive from '../src/components/AetherIphoneDrive';
import AetherLoader from '../src/components/AetherLoader';
function Prerenderer() {
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

async function run() {
  try {
    console.log('--- Static HTML Generation Started ---');
    
    // 1. Render React tree to string
    const htmlString = renderToString(<Prerenderer />);
    
    // 2. Load the built index.html from dist
    const distPath = path.join(__dirname, '../dist');
    const indexPath = path.join(distPath, 'index.html');
    
    if (!fs.existsSync(indexPath)) {
      console.error('Error: dist/index.html not found. Run "npm run build" first.');
      process.exit(1);
    }
    
    let indexHtml = fs.readFileSync(indexPath, 'utf-8');
    
    // 3. Inject the HTML into the mount point
    const mountPoint = '<main id="aether-main-wrapper"></main>';
    if (indexHtml.includes(mountPoint)) {
      indexHtml = indexHtml.replace(mountPoint, `<main id="aether-main-wrapper">${htmlString}</main>`);
    } else {
      console.warn('Warning: Mount point not found in index.html');
    }
    
    // 4. Clean up paths for Webflow (ensure relative paths)
    indexHtml = indexHtml
      .replace(/src="\//g, 'src="./')
      .replace(/href="\//g, 'href="./')
      .replace(/content="\//g, 'content="./');
      
    // 5. Save back to dist/index.html
    fs.writeFileSync(indexPath, indexHtml);
    
    console.log('--- Static HTML Generation Succeeded! ---');
    console.log('Result saved to dist/index.html');
    
  } catch (error) {
    console.error('Static generation failed:', error);
    process.exit(1);
  }
}

run();
