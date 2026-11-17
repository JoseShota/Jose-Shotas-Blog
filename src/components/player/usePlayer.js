import { useSyncExternalStore } from 'react';
import { player } from '../../lib/player.js';

/** Estado del reproductor global como hook de React */
export function usePlayer() {
  return useSyncExternalStore(player.subscribe, player.getState, player.getState);
}
