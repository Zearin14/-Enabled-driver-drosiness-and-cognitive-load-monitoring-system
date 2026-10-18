import React, { useState, useEffect, useRef } from 'react';
import { soundManager } from '../utils/soundEffects';

interface AlertOverlayPageProps {
  onAcknowledgeAlert?: () => void;
}

export const AlertOverlayPage: React.FC<AlertOverlayPageProps> = ({ onAcknowledgeAlert }) => {
  const [overlayState, setOverlayState] = useState<'safe' | 'amber' | 'red'>('red');
  const [showAmberToast, setShowAmberToast] = useState(true);
  const [holdProgress, setHoldProgress] = useState(0);
  const [holdStatus, setHoldStatus] = useState<'READY' | 'HOLDING' | 'OVERRIDDEN' | 'CANCELLED'>('READY');
  const [dispatchAlertMsg, setDispatchAlertMsg] = useState<string | null>(null);
  const holdIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const bgCockpitImg =
    'https://lh3.googleusercontent.com/aida-public/AB6AXuAsqA7g8K-a1ovXkOiHWfHOpysFuObO5VNioD-0Htt87_el2wDyeUY06rAFIaqIny8iRz53Vp4JNCTIjjRbwLM-rnBxyFVhToKmI4s18ZfkqPXcA4XHLI0ghazJ5EFmblN9ROm3K0c6eQ3Q0aTzwBl2vuWZkUvUcs31zCS0piCFBZ_5YOuST5y1A-WGtRIY_wZ2SxfZ1vi1fBpwTbaBCmASQueWnYoHTCLMJxguvsDfPn1MfpueRO1wPw';

  // Sound triggers on state change
  useEffect(() => {
    if (overlayState === 'red') {
      soundManager.playSiren(2500);
      setShowAmberToast(true);
      setHoldProgress(0);
      setHoldStatus('READY');
    } else if (overlayState === 'amber') {
      soundManager.playChime();
      setShowAmberToast(true);
    } else {
      soundManager.playBeep(900, 0.1);
    }
  }, [overlayState]);

  // Hold-to-dismiss handler
  const startHoldDismiss = () => {
    if (overlayState !== 'red') return;
    setHoldStatus('HOLDING');
    soundManager.playBeep(1000, 0.1);

    clearInterval(holdIntervalRef.current as NodeJS.Timeout);
    holdIntervalRef.current = setInterval(() => {
      setHoldProgress((prev) => {
        const next = prev + 3.33; // ~3 seconds to reach 100%
        if (next >= 100) {
          clearInterval(holdIntervalRef.current as NodeJS.Timeout);
          setHoldStatus('OVERRIDDEN');
          soundManager.playBeep(1400, 0.25);
          setTimeout(() => {
            setOverlayState('safe');
            if (onAcknowledgeAlert) onAcknowledgeAlert();
          }, 600);
          return 100;
        }
        return next;
      });
    }, 100);
  };

  const cancelHoldDismiss = () => {
    if (holdProgress < 100 && holdStatus === 'HOLDING') {
      clearInterval(holdIntervalRef.current as NodeJS.Timeout);
      setHoldProgress(0);
      setHoldStatus('CANCELLED');
    }
  };

  const handleDispatchSOS = () => {
    soundManager.playBeep(700, 0.2);
    setDispatchAlertMsg(
      'NeuroDrive Dispatch Uplink: High-Priority distress beacon transmitted to Fleet Command with GPS Coordinates (41.6528° N, -91.5324° W). Dispatcher Marcus Vance notified.'
    );
    setTimeout(() => {
      setDispatchAlertMsg(null);
    }, 6000);
  };

  return (
    <div className="w-full pt-16 min-h-screen bg-[#0f131c] text-[#dfe2ee] px-4 sm:px-6 pb-12">
      {/* Interactive Preview Controls Bar */}
      <div className="w-full bg-[#181c24]/90 backdrop-blur-md rounded-xl p-3 mb-4 border border-[#262a33] shadow-lg flex flex-wrap items-center justify-between gap-3 mt-2">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#00e5ff] text-xl">tune</span>
          <span className="text-sm font-bold text-[#dfe2ee]">Simulation Switcher:</span>
          <span className="font-mono-tabular text-xs text-[#849396] uppercase tracking-wider hidden sm:inline-block">
            Live Test Rig
          </span>
        </div>

        <div className="flex items-center gap-1.5 bg-[#31353e]/60 p-1 rounded-lg border border-[#3b494c]/50">
          <button
            onClick={() => setOverlayState('safe')}
            className={`px-3 py-1.5 rounded font-mono-tabular text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
              overlayState === 'safe'
                ? 'bg-[#05e777] text-[#001f24] font-bold shadow-sm'
                : 'text-[#bac9cc] hover:text-white'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-[#05e777]"></span>
            <span>NOMINAL (CLEAR)</span>
          </button>

          <button
            onClick={() => setOverlayState('amber')}
            className={`px-3 py-1.5 rounded font-mono-tabular text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
              overlayState === 'amber'
                ? 'bg-[#ffc769] text-[#281900] font-bold shadow-sm'
                : 'text-[#bac9cc] hover:text-white'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-[#ffc769]"></span>
            <span>TIER 2 (AMBER COGNITIVE)</span>
          </button>

          <button
            onClick={() => setOverlayState('red')}
            className={`px-3 py-1.5 rounded font-mono-tabular text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
              overlayState === 'red'
                ? 'bg-[#93000a] text-[#ffdad6] font-bold shadow-[0_0_12px_rgba(147,0,10,0.6)]'
                : 'text-[#bac9cc] hover:text-white'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-[#ff1744] animate-ping"></span>
            <span>TIER 1 (RED CRITICAL)</span>
          </button>
        </div>

        <div className="hidden md:flex items-center gap-2">
          <span className="font-mono-tabular text-xs text-[#849396]">HUD MODE:</span>
          <span className="font-mono-tabular text-xs px-2 py-0.5 rounded bg-[#353942] text-[#00e5ff] font-bold border border-[#3b494c]/40">
            CANBUS SYNC ACTIVE
          </span>
        </div>
      </div>

      {/* Main HUD Viewport & Alert Enclosure */}
      <div className="relative w-full rounded-2xl overflow-hidden min-h-[760px] bg-[#0a0e16] border border-[#262a33] shadow-2xl flex items-center justify-center p-4">
        {/* Background Context: Tactical Cockpit under Stress State */}
        <div
          className={`absolute inset-0 w-full h-full p-4 grid grid-cols-12 gap-4 select-none pointer-events-none transition-all duration-700 ${
            overlayState === 'red' ? 'opacity-30' : overlayState === 'amber' ? 'opacity-70' : 'opacity-90'
          }`}
        >
          {/* Video Face Mesh Feed Column (Col 1-8) */}
          <div className="col-span-12 lg:col-span-8 flex flex-col gap-4">
            <div className="relative w-full h-[400px] rounded-xl overflow-hidden bg-[#181c24] border border-[#262a33]">
              <img
                alt="Driver Gaze Lock Breached"
                className="w-full h-full object-cover filter brightness-75 contrast-125"
                src={bgCockpitImg}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0e16] via-transparent to-transparent" />
              <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1 rounded bg-[#0a0e16]/80 backdrop-blur-md border border-[#93000a]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#ff1744] animate-pulse"></span>
                <span className="font-mono-tabular text-xs text-[#ffb4ab] uppercase tracking-wider font-bold">
                  CAM-01 • IR DRIVER GAZE LOCK BREACHED
                </span>
              </div>

              {/* Bounding Reticle Target */}
              <div className="absolute inset-16 rounded-xl border border-dashed border-[#ff1744]/60 flex flex-col justify-between p-3">
                <div className="flex justify-between font-mono-tabular text-xs text-[#ffb4ab]">
                  <span>FOV: 84.2°</span>
                  <span>EAR: 0.12 (CRIT)</span>
                </div>
                <div className="self-center px-3 py-1 bg-[#93000a]/90 text-white rounded font-mono-tabular text-xs tracking-widest uppercase font-bold shadow-md">
                  MICROSLEEP SIGNATURE DETECTED
                </div>
                <div className="flex justify-between font-mono-tabular text-xs text-[#ffb4ab]">
                  <span>HEAD TILT: -14.2° PITCH</span>
                  <span>PUPIL LOSS: 2600ms</span>
                </div>
              </div>
            </div>

            {/* Telemetry Gauges Grid */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-[#181c24] border border-[#262a33] flex flex-col justify-between">
                <span className="font-mono-tabular text-[10px] text-[#bac9cc] uppercase font-semibold">
                  PERCLOS INDEX
                </span>
                <span className="font-mono-tabular text-xl font-bold text-[#ffb4ab]">34.8%</span>
                <div className="w-full bg-[#31353e] h-1.5 rounded-full overflow-hidden mt-1">
                  <div className="bg-[#ff1744] h-full w-[88%]"></div>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-[#181c24] border border-[#262a33] flex flex-col justify-between">
                <span className="font-mono-tabular text-[10px] text-[#bac9cc] uppercase font-semibold">
                  EYE CLOSURE TIME
                </span>
                <span className="font-mono-tabular text-xl font-bold text-[#ffb4ab]">2.60s</span>
                <div className="w-full bg-[#31353e] h-1.5 rounded-full overflow-hidden mt-1">
                  <div className="bg-[#ff1744] h-full w-[95%]"></div>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-[#181c24] border border-[#262a33] flex flex-col justify-between">
                <span className="font-mono-tabular text-[10px] text-[#bac9cc] uppercase font-semibold">
                  YAWN FREQUENCY
                </span>
                <span className="font-mono-tabular text-xl font-bold text-[#ffc769]">4 / 3m</span>
                <div className="w-full bg-[#31353e] h-1.5 rounded-full overflow-hidden mt-1">
                  <div className="bg-[#ffc769] h-full w-[70%]"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Route & System Feed Column (Col 9-12) */}
          <div className="col-span-12 lg:col-span-4 flex flex-col gap-4">
            <div className="p-4 rounded-xl bg-[#181c24] border border-[#262a33] flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="font-mono-tabular text-[11px] text-[#bac9cc] uppercase font-semibold">
                  INTERSTATE 80W TELEMETRY
                </span>
                <span className="font-mono-tabular text-xs text-[#7dffa2] font-bold">64 MPH</span>
              </div>
              <div className="w-full h-36 rounded-lg bg-[#262a33] relative overflow-hidden flex items-center justify-center border border-[#3b494c]/40">
                <span className="material-symbols-outlined text-4xl text-[#00e5ff]/40">map</span>
                <div className="absolute bottom-2 left-2 px-2 py-1 bg-[#0a0e16]/90 rounded text-[#00e5ff] font-mono-tabular text-xs border border-[#3b494c]/50">
                  REST HAVEN: 1.8 MI
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#181c24] border border-[#262a33] flex flex-col gap-1.5">
              <span className="font-mono-tabular text-[11px] text-[#849396] uppercase font-semibold">
                COGNITIVE SENSOR STREAM
              </span>
              <div className="flex items-center justify-between py-1 border-b border-[#262a33]">
                <span className="text-xs text-[#dfe2ee]">Alpha Brainwave Rhythm</span>
                <span className="font-mono-tabular text-xs text-[#ffb4ab] font-bold">
                  Depressed (Stage 1)
                </span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-[#262a33]">
                <span className="text-xs text-[#dfe2ee]">Heart Rate Variability</span>
                <span className="font-mono-tabular text-xs text-[#ffc769] font-bold">
                  48 ms (Fatigue)
                </span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-xs text-[#dfe2ee]">Lane Deviation Drift</span>
                <span className="font-mono-tabular text-xs text-[#ffb4ab] font-bold">+0.62m Right</span>
              </div>
            </div>
          </div>
        </div>

        {/* Ambient Crimson Pulse Vignette Layer */}
        {overlayState === 'red' && (
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_20%,_rgba(147,0,10,0.55)_100%)] animate-pulse transition-opacity duration-500" />
        )}

        {/* Hazard Striping Border Overlay */}
        {overlayState === 'red' && (
          <div className="pointer-events-none absolute inset-0 opacity-20 bg-[repeating-linear-gradient(45deg,#ff0000,#ff0000_20px,#000000_20px,#000000_40px)] mix-blend-overlay" />
        )}

        {/* MAIN MODAL: High-Impact Full-Screen Flashing Alert Modal (Tier 1: Emergency Drowsiness Danger) */}
        {overlayState === 'red' && (
          <div className="relative z-30 max-w-3xl w-full mx-4 bg-[#0a0e16]/95 backdrop-blur-2xl rounded-2xl border-2 border-[#ff1744] shadow-[0_0_80px_rgba(255,23,68,0.4)] overflow-hidden transition-all duration-300">
            {/* Hazard Top Banner Bar */}
            <div className="w-full h-3 bg-[repeating-linear-gradient(45deg,#ff1744,#ff1744_16px,#1c2028_16px,#1c2028_32px)] animate-pulse" />

            {/* Main Emergency Modal Content */}
            <div className="p-6 md:p-8 flex flex-col gap-6">
              {/* Header Banner & Warning Animation */}
              <div className="flex flex-col md:flex-row items-center md:items-start gap-4 text-center md:text-left">
                {/* Pulsing Siren Graphic */}
                <div className="relative flex-shrink-0 flex items-center justify-center w-24 h-24 rounded-2xl bg-[#93000a] text-[#ffdad6] shadow-[0_0_30px_rgba(255,23,68,0.7)]">
                  <span className="absolute inset-0 rounded-2xl bg-[#ff1744] opacity-40 animate-ping"></span>
                  <span
                    className="material-symbols-outlined text-5xl relative z-10"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    warning
                  </span>
                  <div
                    className="absolute -inset-3 rounded-2xl border-2 border-[#ff1744]/40 animate-ping"
                    style={{ animationDuration: '1.5s' }}
                  ></div>
                </div>

                <div className="flex flex-col flex-1">
                  <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded bg-[#ff1744] text-[#001f24] font-mono-tabular text-xs uppercase tracking-widest font-bold">
                      CRITICAL INTERVENTION • TIER 1
                    </span>
                    <span className="font-mono-tabular text-xs text-[#ffb4ab] animate-pulse font-bold">
                      88 dB SIREN ACTIVE
                    </span>
                  </div>

                  <h1 className="text-2xl sm:text-3xl font-extrabold text-[#ffb4ab] leading-tight uppercase tracking-tight">
                    DROWSINESS DETECTED — PULL OVER AND REST IMMEDIATELY
                  </h1>
                  <p className="text-sm text-[#bac9cc] mt-1 leading-relaxed">
                    Autonomous safety protocols activated. Extended micro-sleep detected. Audible
                    cabin alarms broadcasting.
                  </p>
                </div>
              </div>

              {/* Telemetry Breach Breakdown Metric Bento */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-[#181c24]/90 p-4 rounded-xl border border-[#262a33]">
                <div className="flex flex-col gap-1 p-2">
                  <div className="flex items-center gap-1.5 text-[#ffb4ab]">
                    <span className="material-symbols-outlined text-base">visibility_off</span>
                    <span className="font-mono-tabular text-[10px] uppercase font-bold">
                      Eyes Closed
                    </span>
                  </div>
                  <span className="font-mono-tabular text-lg font-bold text-[#ffb4ab]">2.6 sec</span>
                  <span className="font-mono-tabular text-[10px] text-[#849396]">
                    Exceeded limit &gt;1.8s
                  </span>
                </div>

                <div className="flex flex-col gap-1 p-2">
                  <div className="flex items-center gap-1.5 text-[#ffb4ab]">
                    <span className="material-symbols-outlined text-base">timelapse</span>
                    <span className="font-mono-tabular text-[10px] uppercase font-bold">PERCLOS</span>
                  </div>
                  <span className="font-mono-tabular text-lg font-bold text-[#ffb4ab]">34.8%</span>
                  <span className="font-mono-tabular text-[10px] text-[#849396]">
                    Critical danger index
                  </span>
                </div>

                <div className="flex flex-col gap-1 p-2">
                  <div className="flex items-center gap-1.5 text-[#ffc769]">
                    <span className="material-symbols-outlined text-base">
                      sentiment_very_dissatisfied
                    </span>
                    <span className="font-mono-tabular text-[10px] uppercase font-bold">
                      Frequent Yawning
                    </span>
                  </div>
                  <span className="font-mono-tabular text-lg font-bold text-[#ffc769]">4 events</span>
                  <span className="font-mono-tabular text-[10px] text-[#849396]">
                    Past 3 minutes window
                  </span>
                </div>

                <div className="flex flex-col gap-1 p-2">
                  <div className="flex items-center gap-1.5 text-[#ffb4ab]">
                    <span className="material-symbols-outlined text-base">
                      airline_seat_recline_extra
                    </span>
                    <span className="font-mono-tabular text-[10px] uppercase font-bold">
                      Head Nodding
                    </span>
                  </div>
                  <span className="font-mono-tabular text-lg font-bold text-[#ffb4ab]">
                    2 micro-dips
                  </span>
                  <span className="font-mono-tabular text-[10px] text-[#849396]">
                    Rapid jerk recoveries
                  </span>
                </div>
              </div>

              {/* Real-Time Audio Decibel Wave Visualizer */}
              <div className="flex flex-col gap-2 bg-[#262a33]/60 p-3 rounded-xl border border-[#3b494c]/40">
                <div className="flex items-center justify-between font-mono-tabular text-xs">
                  <span className="text-[#bac9cc] flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#ff1744] text-base animate-pulse">
                      volume_up
                    </span>
                    CABIN ACOUSTIC RESONANCE:
                  </span>
                  <span className="text-[#ffb4ab] font-bold tracking-wider">
                    88.4 dB (PEAK DISTRESS FREQUENCY)
                  </span>
                </div>

                {/* Dynamic SVG Wave Bars */}
                <div className="flex items-center justify-between gap-1.5 h-8 w-full px-3 py-1 bg-[#0a0e16] rounded-lg overflow-hidden border border-[#262a33]">
                  {[65, 90, 45, 100, 80, 95, 70, 85, 100, 60, 90, 75, 100, 80, 65, 90, 40, 85, 100, 55].map(
                    (heightPercent, idx) => (
                      <div
                        key={idx}
                        className={`w-1.5 bg-[#ff1744] rounded-full ${
                          idx % 2 === 0 ? 'animate-pulse' : 'animate-bounce'
                        }`}
                        style={{ height: `${heightPercent}%` }}
                      />
                    )
                  )}
                </div>
              </div>

              {/* Nearest Rest Stop & Quick Action */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-xl bg-[#262a33]/80 border border-[#00e5ff]/30 shadow-md">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-[#00e5ff] text-[#001f24] flex items-center justify-center flex-shrink-0 shadow-lg">
                    <span className="material-symbols-outlined text-2xl font-bold">
                      local_gas_station
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-mono-tabular text-[10px] text-[#00e5ff] uppercase font-bold tracking-wider">
                      AUTOMATED ESCAPE ROUTE FOUND
                    </span>
                    <span className="text-base font-bold text-[#dfe2ee]">
                      Pilot Flying J Travel Center
                    </span>
                    <span className="text-xs text-[#bac9cc]">
                      1.8 miles ahead • Exit 42B • 34 Heavy Truck Parking Bays Available
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    soundManager.playBeep(1200);
                    setDispatchAlertMsg('Autonomous navigation engaged: Route locked to Pilot Flying J Exit 42B.');
                  }}
                  className="px-4 py-2.5 bg-[#00e5ff] hover:bg-[#9cf0ff] text-[#001f24] rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-[0_0_20px_rgba(0,229,255,0.4)] flex-shrink-0 cursor-pointer"
                  type="button"
                >
                  <span className="material-symbols-outlined text-base">alt_route</span>
                  <span>Reroute & Park Now</span>
                </button>
              </div>

              {/* Interactive Safety Action Buttons (Hold to Dismiss Logic) */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-1">
                {/* Hold to Dismiss Primary Button */}
                <div className="relative w-full sm:w-2/3 group">
                  <button
                    onMouseDown={startHoldDismiss}
                    onMouseUp={cancelHoldDismiss}
                    onMouseLeave={cancelHoldDismiss}
                    onTouchStart={startHoldDismiss}
                    onTouchEnd={cancelHoldDismiss}
                    className="relative overflow-hidden w-full py-4 px-6 rounded-xl bg-[#ff1744] hover:bg-[#ba1a1a] text-white font-bold text-base flex items-center justify-center gap-2.5 shadow-[0_0_35px_rgba(255,23,68,0.6)] cursor-pointer select-none transition-all active:scale-[0.98]"
                    type="button"
                  >
                    {/* Progress fill meter on hold */}
                    <div
                      className="absolute left-0 top-0 bottom-0 bg-white/40 transition-all pointer-events-none ease-linear"
                      style={{ width: `${holdProgress}%` }}
                    />
                    <span className="material-symbols-outlined text-2xl relative z-10 animate-bounce">
                      pan_tool
                    </span>
                    <span className="relative z-10 uppercase tracking-wide font-extrabold">
                      I'M AWAKE (HOLD 3S TO DISMISS)
                    </span>
                  </button>

                  <div className="flex justify-between items-center mt-1.5 px-1">
                    <span className="font-mono-tabular text-[11px] text-[#849396]">
                      Press and hold firmly to override cabin alarm
                    </span>
                    <span
                      className={`font-mono-tabular text-xs font-bold ${
                        holdStatus === 'HOLDING'
                          ? 'text-[#00e5ff]'
                          : holdStatus === 'OVERRIDDEN'
                          ? 'text-[#7dffa2]'
                          : 'text-[#ffb4ab]'
                      }`}
                    >
                      {holdStatus === 'HOLDING'
                        ? 'HOLDING... (KEEP PRESSED)'
                        : holdStatus === 'OVERRIDDEN'
                        ? 'ALARM OVERRIDDEN'
                        : holdStatus === 'CANCELLED'
                        ? 'RELEASED EARLY'
                        : 'READY'}
                    </span>
                  </div>
                </div>

                {/* Secondary Dispatch Trigger */}
                <button
                  onClick={handleDispatchSOS}
                  className="w-full sm:w-1/3 py-4 px-4 rounded-xl bg-[#262a33] hover:bg-[#353942] text-[#dfe2ee] font-semibold text-sm flex items-center justify-center gap-2 transition-colors border border-[#3b494c]/60 cursor-pointer"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[#ff1744] text-xl">
                    phone_in_talk
                  </span>
                  <span>Alert Fleet Dispatch</span>
                </button>
              </div>
            </div>

            {/* Hazard Bottom Striping */}
            <div className="w-full h-2 bg-[repeating-linear-gradient(45deg,#ff1744,#ff1744_16px,#1c2028_16px,#1c2028_32px)]" />
          </div>
        )}

        {/* Safe State Display when Nominal */}
        {overlayState === 'safe' && (
          <div className="relative z-30 max-w-md w-full text-center bg-[#181c24]/95 p-8 rounded-2xl border border-[#05e777]/50 shadow-2xl flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[#05e777]/20 flex items-center justify-center text-[#7dffa2]">
              <span className="material-symbols-outlined text-4xl">verified</span>
            </div>
            <h3 className="text-xl font-bold text-white">Cockpit Status Clear</h3>
            <p className="text-sm text-[#bac9cc]">
              Driver biometrics are within safe regulatory baselines. Telemetry monitors at 60 FPS.
            </p>
            <button
              onClick={() => setOverlayState('red')}
              className="px-4 py-2 rounded-lg bg-[#93000a] text-[#ffdad6] font-semibold text-xs cursor-pointer hover:bg-[#ba1a1a] transition-colors"
            >
              Simulate Emergency Warning
            </button>
          </div>
        )}

        {/* Lower Right / Floating Toast Notification (Tier 2: Cognitive Load Warning) */}
        {showAmberToast && (overlayState === 'amber' || overlayState === 'red') && (
          <div className="absolute bottom-6 right-6 z-40 max-w-md w-full bg-[#262a33]/95 backdrop-blur-2xl rounded-2xl p-4 border border-[#ffc769]/50 shadow-[0_0_40px_rgba(255,199,105,0.25)] flex flex-col gap-2.5 transition-all duration-300">
            {/* Amber Header Ribbon */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2 text-[#ffc769]">
                <span
                  className="material-symbols-outlined text-2xl"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  crisis_alert
                </span>
                <span className="font-bold text-sm tracking-tight text-[#ffc769]">
                  TIER 2: HIGH COGNITIVE LOAD
                </span>
              </div>
              <button
                onClick={() => setShowAmberToast(false)}
                className="p-1 rounded hover:bg-[#31353e] text-[#849396] hover:text-white transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>

            {/* Body Message */}
            <p className="text-xs text-[#dfe2ee] leading-relaxed">
              Multi-tasking distraction and neural overload detected. Reduce dashboard screen
              interaction, lower audio volume, and keep primary focus straight ahead.
            </p>

            {/* Key Diagnostic Line */}
            <div className="px-3 py-1.5 rounded bg-[#0a0e16]/80 flex items-center justify-between font-mono-tabular text-[11px] border border-[#262a33]">
              <span className="text-[#ffc769] font-bold">COG INDEX: 88/100 (HIGH STRAIN)</span>
              <span className="text-[#849396]">•</span>
              <span className="text-[#ffc769]">GAZE DEV: 4.8s OFF-CENTER</span>
            </div>

            {/* Quick Actions for Cognitive Load */}
            <div className="flex items-center justify-end gap-2 mt-1">
              <button
                onClick={() => {
                  setShowAmberToast(false);
                  soundManager.playBeep(700, 0.08);
                }}
                className="px-3 py-1 rounded text-[#849396] hover:text-white font-mono-tabular text-[11px] transition-colors cursor-pointer"
                type="button"
              >
                Snooze (5m)
              </button>
              <button
                onClick={() => {
                  setShowAmberToast(false);
                  soundManager.playBeep(1200, 0.1);
                }}
                className="px-3.5 py-1.5 rounded bg-[#ffc769] hover:bg-[#ffdeac] text-[#281900] font-mono-tabular text-[11px] font-bold transition-colors flex items-center gap-1 shadow-sm cursor-pointer"
                type="button"
              >
                <span className="material-symbols-outlined text-sm">check_circle</span>
                <span>Acknowledge Focus</span>
              </button>
            </div>
          </div>
        )}

        {/* Dispatch Message Feedback Popup */}
        {dispatchAlertMsg && (
          <div className="absolute top-6 z-50 bg-[#262a33] border border-[#00e5ff] text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3">
            <span className="material-symbols-outlined text-[#00e5ff]">emergency</span>
            <span className="text-xs font-mono-tabular">{dispatchAlertMsg}</span>
          </div>
        )}
      </div>

      {/* Operational Protocol Reference Specs Footer */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-[#181c24] border border-[#262a33] flex flex-col gap-1.5">
          <div className="flex items-center gap-2 text-[#7dffa2] font-semibold text-sm">
            <span className="material-symbols-outlined text-base">verified_user</span>
            <span>Tier 1 Safety Triggers</span>
          </div>
          <p className="text-xs text-[#bac9cc] leading-relaxed">
            Activates when PERCLOS &gt; 25%, Eye Closure &gt; 1.8s, or consecutive head droop
            kinematics occur. Escalates to 88 dB multi-frequency audible beacon and initiates cloud
            fleet dispatcher SOS uplink.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-[#181c24] border border-[#262a33] flex flex-col gap-1.5">
          <div className="flex items-center gap-2 text-[#ffc769] font-semibold text-sm">
            <span className="material-symbols-outlined text-base">warning</span>
            <span>Tier 2 Cognitive Strain</span>
          </div>
          <p className="text-xs text-[#bac9cc] leading-relaxed">
            Monitors off-center gaze vector distributions and pupil dilation. Non-intrusive HUD toast
            warns operator of split attention prior to full drowsiness collapse.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-[#181c24] border border-[#262a33] flex flex-col gap-1.5">
          <div className="flex items-center gap-2 text-[#00e5ff] font-semibold text-sm">
            <span className="material-symbols-outlined text-base">terminal</span>
            <span>FMCSA Compliance Spec</span>
          </div>
          <p className="text-xs text-[#bac9cc] leading-relaxed">
            Compliant with Federal Motor Carrier Safety Administration Automated Driving Systems
            (ADS) Rule 49 CFR § 392.3 for driver impairment and proactive incident avoidance.
          </p>
        </div>
      </div>
    </div>
  );
};
