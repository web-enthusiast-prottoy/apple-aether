const fs = require('fs');

async function inspect() {
  const fileParts = fs.readFileSync('public/aether-3d/nouveau-aether.glb');
  
  // This is a simple binary search for material names in the gltf JSON chunk
  // glTF starts with 12 bytes header, then chunk length, chunk type, chunk data
  const length = fileParts.readUInt32LE(12);
  const jsonChunk = fileParts.toString('utf8', 20, 20 + length);
  
  try {
    const gltf = JSON.parse(jsonChunk);
    if (gltf.materials) {
      console.log("Materials:");
      gltf.materials.forEach((m, i) => console.log(`[${i}] ${m.name}`));
    }
  } catch(e) { console.error('Error parsing JSON chunk'); }
}
inspect();
