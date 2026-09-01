import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LyricLine } from '../types';

interface LyricsDisplayProps {
  currentLine: LyricLine | null;
  currentTime: number;
}

export const LyricsDisplay: React.FC<LyricsDisplayProps> = ({ currentLine }) => {
  return (
    <div
      id="lyrics-display-container"
      className="absolute bottom-8 sm:bottom-12 left-0 right-0 z-30 pointer-events-none flex flex-col items-center justify-end px-5 min-h-[120px]"
    >
      <AnimatePresence mode="wait">
        {currentLine && (
          <motion.div
            key={currentLine.id}
            id={`lyric-line-${currentLine.id}`}
            initial={{ opacity: 0, y: 12, filter: 'blur(3px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -8, filter: 'blur(3px)' }}
            transition={{
              duration: 0.55,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="text-center max-w-md w-full bg-[#fdfbf6]/92 backdrop-blur-sm px-6 py-4 rounded-2xl border border-[#ded5c2] shadow-[0_4px_18px_rgba(60,45,30,0.06)]"
          >
            {/* Handwritten crayon lyric text */}
            <p className="font-crayon text-2xl sm:text-3xl text-[#2c2825] tracking-wide leading-relaxed crayon-text">
              {currentLine.text.split(' ').map((word, wIdx) => {
                const cleanWord = word.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, '').toLowerCase();
                const isHighlighted = currentLine.emphasisWords?.some(
                  (ew) => cleanWord.includes(ew.toLowerCase()) || ew.toLowerCase().includes(cleanWord)
                );

                if (isHighlighted) {
                  return (
                    <motion.span
                      key={wIdx}
                      initial={{ scale: 1 }}
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 2.0, repeat: Infinity, ease: 'easeInOut' }}
                      className="inline-block mx-1 font-semibold text-[#c24b38] crayon-highlight"
                    >
                      {word}
                    </motion.span>
                  );
                }

                return (
                  <span key={wIdx} className="inline-block mx-0.5 text-[#3e3833]">
                    {word}
                  </span>
                );
              })}
            </p>

            {/* Subtle crayon stroke flourish underline */}
            <motion.div
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 0.65 }}
              exit={{ scaleX: 0, opacity: 0 }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="mt-2 mx-auto w-20 h-[1.5px] bg-[#c24b38]/40 rounded-full"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
