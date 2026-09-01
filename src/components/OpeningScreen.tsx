import React from 'react';
import { motion } from 'motion/react';

interface OpeningScreenProps {
  onStart: () => void;
}

export const OpeningScreen: React.FC<OpeningScreenProps> = ({ onStart }) => {
  return (
    <motion.div
      id="opening-screen-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.98, filter: 'blur(4px)' }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="absolute inset-0 z-40 flex flex-col items-center justify-center p-6 text-center bg-[#fbf7ee]/92 backdrop-blur-[2px]"
    >
      {/* Main card container */}
      <div className="relative max-w-sm w-full mx-auto flex flex-col items-center z-10 px-4">
        {/* Subtle decorative crayon heart */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.0, delay: 0.15 }}
          className="mb-4 text-[#c24b38]"
        >
          <svg width="42" height="42" viewBox="0 0 24 24" fill="none" className="filter drop-shadow-[0_2px_4px_rgba(194,75,56,0.2)]">
            <path
              d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </motion.div>

        {/* Hey Vagmii ❤️ */}
        <motion.h1
          id="opening-greeting-title"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.25, ease: 'easeOut' }}
          className="font-romantic text-3xl sm:text-4xl md:text-5xl font-normal tracking-wide text-[#2c2825] mb-3"
        >
          Hey Vagmii <span className="text-[#c24b38] font-sans inline-block hover:scale-110 transition-transform">❤️</span>
        </motion.h1>

        {/* Please click the start button... This song is for you. */}
        <motion.div
          id="opening-subtext-message"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 0.9, y: 0 }}
          transition={{ duration: 0.9, delay: 0.4, ease: 'easeOut' }}
          className="font-handwriting text-2xl sm:text-3xl text-[#524942] mb-9 leading-relaxed max-w-xs space-y-1"
        >
          <p>Please click the start button...</p>
          <p className="text-[#c24b38] font-semibold">This song is for you.</p>
        </motion.div>

        {/* Start ♡ Button */}
        <motion.button
          id="start-surprise-button"
          type="button"
          onClick={onStart}
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.04, boxShadow: '0 4px 20px rgba(194, 75, 56, 0.2)' }}
          whileTap={{ scale: 0.96 }}
          transition={{ duration: 0.6, delay: 0.55 }}
          className="group relative px-8 py-3.5 rounded-full border-2 border-[#2c2825]/80 bg-[#fdfaf3] text-[#2c2825] font-medium tracking-wide text-base shadow-[0_4px_14px_rgba(44,40,37,0.08)] hover:bg-[#2c2825] hover:text-[#fdfaf3] transition-all duration-200 active:outline-none cursor-pointer"
        >
          <span className="flex items-center gap-2 font-crayon text-2xl tracking-wider">
            Start <span className="text-[#c24b38] group-hover:text-rose-300 transition-colors">♡</span>
          </span>
        </motion.button>
      </div>
    </motion.div>
  );
};


