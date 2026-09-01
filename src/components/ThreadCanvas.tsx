import React, { useEffect, useRef } from 'react';

interface ThreadCanvasProps {
  currentTime: number;
  isPlaying: boolean;
}

// Generate organic hand-drawn wobble for crayon / pencil strokes
function addWobble(points: { x: number; y: number }[], wobbleAmount = 0.5): { x: number; y: number }[] {
  const result: { x: number; y: number }[] = [];
  for (let i = 0; i < points.length; i++) {
    const p = points[i];
    const angle = i * 2.39996;
    const offset = Math.sin(i * 1.8) * wobbleAmount;
    result.push({
      x: p.x + Math.cos(angle) * offset,
      y: p.y + Math.sin(angle) * offset,
    });
  }
  return result;
}

export const ThreadCanvas: React.FC<ThreadCanvasProps> = ({
  currentTime,
  isPlaying: _isPlaying,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = canvas.parentElement?.clientWidth || 380);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 650);

    const resize = () => {
      if (!canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };
    window.addEventListener('resize', resize);

    let animationTime = 0;

    const render = () => {
      if (!ctx) return;

      animationTime += 0.016;

      // Clean transparent canvas so authentic paper texture shines through
      ctx.clearRect(0, 0, width, height);

      // Fast, snappy phase timing helper (draws rapidly in the first 45% of time, then breathes gracefully)
      const getPhase = (start: number, end: number, drawPortion = 0.45, keepAtEnd = false) => {
        if (currentTime < start) return { progress: 0, alpha: 0, active: false, elapsed: 0, duration: 0 };
        if (currentTime > end && !keepAtEnd) return { progress: 1, alpha: 0, active: false, elapsed: end - start, duration: end - start };

        const totalDuration = end - start;
        const elapsed = currentTime - start;
        const remaining = end - currentTime;
        const drawTime = Math.max(0.6, totalDuration * drawPortion);
        const progress = Math.min(1, Math.max(0, elapsed / drawTime));

        // Smooth fade in / out
        let alpha = 1;
        if (elapsed < 0.2) {
          alpha = elapsed / 0.2;
        } else if (!keepAtEnd && remaining < 0.3) {
          alpha = Math.max(0, remaining / 0.3);
        }

        return { progress, alpha, active: true, elapsed, duration: totalDuration };
      };

      // Organic Crayon / Sketch stroke renderer
      const drawCrayonStroke = (
        points: { x: number; y: number }[],
        progress: number,
        opacityMultiplier = 1,
        colorHex = '#2c2825',
        lineWidth = 2.2,
        hasLeadTip = true
      ) => {
        if (progress <= 0 || opacityMultiplier <= 0.01 || points.length < 2) return;

        const totalSegments = points.length - 1;
        const currentProgressLength = totalSegments * Math.min(1, Math.max(0, progress));
        const fullSegments = Math.floor(currentProgressLength);
        const partial = currentProgressLength - fullSegments;

        let leadPoint = points[0];

        ctx.save();
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // 1. Soft crayon wax textured under-stroke (gives hand-drawn depth)
        ctx.strokeStyle = colorHex;
        ctx.globalAlpha = 0.28 * opacityMultiplier;
        ctx.lineWidth = lineWidth + 1.4;
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i <= fullSegments; i++) {
          ctx.lineTo(points[i].x, points[i].y);
        }
        if (fullSegments < totalSegments && partial > 0) {
          const p1 = points[fullSegments];
          const p2 = points[fullSegments + 1];
          leadPoint = {
            x: p1.x + (p2.x - p1.x) * partial,
            y: p1.y + (p2.y - p1.y) * partial,
          };
          ctx.lineTo(leadPoint.x, leadPoint.y);
        } else if (fullSegments >= totalSegments) {
          leadPoint = points[points.length - 1];
        }
        ctx.stroke();

        // 2. Crisp core sketch stroke
        ctx.globalAlpha = 0.92 * opacityMultiplier;
        ctx.lineWidth = lineWidth;
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i <= fullSegments; i++) {
          ctx.lineTo(points[i].x, points[i].y);
        }
        if (fullSegments < totalSegments && partial > 0) {
          ctx.lineTo(leadPoint.x, leadPoint.y);
        }
        ctx.stroke();

        // 3. Cute glowing crayon stylus tip while actively drawing
        if (hasLeadTip && progress < 0.99 && opacityMultiplier > 0.3) {
          ctx.fillStyle = colorHex;
          ctx.globalAlpha = 0.95 * opacityMultiplier;
          ctx.beginPath();
          ctx.arc(leadPoint.x, leadPoint.y, lineWidth * 1.1, 0, Math.PI * 2);
          ctx.fill();

          // Sparkle aura around lead tip
          ctx.fillStyle = '#ffffff';
          ctx.globalAlpha = 0.8 * opacityMultiplier;
          ctx.beginPath();
          ctx.arc(leadPoint.x, leadPoint.y, lineWidth * 0.5, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      };

      const drawDoodleHeart = (
        cx: number,
        cy: number,
        size: number,
        progress: number,
        alpha: number,
        color = '#c24b38',
        lineWidth = 2.2,
        fillAlpha = 0.0
      ) => {
        if (progress <= 0 || alpha <= 0.01) return;
        const pts: { x: number; y: number }[] = [];
        const steps = 36;
        for (let i = 0; i <= steps; i++) {
          const t = (i / steps) * Math.PI * 2;
          const x = cx + size * 16 * Math.pow(Math.sin(t), 3) / 16;
          const y = cy - size * (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) / 16;
          pts.push({ x, y });
        }

        // Optional soft watercolor fill
        if (fillAlpha > 0 && progress > 0.7) {
          ctx.save();
          ctx.fillStyle = color;
          ctx.globalAlpha = fillAlpha * alpha * Math.min(1, (progress - 0.7) / 0.3);
          ctx.beginPath();
          ctx.moveTo(pts[0].x, pts[0].y);
          for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        }

        drawCrayonStroke(addWobble(pts, 0.4), progress, alpha, color, lineWidth, true);
      };

      const drawMusicNote = (
        x: number,
        y: number,
        scale: number,
        progress: number,
        alpha: number,
        color = '#d9822b'
      ) => {
        if (progress <= 0) return;
        const pts: { x: number; y: number }[] = [];
        const stemH = 22 * scale;
        // Head
        for (let i = 0; i <= 16; i++) {
          const ang = (i / 16) * Math.PI * 2;
          pts.push({ x: x + Math.cos(ang) * 4.5 * scale, y: y + Math.sin(ang) * 3.5 * scale });
        }
        // Stem
        pts.push({ x: x + 4.5 * scale, y: y - stemH });
        // Flag
        pts.push({ x: x + 11 * scale, y: y - stemH + 5 * scale });
        pts.push({ x: x + 8 * scale, y: y - stemH + 10 * scale });
        drawCrayonStroke(addWobble(pts, 0.3), progress, alpha, color, 1.8 * scale, false);
      };

      const drawStar = (
        cx: number,
        cy: number,
        r: number,
        progress: number,
        alpha: number,
        color = '#d9822b'
      ) => {
        if (progress <= 0) return;
        const pts: { x: number; y: number }[] = [];
        const points = 4; // 4-point romantic sparkle diamond
        for (let i = 0; i <= points * 2; i++) {
          const radius = i % 2 === 0 ? r : r * 0.35;
          const angle = (i / (points * 2)) * Math.PI * 2 - Math.PI / 2;
          pts.push({
            x: cx + Math.cos(angle) * radius,
            y: cy + Math.sin(angle) * radius,
          });
        }
        drawCrayonStroke(addWobble(pts, 0.3), progress, alpha, color, 1.6, false);
      };

      // =========================================================================
      // SCENE 1: "So can I call you tonight?" (0.0s - 3.8s)
      // Fast, Crisp Vintage Telephone with looping Heart Cord & Floating Melody
      // =========================================================================
      const p1 = getPhase(0.0, 3.8, 0.45);
      if (p1.active) {
        const cx = width * 0.5;
        const cy = height * 0.38;
        const pulse = 1 + Math.sin(animationTime * 4) * 0.04;

        // 1. Telephone Base & Handset Cradle
        const basePts = [
          { x: cx - 45, y: cy + 15 },
          { x: cx + 45, y: cy + 15 },
          { x: cx + 55, y: cy + 48 },
          { x: cx - 55, y: cy + 48 },
          { x: cx - 45, y: cy + 15 },
        ];
        drawCrayonStroke(addWobble(basePts, 0.3), Math.min(1, p1.progress / 0.5), p1.alpha, '#2c2825', 2.0, false);

        // Dial wheel in center of base with little heart inside
        const dialPts: { x: number; y: number }[] = [];
        for (let i = 0; i <= 20; i++) {
          const ang = (i / 20) * Math.PI * 2;
          dialPts.push({ x: cx + Math.cos(ang) * 14, y: cy + 32 + Math.sin(ang) * 11 });
        }
        drawCrayonStroke(dialPts, Math.min(1, Math.max(0, (p1.progress - 0.2) / 0.4)), p1.alpha, '#d9822b', 1.6, false);
        drawDoodleHeart(cx, cy + 32, 0.35, Math.min(1, Math.max(0, (p1.progress - 0.35) / 0.3)), p1.alpha, '#c24b38', 1.4, 0.3);

        // 2. Handset Receiver Bar (Arched across top)
        const rxW = width * 0.26;
        const receiverPts: { x: number; y: number }[] = [];
        for (let i = 0; i <= 24; i++) {
          const u = i / 24;
          const x = cx - rxW + u * (rxW * 2);
          const arch = Math.sin(u * Math.PI) * 16;
          receiverPts.push({ x, y: cy - 20 - arch });
        }
        drawCrayonStroke(addWobble(receiverPts, 0.35), Math.min(1, p1.progress / 0.45), p1.alpha, '#c24b38', 2.8, true);

        // Left & Right Earpieces
        const leftEarpiece: { x: number; y: number }[] = [];
        for (let i = 0; i <= 16; i++) {
          const ang = (i / 16) * Math.PI * 2;
          leftEarpiece.push({ x: cx - rxW + Math.cos(ang) * 14, y: cy - 15 + Math.sin(ang) * 10 });
        }
        drawCrayonStroke(leftEarpiece, Math.min(1, Math.max(0, (p1.progress - 0.15) / 0.35)), p1.alpha, '#c24b38', 2.2, false);

        const rightEarpiece: { x: number; y: number }[] = [];
        for (let i = 0; i <= 16; i++) {
          const ang = (i / 16) * Math.PI * 2;
          rightEarpiece.push({ x: cx + rxW + Math.cos(ang) * 14, y: cy - 15 + Math.sin(ang) * 10 });
        }
        drawCrayonStroke(rightEarpiece, Math.min(1, Math.max(0, (p1.progress - 0.2) / 0.35)), p1.alpha, '#c24b38', 2.2, false);

        // 3. Ringing Chime Vibrations
        const chimeLeft = [
          { x: cx - rxW - 20, y: cy - 28 },
          { x: cx - rxW - 28, y: cy - 18 },
        ];
        const chimeRight = [
          { x: cx + rxW + 20, y: cy - 28 },
          { x: cx + rxW + 28, y: cy - 18 },
        ];
        drawCrayonStroke(chimeLeft, Math.min(1, Math.max(0, (p1.progress - 0.35) / 0.3)), p1.alpha * (0.6 + Math.sin(animationTime * 8) * 0.3), '#d9822b', 1.8, false);
        drawCrayonStroke(chimeRight, Math.min(1, Math.max(0, (p1.progress - 0.35) / 0.3)), p1.alpha * (0.6 + Math.sin(animationTime * 8) * 0.3), '#d9822b', 1.8, false);

        // 4. Curly Telephone Cord looping down into an elegant Heart
        const cordPts: { x: number; y: number }[] = [];
        const cordSteps = 45;
        for (let i = 0; i <= cordSteps; i++) {
          const u = i / cordSteps;
          const baseX = cx + (u - 0.5) * 60;
          const baseY = cy + 48 + u * 45;
          const curlX = Math.sin(u * Math.PI * 6) * 10;
          const curlY = Math.cos(u * Math.PI * 6) * 3;
          cordPts.push({ x: baseX + curlX, y: baseY + curlY });
        }
        drawCrayonStroke(addWobble(cordPts, 0.3), Math.min(1, Math.max(0, (p1.progress - 0.3) / 0.4)), p1.alpha, '#2c2825', 1.8, false);

        // Dangling Glowing Heart at the bottom
        drawDoodleHeart(cx, cy + 105, 1.1 * pulse, Math.min(1, Math.max(0, (p1.progress - 0.5) / 0.35)), p1.alpha, '#c24b38', 2.4, 0.25);

        // 5. Floating Music Notes & Sparkles
        drawMusicNote(cx - 75, cy - 65, 0.9, Math.min(1, Math.max(0, (p1.progress - 0.4) / 0.3)), p1.alpha, '#d9822b');
        drawMusicNote(cx + 75, cy - 68, 1.0, Math.min(1, Math.max(0, (p1.progress - 0.45) / 0.3)), p1.alpha, '#d9822b');
        drawStar(cx - 50, cy - 80, 8, Math.min(1, Math.max(0, (p1.progress - 0.55) / 0.3)), p1.alpha, '#d9822b');
        drawStar(cx + 50, cy - 82, 9, Math.min(1, Math.max(0, (p1.progress - 0.6) / 0.3)), p1.alpha, '#c24b38');
      }

      // =========================================================================
      // SCENE 2: "I'm trying to make up my mind" (3.8s - 7.6s)
      // Whimsical Thinking Face resting on hand with Celestial Thought Universe
      // =========================================================================
      const p2 = getPhase(3.8, 7.6, 0.45);
      if (p2.active) {
        const cx = width * 0.5;
        const cy = height * 0.38;

        // 1. Profile head & soft nose contour
        const headPts = [
          { x: cx - 25, y: cy - 75 }, // Top head / hair
          { x: cx + 20, y: cy - 55 }, // Forehead
          { x: cx + 22, y: cy - 38 }, // Nose bridge
          { x: cx + 38, y: cy - 28 }, // Cute upturned nose
          { x: cx + 24, y: cy - 18 },
          { x: cx + 30, y: cy - 10 }, // Smiling lips
          { x: cx + 26, y: cy + 0 },
          { x: cx + 34, y: cy + 16 }, // Chin
          { x: cx + 10, y: cy + 32 }, // Jawline
          { x: cx - 12, y: cy + 58 }, // Neck
        ];
        drawCrayonStroke(addWobble(headPts, 0.35), Math.min(1, p2.progress / 0.45), p2.alpha, '#2c2825', 2.2, true);

        // 2. Closed smiling dreaming eye with cute eyelashes
        const eyePts = [
          { x: cx + 10, y: cy - 35 },
          { x: cx + 18, y: cy - 32 },
          { x: cx + 24, y: cy - 36 },
        ];
        drawCrayonStroke(eyePts, Math.min(1, Math.max(0, (p2.progress - 0.25) / 0.3)), p2.alpha, '#2c2825', 2.0, false);

        // Rosy Blushing Cheek
        const blushPts = [
          { x: cx + 8, y: cy - 18 },
          { x: cx + 22, y: cy - 18 },
        ];
        drawCrayonStroke(blushPts, Math.min(1, Math.max(0, (p2.progress - 0.3) / 0.3)), p2.alpha * 0.75, '#c24b38', 3.2, false);

        // 3. Gentle Hand supporting the chin
        const handPts = [
          { x: cx + 34, y: cy + 18 },
          { x: cx + 46, y: cy + 28 },
          { x: cx + 40, y: cy + 46 },
          { x: cx + 18, y: cy + 56 },
        ];
        drawCrayonStroke(addWobble(handPts, 0.3), Math.min(1, Math.max(0, (p2.progress - 0.35) / 0.35)), p2.alpha, '#c24b38', 2.2, false);

        // 4. Cosmic Swirling Thoughts galaxy above head
        const galaxyPts: { x: number; y: number }[] = [];
        for (let i = 0; i <= 35; i++) {
          const t = i * 0.25;
          const r = t * 6.5;
          galaxyPts.push({
            x: cx - 45 + Math.cos(t) * r,
            y: cy - 55 + Math.sin(t) * (r * 0.65),
          });
        }
        drawCrayonStroke(addWobble(galaxyPts, 0.35), Math.min(1, Math.max(0, (p2.progress - 0.4) / 0.4)), p2.alpha, '#d9822b', 1.8, false);

        // Mini Heart & Shooting Star in thoughts
        drawDoodleHeart(cx - 55, cy - 80, 0.7, Math.min(1, Math.max(0, (p2.progress - 0.5) / 0.3)), p2.alpha, '#c24b38', 1.8, 0.2);
        drawStar(cx - 20, cy - 95, 10, Math.min(1, Math.max(0, (p2.progress - 0.55) / 0.3)), p2.alpha, '#d9822b');
        drawStar(cx + 65, cy - 70, 9, Math.min(1, Math.max(0, (p2.progress - 0.6) / 0.3)), p2.alpha, '#c24b38');
      }

      // =========================================================================
      // SCENE 3: "Just how I feel" (7.6s - 11.4s)
      // Fluttering Winged Heart & Pulsating EKG Rhythm
      // =========================================================================
      const p3 = getPhase(7.6, 11.4, 0.45);
      if (p3.active) {
        const cx = width * 0.5;
        const cy = height * 0.38;
        const heartbeat = 1 + Math.sin(animationTime * 6) * 0.08;

        // 1. Center Glowing Crayon Heart
        drawDoodleHeart(cx, cy, 1.45 * heartbeat, Math.min(1, p3.progress / 0.45), p3.alpha, '#c24b38', 2.8, 0.25);

        // 2. Left Fluttering Angel Wing with layered feathers
        const leftWing = [
          { x: cx - 25, y: cy - 10 },
          { x: cx - 65, y: cy - 40 },
          { x: cx - 90, y: cy - 28 },
          { x: cx - 72, y: cy - 5 },
          { x: cx - 88, y: cy + 12 },
          { x: cx - 65, y: cy + 18 },
          { x: cx - 30, y: cy + 22 },
        ];
        drawCrayonStroke(addWobble(leftWing, 0.35), Math.min(1, Math.max(0, (p3.progress - 0.2) / 0.35)), p3.alpha, '#d9822b', 2.0, true);

        // Feather inner ribs
        const leftRib = [
          { x: cx - 55, y: cy - 15 },
          { x: cx - 75, y: cy - 18 },
        ];
        drawCrayonStroke(leftRib, Math.min(1, Math.max(0, (p3.progress - 0.35) / 0.25)), p3.alpha * 0.7, '#d9822b', 1.4, false);

        // 3. Right Fluttering Angel Wing
        const rightWing = [
          { x: cx + 25, y: cy - 10 },
          { x: cx + 65, y: cy - 40 },
          { x: cx + 90, y: cy - 28 },
          { x: cx + 72, y: cy - 5 },
          { x: cx + 88, y: cy + 12 },
          { x: cx + 65, y: cy + 18 },
          { x: cx + 30, y: cy + 22 },
        ];
        drawCrayonStroke(addWobble(rightWing, 0.35), Math.min(1, Math.max(0, (p3.progress - 0.25) / 0.35)), p3.alpha, '#d9822b', 2.0, true);

        const rightRib = [
          { x: cx + 55, y: cy - 15 },
          { x: cx + 75, y: cy - 18 },
        ];
        drawCrayonStroke(rightRib, Math.min(1, Math.max(0, (p3.progress - 0.35) / 0.25)), p3.alpha * 0.7, '#d9822b', 1.4, false);

        // 4. Heartbeat EKG Pulse Wave running across the bottom
        const ekgPts: { x: number; y: number }[] = [
          { x: cx - 115, y: cy + 70 },
          { x: cx - 45, y: cy + 70 },
          { x: cx - 30, y: cy + 52 },
          { x: cx - 18, y: cy + 86 },
          { x: cx, y: cy + 32 },
          { x: cx + 18, y: cy + 92 },
          { x: cx + 30, y: cy + 70 },
          { x: cx + 115, y: cy + 70 },
        ];
        drawCrayonStroke(addWobble(ekgPts, 0.25), Math.min(1, Math.max(0, (p3.progress - 0.35) / 0.4)), p3.alpha, '#2c2825', 1.8, false);

        // Diamond sparkles at pulse peaks
        drawStar(cx, cy + 26, 7, Math.min(1, Math.max(0, (p3.progress - 0.5) / 0.3)), p3.alpha, '#c24b38');
        drawStar(cx - 85, cy - 65, 8, Math.min(1, Math.max(0, (p3.progress - 0.55) / 0.3)), p3.alpha, '#d9822b');
        drawStar(cx + 85, cy - 65, 8, Math.min(1, Math.max(0, (p3.progress - 0.55) / 0.3)), p3.alpha, '#d9822b');
      }

      // =========================================================================
      // SCENE 4: "Could you tell me what's real?" (11.4s - 15.2s)
      // Smiling Crescent Moon with Star Lantern & Starlit Sky
      // =========================================================================
      const p4 = getPhase(11.4, 15.2, 0.45);
      if (p4.active) {
        const cx = width * 0.48;
        const cy = height * 0.37;

        // 1. Crescent Moon contour
        const moonPts: { x: number; y: number }[] = [];
        const mSteps = 28;
        // Outer arc
        for (let i = 0; i <= mSteps; i++) {
          const ang = -Math.PI * 0.68 + (i / mSteps) * Math.PI * 1.36;
          moonPts.push({ x: cx - 12 + Math.cos(ang) * 58, y: cy + Math.sin(ang) * 62 });
        }
        // Inner scoop
        for (let i = mSteps; i >= 0; i--) {
          const ang = -Math.PI * 0.56 + (i / mSteps) * Math.PI * 1.12;
          moonPts.push({ x: cx + 12 + Math.cos(ang) * 44, y: cy + Math.sin(ang) * 50 });
        }
        drawCrayonStroke(addWobble(moonPts, 0.3), Math.min(1, p4.progress / 0.45), p4.alpha, '#d9822b', 2.4, true);

        // 2. Sleeping smiling eye on the moon
        const moonEye = [
          { x: cx + 5, y: cy - 6 },
          { x: cx + 15, y: cy - 2 },
          { x: cx + 24, y: cy - 7 },
        ];
        drawCrayonStroke(moonEye, Math.min(1, Math.max(0, (p4.progress - 0.25) / 0.3)), p4.alpha, '#2c2825', 1.8, false);

        // 3. Hanging Lantern Thread dangling a Star
        const threadPts = [
          { x: cx - 22, y: cy - 56 },
          { x: cx - 35, y: cy - 25 },
          { x: cx - 30, y: cy + 10 },
        ];
        drawCrayonStroke(threadPts, Math.min(1, Math.max(0, (p4.progress - 0.3) / 0.35)), p4.alpha * 0.8, '#2c2825', 1.4, false);
        drawStar(cx - 30, cy + 15, 11, Math.min(1, Math.max(0, (p4.progress - 0.4) / 0.3)), p4.alpha, '#c24b38');

        // 4. Soft Pillowy Cloud Bed underneath
        const cloudPts = [
          { x: cx - 85, y: cy + 75 },
          { x: cx - 45, y: cy + 58 },
          { x: cx - 5, y: cy + 68 },
          { x: cx + 45, y: cy + 56 },
          { x: cx + 85, y: cy + 75 },
        ];
        drawCrayonStroke(addWobble(cloudPts, 0.35), Math.min(1, Math.max(0, (p4.progress - 0.35) / 0.35)), p4.alpha * 0.8, '#2c2825', 1.6, false);

        // Constellation Sparkles
        drawStar(cx + 75, cy - 45, 12, Math.min(1, Math.max(0, (p4.progress - 0.45) / 0.3)), p4.alpha, '#d9822b');
        drawStar(cx - 75, cy - 40, 9, Math.min(1, Math.max(0, (p4.progress - 0.5) / 0.3)), p4.alpha, '#c24b38');
        drawStar(cx + 65, cy + 45, 8, Math.min(1, Math.max(0, (p4.progress - 0.55) / 0.3)), p4.alpha, '#d9822b');
      }

      // =========================================================================
      // SCENE 5: "I hear your voice on the phone" (15.2s - 19.0s)
      // Musical Phone Call Transmission & Radiating Sound Waves
      // =========================================================================
      const p5 = getPhase(15.2, 19.0, 0.45);
      if (p5.active) {
        const cx = width * 0.5;
        const cy = height * 0.38;

        // 1. Telephone wire waveform traveling across
        const waveWire: { x: number; y: number }[] = [];
        for (let i = 0; i <= 35; i++) {
          const u = i / 35;
          const wx = cx - 110 + u * 220;
          const wy = cy + Math.sin(u * Math.PI * 4 + animationTime * 5) * 14;
          waveWire.push({ x: wx, y: wy });
        }
        drawCrayonStroke(addWobble(waveWire, 0.3), Math.min(1, p5.progress / 0.45), p5.alpha, '#2c2825', 1.8, false);

        // 2. Radiating Acoustic Soundwave Arcs
        for (let w = 1; w <= 3; w++) {
          const arcPts: { x: number; y: number }[] = [];
          const r = 22 * w;
          for (let i = 0; i <= 18; i++) {
            const ang = -Math.PI * 0.35 + (i / 18) * (Math.PI * 0.7);
            arcPts.push({ x: cx - 60 + Math.cos(ang) * r, y: cy + Math.sin(ang) * r });
          }
          drawCrayonStroke(
            addWobble(arcPts, 0.25),
            Math.min(1, Math.max(0, (p5.progress - 0.12 * w) / 0.35)),
            p5.alpha,
            w % 2 === 0 ? '#c24b38' : '#d9822b',
            1.8,
            false
          );
        }

        // 3. Smiling Blushing Lips listening on right side
        const lipsUpper = [
          { x: cx + 25, y: cy - 2 },
          { x: cx + 42, y: cy - 10 },
          { x: cx + 55, y: cy - 6 },
          { x: cx + 68, y: cy - 10 },
          { x: cx + 85, y: cy - 2 },
        ];
        drawCrayonStroke(addWobble(lipsUpper, 0.25), Math.min(1, Math.max(0, (p5.progress - 0.25) / 0.35)), p5.alpha, '#c24b38', 2.2, false);

        const lipsLower = [
          { x: cx + 25, y: cy - 2 },
          { x: cx + 55, y: cy + 14 },
          { x: cx + 85, y: cy - 2 },
        ];
        drawCrayonStroke(addWobble(lipsLower, 0.25), Math.min(1, Math.max(0, (p5.progress - 0.3) / 0.35)), p5.alpha, '#c24b38', 2.4, true);

        // 4. Dancing Musical Notes radiating along soundwave
        drawMusicNote(cx - 15, cy - 55, 1.0, Math.min(1, Math.max(0, (p5.progress - 0.35) / 0.3)), p5.alpha, '#d9822b');
        drawMusicNote(cx + 45, cy - 65, 1.2, Math.min(1, Math.max(0, (p5.progress - 0.4) / 0.3)), p5.alpha, '#c24b38');
        drawDoodleHeart(cx + 55, cy - 35, 0.6, Math.min(1, Math.max(0, (p5.progress - 0.45) / 0.3)), p5.alpha, '#c24b38', 1.8, 0.3);
      }

      // =========================================================================
      // SCENE 6: "Now I'm no longer alone" (19.0s - 22.8s)
      // Interlocking Pinky Promise & Red String of Fate Knot
      // =========================================================================
      const p6 = getPhase(19.0, 22.8, 0.45);
      if (p6.active) {
        const cx = width * 0.5;
        const cy = height * 0.38;

        // 1. Left Hand & Pinky reaching in
        const leftHand = [
          { x: cx - 105, y: cy + 22 },
          { x: cx - 65, y: cy + 12 },
          { x: cx - 38, y: cy - 4 },
          { x: cx - 12, y: cy - 16 }, // pinky curl
          { x: cx - 4, y: cy - 4 },
        ];
        drawCrayonStroke(addWobble(leftHand, 0.3), Math.min(1, p6.progress / 0.45), p6.alpha, '#2c2825', 2.2, true);

        // 2. Right Hand & Pinky hooking in
        const rightHand = [
          { x: cx + 105, y: cy + 22 },
          { x: cx + 65, y: cy + 12 },
          { x: cx + 38, y: cy - 4 },
          { x: cx + 12, y: cy - 16 },
          { x: cx + 4, y: cy - 4 },
        ];
        drawCrayonStroke(addWobble(rightHand, 0.3), Math.min(1, Math.max(0, (p6.progress - 0.15) / 0.4)), p6.alpha, '#2c2825', 2.2, true);

        // 3. Interlocking connection loop
        const hookPts = [
          { x: cx - 4, y: cy - 4 },
          { x: cx, y: cy + 6 },
          { x: cx + 4, y: cy - 4 },
        ];
        drawCrayonStroke(hookPts, Math.min(1, Math.max(0, (p6.progress - 0.3) / 0.3)), p6.alpha, '#c24b38', 2.6, false);

        // 4. Red String of Fate Bow Knot around the linked fingers
        const bowLeft = [
          { x: cx, y: cy + 6 },
          { x: cx - 22, y: cy + 20 },
          { x: cx - 18, y: cy + 32 },
          { x: cx, y: cy + 6 },
        ];
        const bowRight = [
          { x: cx, y: cy + 6 },
          { x: cx + 22, y: cy + 20 },
          { x: cx + 18, y: cy + 32 },
          { x: cx, y: cy + 6 },
        ];
        drawCrayonStroke(bowLeft, Math.min(1, Math.max(0, (p6.progress - 0.35) / 0.3)), p6.alpha, '#c24b38', 1.8, false);
        drawCrayonStroke(bowRight, Math.min(1, Math.max(0, (p6.progress - 0.38) / 0.3)), p6.alpha, '#c24b38', 1.8, false);

        // 5. Glowing Heart floating above the promise
        const pulse = 1 + Math.sin(animationTime * 5) * 0.06;
        drawDoodleHeart(cx, cy - 45, 1.25 * pulse, Math.min(1, Math.max(0, (p6.progress - 0.4) / 0.35)), p6.alpha, '#c24b38', 2.4, 0.3);

        // Sparks & Stardust
        drawStar(cx - 38, cy - 65, 8, Math.min(1, Math.max(0, (p6.progress - 0.5) / 0.25)), p6.alpha, '#d9822b');
        drawStar(cx + 38, cy - 65, 8, Math.min(1, Math.max(0, (p6.progress - 0.55) / 0.25)), p6.alpha, '#d9822b');
      }

      // =========================================================================
      // SCENE 7: "Just how I feel" (22.8s - 26.6s)
      // Romantic Lovebirds Perched on Blossom Tree Branch
      // =========================================================================
      const p7 = getPhase(22.8, 26.6, 0.45);
      if (p7.active) {
        const cx = width * 0.5;
        const cy = height * 0.38;

        // 1. Organic Tree Branch
        const branchPts = [
          { x: cx - 115, y: cy + 45 },
          { x: cx - 55, y: cy + 34 },
          { x: cx, y: cy + 38 },
          { x: cx + 65, y: cy + 28 },
          { x: cx + 115, y: cy + 35 },
        ];
        drawCrayonStroke(addWobble(branchPts, 0.35), Math.min(1, p7.progress / 0.4), p7.alpha, '#2c2825', 2.6, false);

        // 2. Bird 1 (Left sweetheart)
        const bird1: { x: number; y: number }[] = [];
        for (let i = 0; i <= 20; i++) {
          const ang = (i / 20) * Math.PI * 2;
          bird1.push({ x: cx - 22 + Math.cos(ang) * 16, y: cy + 18 + Math.sin(ang) * 13 });
        }
        bird1.push({ x: cx - 6, y: cy + 16 }); // Beak
        drawCrayonStroke(addWobble(bird1, 0.25), Math.min(1, Math.max(0, (p7.progress - 0.2) / 0.35)), p7.alpha, '#c24b38', 2.2, false);

        // 3. Bird 2 (Right sweetheart, beaks touching)
        const bird2: { x: number; y: number }[] = [];
        for (let i = 0; i <= 20; i++) {
          const ang = (i / 20) * Math.PI * 2;
          bird2.push({ x: cx + 22 + Math.cos(ang) * 16, y: cy + 18 + Math.sin(ang) * 13 });
        }
        bird2.push({ x: cx + 6, y: cy + 16 }); // Beak
        drawCrayonStroke(addWobble(bird2, 0.25), Math.min(1, Math.max(0, (p7.progress - 0.25) / 0.35)), p7.alpha, '#d9822b', 2.2, false);

        // 4. Floating Love Heart above their beaks
        drawDoodleHeart(cx, cy - 18, 1.05, Math.min(1, Math.max(0, (p7.progress - 0.4) / 0.35)), p7.alpha, '#c24b38', 2.2, 0.3);

        // 5. Cherry Blossom Flowers along branch
        const drawFlower = (fx: number, fy: number, flSize: number, flProgress: number) => {
          if (flProgress <= 0) return;
          for (let p = 0; p < 5; p++) {
            const pAng = (p / 5) * Math.PI * 2;
            const px = fx + Math.cos(pAng) * (flSize * 7);
            const py = fy + Math.sin(pAng) * (flSize * 7);
            drawDoodleHeart(px, py, flSize * 0.4, flProgress, p7.alpha, '#c24b38', 1.4, 0.25);
          }
        };
        drawFlower(cx - 75, cy + 24, 0.8, Math.min(1, Math.max(0, (p7.progress - 0.45) / 0.3)));
        drawFlower(cx + 80, cy + 18, 0.8, Math.min(1, Math.max(0, (p7.progress - 0.5) / 0.3)));
      }

      // =========================================================================
      // SCENE 8: "Could you tell me what's real anymore?" (26.6s - 30.6s)
      // Love Letter Envelope & Flying Origami Airplane with Heart Contrail
      // =========================================================================
      const p8 = getPhase(26.6, 30.6, 0.45);
      if (p8.active) {
        const cx = width * 0.5;
        const cy = height * 0.39;

        // 1. Envelope Rectangle
        const envW = 55;
        const envH = 36;
        const envPts = [
          { x: cx - envW, y: cy - envH + 32 },
          { x: cx + envW, y: cy - envH + 32 },
          { x: cx + envW, y: cy + envH + 32 },
          { x: cx - envW, y: cy + envH + 32 },
          { x: cx - envW, y: cy - envH + 32 },
          // Flap open
          { x: cx, y: cy - envH - 12 + 32 },
          { x: cx + envW, y: cy - envH + 32 },
        ];
        drawCrayonStroke(addWobble(envPts, 0.3), Math.min(1, p8.progress / 0.4), p8.alpha, '#2c2825', 2.0, false);

        // Heart Wax Seal inside envelope
        drawDoodleHeart(cx, cy + 32, 0.75, Math.min(1, Math.max(0, (p8.progress - 0.25) / 0.3)), p8.alpha, '#c24b38', 2.0, 0.4);

        // 2. Loop-de-loop Heart Flight Contrail
        const flightTrail: { x: number; y: number }[] = [];
        const fSteps = 45;
        for (let i = 0; i <= fSteps; i++) {
          const u = i / fSteps;
          const tx = cx + (u - 0.2) * 125 + Math.sin(u * Math.PI * 2) * 28;
          const ty = cy - u * 95 + Math.cos(u * Math.PI * 2) * 16;
          flightTrail.push({ x: tx, y: ty });
        }
        drawCrayonStroke(flightTrail, Math.min(1, Math.max(0, (p8.progress - 0.3) / 0.35)), p8.alpha * 0.85, '#d9822b', 1.6, false);

        // 3. Origami Paper Airplane soaring at top right
        const planeX = cx + 85;
        const planeY = cy - 90;
        const planePts = [
          { x: planeX, y: planeY },
          { x: planeX - 28, y: planeY + 16 },
          { x: planeX - 12, y: planeY + 11 },
          { x: planeX - 16, y: planeY + 24 },
          { x: planeX, y: planeY },
        ];
        drawCrayonStroke(addWobble(planePts, 0.25), Math.min(1, Math.max(0, (p8.progress - 0.45) / 0.35)), p8.alpha, '#c24b38', 2.2, true);

        // Sparkle stars in the sky
        drawStar(planeX - 35, planeY - 15, 8, Math.min(1, Math.max(0, (p8.progress - 0.55) / 0.25)), p8.alpha, '#d9822b');
        drawStar(cx - 70, cy - 45, 9, Math.min(1, Math.max(0, (p8.progress - 0.6) / 0.25)), p8.alpha, '#d9822b');
      }

      // =========================================================================
      // SCENE 9: "'Cause I wouldn't know..." (30.6s - 34.0s)
      // Eternal Infinity Love Knot & Sparkling Cosmic Stardust
      // =========================================================================
      const p9 = getPhase(30.6, 34.0, 0.45);
      if (p9.active) {
        const cx = width * 0.5;
        const cy = height * 0.38;

        // 1. Infinity Lemniscate Ribbon
        const infPts: { x: number; y: number }[] = [];
        const infSteps = 60;
        const a = 75;
        for (let i = 0; i <= infSteps; i++) {
          const t = (i / infSteps) * Math.PI * 2;
          const scale = a / (1 + Math.sin(t) * Math.sin(t));
          const x = cx + scale * Math.cos(t);
          const y = cy + scale * Math.sin(t) * Math.cos(t) * 1.25;
          infPts.push({ x, y });
        }
        drawCrayonStroke(addWobble(infPts, 0.3), Math.min(1, p9.progress / 0.45), p9.alpha, '#c24b38', 2.6, true);

        // 2. Two cute hearts nestled inside each infinity loop
        drawDoodleHeart(cx - 38, cy, 0.75, Math.min(1, Math.max(0, (p9.progress - 0.25) / 0.35)), p9.alpha, '#d9822b', 1.8, 0.25);
        drawDoodleHeart(cx + 38, cy, 0.75, Math.min(1, Math.max(0, (p9.progress - 0.3) / 0.35)), p9.alpha, '#d9822b', 1.8, 0.25);

        // 3. Stardust constellation halo
        drawStar(cx, cy - 48, 10, Math.min(1, Math.max(0, (p9.progress - 0.4) / 0.3)), p9.alpha, '#d9822b');
        drawStar(cx, cy + 48, 10, Math.min(1, Math.max(0, (p9.progress - 0.45) / 0.3)), p9.alpha, '#d9822b');
        drawStar(cx - 75, cy - 30, 8, Math.min(1, Math.max(0, (p9.progress - 0.5) / 0.3)), p9.alpha, '#c24b38');
        drawStar(cx + 75, cy - 30, 8, Math.min(1, Math.max(0, (p9.progress - 0.5) / 0.3)), p9.alpha, '#c24b38');
      }

      // =========================================================================
      // SCENE 10: Operator Outro & Grand Finale (34.0s - 45.7s)
      // Magnificent Grand Double Heart with Botanical Flourishes, Phone Cord & Starlight
      // =========================================================================
      const p10 = getPhase(34.0, 45.7, 0.4, true);
      if (p10.active) {
        const cx = width * 0.5;
        const cy = height * 0.37;
        const pulse = 1 + Math.sin(animationTime * 3) * 0.03;

        // 1. Outer Grand Double Heart
        drawDoodleHeart(cx, cy - 10, 1.85 * pulse, Math.min(1, p10.progress / 0.35), p10.alpha, '#c24b38', 2.8, 0.08);
        drawDoodleHeart(cx, cy - 10, 1.55 * pulse, Math.min(1, Math.max(0, (p10.progress - 0.15) / 0.35)), p10.alpha * 0.85, '#d9822b', 2.0);

        // 2. Decorative Ribbon / Telephone Cord looping around the composition
        const frameCord: { x: number; y: number }[] = [];
        const fcSteps = 50;
        for (let i = 0; i <= fcSteps; i++) {
          const u = i / fcSteps;
          const ang = u * Math.PI * 2;
          const rX = width * 0.42 + Math.sin(u * Math.PI * 6) * 8;
          const rY = height * 0.26 + Math.cos(u * Math.PI * 6) * 8;
          frameCord.push({ x: cx + Math.cos(ang) * rX, y: cy - 10 + Math.sin(ang) * rY });
        }
        drawCrayonStroke(addWobble(frameCord, 0.35), Math.min(1, Math.max(0, (p10.progress - 0.2) / 0.35)), p10.alpha * 0.75, '#2c2825', 1.6, false);

        // 3. Sprouting Botanical Leaves & Flowers at base
        const pFlowers = Math.min(1, Math.max(0, (p10.progress - 0.3) / 0.35));
        if (pFlowers > 0) {
          // Left Branch
          const leftStem = [
            { x: cx - 5, y: cy + 70 },
            { x: cx - 35, y: cy + 92 },
            { x: cx - 65, y: cy + 82 },
          ];
          drawCrayonStroke(addWobble(leftStem, 0.25), pFlowers, p10.alpha, '#2c2825', 1.8, false);
          drawDoodleHeart(cx - 68, cy + 78, 0.65, pFlowers, p10.alpha, '#c24b38', 1.8, 0.3);

          // Right Branch
          const rightStem = [
            { x: cx + 5, y: cy + 70 },
            { x: cx + 35, y: cy + 92 },
            { x: cx + 65, y: cy + 82 },
          ];
          drawCrayonStroke(addWobble(rightStem, 0.25), pFlowers, p10.alpha, '#2c2825', 1.8, false);
          drawDoodleHeart(cx + 68, cy + 78, 0.65, pFlowers, p10.alpha, '#c24b38', 1.8, 0.3);

          // Center Blossom Petals
          for (let petal = 0; petal < 6; petal++) {
            const pAng = (petal / 6) * Math.PI * 2;
            const px = cx + Math.cos(pAng) * 11;
            const py = cy + 78 + Math.sin(pAng) * 11;
            drawDoodleHeart(px, py, 0.28, pFlowers, p10.alpha, '#d9822b', 1.4, 0.4);
          }
        }

        // 4. Stardust celebration bursts
        const pStars = Math.min(1, Math.max(0, (p10.progress - 0.4) / 0.3));
        if (pStars > 0) {
          drawStar(cx - 88, cy - 95, 11, pStars, p10.alpha, '#d9822b');
          drawStar(cx + 88, cy - 95, 11, pStars, p10.alpha, '#d9822b');
          drawStar(cx - 98, cy + 20, 9, pStars, p10.alpha, '#c24b38');
          drawStar(cx + 98, cy + 20, 9, pStars, p10.alpha, '#c24b38');
          drawStar(cx, cy - 100, 10, pStars, p10.alpha, '#d9822b');
        }
      }

      animationFrameRef = requestAnimationFrame(render);
    };

    let animationFrameRef = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', resize);
      if (animationFrameRef) {
        cancelAnimationFrame(animationFrameRef);
      }
    };
  }, [currentTime]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden"
    >
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
};
