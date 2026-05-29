import { Thought } from '../types';

const STORAGE_KEY = 'noja_thoughts_v1';
const AUDIO_PREF_KEY = 'noja_audio_v1';

export function loadThoughts(): Thought[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      return JSON.parse(data) as Thought[];
    }
  } catch (err) {
    console.error('Failed to load thoughts:', err);
  }
  return [];
}

export function saveThoughts(thoughts: Thought[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(thoughts));
  } catch (err) {
    console.error('Failed to save thoughts:', err);
  }
}

export function loadAudioPref(): boolean {
  try {
    const data = localStorage.getItem(AUDIO_PREF_KEY);
    if (data !== null) {
      return data === 'true';
    }
  } catch (err) {
    console.error('Failed to load audio preference:', err);
  }
  return false;
}

export function saveAudioPref(enabled: boolean): void {
  try {
    localStorage.setItem(AUDIO_PREF_KEY, enabled ? 'true' : 'false');
  } catch (err) {
    console.error('Failed to save audio preference:', err);
  }
}
