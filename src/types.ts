export interface LyricLine {
  id: number;
  startTime: number; // in seconds
  endTime: number;
  text: string;
  emphasisWords?: string[];
  illustrationPhase: string; // clue for which elements the thread is drawing
  subtitleNote?: string;
}

export interface Point {
  x: number;
  y: number;
}

export interface ThreadPath {
  id: string;
  points: Point[];
  progress: number; // 0 to 1
  color?: string;
  width?: number;
  isComplete?: boolean;
}

export interface FloatingParticle {
  x: number;
  y: number;
  size: number;
  alpha: number;
  speedX: number;
  speedY: number;
  phase: number;
  color: string;
}

export interface InteractiveSpark {
  x: number;
  y: number;
  size: number;
  alpha: number;
  life: number;
  type: 'heart' | 'star' | 'sparkle';
  vx: number;
  vy: number;
}
