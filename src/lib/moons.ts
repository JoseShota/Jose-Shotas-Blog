// Escala lunar 0–5: cinco lunas; cada una puede estar llena, a medias o en sombra.
// Cada medio punto tiene nombre propio en ambos idiomas.
export const MOON_NAMES: Record<string, { es: string; en: string }> = {
  '0': { es: 'Eclipse total', en: 'Total eclipse' },
  '0.5': { es: 'Un destello', en: 'A glimmer' },
  '1': { es: 'Luna tímida', en: 'Shy moon' },
  '1.5': { es: 'Media sombra', en: 'Half shadow' },
  '2': { es: 'Creciente', en: 'Waxing' },
  '2.5': { es: 'Media luna', en: 'Half moon' },
  '3': { es: 'Gibosa', en: 'Gibbous' },
  '3.5': { es: 'Casi plena', en: 'Nearly full' },
  '4': { es: 'Resplandor', en: 'Radiant' },
  '4.5': { es: 'Marea alta', en: 'High tide' },
  '5': { es: 'Luna llena', en: 'Full moon' },
};

export type MoonPhase = 'full' | 'half' | 'empty';

export function moonPhases(value: number): MoonPhase[] {
  return Array.from({ length: 5 }, (_, i) => {
    if (value >= i + 1) return 'full';
    if (value >= i + 0.5) return 'half';
    return 'empty';
  });
}

const EMOJI: Record<MoonPhase, string> = { full: '🌕', half: '🌗', empty: '🌑' };

export const MOON_OPTIONS = Object.keys(MOON_NAMES)
  .sort((a, b) => Number(a) - Number(b))
  .map((value) => ({
    value,
    editorLabel: `${moonPhases(Number(value)).map((p) => EMOJI[p]).join('')}  ${value} — ${MOON_NAMES[value].es}`,
  }));

export function moonName(value: number, lang: 'es' | 'en') {
  const key = String(Math.round(value * 2) / 2);
  return MOON_NAMES[key]?.[lang] ?? '';
}
