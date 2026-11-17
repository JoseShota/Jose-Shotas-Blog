/** Acepta un ID o cualquier enlace de YouTube y devuelve el ID de 11 caracteres */
export function youtubeId(input: string = ''): string | null {
  const s = input.trim();
  if (/^[\w-]{11}$/.test(s)) return s;
  const m = s.match(/(?:v=|youtu\.be\/|embed\/|shorts\/|live\/)([\w-]{11})/);
  return m ? m[1] : null;
}
