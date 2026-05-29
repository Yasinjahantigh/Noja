export type Emotion = 'calm' | 'happy' | 'sad' | 'angry' | 'neutral';

export interface Thought {
  id: string;
  text: string;
  emotion: Emotion;
  x: number;
  y: number;
  timestamp: number;
  connectedToId?: string | null;
}

export interface AppState {
  thoughts: Thought[];
  audioEnabled: boolean;
}
