import { LyricLine } from '../types';

export const SECRET_DOOR_LYRICS: LyricLine[] = [
  {
    id: 1,
    startTime: 0.0,
    endTime: 3.8,
    text: "So can I call you tonight?",
    emphasisWords: ["call you tonight", "tonight", "call"],
    illustrationPhase: "call_tonight",
  },
  {
    id: 2,
    startTime: 3.8,
    endTime: 7.6,
    text: "I'm trying to make up my mind",
    emphasisWords: ["make up my mind", "trying"],
    illustrationPhase: "make_up_mind",
  },
  {
    id: 3,
    startTime: 7.6,
    endTime: 11.4,
    text: "Just how I feel",
    emphasisWords: ["how I feel", "feel"],
    illustrationPhase: "how_i_feel",
  },
  {
    id: 4,
    startTime: 11.4,
    endTime: 15.2,
    text: "Could you tell me what's real?",
    emphasisWords: ["tell me", "what's real"],
    illustrationPhase: "whats_real",
  },
  {
    id: 5,
    startTime: 15.2,
    endTime: 19.0,
    text: "I hear your voice on the phone",
    emphasisWords: ["voice on the phone", "hear your voice"],
    illustrationPhase: "voice_on_phone",
  },
  {
    id: 6,
    startTime: 19.0,
    endTime: 22.8,
    text: "Now I'm no longer alone",
    emphasisWords: ["no longer alone", "alone"],
    illustrationPhase: "no_longer_alone",
  },
  {
    id: 7,
    startTime: 22.8,
    endTime: 26.6,
    text: "Just how I feel",
    emphasisWords: ["how I feel", "feel"],
    illustrationPhase: "how_i_feel_repeat",
  },
  {
    id: 8,
    startTime: 26.6,
    endTime: 30.6,
    text: "Could you tell me what's real anymore?",
    emphasisWords: ["what's real anymore", "anymore", "tell me"],
    illustrationPhase: "real_anymore",
  },
  {
    id: 9,
    startTime: 30.6,
    endTime: 34.0,
    text: "'Cause I wouldn't know...",
    emphasisWords: ["I wouldn't know", "wouldn't know"],
    illustrationPhase: "wouldnt_know",
  },
  {
    id: 10,
    startTime: 34.0,
    endTime: 45.7,
    text: "📞 \"Goodbye, you have reached a number that has been disconnected...\"",
    emphasisWords: ["disconnected", "reached a number"],
    illustrationPhase: "grand_canvas_love",
  },
];

export const TOTAL_SONG_DURATION = 45.7; // in seconds matching the audio clip

