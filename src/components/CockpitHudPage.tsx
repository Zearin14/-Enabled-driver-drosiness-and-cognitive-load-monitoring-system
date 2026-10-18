import React, { useState, useEffect } from 'react';
import { soundManager } from '../utils/soundEffects';
import { useDriverVision } from '../hooks/useDriverVision';
import { CognitiveLoadTrendChart } from './CognitiveLoadTrendChart';

interface CockpitHudPageProps {
  alarmEnabled: boolean;
  onToggleAlarm: () => void;
  onTriggerAlertModal: () => void;
}

export const CockpitHudPage: React.FC<CockpitHudPageProps> = ({
  alarmEnabled,
  onToggleAlarm,
  onTriggerAlertModal,
}) => {
  // Session timer
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(true);

  // Fullscreen critical alert state
  const [isCriticalAlertActive, setIsCriticalAlertActive] = useState(false);
  const [criticalReason, setCriticalReason] = useState<string>('');

  // Calibration state message
  const [calibrateFeedback, setCalibrateFeedback] = useState<string | null>(null);

  // Emergency alarm trigger callback from real computer vision
  const handleEmergencyTrigger = () => {
    if (!alarmEnabled) return;
    setIsCriticalAlertActive(true);
    soundManager.startLoopingAlarm();
  };

  // Initialize real MediaPipe vision hook
  const {
    videoRef,
    canvasRef,
    status,
    errorMessage,
    faceDetected,
    ear,
    earThreshold,
    isEyesClosed,
    eyeClosedDurationSec,
    blinkCount,
    blinksPerMinute,
    mar,
    isYawning,
    yawnCount,
    perclos,
    headPose,
    isNodding,
    roadFocusPercent,
    drowsinessScore,
    cognitiveLoad,
    history60s,
    calibrate,
    resetAlarmState,
    requestCameraPermission,
  } = useDriverVision(handleEmergencyTrigger);

  // Check if eyes closed for 2 seconds or drowsiness > 70
  useEffect(() => {
    if (eyeClosedDurationSec >= 2.0 && !isCriticalAlertActive) {
      setCriticalReason(`Sustained Eye Closure (${eyeClosedDurationSec.toFixed(1)}s >= 2.0s Limit)`);
      handleEmergencyTrigger();
    } else if (drowsinessScore > 70 && !isCriticalAlertActive) {
      setCriticalReason(`High Drowsiness Score (${drowsinessScore}/100 > 70 Limit)`);
      handleEmergencyTrigger();
    }
  }, [eyeClosedDurationSec, drowsinessScore, isCriticalAlertActive]);

  // Dismiss critical alarm when "I'M AWAKE" is clicked
  const handleDismissCriticalAlert = () => {
    soundManager.stopLoopingAlarm();
    soundManager.playBeep(1200, 0.1);
    setIsCriticalAlertActive(false);
    resetAlarmState();
  };

  // Session timer ticker
  useEffect(() => {
    if (!isTimerRunning) return;
    const interval = setInterval(() => {
      setTotalSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const formatTimer = (secs: number) => {
    const h = String(Math.floor(secs / 3600)).padStart(2, '0');
    const m = String(Math.floor((secs % 3600) / 60)).padStart(2, '0');
    const s = String(secs % 60).padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  const handleCalibrateClick = () => {
    const newThresh = calibrate();
    soundManager.playBeep(1100, 0.08);
    setCalibrateFeedback(`Baseline Set (Threshold: ${newThresh})`);
    setTimeout(() => {
      setCalibrateFeedback(null);
    }, 2500);
  };

  // Circular progress math (circumference for r=50 is 314.15)
  const drowsinessCircleOffset = 314.15 * (1 - drowsinessScore / 100);
  const cognitiveCircleOffset = 314.15 * (1 - cognitiveLoad / 100);

  // Status colors
  const stateColor =
    drowsinessScore >= 70 || isEyesClosed
      ? '#ff1744'
      : drowsinessScore >= 45
      ? '#ffc769'
      : '#05e777';

  return (
    <div className="w-full pt-16 min-h-screen bg-[#0f131c] text-[#dfe2ee] px-4 sm:px-6 pb-12">
      {/* Top Telemetry Status Bar */}
      <section className="w-full bg-[#181c24]/80 backdrop-blur-md rounded-xl p-4 mb-4 border border-[#262a33]/80 shadow-lg mt-2">
        <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4">
          {/* Left: Operator & Fleet Unit Identification */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2.5 bg-[#31353e]/50 px-3.5 py-2 rounded-lg border border-[#3b494c]/40">
              <span className="material-symbols-outlined text-[#00e5ff] text-xl">account_circle</span>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-[#dfe2ee] leading-tight">Driver Vision Unit</span>
                <span className="font-mono-tabular text-[11px] text-[#00daf3]">ID: #ND-REALCAM</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 bg-[#31353e]/50 px-3.5 py-2 rounded-lg border border-[#3b494c]/40">
              <span className="material-symbols-outlined text-[#849396] text-xl">videocam</span>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-[#dfe2ee] leading-tight">
                  MediaPipe FaceLandmarker
                </span>
                <span className="font-mono-tabular text-[11px] text-[#7dffa2]">
                  468-POINT VISION ACTIVE
                </span>
              </div>
            </div>

            {/* Live Tracking Status Pill */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0a0e16] border border-[#262a33]">
              <span
                className={`h-2.5 w-2.5 rounded-full inline-block ${
                  faceDetected ? 'bg-[#7dffa2] animate-pulse' : 'bg-[#ffc769] animate-ping'
                }`}
              />
              <span className="font-mono-tabular text-xs font-semibold">
                {faceDetected ? 'FACE TRACKING LOCKED' : 'SEARCHING FOR FACE...'}
              </span>
            </div>
          </div>

          {/* Right: Session Timer & Calibration Controls */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Session Timer */}
            <div className="flex items-center gap-2 bg-[#0a0e16] px-3.5 py-1.5 rounded-lg border border-[#3b494c]/50">
              <span className="material-symbols-outlined text-xs text-[#00e5ff]">timer</span>
              <span className="font-mono-tabular text-sm font-bold text-[#dfe2ee]">
                {formatTimer(totalSeconds)}
              </span>
            </div>

            {/* Calibrate EAR Baseline Button */}
            <button
              onClick={handleCalibrateClick}
              className="px-3 py-1.5 rounded bg-[#262a33] hover:bg-[#353942] text-[#00e5ff] border border-[#00e5ff]/40 transition-colors flex items-center gap-1.5 font-semibold text-xs cursor-pointer shadow-sm active:scale-95"
              type="button"
              title="Calibrate eye-closure threshold from current open eyes"
            >
              <span className="material-symbols-outlined text-sm">tune</span>
              <span>{calibrateFeedback || 'Calibrate EAR Baseline'}</span>
            </button>

            {/* Pause / Resume Session */}
            <button
              onClick={() => setIsTimerRunning(!isTimerRunning)}
              className={`px-3 py-1.5 rounded bg-[#31353e] hover:bg-[#353942] transition-colors flex items-center gap-1.5 font-semibold text-xs border border-[#3b494c]/60 cursor-pointer ${
                !isTimerRunning ? 'text-[#7dffa2]' : 'text-[#dfe2ee]'
              }`}
              type="button"
            >
              <span className="material-symbols-outlined text-[#ffc769] text-sm">
                {isTimerRunning ? 'pause_circle' : 'play_circle'}
              </span>
              <span>{isTimerRunning ? 'Pause' : 'Resume'}</span>
            </button>

            {/* Test Alarm Sound */}
            <button
              onClick={onTriggerAlertModal}
              className="px-3 py-1.5 rounded bg-[#93000a] hover:bg-[#ba1a1a] text-[#ffdad6] transition-colors flex items-center gap-1.5 font-semibold text-xs shadow-md cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-sm">notifications_active</span>
              <span>Test Alarm</span>
            </button>
          </div>
        </div>
      </section>

      {/* Central Grid: Real Webcam & Canvas Overlay (Left) & Real Gauges (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-4">
        {/* LEFT: Live Webcam Feed with Canvas Landmarks Overlay (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col bg-[#0a0e16] rounded-xl border border-[#262a33] overflow-hidden shadow-2xl relative">
          {/* Top Video Header */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-[#181c24] border-b border-[#262a33] z-20">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#00e5ff] text-base">
                center_focus_strong
              </span>
              <span className="font-mono-tabular text-xs text-[#dfe2ee] uppercase tracking-wider font-semibold">
                LIVE OPTICAL DRIVER FEED
              </span>
            </div>

            {/* Real-Time Live Status Pill */}
            <div className="flex items-center gap-2">
              {status === 'permission_denied' || status === 'error' ? (
                <button
                  onClick={() => requestCameraPermission()}
                  className="flex items-center gap-1.5 text-[#ffdad6] font-mono-tabular text-xs font-bold bg-[#93000a] hover:bg-[#ba1a1a] px-3 py-1 rounded-lg border border-[#ff1744] cursor-pointer shadow-md transition-all active:scale-95 animate-pulse"
                  type="button"
                >
                  <span className="material-symbols-outlined text-sm">videocam_off</span>
                  <span>CLICK TO ALLOW CAMERA</span>
                </button>
              ) : faceDetected ? (
                <span className="flex items-center gap-1.5 text-[#7dffa2] font-mono-tabular text-xs font-bold bg-[#05e777]/10 px-2.5 py-0.5 rounded border border-[#05e777]/30">
                  <span className="w-2 h-2 rounded-full bg-[#05e777] animate-pulse" />
                  FACE DETECTED
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-[#ffc769] font-mono-tabular text-xs font-bold bg-[#ffc769]/10 px-2.5 py-0.5 rounded border border-[#ffc769]/30">
                  <span className="w-2 h-2 rounded-full bg-[#ffc769] animate-ping" />
                  NO FACE IN VIEW
                </span>
              )}
            </div>
          </div>

          {/* Video & Canvas Viewport */}
          <div className="relative w-full h-[460px] bg-[#0a0e16] overflow-hidden flex items-center justify-center">
            {/* Real Webcam <video> Element - Mirrored as requested */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover -scale-x-100 select-none"
            />

            {/* Real Landmark Overlay <canvas> - Mirrored 1:1 with video */}
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full pointer-events-none -scale-x-100 z-10"
            />

            {/* Clear State 1: Loading AI Model */}
            {status === 'loading_model' && (
              <div className="absolute inset-0 z-30 bg-[#0a0e16]/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center">
                <div className="w-12 h-12 border-3 border-[#00e5ff] border-t-transparent rounded-full animate-spin mb-4" />
                <h4 className="text-base font-bold text-[#c3f5ff] mb-1">
                  Loading AI Vision Model…
                </h4>
                <p className="text-xs text-[#849396] max-w-sm">
                  Initializing MediaPipe FaceLandmarker WebAssembly and downloading float16 neural model.
                </p>
              </div>
            )}

            {/* Clear State 2: Camera Permission Required or Denied */}
            {(status === 'permission_denied' || status === 'error') && (
              <div className="absolute inset-0 z-30 bg-[#0a0e16]/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center">
                <div className="w-14 h-14 rounded-2xl bg-[#93000a] text-[#ffdad6] flex items-center justify-center mb-3 shadow-lg">
                  <span className="material-symbols-outlined text-3xl">videocam_off</span>
                </div>
                <h4 className="text-lg font-bold text-[#ffb4ab] mb-1">
                  Camera Permission Required
                </h4>
                <p className="text-xs text-[#dfe2ee] max-w-md leading-relaxed mb-3">
                  NeuroDrive uses real-time local on-device computer vision to detect facial landmarks and eye aspect ratio. Zero video is recorded or sent to any server.
                </p>

                {errorMessage && (
                  <div className="max-w-md w-full bg-[#181c24] border border-[#ff1744]/40 text-[#ffdad6] text-[11px] font-mono-tabular p-2.5 rounded-lg mb-4 text-left break-words">
                    <span className="text-[#849396] font-bold block mb-1">Diagnostic Output:</span>
                    {errorMessage}
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-center gap-3 mb-4">
                  {/* Primary Direct Request Button - initiates getUserMedia from direct user click gesture */}
                  <button
                    onClick={() => requestCameraPermission()}
                    className="px-5 py-2.5 rounded-xl bg-[#00e5ff] hover:bg-[#9cf0ff] text-[#001f24] font-black text-xs uppercase tracking-wider cursor-pointer shadow-[0_0_20px_rgba(0,229,255,0.4)] flex items-center gap-2 transform active:scale-95 transition-all"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-base">videocam</span>
                    <span>Grant / Request Camera Access</span>
                  </button>

                  {/* Open in Standalone Tab (bypasses iframe permissions sandbox) */}
                  <a
                    href={window.location.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2.5 rounded-xl bg-[#262a33] hover:bg-[#353942] text-[#c3f5ff] font-bold text-xs border border-[#3b494c]/60 cursor-pointer flex items-center gap-1.5 transition-all"
                  >
                    <span className="material-symbols-outlined text-base">open_in_new</span>
                    <span>Open in Dedicated Tab</span>
                  </a>
                </div>

                <div className="p-3 bg-[#181c24]/90 rounded-lg border border-[#262a33] text-[11px] text-[#849396] max-w-md text-left space-y-1">
                  <div className="font-semibold text-[#bac9cc] flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs text-[#ffc769]">info</span>
                    <span>If the browser prompt didn&apos;t appear:</span>
                  </div>
                  <p>1. Look at the left or right of your browser&apos;s address bar for a camera/lock icon.</p>
                  <p>2. Select <strong>&quot;Always allow https://... to access your camera&quot;</strong>.</p>
                  <p>3. Click <strong>&quot;Grant / Request Camera Access&quot;</strong> above, or open in a dedicated tab.</p>
                </div>
              </div>
            )}

            {/* Clear State 3: Camera Ready But No Face Detected */}
            {status === 'ready' && !faceDetected && (
              <div className="absolute inset-0 z-20 pointer-events-none flex flex-col items-center justify-center">
                <div className="w-48 h-64 border-2 border-dashed border-[#ffc769]/60 rounded-3xl flex flex-col items-center justify-center bg-black/30 backdrop-blur-xs p-4 text-center">
                  <span className="material-symbols-outlined text-3xl text-[#ffc769] mb-2 animate-bounce">
                    face
                  </span>
                  <span className="font-mono-tabular text-xs font-bold text-[#ffdeac]">
                    No Face Detected
                  </span>
                  <span className="text-[10px] text-[#bac9cc] mt-1">
                    Position your face within the frame
                  </span>
                </div>
              </div>
            )}

            {/* PROMINENT LIVE EAR READOUT (Requirement 9: Testable by closing eyes!) */}
            <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
              <div
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl backdrop-blur-md border shadow-2xl transition-all duration-200 ${
                  isEyesClosed
                    ? 'bg-[#93000a]/90 border-[#ff1744] text-[#ffdad6] scale-105 shadow-[0_0_20px_rgba(255,23,68,0.6)]'
                    : 'bg-[#0a0e16]/85 border-[#00e5ff]/50 text-[#dfe2ee]'
                }`}
              >
                <span
                  className={`material-symbols-outlined text-lg ${
                    isEyesClosed ? 'text-[#ff1744] animate-bounce' : 'text-[#7dffa2]'
                  }`}
                >
                  {isEyesClosed ? 'visibility_off' : 'visibility'}
                </span>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="font-mono-tabular text-base font-bold">
                      EAR: {ear.toFixed(3)}
                    </span>
                    <span
                      className={`font-mono-tabular text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${
                        isEyesClosed ? 'bg-[#ff1744] text-white' : 'bg-[#05e777]/20 text-[#7dffa2]'
                      }`}
                    >
                      {isEyesClosed ? `CLOSED (${eyeClosedDurationSec.toFixed(1)}s)` : 'OPEN'}
                    </span>
                  </div>
                  <span className="font-mono-tabular text-[9.5px] text-[#bac9cc]">
                    Threshold: {earThreshold.toFixed(2)} • Close eyes to test!
                  </span>
                </div>
              </div>

              {/* Head Nod / Yawn Alert Tag */}
              {isYawning && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#ffc769]/20 border border-[#ffc769] text-[#ffdeac] text-xs font-bold animate-pulse">
                  <span className="material-symbols-outlined text-sm">sentiment_dissatisfied</span>
                  <span>YAWN DETECTED (MAR: {mar.toFixed(2)})</span>
                </div>
              )}
              {isNodding && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#ff1744]/20 border border-[#ff1744] text-[#ffdad6] text-xs font-bold animate-bounce">
                  <span className="material-symbols-outlined text-sm">arrow_downward</span>
                  <span>HEAD DROOP / NOD ANOMALY</span>
                </div>
              )}
            </div>

            {/* Bottom HUD Readouts Over Live Canvas */}
            <div className="absolute bottom-3 left-4 right-4 z-20 flex items-center justify-between text-[#bac9cc] font-mono-tabular text-xs bg-[#0a0e16]/90 backdrop-blur-md px-4 py-2 rounded-lg border border-[#3b494c]/40">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5 text-[#00e5ff]">
                  <span className="material-symbols-outlined text-xs">filter_center_focus</span>
                  <span>MAR: {mar.toFixed(2)}</span>
                </span>
                <span className="hidden sm:inline text-[#3b494c]">|</span>
                <span className="hidden sm:flex items-center gap-1.5 text-[#dfe2ee]">
                  <span className="material-symbols-outlined text-xs text-[#ffc769]">screen_rotation</span>
                  <span>
                    P: {headPose.pitch}° | Y: {headPose.yaw}° | R: {headPose.roll}°
                  </span>
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[#7dffa2]">
                <span className="material-symbols-outlined text-xs">navigation</span>
                <span>ROAD FOCUS: {roadFocusPercent}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: Real Drowsiness Index & Real Cognitive Load Score (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* Gauge 1: Real Drowsiness Index */}
          <div className="bg-[#181c24]/80 backdrop-blur-md rounded-xl p-4 flex flex-col justify-between border border-[#262a33] shadow-xl relative overflow-hidden flex-1">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#00e5ff] text-xl">bedtime</span>
                <h2 className="text-base font-bold text-[#dfe2ee]">Drowsiness Index</h2>
              </div>
              <span
                className={`font-mono-tabular text-xs px-2.5 py-0.5 rounded font-bold uppercase ${
                  drowsinessScore >= 70
                    ? 'bg-[#93000a] text-[#ffdad6] animate-pulse'
                    : drowsinessScore >= 45
                    ? 'bg-[#ffc769]/20 text-[#ffc769]'
                    : 'bg-[#05e777]/20 text-[#7dffa2]'
                }`}
              >
                {drowsinessScore >= 70
                  ? 'ZONE: CRITICAL'
                  : drowsinessScore >= 45
                  ? 'ZONE: ELEVATED'
                  : 'ZONE: ALERT'}
              </span>
            </div>

            <div className="flex items-center justify-around py-3">
              {/* Circular SVG Gauge for Drowsiness */}
              <div className="relative w-36 h-36 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="50" fill="transparent" stroke="#262a33" strokeWidth="10" />
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    fill="transparent"
                    stroke={stateColor}
                    strokeWidth="10"
                    strokeDasharray="314.15"
                    strokeDashoffset={drowsinessCircleOffset}
                    strokeLinecap="round"
                    className="transition-all duration-300"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span
                    className="font-mono-tabular text-4xl font-bold leading-none"
                    style={{ color: stateColor }}
                  >
                    {drowsinessScore}
                  </span>
                  <span className="font-mono-tabular text-[10px] text-[#849396] mt-1 font-semibold">
                    / 100 REAL SCORE
                  </span>
                </div>
              </div>

              {/* Gauge Evaluation Details */}
              <div className="flex flex-col gap-1.5 max-w-[170px]">
                <span className="font-mono-tabular text-[10px] text-[#bac9cc] uppercase tracking-wider font-semibold">
                  EVALUATION
                </span>
                <span className="text-sm font-bold text-[#dfe2ee]">
                  {drowsinessScore >= 70
                    ? 'Dangerous Fatigue'
                    : drowsinessScore >= 45
                    ? 'Elevated Drowsiness'
                    : 'Optimal Alertness'}
                </span>
                <p className="text-xs text-[#849396] leading-snug">
                  {drowsinessScore >= 70
                    ? 'Sustained eye closures or high PERCLOS. Siren alarm armed.'
                    : drowsinessScore >= 45
                    ? 'Frequent micro-blinks or yawn events detected.'
                    : 'Eyes open, regular blink rate, head oriented forward.'}
                </p>
                <div className="w-full bg-[#262a33] rounded-full h-1.5 overflow-hidden mt-1">
                  <div
                    className="h-1.5 rounded-full transition-all duration-300"
                    style={{
                      width: `${drowsinessScore}%`,
                      backgroundColor: stateColor,
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-[#849396] font-mono-tabular text-[11px] pt-2 border-t border-[#262a33]/60">
              <span>0 (ALERT)</span>
              <span>45 (WARN)</span>
              <span>70 (CRITICAL ALARM)</span>
            </div>
          </div>

          {/* Gauge 2: Real Cognitive Load Score */}
          <div className="bg-[#181c24]/80 backdrop-blur-md rounded-xl p-4 flex flex-col justify-between border border-[#262a33] shadow-xl relative overflow-hidden flex-1">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#00e5ff] text-xl">psychology</span>
                <h2 className="text-base font-bold text-[#dfe2ee]">Cognitive Load Score</h2>
              </div>
              <span className="font-mono-tabular text-xs px-2.5 py-0.5 rounded bg-[#00e5ff]/10 text-[#00e5ff] font-bold">
                {cognitiveLoad >= 70 ? 'HIGH WORKLOAD' : 'FOCUSED / ENGAGED'}
              </span>
            </div>

            <div className="flex items-center justify-around py-3">
              <div className="relative w-36 h-36 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="50" fill="transparent" stroke="#1c2028" strokeWidth="10" />
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    fill="transparent"
                    stroke="#00e5ff"
                    strokeWidth="10"
                    strokeDasharray="314.15"
                    strokeDashoffset={cognitiveCircleOffset}
                    strokeLinecap="round"
                    className="transition-all duration-300"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="font-mono-tabular text-4xl font-bold text-[#00e5ff] leading-none">
                    {cognitiveLoad}%
                  </span>
                  <span className="font-mono-tabular text-[10px] text-[#849396] mt-1 font-semibold">
                    REAL WORKLOAD
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-2 text-xs">
                <div className="flex items-center justify-between gap-3 text-[#bac9cc] font-mono-tabular">
                  <span>Task Capacity:</span>
                  <span className="text-[#00e5ff] font-bold">{100 - cognitiveLoad}% Free</span>
                </div>
                <div className="flex items-center justify-between gap-3 text-[#bac9cc] font-mono-tabular">
                  <span>Head Scanning:</span>
                  <span className="text-[#7dffa2]">{(Math.abs(headPose.yaw) * 1.5).toFixed(1)}°/s</span>
                </div>
                <div className="flex items-center justify-between gap-3 text-[#bac9cc] font-mono-tabular">
                  <span>Blink Rate:</span>
                  <span className="text-[#dfe2ee]">{blinksPerMinute} bpm</span>
                </div>
                <div className="flex items-center justify-between gap-3 text-[#bac9cc] font-mono-tabular">
                  <span>Road Focus:</span>
                  <span className="text-[#7dffa2] font-bold">{roadFocusPercent}%</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-[#849396] font-mono-tabular text-[11px] pt-2 border-t border-[#262a33]/60">
              <span>0% (PASSIVE)</span>
              <span>50% (ENGAGED)</span>
              <span>100% (OVERLOAD)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Metric Telemetry Cards 6-Column Grid (100% Real Webcam Values) */}
      <section className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 mb-4">
        {/* Card 1: Eye Ratio (EAR) */}
        <div className="bg-[#181c24]/80 backdrop-blur-md rounded-xl p-3.5 border border-[#262a33] shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#bac9cc] mb-1">
            <span className="font-mono-tabular text-[11px] uppercase tracking-wider font-semibold">
              Eye Ratio (EAR)
            </span>
            <span className="material-symbols-outlined text-[#00e5ff] text-base">visibility</span>
          </div>
          <div className="flex items-baseline gap-2 my-1">
            <span className="font-mono-tabular text-2xl font-bold text-[#dfe2ee]">
              {ear.toFixed(3)}
            </span>
            <span
              className={`font-mono-tabular text-xs font-bold ${
                !isEyesClosed ? 'text-[#7dffa2]' : 'text-[#ff1744]'
              }`}
            >
              {!isEyesClosed ? 'OPEN' : 'CLOSED'}
            </span>
          </div>
          <div className="w-full bg-[#31353e] rounded-full h-1.5 my-1.5">
            <div
              className={`h-1.5 rounded-full transition-all duration-150 ${
                !isEyesClosed ? 'bg-[#7dffa2]' : 'bg-[#ff1744]'
              }`}
              style={{ width: `${Math.min(100, Math.round((ear / 0.45) * 100))}%` }}
            />
          </div>
          <span className="font-mono-tabular text-[10px] text-[#849396] mt-1">
            Threshold: {earThreshold.toFixed(2)}
          </span>
        </div>

        {/* Card 2: Blink Frequency */}
        <div className="bg-[#181c24]/80 backdrop-blur-md rounded-xl p-3.5 border border-[#262a33] shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#bac9cc] mb-1">
            <span className="font-mono-tabular text-[11px] uppercase tracking-wider font-semibold">
              Blink Frequency
            </span>
            <span className="material-symbols-outlined text-[#7dffa2] text-base">remove_red_eye</span>
          </div>
          <div className="flex items-baseline gap-2 my-1">
            <span className="font-mono-tabular text-2xl font-bold text-[#dfe2ee]">
              {blinksPerMinute}
            </span>
            <span className="font-mono-tabular text-xs text-[#849396]">/MIN</span>
          </div>
          <div className="w-full bg-[#31353e] rounded-full h-1.5 my-1.5">
            <div
              className="bg-[#7dffa2] h-1.5 rounded-full"
              style={{ width: `${Math.min(100, Math.round((blinksPerMinute / 30) * 100))}%` }}
            />
          </div>
          <span className="font-mono-tabular text-[10px] text-[#7dffa2] font-semibold">
            Total Blinks: {blinkCount}
          </span>
        </div>

        {/* Card 3: Yawn Events */}
        <div className="bg-[#181c24]/80 backdrop-blur-md rounded-xl p-3.5 border border-[#262a33] shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#bac9cc] mb-1">
            <span className="font-mono-tabular text-[11px] uppercase tracking-wider font-semibold">
              Yawn Events
            </span>
            <span className="material-symbols-outlined text-[#ffc769] text-base">
              sentiment_dissatisfied
            </span>
          </div>
          <div className="flex items-baseline gap-2 my-1">
            <span className="font-mono-tabular text-2xl font-bold text-[#dfe2ee]">{yawnCount}</span>
            <span className="font-mono-tabular text-xs text-[#849396]">EVENTS</span>
          </div>
          <div className="w-full bg-[#31353e] rounded-full h-1.5 my-1.5">
            <div
              className={`h-1.5 rounded-full ${isYawning ? 'bg-[#ffc769]' : 'bg-[#00e5ff]'}`}
              style={{ width: `${Math.min(100, Math.round((mar / 0.8) * 100))}%` }}
            />
          </div>
          <span className="font-mono-tabular text-[10px] text-[#bac9cc]">
            MAR: {mar.toFixed(2)} (Alert &gt; 0.6)
          </span>
        </div>

        {/* Card 4: PERCLOS Ratio */}
        <div className="bg-[#181c24]/80 backdrop-blur-md rounded-xl p-3.5 border border-[#262a33] shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#bac9cc] mb-1">
            <span className="font-mono-tabular text-[11px] uppercase tracking-wider font-semibold">
              PERCLOS Ratio
            </span>
            <span className="material-symbols-outlined text-[#00e5ff] text-base">timelapse</span>
          </div>
          <div className="flex items-baseline gap-2 my-1">
            <span
              className={`font-mono-tabular text-2xl font-bold ${
                perclos > 15 ? 'text-[#ff1744]' : 'text-[#7dffa2]'
              }`}
            >
              {perclos.toFixed(1)}%
            </span>
            <span className="font-mono-tabular text-xs text-[#849396]">60s WIN</span>
          </div>
          <div className="w-full bg-[#31353e] rounded-full h-1.5 my-1.5">
            <div
              className={`h-1.5 rounded-full ${perclos > 15 ? 'bg-[#ff1744]' : 'bg-[#7dffa2]'}`}
              style={{ width: `${Math.min(100, Math.round(perclos * 3))}%` }}
            />
          </div>
          <span className="font-mono-tabular text-[10px] text-[#849396]">Danger &gt; 15%</span>
        </div>

        {/* Card 5: Head Orientation */}
        <div className="bg-[#181c24]/80 backdrop-blur-md rounded-xl p-3.5 border border-[#262a33] shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#bac9cc] mb-1">
            <span className="font-mono-tabular text-[11px] uppercase tracking-wider font-semibold">
              Head Orientation
            </span>
            <span className="material-symbols-outlined text-[#00e5ff] text-base">
              screen_rotation
            </span>
          </div>
          <div className="flex flex-col my-1 font-mono-tabular text-[11px] text-[#dfe2ee] leading-tight">
            <div className="flex justify-between py-0.5">
              <span className="text-[#849396]">Pitch:</span>
              <span className={headPose.pitch < -15 ? 'text-[#ff1744] font-bold' : 'text-[#00e5ff]'}>
                {headPose.pitch}°
              </span>
            </div>
            <div className="flex justify-between py-0.5">
              <span className="text-[#849396]">Yaw:</span>
              <span className="text-[#7dffa2]">{headPose.yaw}°</span>
            </div>
            <div className="flex justify-between py-0.5">
              <span className="text-[#849396]">Roll:</span>
              <span className="text-[#dfe2ee]">{headPose.roll}°</span>
            </div>
          </div>
          <span
            className={`font-mono-tabular text-[10px] ${
              isNodding ? 'text-[#ff1744] font-bold' : 'text-[#7dffa2]'
            }`}
          >
            {isNodding ? 'Nod / Droop Detected!' : 'Normal Head Pose'}
          </span>
        </div>

        {/* Card 6: Road Focus Gaze */}
        <div className="bg-[#181c24]/80 backdrop-blur-md rounded-xl p-3.5 border border-[#262a33] shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#bac9cc] mb-1">
            <span className="font-mono-tabular text-[11px] uppercase tracking-wider font-semibold">
              Road Focus Gaze
            </span>
            <span className="material-symbols-outlined text-[#7dffa2] text-base">navigation</span>
          </div>
          <div className="flex items-baseline gap-2 my-1">
            <span className="font-mono-tabular text-2xl font-bold text-[#dfe2ee]">
              {roadFocusPercent.toFixed(1)}%
            </span>
            <span className="font-mono-tabular text-xs text-[#849396]">60s</span>
          </div>
          <div className="w-full bg-[#31353e] rounded-full h-1.5 my-1.5">
            <div
              className="bg-[#7dffa2] h-1.5 rounded-full"
              style={{ width: `${roadFocusPercent}%` }}
            />
          </div>
          <span className="font-mono-tabular text-[10px] text-[#7dffa2]">Forward Attention</span>
        </div>
      </section>

      {/* Real-time Driver Cognitive Load Trend (Recharts) */}
      <CognitiveLoadTrendChart
        currentLoad={cognitiveLoad}
        history={history60s}
        ear={ear}
        roadFocus={roadFocusPercent}
      />

      {/* Bottom Section: Continuous 60s Real-time Drowsiness & Fatigue Trendline */}
      <section className="w-full bg-[#181c24]/80 backdrop-blur-md rounded-xl p-4 border border-[#262a33] shadow-xl flex flex-col">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-[#00e5ff] text-xl">show_chart</span>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-[#dfe2ee]">
                Real Telemetry Fatigue & Cognitive Trendline (Past 60 Seconds)
              </h3>
              <p className="text-xs text-[#bac9cc]">
                Live streaming webcam vision samples recorded every 1 second. Zero simulation.
              </p>
            </div>
          </div>

          {/* Graph Legend */}
          <div className="flex flex-wrap items-center gap-3 font-mono-tabular text-[11px]">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-[#05e777] inline-block"></span>
              <span className="text-[#dfe2ee]">Drowsiness Score ({drowsinessScore})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-[#00e5ff] inline-block"></span>
              <span className="text-[#dfe2ee]">Cognitive Load ({cognitiveLoad}%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-[#ffc769] inline-block border-b border-dashed border-[#ffc769]"></span>
              <span className="text-[#ffc769]">Warn (45)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-[#ff1744] inline-block border-b border-dashed border-[#ff1744]"></span>
              <span className="text-[#ff1744]">Critical Alarm (70)</span>
            </div>
          </div>
        </div>

        {/* Live Real Telemetry SVG Graph */}
        <div className="relative w-full h-52 bg-[#0a0e16]/80 rounded-lg p-2 overflow-hidden flex flex-col justify-between border border-[#262a33]">
          <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 900 180">
            <defs>
              <linearGradient id="realDrowsinessFill" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#05e777" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#05e777" stopOpacity="0.0" />
              </linearGradient>
              <linearGradient id="realCognitiveFill" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#00e5ff" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#00e5ff" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Threshold Lines */}
            <line x1="40" y1="54" x2="880" y2="54" stroke="#ff1744" strokeDasharray="4,4" strokeWidth="1.5" opacity="0.6" />
            <text x="810" y="49" fill="#ffb4ab" fontFamily="JetBrains Mono" fontSize="10">
              ALARM (70)
            </text>

            <line x1="40" y1="99" x2="880" y2="99" stroke="#ffc769" strokeDasharray="4,4" strokeWidth="1.5" opacity="0.5" />
            <text x="815" y="94" fill="#ffc769" fontFamily="JetBrains Mono" fontSize="10">
              WARNING (45)
            </text>

            <line x1="40" y1="165" x2="880" y2="165" stroke="#262a33" strokeWidth="1" />

            {/* Render real data path if history exists */}
            {history60s.length > 1 ? (
              <>
                {/* Real Cognitive Path */}
                {(() => {
                  const pts = history60s;
                  const step = 840 / Math.max(1, pts.length - 1);
                  let d = `M 40 ${165 - (pts[0].cognitiveLoad / 100) * 140}`;
                  for (let i = 1; i < pts.length; i++) {
                    const x = 40 + i * step;
                    const y = 165 - (pts[i].cognitiveLoad / 100) * 140;
                    d += ` L ${x} ${y}`;
                  }
                  return (
                    <>
                      <path
                        d={`${d} L ${40 + (pts.length - 1) * step} 165 L 40 165 Z`}
                        fill="url(#realCognitiveFill)"
                      />
                      <path d={d} fill="none" stroke="#00e5ff" strokeWidth="2" strokeLinecap="round" />
                    </>
                  );
                })()}

                {/* Real Drowsiness Path */}
                {(() => {
                  const pts = history60s;
                  const step = 840 / Math.max(1, pts.length - 1);
                  let d = `M 40 ${165 - (pts[0].drowsinessScore / 100) * 140}`;
                  for (let i = 1; i < pts.length; i++) {
                    const x = 40 + i * step;
                    const y = 165 - (pts[i].drowsinessScore / 100) * 140;
                    d += ` L ${x} ${y}`;
                  }
                  return (
                    <>
                      <path
                        d={`${d} L ${40 + (pts.length - 1) * step} 165 L 40 165 Z`}
                        fill="url(#realDrowsinessFill)"
                      />
                      <path
                        d={d}
                        fill="none"
                        stroke={drowsinessScore >= 70 ? '#ff1744' : drowsinessScore >= 45 ? '#ffc769' : '#05e777'}
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      />
                    </>
                  );
                })()}
              </>
            ) : (
              // Initial baseline line before 2nd sample arrives
              <line
                x1="40"
                y1={165 - (drowsinessScore / 100) * 140}
                x2="880"
                y2={165 - (drowsinessScore / 100) * 140}
                stroke="#05e777"
                strokeWidth="2"
              />
            )}

            {/* Current Real Live Head Point at T-0s (X = 880) */}
            <circle
              cx="880"
              cy={165 - (drowsinessScore / 100) * 140}
              r="5"
              fill={stateColor}
              className="animate-ping"
              opacity="0.6"
            />
            <circle cx="880" cy={165 - (drowsinessScore / 100) * 140} r="4" fill={stateColor} />
            <circle cx="880" cy={165 - (cognitiveLoad / 100) * 140} r="4" fill="#00e5ff" />
          </svg>

          {/* Time Axis Markers */}
          <div className="flex items-center justify-between text-[#849396] font-mono-tabular text-[10px] px-2 pt-1 border-t border-[#262a33]">
            <span>-60s</span>
            <span>-50s</span>
            <span>-40s</span>
            <span>-30s</span>
            <span>-20s</span>
            <span>-10s</span>
            <span className="text-[#7dffa2] font-bold">LIVE (T-0s)</span>
          </div>
        </div>

        {/* Real Session Diagnostics Footer */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 px-1 font-mono-tabular text-xs">
          <div className="flex items-center gap-3 text-[#bac9cc]">
            <span className="flex items-center gap-1 text-[#00e5ff]">
              <span className="material-symbols-outlined text-xs">verified</span>
              <span>GROUND TRUTH VISION SENSOR</span>
            </span>
            <span className="text-[#3b494c]">•</span>
            <span className="text-[#dfe2ee]">
              EAR: {ear.toFixed(3)} | Threshold: {earThreshold.toFixed(2)} | PERCLOS: {perclos.toFixed(1)}%
            </span>
          </div>
          <div className="flex items-center gap-4 text-[#849396]">
            <span>Yawns: {yawnCount}</span>
            <span>Blinks: {blinkCount} ({blinksPerMinute} bpm)</span>
          </div>
        </div>
      </section>

      {/* FULL-SCREEN RED ALERT MODAL (Requirement 7) */}
      {isCriticalAlertActive && (
        <div className="fixed inset-0 z-50 bg-[#ff1744]/25 backdrop-blur-lg flex items-center justify-center p-4">
          <div className="relative max-w-xl w-full bg-[#0a0e16] border-4 border-[#ff1744] rounded-2xl shadow-[0_0_80px_rgba(255,23,68,0.8)] overflow-hidden animate-pulse">
            {/* Striped Caution Header */}
            <div className="w-full h-3 bg-[repeating-linear-gradient(45deg,#ff1744,#ff1744_16px,#1c2028_16px,#1c2028_32px)]" />

            <div className="p-6 sm:p-8 flex flex-col items-center text-center gap-5">
              <div className="w-20 h-20 rounded-2xl bg-[#93000a] text-white flex items-center justify-center shadow-[0_0_30px_#ff1744] animate-bounce">
                <span className="material-symbols-outlined text-5xl">warning</span>
              </div>

              <div>
                <span className="px-3 py-1 rounded-full bg-[#ff1744] text-[#001f24] font-mono-tabular text-xs font-black uppercase tracking-widest inline-block mb-2">
                  CRITICAL FATIGUE INTERVENTION
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-[#ffdad6] tracking-tight">
                  MICRO-SLEEP DETECTED!
                </h2>
                <p className="text-sm text-[#ffb4ab] mt-2 font-mono-tabular font-semibold">
                  {criticalReason || 'Eyes closed or extreme fatigue detected'}
                </p>
              </div>

              <div className="w-full p-4 rounded-xl bg-[#181c24] border border-[#ff1744]/40 font-mono-tabular text-xs space-y-2 text-[#bac9cc]">
                <div className="flex justify-between">
                  <span>Current Live EAR:</span>
                  <span className="text-[#ff1744] font-bold">{ear.toFixed(3)} (CLOSED)</span>
                </div>
                <div className="flex justify-between">
                  <span>Closed Duration:</span>
                  <span className="text-[#ff1744] font-bold">{eyeClosedDurationSec.toFixed(1)} seconds</span>
                </div>
                <div className="flex justify-between">
                  <span>Drowsiness Score:</span>
                  <span className="text-[#ff1744] font-bold">{drowsinessScore}/100</span>
                </div>
                <div className="flex justify-between">
                  <span>Auditory Siren:</span>
                  <span className="text-[#7dffa2] font-bold">LOOPING WEB AUDIO ALARM ACTIVE</span>
                </div>
              </div>

              {/* Big "I'M AWAKE" Dismiss Button (Requirement 7) */}
              <button
                onClick={handleDismissCriticalAlert}
                className="w-full py-4 rounded-xl bg-[#ff1744] hover:bg-[#ba1a1a] text-white font-black text-lg tracking-wider shadow-[0_0_30px_rgba(255,23,68,0.7)] transition-all cursor-pointer transform active:scale-95 flex items-center justify-center gap-2"
                type="button"
              >
                <span className="material-symbols-outlined text-2xl">check_circle</span>
                <span>I'M AWAKE — SILENCE ALARM</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
