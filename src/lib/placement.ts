import { Thought } from '../types';

interface Point {
  x: number;
  y: number;
}

const MIN_DISTANCE = 80;
const MAX_DISTANCE = 250;

export function calculateNextStarPosition(width: number, height: number, existingThoughts: Thought[]): { position: Point, connectedToId: string | null } {
  const center = { x: width / 2, y: height / 2 };

  if (existingThoughts.length === 0) {
    return { position: center, connectedToId: null };
  }

  const lastThought = existingThoughts[existingThoughts.length - 1];
  let parent = lastThought;

  if (existingThoughts.length > 5 && Math.random() < 0.15) {
    parent = existingThoughts[Math.floor(Math.random() * existingThoughts.length)];
  }

  let attempts = 0;
  const maxAttempts = 50;
  
  while (attempts < maxAttempts) {
    const angle = Math.random() * Math.PI * 2;
    const distance = MIN_DISTANCE + Math.random() * (MAX_DISTANCE - MIN_DISTANCE);

    const nx = parent.x + Math.cos(angle) * distance;
    const ny = parent.y + Math.sin(angle) * distance;

    const margin = 50;
    if (nx < margin || nx > width - margin || ny < margin || ny > height - margin) {
      attempts++;
      continue;
    }

    let collision = false;
    for (const t of existingThoughts) {
      const dx = t.x - nx;
      const dy = t.y - ny;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d < MIN_DISTANCE * 0.8) {
        collision = true;
        break;
      }
    }

    if (!collision) {
      return { position: { x: nx, y: ny }, connectedToId: parent.id };
    }

    attempts++;
  }

  return { 
    position: {
      x: center.x + (Math.random() - 0.5) * 200,
      y: center.y + (Math.random() - 0.5) * 200
    },
    connectedToId: null
  };
}
