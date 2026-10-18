import React, { useState, useEffect, useMemo } from 'react';
import { SimState } from '../types/telemetry';

interface FacialMeshVisualizerProps {
  simState: SimState;
  ear?: number;
  perclos?: number;
  blinkFrequency?: number;
  className?: string;
  enableInteractiveControls?: boolean;
}

export const FacialMeshVisualizer: React.FC<FacialMeshVisualizerProps> = ({
  simState,
  ear: customEar,
  perclos: customPerclos,
  blinkFrequency = 16,
  className = '',
  enableInteractiveControls = true,
}) => {
  // HUD view toggles
  const [showMeshLines, setShowMeshLines] = useState(true);
  const [showDenseDots, setShowDenseDots] = useState(true);
  const [showGazeRay, setShowGazeRay] = useState(true);
  const [showAttitudeIndicator, setShowAttitudeIndicator] = useState(true);
  const [isBlinking, setIsBlinking] = useState(false);

  // Dynamic simulation values that animate smoothly
  const [gazeOffset, setGazeOffset] = useState({ x: 0, y: 0 });
  const [headPose, setHeadPose] = useState({ yaw: 0.8, pitch: -2.1, roll: 1.2 });
  const [liveEar, setLiveEar] = useState(customEar || 0.34);
  const [mouthOpenFactor, setMouthOpenFactor] = useState(0);

  // Blink simulation timer based on blinkFrequency
  useEffect(() => {
    // Normal blinking: blinks every ~3.5 seconds
    const blinkInterval = Math.max(1500, Math.round(60000 / (blinkFrequency || 16)));
    const timer = setInterval(() => {
      // Don't do quick normal blink if in danger micro-sleep (where eyes are stuck closed)
      if (simState === 'danger') return;

      setIsBlinking(true);
      const blinkDuration = simState === 'drowsy' ? 320 : 160; // Drowsy blinks are prolonged
      setTimeout(() => {
        setIsBlinking(false);
      }, blinkDuration);
    }, blinkInterval);

    return () => clearInterval(timer);
  }, [blinkFrequency, simState]);

  // Natural subtle gaze micro-saccades and yaw/pitch drift
  useEffect(() => {
    const saccadeInterval = setInterval(() => {
      if (simState === 'danger') {
        // Driver head drooping forward and gaze lost
        setHeadPose({ yaw: 0.2, pitch: -14.2, roll: 2.1 });
        setGazeOffset({ x: 0, y: 15 });
        setMouthOpenFactor(0.4); // slightly slack mouth
      } else if (simState === 'drowsy') {
        // Wandering / off-center gaze
        const randomX = (Math.random() - 0.5) * 14;
        const randomY = Math.random() * 8 + 2;
        setGazeOffset({ x: randomX, y: randomY });
        setHeadPose({
          yaw: parseFloat((randomX * 0.4).toFixed(1)),
          pitch: parseFloat((-2.5 - randomY * 0.5).toFixed(1)),
          roll: 1.0,
        });
        setMouthOpenFactor(0.2);
      } else {
        // Safe: steady forward road fixation with tiny realistic tremors (<2px)
        const tinyX = (Math.random() - 0.5) * 3;
        const tinyY = (Math.random() - 0.5) * 2;
        setGazeOffset({ x: tinyX, y: tinyY });
        setHeadPose({
          yaw: parseFloat((0.8 + tinyX * 0.1).toFixed(1)),
          pitch: parseFloat((-2.1 + tinyY * 0.1).toFixed(1)),
          roll: 1.2,
        });
        setMouthOpenFactor(0);
      }
    }, 600);

    return () => clearInterval(saccadeInterval);
  }, [simState]);

  // Compute effective eyelid openness (EAR)
  useEffect(() => {
    if (customEar) {
      setLiveEar(customEar);
      return;
    }

    if (simState === 'danger') {
      setLiveEar(0.12); // Closed in micro-sleep
    } else if (isBlinking) {
      setLiveEar(0.08); // Full closure on blink
    } else if (simState === 'drowsy') {
      setLiveEar(0.21); // Eyelids drooping
    } else {
      setLiveEar(0.34); // Wide awake nominal
    }
  }, [simState, isBlinking, customEar]);

  // Color grading according to telemetry state
  const stateColor = useMemo(() => {
    if (simState === 'danger' || liveEar < 0.2) return '#ff1744';
    if (simState === 'drowsy' || liveEar < 0.25) return '#ffc769';
    return '#00e5ff';
  }, [simState, liveEar]);

  const eyeAccentColor = useMemo(() => {
    if (simState === 'danger' || liveEar < 0.2) return '#ff1744';
    if (simState === 'drowsy' || liveEar < 0.25) return '#ffc769';
    return '#7dffa2';
  }, [simState, liveEar]);

  // Head center anchor and coordinate shifts
  const cx = 350 + gazeOffset.x * 0.5;
  const cy = 210 + (simState === 'danger' ? 24 : 0); // head drops down in danger

  // Eyelid vertical aperture calculation based on live EAR
  // When liveEar = 0.34, height ~14px; when liveEar = 0.08, height ~2px
  const eyeApertureY = Math.max(2, Math.min(16, liveEar * 44));
  const pupilOffsetX = gazeOffset.x * 0.6;
  const pupilOffsetY = gazeOffset.y * 0.4;

  // Generate 468 simulated landmark grid points mathematically clustered around facial geometry
  const meshPoints = useMemo(() => {
    const pts: { x: number; y: number; group: string }[] = [];

    // Forehead arcs (3 tiers)
    for (let row = 0; row < 3; row++) {
      const y = -75 + row * 14;
      const count = 9 - row;
      for (let i = 0; i < count; i++) {
        const angle = Math.PI * (0.2 + (i / (count - 1)) * 0.6);
        const rx = 65 - row * 3;
        const ry = 45 - row * 2;
        pts.push({
          x: Math.cos(angle) * rx,
          y: Math.sin(angle) * ry + y,
          group: 'forehead',
        });
      }
    }

    // Brows Left (-35 to -10)
    for (let i = 0; i < 5; i++) {
      pts.push({ x: -44 + i * 8, y: -38 + Math.sin(i * 0.8) * 4, group: 'brow_l' });
      pts.push({ x: -42 + i * 7.5, y: -32 + Math.sin(i * 0.8) * 3, group: 'brow_l' });
    }

    // Brows Right (10 to 35)
    for (let i = 0; i < 5; i++) {
      pts.push({ x: 12 + i * 8, y: -38 + Math.sin((4 - i) * 0.8) * 4, group: 'brow_r' });
      pts.push({ x: 14 + i * 7.5, y: -32 + Math.sin((4 - i) * 0.8) * 3, group: 'brow_r' });
    }

    // Nose Bridge & Cartilage
    for (let i = 0; i < 5; i++) {
      pts.push({ x: (Math.random() - 0.5) * 1.5, y: -26 + i * 9, group: 'nose_bridge' });
    }
    // Nose Base & Nostrils
    pts.push({ x: -12, y: 14, group: 'nose' });
    pts.push({ x: 0, y: 15, group: 'nose' });
    pts.push({ x: 12, y: 14, group: 'nose' });
    pts.push({ x: -6, y: 18, group: 'nose' });
    pts.push({ x: 6, y: 18, group: 'nose' });

    // Cheeks & Zygomatic Arches
    for (let i = 0; i < 4; i++) {
      pts.push({ x: -55 + i * 6, y: -5 + i * 9, group: 'cheek_l' });
      pts.push({ x: 55 - i * 6, y: -5 + i * 9, group: 'cheek_r' });
      pts.push({ x: -62 + i * 5, y: 12 + i * 9, group: 'cheek_l' });
      pts.push({ x: 62 - i * 5, y: 12 + i * 9, group: 'cheek_r' });
    }

    // Jawline & Chin Contour
    for (let i = 0; i <= 14; i++) {
      const t = i / 14; // 0 to 1
      const angle = Math.PI * (0.88 - t * 0.76);
      pts.push({
        x: Math.cos(angle) * 72,
        y: Math.sin(angle) * 88 + 10,
        group: 'jaw',
      });
    }

    return pts;
  }, []);

  return (
    <div className={`relative w-full h-full pointer-events-none select-none ${className}`}>
      {/* Interactive HUD Control Toggles Toolbar (Hoverable overlay) */}
      {enableInteractiveControls && (
        <div className="absolute top-2 right-2 pointer-events-auto z-30 flex items-center gap-1.5 bg-[#0a0e16]/85 backdrop-blur-md px-2.5 py-1 rounded-lg border border-[#3b494c]/40 font-mono-tabular text-[10px]">
          <span className="text-[#849396] uppercase font-bold mr-1 hidden sm:inline">HUD OVERLAY:</span>
          <button
            onClick={() => setShowMeshLines(!showMeshLines)}
            className={`px-1.5 py-0.5 rounded transition-colors cursor-pointer ${
              showMeshLines
                ? 'bg-[#00e5ff]/20 text-[#00e5ff] font-bold border border-[#00e5ff]/40'
                : 'text-[#849396] hover:text-white'
            }`}
            title="Toggle 468 Wireframe Tessellation Lines"
          >
            LINES
          </button>
          <button
            onClick={() => setShowDenseDots(!showDenseDots)}
            className={`px-1.5 py-0.5 rounded transition-colors cursor-pointer ${
              showDenseDots
                ? 'bg-[#00e5ff]/20 text-[#00e5ff] font-bold border border-[#00e5ff]/40'
                : 'text-[#849396] hover:text-white'
            }`}
            title="Toggle Landmark Dense Points"
          >
            DOTS
          </button>
          <button
            onClick={() => setShowGazeRay(!showGazeRay)}
            className={`px-1.5 py-0.5 rounded transition-colors cursor-pointer ${
              showGazeRay
                ? 'bg-[#7dffa2]/20 text-[#7dffa2] font-bold border border-[#7dffa2]/40'
                : 'text-[#849396] hover:text-white'
            }`}
            title="Toggle 3D Gaze Vector Ray"
          >
            GAZE RAY
          </button>
          <button
            onClick={() => setShowAttitudeIndicator(!showAttitudeIndicator)}
            className={`px-1.5 py-0.5 rounded transition-colors cursor-pointer ${
              showAttitudeIndicator
                ? 'bg-[#ffc769]/20 text-[#ffc769] font-bold border border-[#ffc769]/40'
                : 'text-[#849396] hover:text-white'
            }`}
            title="Toggle Pitch / Roll Cockpit Attitude Ladder"
          >
            ATTITUDE
          </button>
        </div>
      )}

      {/* Main SVG Vector Surface */}
      <svg
        className="w-full h-full"
        preserveAspectRatio="none"
        viewBox="0 0 700 460"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <filter id="hudGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* 1. Tactical HUD Outer Reticles */}
        <g stroke={stateColor} strokeWidth="2" fill="none" opacity="0.8">
          {/* Top-Left Bracket */}
          <path d="M 24 54 L 24 24 L 54 24" strokeLinecap="round" />
          <line x1="24" y1="24" x2="32" y2="32" strokeWidth="1" opacity="0.6" />
          {/* Top-Right Bracket */}
          <path d="M 676 54 L 676 24 L 646 24" strokeLinecap="round" />
          <line x1="676" y1="24" x2="668" y2="32" strokeWidth="1" opacity="0.6" />
          {/* Bottom-Left Bracket */}
          <path d="M 24 406 L 24 436 L 54 436" strokeLinecap="round" />
          <line x1="24" y1="436" x2="32" y2="428" strokeWidth="1" opacity="0.6" />
          {/* Bottom-Right Bracket */}
          <path d="M 676 406 L 676 436 L 646 436" strokeLinecap="round" />
          <line x1="676" y1="436" x2="668" y2="428" strokeWidth="1" opacity="0.6" />
        </g>

        {/* 2. Cockpit Attitude Horizon & Pitch Ladder */}
        {showAttitudeIndicator && (
          <g opacity="0.4" stroke="#00e5ff" strokeWidth="1">
            {/* Center Horizon Notch */}
            <line x1="310" y1="230" x2="335" y2="230" strokeDasharray="3,2" />
            <line x1="365" y1="230" x2="390" y2="230" strokeDasharray="3,2" />
            <line x1="350" y1="218" x2="350" y2="242" strokeDasharray="3,2" />
            {/* Roll tick marks */}
            <path
              d="M 330 150 A 24 24 0 0 1 370 150"
              fill="none"
              stroke="#ffc769"
              strokeDasharray="2,3"
              strokeWidth="1.2"
            />
            <text x="375" y="152" fill="#ffc769" fontFamily="JetBrains Mono" fontSize="8">
              {headPose.roll > 0 ? `+${headPose.roll}°` : `${headPose.roll}°`} ROLL
            </text>
          </g>
        )}

        {/* 3. DYNAMIC FACIAL MESH & EYE TARGETING CLUSTER (Transformed by Head Pose Center) */}
        <g transform={`translate(${cx}, ${cy})`}>
          {/* 3.1 Simulated 468 Wireframe Tessellation Lines */}
          {showMeshLines && (
            <g
              stroke={stateColor}
              strokeWidth="0.6"
              opacity={simState === 'danger' ? 0.45 : 0.25}
              fill="none"
            >
              {/* Forehead network */}
              <path d="M -50 -70 L 0 -85 L 50 -70 L 40 -50 L 0 -60 L -40 -50 Z" />
              <path d="M -40 -50 L -25 -38 L 0 -45 L 25 -38 L 40 -50" />
              <path d="M -25 -38 L 0 -60 L 25 -38" />

              {/* Brow to Nose to Cheeks Triangular Facets */}
              <path d="M -44 -38 L -30 -38 L -20 -15 L -45 -5 Z" />
              <path d="M 44 -38 L 30 -38 L 20 -15 L 45 -5 Z" />
              <path d="M -20 -15 L 0 -26 L 20 -15 L 0 0 Z" />

              {/* Eye Perimeter Mesh Connection lines */}
              <path d="M -44 -38 L -50 -18 L -45 -5 L -20 -15 L -28 -18 Z" />
              <path d="M 44 -38 L 50 -18 L 45 -5 L 20 -15 L 28 -18 Z" />

              {/* Nose to Lip to Chin Tessellation */}
              <path d="M -12 14 L 0 0 L 12 14 L 0 18 Z" />
              <path d="M -12 14 L -24 35 L 0 35 L 24 35 L 12 14" />
              <path d="M -24 35 L -16 65 L 0 68 L 16 65 L 24 35" />
              <path d="M -16 65 L 0 78 L 16 65 Z" />

              {/* Cheeks to Mandible outer contour */}
              <path d="M -55 -5 L -62 12 L -50 40 L -24 35" />
              <path d="M 55 -5 L 62 12 L 50 40 L 24 35" />
              <path d="M -50 40 L -38 68 L -16 65" />
              <path d="M 50 40 L 38 68 L 16 65" />
            </g>
          )}

          {/* 3.2 468 Dense Facial Landmark Dots */}
          {showDenseDots && (
            <g fill={stateColor} opacity={simState === 'danger' ? 0.7 : 0.45}>
              {meshPoints.map((pt, idx) => (
                <circle key={idx} cx={pt.x} cy={pt.y} r="1.1" />
              ))}
            </g>
          )}

          {/* 3.3 Dynamic Mouth & Yawn Contour */}
          <g>
            <path
              d={`M -22 36 Q 0 ${34 - mouthOpenFactor * 8} 22 36 Q 0 ${
                42 + mouthOpenFactor * 26
              } -22 36 Z`}
              fill={mouthOpenFactor > 0.2 ? 'rgba(255, 180, 171, 0.2)' : 'rgba(0, 229, 255, 0.08)'}
              stroke={mouthOpenFactor > 0.2 ? '#ffb4ab' : stateColor}
              strokeWidth="1.2"
            />
            {mouthOpenFactor > 0.25 && (
              <text
                x="0"
                y="52"
                textAnchor="middle"
                fill="#ffb4ab"
                fontFamily="JetBrains Mono"
                fontSize="7.5"
                fontWeight="bold"
              >
                YAWN APERTURE OPEN
              </text>
            )}
          </g>

          {/* 3.4 LEFT EYE OCULAR TRACKER */}
          <g transform="translate(-28, -18)">
            {/* ROI Bounding Box */}
            <rect
              x="-24"
              y="-15"
              width="44"
              height="30"
              rx="3"
              fill={
                simState === 'danger' || isBlinking
                  ? 'rgba(255, 23, 68, 0.12)'
                  : 'rgba(0, 229, 255, 0.04)'
              }
              stroke={eyeAccentColor}
              strokeDasharray={isBlinking ? 'none' : '4,2'}
              strokeWidth={isBlinking ? '1.8' : '1.2'}
            />

            {/* Upper and Lower Eyelid Dynamic Arcs reacting to live EAR */}
            <path
              d={`M -18 0 Q 0 ${-eyeApertureY} 18 0 Q 0 ${eyeApertureY * 0.9} -18 0 Z`}
              fill="rgba(125, 255, 162, 0.08)"
              stroke={eyeAccentColor}
              strokeWidth="1.5"
            />

            {/* Iris & Pupil tracking gaze offset (only visible if aperture is open) */}
            {eyeApertureY > 3 && (
              <g transform={`translate(${pupilOffsetX}, ${pupilOffsetY})`}>
                {/* Iris outer circle */}
                <circle
                  cx="0"
                  cy="0"
                  r={Math.min(6, eyeApertureY * 0.65)}
                  fill="none"
                  stroke={eyeAccentColor}
                  strokeWidth="1.2"
                />
                {/* Pupil center */}
                <circle
                  cx="0"
                  cy="0"
                  r={Math.min(2.5, eyeApertureY * 0.3)}
                  fill={eyeAccentColor}
                />
              </g>
            )}

            {/* Micro EAR readout on top of ROI */}
            <text
              x="-24"
              y="-19"
              fill={eyeAccentColor}
              fontFamily="JetBrains Mono"
              fontSize="8"
              fontWeight="bold"
            >
              L_EAR: {liveEar.toFixed(2)}
            </text>
          </g>

          {/* 3.5 RIGHT EYE OCULAR TRACKER */}
          <g transform="translate(28, -18)">
            {/* ROI Bounding Box */}
            <rect
              x="-20"
              y="-15"
              width="44"
              height="30"
              rx="3"
              fill={
                simState === 'danger' || isBlinking
                  ? 'rgba(255, 23, 68, 0.12)'
                  : 'rgba(0, 229, 255, 0.04)'
              }
              stroke={eyeAccentColor}
              strokeDasharray={isBlinking ? 'none' : '4,2'}
              strokeWidth={isBlinking ? '1.8' : '1.2'}
            />

            {/* Upper and Lower Eyelid Dynamic Arcs reacting to live EAR */}
            <path
              d={`M -18 0 Q 0 ${-eyeApertureY} 18 0 Q 0 ${eyeApertureY * 0.9} -18 0 Z`}
              fill="rgba(125, 255, 162, 0.08)"
              stroke={eyeAccentColor}
              strokeWidth="1.5"
            />

            {/* Iris & Pupil tracking gaze offset */}
            {eyeApertureY > 3 && (
              <g transform={`translate(${pupilOffsetX}, ${pupilOffsetY})`}>
                <circle
                  cx="0"
                  cy="0"
                  r={Math.min(6, eyeApertureY * 0.65)}
                  fill="none"
                  stroke={eyeAccentColor}
                  strokeWidth="1.2"
                />
                <circle
                  cx="0"
                  cy="0"
                  r={Math.min(2.5, eyeApertureY * 0.3)}
                  fill={eyeAccentColor}
                />
              </g>
            )}

            {/* Micro EAR readout on top of ROI */}
            <text
              x="-20"
              y="-19"
              fill={eyeAccentColor}
              fontFamily="JetBrains Mono"
              fontSize="8"
              fontWeight="bold"
            >
              R_EAR: {liveEar.toFixed(2)}
            </text>
          </g>

          {/* 3.6 3D Glabella Gaze Vector Triad from bridge of nose */}
          {showGazeRay && (
            <g transform="translate(0, -32)">
              {/* Yaw Vector (Horizontal Lateral projection) */}
              <line
                x1="0"
                y1="0"
                x2={headPose.yaw * 35}
                y2="-2"
                stroke="#05e777"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <text
                x={headPose.yaw >= 0 ? headPose.yaw * 35 + 6 : headPose.yaw * 35 - 38}
                y="1"
                fill="#05e777"
                fontFamily="JetBrains Mono"
                fontSize="9"
                fontWeight="bold"
              >
                {headPose.yaw >= 0 ? `+${headPose.yaw}°` : `${headPose.yaw}°`} YAW
              </text>

              {/* Pitch Vector (Vertical Gaze projection) */}
              <line
                x1="0"
                y1="0"
                x2="0"
                y2={headPose.pitch * 6}
                stroke="#00e5ff"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <polygon
                points={`0,${headPose.pitch * 6 - 8} -4,${headPose.pitch * 6} 4,${
                  headPose.pitch * 6
                }`}
                fill="#00e5ff"
              />
              <text
                x="8"
                y={headPose.pitch * 6 + 4}
                fill="#00e5ff"
                fontFamily="JetBrains Mono"
                fontSize="9"
                fontWeight="bold"
              >
                {headPose.pitch >= 0 ? `+${headPose.pitch}°` : `${headPose.pitch}°`} PITCH
              </text>
            </g>
          )}

          {/* 3.7 Chin anchor dot */}
          <circle cx="0" cy="88" r="2.5" fill="#05e777" />
        </g>

        {/* 4. Real-time Status Overlay Text within Reticle bounds */}
        <g fontFamily="JetBrains Mono" fontSize="9.5" letterSpacing="0.5">
          <text x="44" y="68" fill="#00e5ff" fontWeight="bold">
            GAZE VECTOR: {headPose.pitch >= 0 ? `+${headPose.pitch}°` : `${headPose.pitch}°`} PITCH /{' '}
            {headPose.yaw >= 0 ? `+${headPose.yaw}°` : `${headPose.yaw}°`} YAW
          </text>
          <text x="44" y="84" fill="#bac9cc">
            {simState === 'danger'
              ? 'HEAD POSE: SEVERE DROOP OCCLUSION DETECTED'
              : simState === 'drowsy'
              ? 'HEAD POSE: OFF-AXIS SACCADIC DRIFT'
              : 'HEAD POSE: NOMINAL ROAD ALIGNMENT'}
          </text>
          <text x="44" y="100" fill={eyeAccentColor}>
            BLINK STATUS:{' '}
            {simState === 'danger'
              ? 'MICROSLEEP LOCK (> 2.4s)'
              : isBlinking
              ? 'BLINK OCCLUSION ACTIVE'
              : `OPEN (${blinkFrequency}/min)`}
          </text>
        </g>
      </svg>
    </div>
  );
};
