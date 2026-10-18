import React, { useState, useEffect, useMemo, useRef } from 'react';
import { SimState } from '../types/telemetry';
import { soundManager } from '../utils/soundEffects';

interface BiometricHealthCardProps {
  simState: SimState;
  cognitiveLoad?: number;
  className?: string;
}

type WaveformMode = 'ekg' | 'ppg' | 'tachogram';
type SensorSource = 'wheel_ppg' | 'radar_dms' | 'smartband';

export const BiometricHealthCard: React.FC<BiometricHealthCardProps> = ({
  simState,
  cognitiveLoad = 38,
  className = '',
}) => {
  const [waveformMode, setWaveformMode] = useState<WaveformMode>('ekg');
  const [sensorSource, setSensorSource] = useState<SensorSource>('wheel_ppg');
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [pulseTick, setPulseTick] = useState(0);
  const [ecgOffset, setEcgOffset] = useState(0);
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [calibrationSuccess, setCalibrationSuccess] = useState(false);

  // RR interval history for Tachogram visualization (last 20 intervals)
  const [rrHistory, setRrHistory] = useState<number[]>([
    830, 842, 836, 850, 832, 846, 838, 852, 840, 848,
    835, 844, 839, 851, 837, 845, 841, 849, 838, 843,
  ]);

  // Dynamic Heart Rate (BPM) mathematically coupled to simState and cognitive load
  const heartRate = useMemo(() => {
    // Cognitive load adds a modest sympathetic acceleration (0 to ~12 bpm)
    const loadContribution = Math.round((cognitiveLoad / 100) * 10);
    const microJitter = (pulseTick % 3) - 1;

    if (simState === 'danger') {
      // Acute tachycardia: shock / siren adrenaline surge
      return 96 + loadContribution + microJitter;
    }
    if (simState === 'drowsy') {
      // Sleep-onset bradycardia: vagal deceleration
      return 56 + Math.round(loadContribution * 0.5) + (pulseTick % 2);
    }
    // Optimal alert focus: steady nominal baseline ~70-74 bpm
    return 68 + loadContribution + microJitter;
  }, [simState, cognitiveLoad, pulseTick]);

  // Heart Rate Variability: rMSSD (ms) - Root Mean Square of Successive Differences
  const hrvMs = useMemo(() => {
    const microJitter = (pulseTick % 5) - 2;
    if (simState === 'danger') {
      // Severe sympathetic dominance drastically crushes HRV
      return Math.max(16, 24 - Math.round((cognitiveLoad - 70) * 0.2) + microJitter);
    }
    if (simState === 'drowsy') {
      // Autonomic fatigue depressor
      return Math.max(22, 34 - Math.round((cognitiveLoad - 50) * 0.15) + microJitter);
    }
    // Robust parasympathetic tone during nominal alert state
    return Math.min(85, 72 - Math.round((cognitiveLoad - 30) * 0.2) + microJitter);
  }, [simState, cognitiveLoad, pulseTick]);

  // Standard Deviation of NN intervals (SDNN in ms)
  const sdnnMs = useMemo(() => {
    if (simState === 'danger') return 28;
    if (simState === 'drowsy') return 44;
    return 88;
  }, [simState]);

  // Autonomic Sympathovagal Balance (LF/HF ratio)
  const lfHfRatio = useMemo(() => {
    if (simState === 'danger') return (3.8 + (cognitiveLoad / 100) * 0.8).toFixed(1);
    if (simState === 'drowsy') return (0.65 + (cognitiveLoad / 100) * 0.15).toFixed(1);
    return (1.2 + (cognitiveLoad / 100) * 0.3).toFixed(1);
  }, [simState, cognitiveLoad]);

  // Blood Oxygen Saturation (SpO2)
  const spO2 = useMemo(() => {
    if (simState === 'drowsy') return '95.8%';
    if (simState === 'danger') return '97.2%';
    return '98.9%';
  }, [simState]);

  // Respiration Rate (BRPM derived from Respiratory Sinus Arrhythmia)
  const respirationRate = useMemo(() => {
    if (simState === 'danger') return 24;
    if (simState === 'drowsy') return 9;
    return 14;
  }, [simState]);

  // Cardiovascular Fatigue & Stress Composite Index (0 - 100)
  const cardiacStressIndex = useMemo(() => {
    const hrvPenalty = Math.max(0, 80 - hrvMs) * 0.6;
    const loadPenalty = cognitiveLoad * 0.4;
    return Math.min(99, Math.round(hrvPenalty + loadPenalty));
  }, [hrvMs, cognitiveLoad]);

  // Instantaneous R-R Interval for the current beat
  const currentRR = useMemo(() => {
    const base = Math.round(60000 / heartRate);
    const variance = (pulseTick % 2 === 0 ? 1 : -1) * Math.round(hrvMs * 0.25);
    return base + variance;
  }, [heartRate, hrvMs, pulseTick]);

  // Append new RR interval to history buffer on each pulse tick
  const prevTickRef = useRef(pulseTick);
  useEffect(() => {
    if (pulseTick !== prevTickRef.current) {
      prevTickRef.current = pulseTick;
      setRrHistory((prev) => [...prev.slice(1), currentRR]);

      if (audioEnabled) {
        soundManager.playHeartbeat(simState === 'danger');
      }
    }
  }, [pulseTick, currentRR, audioEnabled, simState]);

  // Continuous cardiac cycle ticker tied to instantaneous heart rate
  useEffect(() => {
    const pulseDelay = Math.max(350, Math.round(60000 / heartRate));
    const interval = setInterval(() => {
      setPulseTick((t) => (t + 1) % 1000);
    }, pulseDelay);

    return () => clearInterval(interval);
  }, [heartRate]);

  // Continuous high-resolution waveform sweep animation
  useEffect(() => {
    const sweepInterval = setInterval(() => {
      setEcgOffset((prev) => (prev + 3) % 360);
    }, 40);
    return () => clearInterval(sweepInterval);
  }, []);

  // Handle sensor recalibration
  const handleCalibrate = () => {
    setIsCalibrating(true);
    setCalibrationSuccess(false);
    soundManager.playBeep(900, 0.08);

    setTimeout(() => {
      setIsCalibrating(false);
      setCalibrationSuccess(true);
      soundManager.playBeep(1300, 0.12);
      setTimeout(() => {
        setCalibrationSuccess(false);
      }, 3000);
    }, 1400);
  };

  // Status styling
  const statusColor =
    simState === 'danger'
      ? '#ff1744'
      : simState === 'drowsy'
      ? '#ffc769'
      : '#7dffa2';

  const statusLabel =
    simState === 'danger'
      ? 'ACUTE STRESS / TACHYCARDIA'
      : simState === 'drowsy'
      ? 'BRADYCARDIC HYPOVIGILANCE'
      : 'OPTIMAL AUTONOMIC EQUILIBRIUM';

  return (
    <div
      className={`bg-[#181c24]/80 backdrop-blur-md rounded-xl p-4 border border-[#262a33] shadow-xl flex flex-col justify-between ${className}`}
    >
      {/* Top Header Strip */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center border shadow-inner transition-colors duration-300"
            style={{
              backgroundColor: `${statusColor}15`,
              color: statusColor,
              borderColor: `${statusColor}40`,
            }}
          >
            <span
              className={`material-symbols-outlined text-lg transition-transform duration-200 ${
                simState === 'danger'
                  ? 'animate-ping scale-110'
                  : pulseTick % 2 === 0
                  ? 'scale-110'
                  : 'scale-95'
              }`}
            >
              favorite
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-[#dfe2ee] leading-tight">
                Biometric Health & HRV
              </h3>
              <span className="w-1.5 h-1.5 rounded-full bg-[#00e5ff] animate-ping" />
            </div>
            <span className="font-mono-tabular text-[10px] text-[#849396] tracking-wide uppercase">
              COGNITIVE-COUPLED AUTONOMIC TELEMETRY
            </span>
          </div>
        </div>

        {/* Right Status Badge & Audio Toggle */}
        <div className="flex items-center gap-2">
          {/* Subtle Heartbeat Audio Monitor Toggle */}
          <button
            onClick={() => {
              setAudioEnabled(!audioEnabled);
              soundManager.playBeep(audioEnabled ? 700 : 1100, 0.05);
            }}
            className={`px-2 py-0.5 rounded text-[10px] font-mono-tabular font-bold border flex items-center gap-1 cursor-pointer transition-colors ${
              audioEnabled
                ? 'bg-[#ff1744]/20 text-[#ffb4ab] border-[#ff1744]/40'
                : 'bg-[#262a33]/60 text-[#849396] border-[#3b494c]/50 hover:text-[#dfe2ee]'
            }`}
            title="Toggle subtle real-time acoustic lub-dub heartbeat monitor"
            type="button"
          >
            <span className="material-symbols-outlined text-xs">
              {audioEnabled ? 'volume_up' : 'volume_off'}
            </span>
            <span className="hidden sm:inline">PULSE AUDIO</span>
          </button>

          <span
            className="font-mono-tabular text-[10px] px-2.5 py-0.5 rounded font-bold uppercase tracking-wider"
            style={{
              color: statusColor,
              backgroundColor: `${statusColor}15`,
              border: `1px solid ${statusColor}35`,
            }}
          >
            {statusLabel}
          </span>
        </div>
      </div>

      {/* Primary Biometric Metric Readouts Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-3">
        {/* Heart Rate (BPM) */}
        <div className="p-2.5 rounded-lg bg-[#0a0e16]/80 border border-[#262a33] flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#849396] font-mono-tabular text-[10px]">
            <span className="uppercase font-semibold tracking-wider">HEART RATE</span>
            <span
              className="w-1.5 h-1.5 rounded-full inline-block"
              style={{ backgroundColor: statusColor }}
            />
          </div>
          <div className="flex items-baseline gap-1 my-1">
            <span
              className="font-mono-tabular text-2xl sm:text-3xl font-bold tracking-tight"
              style={{ color: statusColor }}
            >
              {heartRate}
            </span>
            <span className="font-mono-tabular text-xs text-[#849396]">BPM</span>
          </div>
          <div className="flex items-center justify-between text-[10px] font-mono-tabular text-[#849396]">
            <span>{simState === 'drowsy' ? 'Bradycardia' : simState === 'danger' ? 'Tachycardia' : 'Sinus Nom.'}</span>
            <span className="text-[#dfe2ee] font-semibold">RR: {currentRR}ms</span>
          </div>
        </div>

        {/* Heart Rate Variability (HRV rMSSD) */}
        <div className="p-2.5 rounded-lg bg-[#0a0e16]/80 border border-[#262a33] flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#849396] font-mono-tabular text-[10px]">
            <span className="uppercase font-semibold tracking-wider">HRV (rMSSD)</span>
            <span className="text-[#00e5ff] text-[9px] font-bold">VAGAL</span>
          </div>
          <div className="flex items-baseline gap-1 my-1">
            <span
              className={`font-mono-tabular text-2xl sm:text-3xl font-bold tracking-tight ${
                hrvMs < 30 ? 'text-[#ff1744]' : hrvMs < 45 ? 'text-[#ffc769]' : 'text-[#7dffa2]'
              }`}
            >
              {hrvMs}
            </span>
            <span className="font-mono-tabular text-xs text-[#849396]">MS</span>
          </div>
          <div className="flex items-center justify-between text-[10px] font-mono-tabular text-[#849396]">
            <span>SDNN: {sdnnMs}ms</span>
            <span className={hrvMs < 40 ? 'text-[#ffc769]' : 'text-[#7dffa2]'}>
              {hrvMs < 35 ? 'Depleted' : 'Robust'}
            </span>
          </div>
        </div>

        {/* Autonomic Balance (LF/HF Ratio) */}
        <div className="p-2.5 rounded-lg bg-[#0a0e16]/80 border border-[#262a33] flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#849396] font-mono-tabular text-[10px]">
            <span className="uppercase font-semibold tracking-wider">LF/HF RATIO</span>
            <span className="text-[#dfe2ee] text-[9px]">BALANCE</span>
          </div>
          <div className="flex items-baseline gap-1 my-1">
            <span
              className={`font-mono-tabular text-2xl sm:text-3xl font-bold tracking-tight ${
                parseFloat(lfHfRatio) > 3.0
                  ? 'text-[#ff1744]'
                  : parseFloat(lfHfRatio) < 0.9
                  ? 'text-[#ffc769]'
                  : 'text-[#00e5ff]'
              }`}
            >
              {lfHfRatio}
            </span>
            <span className="font-mono-tabular text-xs text-[#849396]">SYM/VAG</span>
          </div>
          <div className="flex items-center justify-between text-[10px] font-mono-tabular text-[#849396]">
            <span>Norm: 1.0–2.0</span>
            <span className="text-[#00e5ff]">
              {parseFloat(lfHfRatio) > 2.5
                ? 'Sympathetic'
                : parseFloat(lfHfRatio) < 0.8
                ? 'Sluggish'
                : 'Equilibrium'}
            </span>
          </div>
        </div>

        {/* Blood Oxygen & Respiration */}
        <div className="p-2.5 rounded-lg bg-[#0a0e16]/80 border border-[#262a33] flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#849396] font-mono-tabular text-[10px]">
            <span className="uppercase font-semibold tracking-wider">SpO2 / BRPM</span>
            <span className="text-[#7dffa2] text-[9px]">OXIMETRY</span>
          </div>
          <div className="flex items-baseline gap-1 my-1">
            <span className="font-mono-tabular text-2xl sm:text-3xl font-bold text-[#7dffa2] tracking-tight">
              {spO2}
            </span>
            <span className="font-mono-tabular text-xs text-[#849396]">SAT</span>
          </div>
          <div className="flex items-center justify-between text-[10px] font-mono-tabular text-[#849396]">
            <span>Resp Rate:</span>
            <span className="text-[#dfe2ee] font-semibold">{respirationRate} brpm</span>
          </div>
        </div>
      </div>

      {/* Waveform Controls Toolbar */}
      <div className="flex items-center justify-between px-1 mb-1.5 font-mono-tabular text-[10px]">
        {/* Waveform View Tabs */}
        <div className="flex items-center gap-1 bg-[#0a0e16] p-0.5 rounded border border-[#262a33]">
          <button
            onClick={() => setWaveformMode('ekg')}
            className={`px-2 py-0.5 rounded transition-colors cursor-pointer font-semibold ${
              waveformMode === 'ekg'
                ? 'bg-[#00e5ff]/20 text-[#00e5ff]'
                : 'text-[#849396] hover:text-[#dfe2ee]'
            }`}
            type="button"
          >
            LEAD-II EKG
          </button>
          <button
            onClick={() => setWaveformMode('ppg')}
            className={`px-2 py-0.5 rounded transition-colors cursor-pointer font-semibold ${
              waveformMode === 'ppg'
                ? 'bg-[#00e5ff]/20 text-[#00e5ff]'
                : 'text-[#849396] hover:text-[#dfe2ee]'
            }`}
            type="button"
          >
            PPG PULSE WAVE
          </button>
          <button
            onClick={() => setWaveformMode('tachogram')}
            className={`px-2 py-0.5 rounded transition-colors cursor-pointer font-semibold ${
              waveformMode === 'tachogram'
                ? 'bg-[#00e5ff]/20 text-[#00e5ff]'
                : 'text-[#849396] hover:text-[#dfe2ee]'
            }`}
            type="button"
          >
            HRV TACHOGRAM
          </button>
        </div>

        {/* Live Calibration / Sensor Source Pill */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCalibrate}
            disabled={isCalibrating}
            className="flex items-center gap-1 text-[#bac9cc] hover:text-[#00e5ff] cursor-pointer transition-colors"
            title="Recalibrate biometric baseline with driver resting parameters"
            type="button"
          >
            <span
              className={`material-symbols-outlined text-xs ${
                isCalibrating ? 'animate-spin text-[#00e5ff]' : ''
              }`}
            >
              sync
            </span>
            <span>{isCalibrating ? 'ALIGNING...' : calibrationSuccess ? 'CALIBRATED' : 'CALIBRATE'}</span>
          </button>

          <span className="text-[#3b494c]">|</span>

          {/* Sensor source switcher */}
          <button
            onClick={() => {
              const modes: SensorSource[] = ['wheel_ppg', 'radar_dms', 'smartband'];
              const next = modes[(modes.indexOf(sensorSource) + 1) % modes.length];
              setSensorSource(next);
              soundManager.playBeep(850, 0.05);
            }}
            className="text-[#00e5ff] hover:underline cursor-pointer flex items-center gap-1"
            title="Click to switch physical sensor hardware transducer"
            type="button"
          >
            <span className="material-symbols-outlined text-xs">sensors</span>
            <span>
              {sensorSource === 'wheel_ppg'
                ? 'STEERING WHEEL PPG'
                : sensorSource === 'radar_dms'
                ? 'RADAR MICRO-DOPPLER'
                : 'BLE SMARTBAND'}
            </span>
          </button>
        </div>
      </div>

      {/* Dynamic Waveform Display Viewport */}
      <div className="relative w-full h-24 bg-[#0a0e16] rounded-lg p-2 overflow-hidden border border-[#262a33] mb-3 flex flex-col justify-between">
        {/* Subtle grid lines */}
        <div className="absolute inset-0 pointer-events-none opacity-20 bg-[linear-gradient(to_right,#31353e_1px,transparent_1px),linear-gradient(to_bottom,#31353e_1px,transparent_1px)] bg-[size:20px_20px]" />

        {/* Top Waveform Header Overlay */}
        <div className="flex items-center justify-between text-[9px] font-mono-tabular text-[#849396] px-1 z-10">
          <span className="flex items-center gap-1 text-[#00e5ff]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00e5ff] animate-ping" />
            {waveformMode === 'ekg'
              ? 'LIVE CARDIAC ELECTROGRAM (P-Q-R-S-T COMPLEX)'
              : waveformMode === 'ppg'
              ? 'INFRARED ARTERIAL PLETHYSMOGRAPHY (PULSE VOLUME)'
              : 'CONSECUTIVE R-R INTER-BEAT INTERVAL SCATTER (LAST 20 BEATS)'}
          </span>
          <span>{waveformMode === 'tachogram' ? 'RANGE: 550–1100 ms' : 'SWEEP: 25mm/s • GAIN: 10mm/mV'}</span>
        </div>

        {/* Render Selected Waveform Mode */}
        {waveformMode === 'ekg' && (
          <svg
            className="w-full h-14 overflow-hidden z-10"
            preserveAspectRatio="none"
            viewBox="0 0 400 60"
          >
            {/* Center isoelectric baseline */}
            <line x1="0" y1="32" x2="400" y2="32" stroke="#262a33" strokeWidth="1" opacity="0.7" />

            {/* Continuous Lead-II EKG Pattern (repeating P-Q-R-S-T) */}
            <path
              d="
                M 0 32
                L 15 32 Q 22 28 28 32 L 38 32
                L 42 36 L 47 4 L 52 50 L 57 32
                L 66 32 Q 78 22 88 32 L 105 32
                L 115 32 Q 122 28 128 32 L 138 32
                L 142 36 L 147 4 L 152 50 L 157 32
                L 166 32 Q 178 22 188 32 L 205 32
                L 215 32 Q 222 28 228 32 L 238 32
                L 242 36 L 247 4 L 252 50 L 257 32
                L 266 32 Q 278 22 288 32 L 305 32
                L 315 32 Q 322 28 328 32 L 338 32
                L 342 36 L 347 4 L 352 50 L 357 32
                L 366 32 Q 378 22 388 32 L 400 32
              "
              fill="none"
              stroke={statusColor}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Sweeping Cathode Scanning Bar */}
            <line
              x1={(ecgOffset * 1.1) % 400}
              y1="0"
              x2={(ecgOffset * 1.1) % 400}
              y2="60"
              stroke={statusColor}
              strokeWidth="2"
              opacity="0.8"
            />
            <circle
              cx={(ecgOffset * 1.1) % 400}
              cy="32"
              r="3.5"
              fill={statusColor}
              className="animate-ping"
            />
          </svg>
        )}

        {waveformMode === 'ppg' && (
          <svg
            className="w-full h-14 overflow-hidden z-10"
            preserveAspectRatio="none"
            viewBox="0 0 400 60"
          >
            {/* Smooth PPG Pulse Volume Wave with Dicrotic Notch */}
            <path
              d="
                M 0 48
                C 15 48, 22 8, 30 8
                C 38 8, 42 28, 48 24
                C 54 20, 60 48, 75 48
                C 90 48, 97 8, 105 8
                C 113 8, 117 28, 123 24
                C 129 20, 135 48, 150 48
                C 165 48, 172 8, 180 8
                C 188 8, 192 28, 198 24
                C 204 20, 210 48, 225 48
                C 240 48, 247 8, 255 8
                C 263 8, 267 28, 273 24
                C 279 20, 285 48, 300 48
                C 315 48, 322 8, 330 8
                C 338 8, 342 28, 348 24
                C 354 20, 360 48, 375 48
                C 390 48, 397 8, 400 8
              "
              fill="none"
              stroke="#00e5ff"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
            {/* Shading under PPG curve */}
            <path
              d="
                M 0 48
                C 15 48, 22 8, 30 8
                C 38 8, 42 28, 48 24
                C 54 20, 60 48, 75 48
                C 90 48, 97 8, 105 8
                C 113 8, 117 28, 123 24
                C 129 20, 135 48, 150 48
                C 165 48, 172 8, 180 8
                C 188 8, 192 28, 198 24
                C 204 20, 210 48, 225 48
                C 240 48, 247 8, 255 8
                C 263 8, 267 28, 273 24
                C 279 20, 285 48, 300 48
                C 315 48, 322 8, 330 8
                C 338 8, 342 28, 348 24
                C 354 20, 360 48, 375 48
                L 400 60 L 0 60 Z
              "
              fill="#00e5ff"
              opacity="0.12"
            />
          </svg>
        )}

        {waveformMode === 'tachogram' && (
          <div className="w-full h-14 flex items-end justify-between px-2 pt-2 z-10">
            {rrHistory.map((val, idx) => {
              // Map 600ms - 1100ms to height 10% - 90%
              const normalizedHeight = Math.max(
                12,
                Math.min(95, Math.round(((val - 550) / (1100 - 550)) * 100))
              );
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1 group relative">
                  <div
                    className="w-1.5 rounded-t transition-all duration-300"
                    style={{
                      height: `${normalizedHeight}%`,
                      backgroundColor:
                        val < 700 ? '#ff1744' : val < 800 ? '#ffc769' : '#7dffa2',
                    }}
                  />
                  {/* Tooltip on hover */}
                  <span className="absolute -top-6 hidden group-hover:block bg-[#0f131c] text-white text-[9px] px-1 py-0.5 rounded border border-[#3b494c] z-30 pointer-events-none">
                    {val}ms
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Bottom Waveform Meta Readouts */}
        <div className="flex items-center justify-between text-[9px] font-mono-tabular text-[#849396] px-1 z-10 border-t border-[#262a33]/60 pt-0.5">
          <span>QRS INTERVAL: 86ms • PR: 138ms</span>
          <span className="text-[#00e5ff]">SKIN CONTACT: 99.4% (EXCELLENT)</span>
          <span>QTc: 392ms</span>
        </div>
      </div>

      {/* Autonomic Nervous Balance & Cognitive Correlation Strip */}
      <div className="p-2.5 rounded-lg bg-[#0a0e16]/60 border border-[#262a33] flex flex-col gap-2 font-mono-tabular text-xs">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-[#849396] flex items-center gap-1">
            <span className="material-symbols-outlined text-xs text-[#00e5ff]">balance</span>
            <span>AUTONOMIC VAGAL BRAKE vs SYMPATHETIC LOAD</span>
          </span>
          <span
            className="font-bold tracking-wide"
            style={{ color: statusColor }}
          >
            {simState === 'danger'
              ? 'SYMPATHETIC OVERDRIVE'
              : simState === 'drowsy'
              ? 'PARASYMPATHETIC EXHAUSTION'
              : 'ROBUST VAGAL REGULATION'}
          </span>
        </div>

        {/* Dual Balance Visualizer Bar */}
        <div className="w-full bg-[#262a33] h-2 rounded-full overflow-hidden flex shadow-inner">
          <div
            className="bg-[#00e5ff] h-full transition-all duration-500"
            style={{ width: `${Math.max(12, 100 - cardiacStressIndex)}%` }}
            title="Parasympathetic Vagal Reserve"
          />
          <div
            className="bg-[#ff1744] h-full transition-all duration-500"
            style={{ width: `${Math.min(88, cardiacStressIndex)}%` }}
            title="Sympathetic Cognitive Strain"
          />
        </div>

        <div className="flex items-center justify-between text-[10px] text-[#849396]">
          <span className="text-[#00e5ff]">
            Vagal Brake: {simState === 'drowsy' ? 'Suppressed (32%)' : simState === 'danger' ? 'Inhibited (14%)' : 'Active (88%)'}
          </span>
          <span className="text-[#dfe2ee]">
            Cardiovascular Fatigue: <strong style={{ color: statusColor }}>{cardiacStressIndex}/100</strong>
          </span>
          <span className="text-[#7dffa2]">
            Cognitive Coupling: r = {simState === 'danger' ? '+0.88' : '+0.74'}
          </span>
        </div>
      </div>
    </div>
  );
};
