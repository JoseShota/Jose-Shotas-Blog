import fs from 'fs';
import path from 'path';
import { parseFile } from 'music-metadata';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

// --- CONFIGURATION ---
const R2_BUCKET = 'YOUR_BUCKET_NAME'; // <-- Replace with your R2 bucket name
const M3U_PATH = 'D:\\Music\\Te miré en mí.m3u';
const MUSIC_DIR = 'D:\\Music';
const COVER_IMAGE = 'C:\\Users\\eljos\\Downloads\\1261037.jpg';
const COVER_R2_KEY = 'images/playlist-cover-vol2.jpg';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEMP_DIR = path.join(__dirname, '.temp-covers');

function runWrangler(localFile, r2Key) {
  const cmd = `npx wrangler r2 object put "${R2_BUCKET}/${r2Key}" --file="${localFile}"`;
  try {
    execSync(cmd, { stdio: 'pipe', timeout: 60000 });
    return true;
  } catch (err) {
    console.error(`    Failed: ${err.message}`);
    return false;
  }
}

async function extractCoverArt(mp3Path, outputJpgPath) {
  try {
    const metadata = await parseFile(mp3Path);
    const picture = metadata.common.picture?.[0];
    if (picture) {
      fs.writeFileSync(outputJpgPath, picture.data);
      return true;
    }
  } catch { /* ignore */ }
  return false;
}

async function main() {
  if (R2_BUCKET === 'YOUR_BUCKET_NAME') {
    console.error('Edit this script first: replace YOUR_BUCKET_NAME with your actual R2 bucket name.');
    console.log('\nTo find your bucket name, run: npx wrangler r2 bucket list');
    process.exit(1);
  }

  if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR, { recursive: true });

  const raw = fs.readFileSync(M3U_PATH, 'utf8');
  const lines = raw.split(/\r?\n/).filter(l => l.trim() && !l.startsWith('#'));

  console.log(`\n=== Uploading playlist cover ===`);
  if (fs.existsSync(COVER_IMAGE)) {
    console.log(`  ${COVER_IMAGE} -> ${COVER_R2_KEY}`);
    runWrangler(COVER_IMAGE, COVER_R2_KEY);
  }

  console.log(`\n=== Uploading ${lines.length} tracks + cover art ===\n`);

  let uploaded = 0, failed = 0;

  for (let i = 0; i < lines.length; i++) {
    let relative = lines[i];
    if (relative.startsWith('.\\') || relative.startsWith('./')) relative = relative.slice(2);
    const r2Key = relative.replace(/\\/g, '/');
    const localPath = path.join(MUSIC_DIR, relative);

    console.log(`[${i + 1}/${lines.length}] ${r2Key}`);

    if (!fs.existsSync(localPath)) {
      console.log(`  SKIP (file not found locally)`);
      failed++;
      continue;
    }

    // Upload MP3
    console.log(`  Uploading MP3...`);
    const mp3Ok = runWrangler(localPath, r2Key);

    // Extract and upload album art
    const coverKey = r2Key.replace(/\.mp3$/i, '.jpg');
    const tempJpg = path.join(TEMP_DIR, `track-${i + 1}.jpg`);

    const hasArt = await extractCoverArt(localPath, tempJpg);
    if (hasArt) {
      console.log(`  Uploading cover art...`);
      runWrangler(tempJpg, coverKey);
      fs.unlinkSync(tempJpg);
    } else {
      console.log(`  No embedded cover art found`);
    }

    if (mp3Ok) uploaded++;
    else failed++;
  }

  // Cleanup
  if (fs.existsSync(TEMP_DIR)) fs.rmSync(TEMP_DIR, { recursive: true });

  console.log(`\n=== Done ===`);
  console.log(`Uploaded: ${uploaded} | Failed: ${failed}`);
}

main();
