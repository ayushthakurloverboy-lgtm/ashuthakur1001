import React, { useState, useEffect, useMemo } from 'react';
import { AnimatePresence } from 'motion/react';
import { SECRET_DOOR_LYRICS, TOTAL_SONG_DURATION } from './data/lyrics';
import { secretDoorAudio } from './audio/secretDoorAudio';
import { ThreadCanvas } from './components/ThreadCanvas';
import { OpeningScreen } from './components/OpeningScreen';
import { LyricsDisplay } from './components/LyricsDisplay';
import { AudioControls } from './components/AudioControls';
import { EndingCard } from './components/EndingCard';

export default function App() {
  const [hasStarted, setHasStarted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isEnded, setIsEnded] = useState(false);

  // Sync audio engine with state
  useEffect(() => {
    secretDoorAudio.onTimeUpdate((time) => {
      setCurrentTime(time);
      if (time >= TOTAL_SONG_DURATION - 0.2) {
        setIsEnded(true);
      }
    });

    secretDoorAudio.onEnded(() => {
      setIsPlaying(false);
      setIsEnded(true);
    });

    return () => {
      secretDoorAudio.pause();
    };
  }, []);

  const handleStart = () => {
    setHasStarted(true);
    setIsPlaying(true);
    setIsEnded(false);
    secretDoorAudio.start(0);
  };

  const handleTogglePlay = () => {
    if (isPlaying) {
      secretDoorAudio.pause();
      setIsPlaying(false);
    } else {
      secretDoorAudio.resume();
      setIsPlaying(true);
    }
  };

  const handleReplay = () => {
    setIsEnded(false);
    setCurrentTime(0);
    setIsPlaying(true);
    secretDoorAudio.start(0);
  };

  // Determine current active lyric line
  const currentLine = useMemo(() => {
    if (!hasStarted) return null;
    return (
      SECRET_DOOR_LYRICS.find(
        (line) => currentTime >= line.startTime && currentTime <= line.endTime
      ) || null
    );
  }, [hasStarted, currentTime]);

  const progressRatio = Math.min(1, currentTime / TOTAL_SONG_DURATION);

  return (
    <div className="w-full h-full min-h-[100dvh] bg-[#ece5d8] flex items-center justify-center font-sans text-[#2c2825] overflow-hidden p-0 sm:p-4">
      <main
        id="canvas-sheet-main"
        className="relative w-full h-[100dvh] max-w-md sm:max-h-[900px] sm:h-[94vh] sm:rounded-2xl bg-canvas-sheet border-0 sm:border sm:border-[#ded5c2] shadow-[0_15px_45px_rgba(65,50,35,0.12)] overflow-hidden select-none flex flex-col justify-between"
      >
        {/* Authentic Canvas Paper Grain Overlay */}
        <div className="canvas-grain" />

        {/* Crayon / Colored Pencil Drawing Engine on Canvas */}
        <ThreadCanvas
          currentTime={hasStarted ? currentTime : 0}
          isPlaying={isPlaying}
        />

        {/* Opening Screen on Canvas Sheet */}
        <AnimatePresence>
          {!hasStarted && <OpeningScreen onStart={handleStart} />}
        </AnimatePresence>

        {/* Main Canvas Experience Elements */}
        {hasStarted && (
          <>
            {/* Top Toolbar with Minimal Play/Pause & Progress */}
            <AudioControls
              isPlaying={isPlaying}
              onTogglePlay={handleTogglePlay}
              progressRatio={progressRatio}
            />

            {/* Handwritten Crayon Lyrics Display at Bottom of Canvas */}
            <LyricsDisplay currentLine={currentLine} currentTime={currentTime} />

            {/* Ending Card on Canvas */}
            <AnimatePresence>
              {isEnded && <EndingCard onReplay={handleReplay} />}
            </AnimatePresence>
          </>
        )}
      </main>
    </div>
  );
}

