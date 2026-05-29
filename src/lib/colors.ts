import { Emotion } from '../types';

export const getEmotionColor = (emotion: Emotion): { rgb: string, glow: string, size: number } => {
  switch (emotion) {
    case 'calm':
      return { rgb: '147, 197, 253', glow: 'rgba(147, 197, 253, 0.4)', size: 3.5 };
    case 'happy':
      return { rgb: '253, 224, 71', glow: 'rgba(253, 224, 71, 0.5)', size: 5 };
    case 'sad':
      return { rgb: '125, 211, 252', glow: 'rgba(125, 211, 252, 0.2)', size: 2.5 };
    case 'angry':
      return { rgb: '248, 113, 113', glow: 'rgba(248, 113, 113, 0.6)', size: 4.5 };
    case 'neutral':
    default:
      return { rgb: '226, 232, 240', glow: 'rgba(226, 232, 240, 0.3)', size: 3 };
  }
};
