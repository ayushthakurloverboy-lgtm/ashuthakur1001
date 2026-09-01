import React from 'react';
import { Play, Pause } from 'lucide-react';
import { motion } from 'motion/react';

interface AudioControlsProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  progressRatio: number;
}

export const AudioControls: React.FC<AudioControlsProps> = ({
  isPlaying,
  onTogglePlay,
  progressRatio,
}) => {
  const radius = 14;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - progressRatio * circumference;

  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="absolute top-4 right-4 z-40 flex items-center justify-end pointer-events-auto"
    >
      {/* Minimal Play/Pause Button on Paper */}
      <button
        id="minimal-audio-toggle-button"
        type="button"
        onClick={onTogglePlay}
        aria-label={isPlaying ? 'Pause music' : 'Play music'}
        className="relative w-9 h-9 rounded-full flex items-center justify-center bg-[#fdfaf3]/90 border border-[#d6ccb8] text-[#2c2825] hover:border-[#c24b38] hover:text-[#c24b38] transition-all p-0 cursor-pointer focus:outline-none shadow-[0_2px_8px_rgba(60,45,30,0.08)]"
      >
        <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 36 36">
          <circle
            cx="18"
            cy="18"
            r={radius}
            fill="none"
            stroke="rgba(180, 165, 145, 0.25)"
            strokeWidth="1.6"
          />
          <circle
            cx="18"
            cy="18"
            r={radius}
            fill="none"
            stroke="#c24b38"
            strokeWidth="1.8"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-300 ease-out"
          />
        </svg>

        {isPlaying ? (
          <Pause className="w-3.5 h-3.5 fill-current opacity-85" />
        ) : (
          <Play className="w-3.5 h-3.5 fill-current opacity-85 translate-x-0.5" />
        )}
      </button>
    </motion.div>
  );
};

