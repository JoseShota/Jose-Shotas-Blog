import fs from 'fs';
import path from 'path';
import { parseFile } from 'music-metadata';
import { fileURLToPath } from 'url';

const R2_BUCKET = 'josesmusic';
const M3U_PATH = 'D:\\Music\\Te miré en mí.m3u';
const MUSIC_DIR = 'D:\\Music';
const COVER_IMAGE = 'C:\\Users\\eljos\\Downloads\\1261037.jpg';
const COVER_R2_KEY = 'images/playlist-cover-vol2.jpg';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEMP_DIR = path.join(__dirname, '.temp-covers');
const PS_SCRIPT = path.join(__dirname, 'run-upload.ps1');
const sanitizeR2Key = (key) => key.replace(/\.{2,}/g, '.');

async function main() {
  if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR, { recursive: true });

  const raw = fs.readFileSync(M3U_PATH, 'utf8');
  const lines = raw.split(/\r?\n/).filter(l => l.trim() && !l.startsWith('#'));

  const cmds = [];

  cmds.push(`Write-Host "=== Uploading playlist cover ===" -ForegroundColor Cyan`);
  cmds.push(`npx wrangler r2 object put "${R2_BUCKET}/${COVER_R2_KEY}" --file="${COVER_IMAGE}" --remote`);

  console.log(`Extracting album art for ${lines.length} tracks...`);

  for (let i = 0; i < lines.length; i++) {
    let relative = lines[i];
    if (relative.startsWith('.\\') || relative.startsWith('./')) relative = relative.slice(2);
    const relativeNormalized = relative.replace(/\\/g, '/');
    const r2Key = sanitizeR2Key(relativeNormalized);
    const localPath = path.join(MUSIC_DIR, relative);

    cmds.push(`Write-Host "[${i + 1}/${lines.length}] ${r2Key}" -ForegroundColor Yellow`);

    if (!fs.existsSync(localPath)) {
      cmds.push(`Write-Host "  SKIP - file not found" -ForegroundColor Red`);
      continue;
    }

    cmds.push(`npx wrangler r2 object put "${R2_BUCKET}/${r2Key}" --file="${localPath}" --remote`);

    const coverKey = r2Key.replace(/\.mp3$/i, '.jpg');
    const tempJpg = path.join(TEMP_DIR, `track-${i + 1}.jpg`);

    try {
      const metadata = await parseFile(localPath);
      const picture = metadata.common.picture?.[0];
      if (picture) {
        fs.writeFileSync(tempJpg, picture.data);
        cmds.push(`npx wrangler r2 object put "${R2_BUCKET}/${coverKey}" --file="${tempJpg}" --remote`);
        console.log(`  [${i + 1}/${lines.length}] Extracted art for: ${r2Key}`);
      } else {
        console.log(`  [${i + 1}/${lines.length}] No art: ${r2Key}`);
      }
    } catch {
      console.log(`  [${i + 1}/${lines.length}] Could not read: ${r2Key}`);
    }
  }

  cmds.push(`Write-Host "=== All done! ===" -ForegroundColor Green`);

  const script = cmds.join('\n');
  fs.writeFileSync(PS_SCRIPT, script, 'utf8');

  console.log(`\nGenerated PowerShell script: ${PS_SCRIPT}`);
  console.log(`Total commands: ${cmds.length}`);
  console.log(`\nRun it in your terminal with:`);
  console.log(`  .\\run-upload.ps1`);
}

main();
