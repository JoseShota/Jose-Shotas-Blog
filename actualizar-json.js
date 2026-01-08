import fs from 'fs';
import path from 'path';

// --- CONFIGURACIÓN ---
// Ruta de tu archivo JSON original
const inputPath = './src/data/playlist.json'; 
// Ruta donde guardaremos el nuevo JSON actualizado
const outputPath = './src/data/playlist-updated.json'; 

// Leemos el archivo
try {
    const rawData = fs.readFileSync(inputPath, 'utf8');
    const playlist = JSON.parse(rawData);

    console.log(`📊 Procesando ${playlist.length} canciones...`);

    // Iteramos y actualizamos
    const updatedPlaylist = playlist.map(track => {
        // Verificamos si tiene un 'src' válido que termine en .mp3
        if (track.src && track.src.toLowerCase().endsWith('.mp3')) {
            // Reemplazamos la extensión .mp3 por .jpg (insensible a mayúsculas/minúsculas)
            const newCoverUrl = track.src.replace(/\.mp3$/i, '.jpg');
            
            // Actualizamos el campo cover
            // Puedes comentar la siguiente línea si quieres mantener el cover original si ya era una URL externa
            track.cover = newCoverUrl; 
        }
        return track;
    });

    // Guardamos el nuevo archivo
    fs.writeFileSync(outputPath, JSON.stringify(updatedPlaylist, null, 2), 'utf8');
    
    console.log(`✅ ¡Listo! Archivo generado en: ${outputPath}`);
    console.log(`📝 Revisa el nuevo archivo y, si todo está bien, renómbralo a 'playlist.json'.`);

} catch (error) {
    console.error("❌ Ocurrió un error:", error.message);
    console.error("Asegúrate de que la ruta 'inputPath' sea correcta.");
}