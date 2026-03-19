import fs from 'fs';
import path from 'path';
import { parseFile } from 'music-metadata';

const R2_BASE = 'https://pub-aaf3924643cd497aa862a84aa6eaadb0.r2.dev';
const M3U_PATH = 'D:\\Music\\Te miré en mí.m3u';
const MUSIC_DIR = 'D:\\Music';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_PATH = path.join(__dirname, 'src', 'data', 'playlist-vol2.json');

const formatDuration = (seconds) => {
  if (!seconds || isNaN(seconds)) return '';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
};

const stripTrackNumber = (filename) => {
  return filename.replace(/^\d+-?\d*\s+/, '');
};

const sanitizeR2Key = (key) => key.replace(/\.{2,}/g, '.');

async function generate() {
  const raw = fs.readFileSync(M3U_PATH, 'utf8');
  const lines = raw.split(/\r?\n/).filter(l => l.trim() && !l.startsWith('#'));

  const playlist = [];
  let totalSeconds = 0;

  for (let i = 0; i < lines.length; i++) {
    let relative = lines[i];
    if (relative.startsWith('.\\') || relative.startsWith('./')) relative = relative.slice(2);
    const originalRelative = relative.replace(/\\/g, '/');
    const r2Relative = sanitizeR2Key(originalRelative);
    const localPath = path.join(MUSIC_DIR, originalRelative.replace(/\//g, '\\'));
    const parts = originalRelative.split('/');

    const artist = parts[0] || 'Unknown Artist';
    const album = parts[1] || 'Unknown Album';
    const filename = parts[parts.length - 1].replace(/\.mp3$/i, '');
    const fallbackTitle = stripTrackNumber(filename);

    const srcUrl = `${R2_BASE}/${r2Relative}`;
    const coverUrl = srcUrl.replace(/\.mp3$/i, '.jpg');

    let title = fallbackTitle;
    let metaArtist = artist;
    let metaAlbum = album;
    let duration = '';

    try {
      const metadata = await parseFile(localPath);
      if (metadata.common.title) title = metadata.common.title;
      if (metadata.common.artist) metaArtist = metadata.common.artist;
      if (metadata.common.album) metaAlbum = metadata.common.album;
      if (metadata.format.duration) {
        duration = formatDuration(metadata.format.duration);
        totalSeconds += metadata.format.duration;
      }
      console.log(`  [${i + 1}/${lines.length}] ${title} - ${metaArtist} (${duration})`);
    } catch (err) {
      console.warn(`  [${i + 1}/${lines.length}] Could not read metadata for: ${localPath}`);
      console.warn(`    Falling back to path-based info: ${fallbackTitle} - ${artist}`);
    }

    playlist.push({
      id: i + 1,
      title,
      artist: metaArtist,
      album: metaAlbum,
      src: srcUrl,
      cover: coverUrl,
      duration
    });
  }

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(playlist, null, 2), 'utf8');

  const hours = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = Math.floor(totalSeconds % 60);
  const totalFormatted = `${hours}h ${mins.toString().padStart(2, '0')}m ${secs.toString().padStart(2, '0')}s`;

  console.log('\n--- Summary ---');
  console.log(`Tracks: ${playlist.length}`);
  console.log(`Total duration: ${totalFormatted}`);
  console.log(`Output: ${OUTPUT_PATH}`);
}

generate();
