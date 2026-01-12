import fs from 'fs';
import { parseStream } from 'music-metadata';
import { Readable } from 'stream';

// --- CONFIGURATION ---
const inputPath = './src/data/playlist.json';
const outputPath = './src/data/playlist-updated.json';

// Helper function to format seconds into MM:SS
const formatDuration = (seconds) => {
    if (!seconds || isNaN(seconds)) return "";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
};

async function updatePlaylist() {
    try {
        console.log("📂 Reading playlist...");
        const rawData = fs.readFileSync(inputPath, 'utf8');
        let playlist = JSON.parse(rawData);

        console.log(`📊 Processing ${playlist.length} songs... This might take a moment.`);

        for (let i = 0; i < playlist.length; i++) {
            const track = playlist[i];
            
            // 1. Update Cover (Keep your existing logic)
            if (track.src && track.src.toLowerCase().endsWith('.mp3')) {
                const newCoverUrl = track.src.replace(/\.mp3$/i, '.jpg');
                track.cover = newCoverUrl;
            }

            // 2. Fetch Duration (Only if missing)
            if (!track.duration || track.duration === "") {
                try {
                    console.log(`   🎵 Fetching metadata for: ${track.title}`);
                    
                    const response = await fetch(track.src);
                    
                    if (response.ok && response.body) {
                        // Convert Web Stream to Node Stream for the library
                        const nodeStream = Readable.fromWeb(response.body);
                        
                        const metadata = await parseStream(nodeStream, { 
                            mimeType: 'audio/mpeg', 
                            size: parseInt(response.headers.get('content-length')) 
                        });
                        
                        const durationSecs = metadata.format.duration;
                        const formattedTime = formatDuration(durationSecs);
                        
                        console.log(`      ✅ Duration found: ${formattedTime}`);
                        track.duration = formattedTime;
                    } else {
                        console.warn(`      ⚠️ Could not fetch URL: ${response.statusText}`);
                    }
                } catch (err) {
                    console.error(`      ❌ Error reading metadata for ${track.title}:`, err.message);
                }
            } else {
                console.log(`   ⏩ Skipping ${track.title} (Duration exists)`);
            }
        }

        // Save the file
        fs.writeFileSync(outputPath, JSON.stringify(playlist, null, 2), 'utf8');
        console.log("------------------------------------------------");
        console.log(`✅ Success! New file saved at: ${outputPath}`);
        console.log(`📝 Check the file, then delete 'playlist.json' and rename this new file to 'playlist.json'.`);

    } catch (error) {
        console.error("❌ Fatal Error:", error);
    }
}

updatePlaylist();