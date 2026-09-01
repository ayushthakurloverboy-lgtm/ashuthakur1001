import React from 'react';
import { motion } from 'motion/react';
import { RotateCcw, Heart } from 'lucide-react';

interface EndingCardProps {
  onReplay: () => void;
}

export const EndingCard: React.FC<EndingCardProps> = ({ onReplay }) => {
  return (
    <motion.div
      id="ending-personal-card"
      initial={{ opacity: 0, y: 16, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 1.0, ease: 'easeOut' }}
      className="absolute bottom-8 left-0 right-0 z-30 flex flex-col items-center justify-center px-6 pointer-events-auto"
    >
      <div className="bg-[#fdfbf6]/94 backdrop-blur-sm border border-[#ded5c2] rounded-2xl p-6 max-w-xs w-full text-center shadow-[0_8px_25px_rgba(60,45,30,0.1)] flex flex-col items-center">
        <div className="w-8 h-8 rounded-full bg-[#c24b38]/10 flex items-center justify-center mb-2.5 text-[#c24b38]">
          <Heart className="w-4 h-4 fill-[#c24b38]/70" />
        </div>

        <h2 className="font-romantic text-2xl sm:text-3xl text-[#2c2825] mb-0.5">
          For Vagmii
        </h2>

        <p className="font-handwriting text-2xl text-[#c24b38] mb-4">
          by ashu &lt;3
        </p>

        <button
          id="replay-experience-button"
          type="button"
          onClick={onReplay}
          className="flex items-center gap-2 px-5 py-2 rounded-full border border-[#2c2825]/60 bg-[#fdfaf3] text-[#2c2825] text-sm font-sans tracking-wide hover:bg-[#2c2825] hover:text-[#fdfaf3] transition-all cursor-pointer shadow-[0_2px_8px_rgba(60,45,30,0.06)]"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Play Again ♡</span>
        </button>
      </div>
    </motion.div>
  );
};

