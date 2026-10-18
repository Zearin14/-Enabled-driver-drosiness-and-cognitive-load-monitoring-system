import React, { useState } from 'react';
import { ScreenType } from '../types/telemetry';
import { soundManager } from '../utils/soundEffects';
import { FacialMeshVisualizer } from './FacialMeshVisualizer';

interface OverviewPageProps {
  onNavigate: (screen: ScreenType) => void;
}

export const OverviewPage: React.FC<OverviewPageProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'all' | 'drowsiness' | 'cognitive'>('all');
  const [showNotesModal, setShowNotesModal] = useState(false);

  const heroCockpitImg =
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBonkXJ3a3AssytRh_LI4i0ZCY3ZZc5DeBKPh4YpVfWz91SBpakSg1_5nwq-8qoCvEBqcT15N9g6T-lL5TOnwNGr8vqpw3k24XZmXZGCfYi1ijBSMVIJwCBKo9ZyhQKlgfxyWPLUPhKg4v0cV5BUxkx9kROPrPhLw1BLwR39ULp9Vm2GxI9lGyB5ibFmX2-BD6Tap08wNK6vqGrgr-iE61z2OASiWmTqPLzK9GtdKluz1WTVVZGZNziKQ';
  const testimonialImg =
    'https://lh3.googleusercontent.com/aida-public/AB6AXuC86NdDN7UJ-eDUhXY4IJiawDiN63JXF7bXOlE_7RrxM55wAjSw4cKJsJXL5kq6BBMsIMW8SYH4nwZcAAlXEToVZyx7yaizl88Di1dHSLv37P4ZD2UeLZ6WwpgRw5DFTYAPBBBHkVhHp_7hQG7kpgyunOrdy9FPyjrVHN3okGPuBmSe8WBfozty38VlFrfDSgGMZ8ABeHVgnkaYb1IIoq4pKyO6fF5ox3YpU_7D1FN8RtMCmOUX13JTZA';
  const logoUrl =
    'https://lh3.googleusercontent.com/aida/AEtjO1WSr2GpDwe4UxrPaPSD4KSEBJk4MFRhxVHw97CKTPfCygezbCS8AbeBnYyUXKBjF11w7O__Cny4GKi8wfCTflUkLSLVRa_dAf1fWyzrkso6SKFc7g1w_iOhzmD5faNAHMdY8jO_rrNfJQkdvmbq6ux64sSzRjy3VCgb-hO64mE0A67BAwd_Yfj5Tb3B4ZNgl_QxTOEWgi4TeUKncn-fAdBDrvyod6ruxnmFBuzWpQ9tDNLzRWGLhJoV5oWj';

  return (
    <div className="w-full min-h-screen bg-[#0f131c] text-[#dfe2ee] pt-16">
      {/* Announcement Banner */}
      <section className="w-full bg-[#0a0e16] border-b border-[#262a33]/60 relative overflow-hidden py-2">
        <div className="absolute inset-0 bg-gradient-to-r from-[#00e5ff]/10 via-[#05e777]/10 to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-wrap items-center justify-between gap-2 relative z-10">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-2 h-2 rounded-full bg-[#7dffa2] shadow-[0_0_8px_#7dffa2] animate-pulse"></span>
            <span className="font-mono-tabular text-[11px] text-[#c3f5ff] tracking-widest uppercase font-bold">
              TELEMETRY DEPLOYED
            </span>
            <span className="hidden md:inline text-[#3b494c] font-mono-tabular text-xs">|</span>
            <p className="text-xs text-[#dfe2ee]">
              Next-Gen Edge AI Telemetry v3.2 is now active for commercial fleets.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-mono-tabular text-[11px] text-[#bac9cc] hidden sm:inline">
              ENGINE: EDGE-TENSOR-V3
            </span>
            <button
              onClick={() => setShowNotesModal(true)}
              className="font-mono-tabular text-[11px] text-[#c3f5ff] hover:text-white transition-colors underline decoration-[#00e5ff] underline-offset-4 cursor-pointer"
            >
              Read Release Notes →
            </button>
          </div>
        </div>
      </section>

      {/* Hero Section */}
      <section className="relative w-full pt-8 pb-16 overflow-hidden">
        {/* Ambient Cockpit Glows */}
        <div className="absolute top-10 left-1/4 w-96 h-96 bg-[#00e5ff]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-48 right-10 w-80 h-80 bg-[#05e777]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Hero Left Column */}
            <div className="lg:col-span-6 flex flex-col gap-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded bg-[#262a33] w-fit border border-[#3b494c]/50 shadow-inner">
                <span className="material-symbols-outlined text-[#00e5ff] text-base">sensors</span>
                <span className="font-mono-tabular text-[11px] text-[#00e5ff] tracking-wider uppercase font-semibold">
                  AUTONOMOUS EDGE SAFETY GRID
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#dfe2ee] tracking-tight leading-tight">
                NeuroDrive — <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#c3f5ff] via-[#00e5ff] to-[#7dffa2]">
                  Stay Awake. Stay Alive.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-[#bac9cc] max-w-xl leading-relaxed">
                Real-time AI facial mesh & cognitive load telemetry via standard webcams. Predicting
                micro-sleeps, distraction, and mental fatigue before danger strikes on the road.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={() => {
                    soundManager.playBeep(1100);
                    onNavigate('live-dashboard');
                  }}
                  className="relative group inline-flex items-center gap-2.5 px-6 py-3.5 rounded bg-[#00e5ff] text-[#001f24] font-bold text-base transition-all duration-300 shadow-[0_0_24px_rgba(0,229,255,0.4)] hover:shadow-[0_0_36px_rgba(0,229,255,0.7)] hover:scale-[1.02] cursor-pointer"
                >
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#001f24] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#001f24]"></span>
                  </span>
                  <span>Start Monitoring</span>
                  <span className="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform">
                    bolt
                  </span>
                </button>

                <button
                  onClick={() => {
                    soundManager.playBeep(900);
                    onNavigate('fleet-manager');
                  }}
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded bg-[#262a33] hover:bg-[#353942] text-[#dfe2ee] font-semibold text-base transition-colors border border-[#3b494c]/60 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base">domain</span>
                  <span>Fleet Enterprise Demo</span>
                </button>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4">
                <div className="flex flex-col p-3 bg-[#181c24] border border-[#262a33] rounded-lg shadow-sm">
                  <div className="flex items-center gap-1.5 text-[#7dffa2] mb-1">
                    <span className="material-symbols-outlined text-base">verified</span>
                    <span className="font-mono-tabular text-xl font-bold">99.4%</span>
                  </div>
                  <span className="font-mono-tabular text-[11px] text-[#bac9cc]">
                    Micro-Sleep Detection
                  </span>
                </div>

                <div className="flex flex-col p-3 bg-[#181c24] border border-[#262a33] rounded-lg shadow-sm">
                  <div className="flex items-center gap-1.5 text-[#00e5ff] mb-1">
                    <span className="material-symbols-outlined text-base">speed</span>
                    <span className="font-mono-tabular text-xl font-bold">&lt;15ms</span>
                  </div>
                  <span className="font-mono-tabular text-[11px] text-[#bac9cc]">
                    On-Device Latency
                  </span>
                </div>

                <div className="flex flex-col p-3 bg-[#181c24] border border-[#262a33] rounded-lg shadow-sm">
                  <div className="flex items-center gap-1.5 text-[#ffc769] mb-1">
                    <span className="material-symbols-outlined text-base">lock</span>
                    <span className="font-mono-tabular text-xl font-bold">Zero</span>
                  </div>
                  <span className="font-mono-tabular text-[11px] text-[#bac9cc]">
                    Video Uploads / Privacy
                  </span>
                </div>
              </div>
            </div>

            {/* Hero Right Column: Cockpit HUD Mockup Card */}
            <div className="lg:col-span-6 relative">
              <div className="relative rounded-xl overflow-hidden bg-[#181c24] border border-[#3b494c]/60 shadow-[0_8px_32px_rgba(0,0,0,0.6)] backdrop-blur-xl">
                {/* HUD Top Header */}
                <div className="px-4 py-2.5 bg-[#262a33] flex items-center justify-between border-b border-[#3b494c]/40">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#93000a] inline-block"></span>
                    <span className="font-mono-tabular text-[11px] text-[#00e5ff] tracking-wider uppercase font-semibold">
                      LIVE CAMERA TELEMETRY [NODE-01]
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-[#1c2028] px-2 py-0.5 rounded border border-[#3b494c]/50">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#7dffa2] animate-ping"></span>
                    <span className="font-mono-tabular text-[11px] text-[#7dffa2] font-semibold">
                      60.2 FPS
                    </span>
                  </div>
                </div>

                {/* Viewport Overlay Simulation */}
                <div className="relative w-full aspect-video bg-[#0a0e16] overflow-hidden flex items-center justify-center">
                  <img
                    alt="Driver Cockpit Telemetry"
                    className="w-full h-full object-cover opacity-60"
                    src={heroCockpitImg}
                  />

                  {/* Animated SVG-based Facial Mesh Visualizer Component Overlay */}
                  <FacialMeshVisualizer
                    simState="safe"
                    ear={0.32}
                    perclos={4.1}
                    blinkFrequency={18}
                    className="absolute inset-0 z-10"
                    enableInteractiveControls={false}
                  />

                  {/* Central Live Biometric Card Overlay */}
                  <div className="absolute bottom-3 left-3 right-3 bg-[#31353e]/90 backdrop-blur-md rounded-lg p-3 flex items-center justify-between border border-[#3b494c]/60 shadow-lg">
                    <div className="flex items-center gap-4">
                      <div>
                        <span className="block font-mono-tabular text-[10px] text-[#bac9cc]">
                          EAR (EYE ASPECT)
                        </span>
                        <span className="font-mono-tabular text-sm font-bold text-[#7dffa2]">
                          0.32 <span className="text-[10px] text-[#bac9cc] font-normal">NOMINAL</span>
                        </span>
                      </div>
                      <div className="w-px h-7 bg-[#181c24]"></div>
                      <div>
                        <span className="block font-mono-tabular text-[10px] text-[#bac9cc]">
                          BLINK FREQ
                        </span>
                        <span className="font-mono-tabular text-sm font-bold text-[#c3f5ff]">
                          18 <span className="text-[10px] text-[#bac9cc] font-normal">/min</span>
                        </span>
                      </div>
                      <div className="w-px h-7 bg-[#181c24]"></div>
                      <div>
                        <span className="block font-mono-tabular text-[10px] text-[#bac9cc]">PERCLOS</span>
                        <span className="font-mono-tabular text-sm font-bold text-[#7dffa2]">
                          4.1%
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="font-mono-tabular text-[10px] text-[#bac9cc]">OPERATOR STATE</span>
                      <span className="px-2 py-0.5 rounded bg-[#05e777]/20 text-[#7dffa2] font-mono-tabular text-[11px] font-bold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#7dffa2]"></span> SAFE
                      </span>
                    </div>
                  </div>
                </div>

                {/* Lower Instrument Dock */}
                <div className="p-2.5 bg-[#1c2028] grid grid-cols-3 gap-2 text-center border-t border-[#262a33]">
                  <div className="p-2 rounded bg-[#181c24]">
                    <span className="font-mono-tabular text-[10px] text-[#bac9cc] block">
                      NEURAL CORE
                    </span>
                    <span className="text-xs font-semibold text-[#dfe2ee]">TFLite 468-V2</span>
                  </div>
                  <div className="p-2 rounded bg-[#181c24]">
                    <span className="font-mono-tabular text-[10px] text-[#bac9cc] block">
                      DROWSINESS INDEX
                    </span>
                    <span className="text-xs font-semibold text-[#7dffa2]">0.08 (MINIMAL)</span>
                  </div>
                  <div className="p-2 rounded bg-[#181c24]">
                    <span className="font-mono-tabular text-[10px] text-[#bac9cc] block">
                      CAN BUS SYNC
                    </span>
                    <span className="text-xs font-semibold text-[#00e5ff]">CONNECTED</span>
                  </div>
                </div>
              </div>

              {/* Micro floating badge offset */}
              <div className="hidden sm:flex absolute -bottom-4 -left-3 bg-[#31353e] border border-[#3b494c]/60 px-3 py-1.5 rounded-full items-center gap-1.5 shadow-xl">
                <span className="material-symbols-outlined text-[#7dffa2] text-sm">shield</span>
                <span className="font-mono-tabular text-[11px] text-[#dfe2ee]">
                  ISO-26262 ASIL-B READY ALGORITHM
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid: 3 Core Instrument Cards */}
      <section className="w-full py-16 bg-[#0a0e16] border-y border-[#262a33]/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-[#00e5ff]"></span>
                <span className="font-mono-tabular text-xs text-[#00e5ff] tracking-widest uppercase font-semibold">
                  CORE SENSOR SUITE
                </span>
              </div>
              <h2 className="text-3xl font-bold text-[#dfe2ee] tracking-tight">
                High-Speed Edge Diagnostic Engines
              </h2>
            </div>
            <p className="text-sm text-[#bac9cc] max-w-md leading-relaxed">
              Continuous mathematical validation calculated every 16ms without offloading sensitive
              cabin visuals to public cloud networks.
            </p>
          </div>

          {/* 3 Glass Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="bg-[#181c24] border border-[#262a33] rounded-xl p-6 flex flex-col justify-between hover:bg-[#1c2028] transition-all group shadow-md">
              <div>
                <div className="w-12 h-12 rounded-lg bg-[#262a33] flex items-center justify-center text-[#00e5ff] group-hover:scale-110 group-hover:bg-[#00e5ff] group-hover:text-[#001f24] transition-all mb-4 shadow-inner">
                  <span className="material-symbols-outlined text-2xl">visibility</span>
                </div>
                <span className="font-mono-tabular text-[11px] text-[#00e5ff] tracking-widest uppercase block mb-1">
                  01 / OCULAR DYNAMICS
                </span>
                <h3 className="text-lg font-bold text-[#dfe2ee] mb-2">
                  Real-time Drowsiness Detection
                </h3>
                <p className="text-sm text-[#bac9cc] mb-6 leading-relaxed">
                  Eye Aspect Ratio (EAR), PERCLOS percentage tracking, and micro-nod recognition with
                  instant acoustic warnings triggered before full lid closure.
                </p>
              </div>

              {/* Embedded Mini Gauge Visual */}
              <div className="p-3 rounded-lg bg-[#0a0e16] border border-[#262a33] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <svg className="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-[#353942]"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3.5"
                    />
                    <path
                      className="text-[#7dffa2]"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeDasharray="82, 100"
                      strokeLinecap="round"
                      strokeWidth="3.5"
                    />
                  </svg>
                  <div>
                    <span className="font-mono-tabular text-base font-bold text-[#dfe2ee] leading-none block">
                      82%
                    </span>
                    <span className="font-mono-tabular text-[10px] text-[#bac9cc]">
                      LID APERTURE
                    </span>
                  </div>
                </div>
                <span className="font-mono-tabular text-[11px] text-[#7dffa2] bg-[#05e777]/10 px-2 py-0.5 rounded font-bold">
                  NOMINAL
                </span>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="bg-[#181c24] border border-[#262a33] rounded-xl p-6 flex flex-col justify-between hover:bg-[#1c2028] transition-all group shadow-md">
              <div>
                <div className="w-12 h-12 rounded-lg bg-[#262a33] flex items-center justify-center text-[#00e5ff] group-hover:scale-110 group-hover:bg-[#00e5ff] group-hover:text-[#001f24] transition-all mb-4 shadow-inner">
                  <span className="material-symbols-outlined text-2xl">neurology</span>
                </div>
                <span className="font-mono-tabular text-[11px] text-[#00e5ff] tracking-widest uppercase block mb-1">
                  02 / NEURO-METRIC
                </span>
                <h3 className="text-lg font-bold text-[#dfe2ee] mb-2">Cognitive Load Tracking</h3>
                <p className="text-sm text-[#bac9cc] mb-6 leading-relaxed">
                  Multi-vector pupillometry, saccadic gaze distraction analysis, and mental fatigue
                  scoring (Low / Balanced / High) to detect road hypnotism.
                </p>
              </div>

              {/* Embedded Metric Strip */}
              <div className="p-3 rounded-lg bg-[#0a0e16] border border-[#262a33] flex items-center justify-between">
                <div className="w-full">
                  <div className="flex justify-between items-center mb-1.5 font-mono-tabular text-[11px]">
                    <span className="text-[#bac9cc]">COGNITIVE INDEX</span>
                    <span className="text-[#00e5ff] font-semibold">BALANCED</span>
                  </div>
                  <div className="w-full bg-[#262a33] h-2 rounded-full overflow-hidden flex">
                    <div className="bg-[#7dffa2] w-1/3 h-full"></div>
                    <div className="bg-[#00e5ff] w-1/4 h-full"></div>
                    <div className="bg-[#353942] w-5/12 h-full"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="bg-[#181c24] border border-[#262a33] rounded-xl p-6 flex flex-col justify-between hover:bg-[#1c2028] transition-all group shadow-md">
              <div>
                <div className="w-12 h-12 rounded-lg bg-[#262a33] flex items-center justify-center text-[#00e5ff] group-hover:scale-110 group-hover:bg-[#00e5ff] group-hover:text-[#001f24] transition-all mb-4 shadow-inner">
                  <span className="material-symbols-outlined text-2xl">campaign</span>
                </div>
                <span className="font-mono-tabular text-[11px] text-[#00e5ff] tracking-widest uppercase block mb-1">
                  03 / ACTIVE MITIGATION
                </span>
                <h3 className="text-lg font-bold text-[#dfe2ee] mb-2">Instant Dual-Tier Alerts</h3>
                <p className="text-sm text-[#bac9cc] mb-6 leading-relaxed">
                  Sensory auditory sirens, visual HUD flashes, and fleet manager dispatch alerts
                  before critical lane deviations occur.
                </p>
              </div>

              {/* Embedded Flash Status Mock */}
              <div className="p-3 rounded-lg bg-[#0a0e16] border border-[#262a33] flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-[#ffc769] text-xl animate-bounce">
                    warning
                  </span>
                  <div>
                    <span className="text-xs font-semibold text-[#dfe2ee] block">Haptic + Audio Tier</span>
                    <span className="font-mono-tabular text-[10px] text-[#bac9cc]">
                      DISPATCH DISCONNECT: OFF
                    </span>
                  </div>
                </div>
                <span className="font-mono-tabular text-[11px] text-[#ffc769] bg-[#ffc769]/10 px-2 py-0.5 rounded font-bold">
                  READY
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How NeuroDrive Operates (4 Steps) */}
      <section className="w-full py-16 bg-[#0f131c]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="font-mono-tabular text-xs text-[#00e5ff] tracking-widest uppercase block mb-2 font-semibold">
              ARCHITECTURE PIPELINE
            </span>
            <h2 className="text-3xl font-bold text-[#dfe2ee] tracking-tight mb-2">
              How NeuroDrive Operates
            </h2>
            <p className="text-sm text-[#bac9cc]">
              From light entering a standard automotive lens to neural threat mitigation within tens of
              milliseconds.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {/* Step 1 */}
            <div className="relative bg-[#181c24] border border-[#262a33] p-5 rounded-xl flex flex-col justify-between shadow-sm">
              <div className="mb-4">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono-tabular text-xs text-[#00e5ff] bg-[#00e5ff]/10 px-2 py-0.5 rounded font-bold">
                    STEP 01
                  </span>
                  <span className="material-symbols-outlined text-[#bac9cc]">videocam</span>
                </div>
                <h4 className="text-base font-bold text-[#dfe2ee] mb-1">Webcam Input</h4>
                <p className="text-xs text-[#bac9cc] leading-relaxed">
                  Standard 720p or 1080p vehicle camera capture. Requires no specialized LIDAR or
                  infrared sensors.
                </p>
              </div>
              <div className="font-mono-tabular text-[10px] text-[#849396]">LATENCY: 0ms (INGEST)</div>
            </div>

            {/* Step 2 */}
            <div className="relative bg-[#181c24] border border-[#262a33] p-5 rounded-xl flex flex-col justify-between shadow-sm">
              <div className="mb-4">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono-tabular text-xs text-[#00e5ff] bg-[#00e5ff]/10 px-2 py-0.5 rounded font-bold">
                    STEP 02
                  </span>
                  <span className="material-symbols-outlined text-[#bac9cc]">grid_view</span>
                </div>
                <h4 className="text-base font-bold text-[#dfe2ee] mb-1">AI Face Mesh</h4>
                <p className="text-xs text-[#bac9cc] leading-relaxed">
                  468 facial landmark tracking & ocular vector analysis with real-time rotational yaw
                  and pitch tracking.
                </p>
              </div>
              <div className="font-mono-tabular text-[10px] text-[#849396]">ENGINE: TENSORFLOW-LITE</div>
            </div>

            {/* Step 3 */}
            <div className="relative bg-[#181c24] border border-[#262a33] p-5 rounded-xl flex flex-col justify-between shadow-sm">
              <div className="mb-4">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono-tabular text-xs text-[#00e5ff] bg-[#00e5ff]/10 px-2 py-0.5 rounded font-bold">
                    STEP 03
                  </span>
                  <span className="material-symbols-outlined text-[#bac9cc]">analytics</span>
                </div>
                <h4 className="text-base font-bold text-[#dfe2ee] mb-1">Real-time Risk Scoring</h4>
                <p className="text-xs text-[#bac9cc] leading-relaxed">
                  Continuous drowsiness index & cognitive strain evaluation running locally on
                  low-power vehicle hardware.
                </p>
              </div>
              <div className="font-mono-tabular text-[10px] text-[#849396]">INFERENCE: &lt; 12MS</div>
            </div>

            {/* Step 4 */}
            <div className="relative bg-[#181c24] border border-[#262a33] p-5 rounded-xl flex flex-col justify-between shadow-sm">
              <div className="mb-4">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono-tabular text-xs text-[#7dffa2] bg-[#7dffa2]/10 px-2 py-0.5 rounded font-bold">
                    STEP 04
                  </span>
                  <span className="material-symbols-outlined text-[#7dffa2]">notifications_active</span>
                </div>
                <h4 className="text-base font-bold text-[#dfe2ee] mb-1">Multi-Modal Warning</h4>
                <p className="text-xs text-[#bac9cc] leading-relaxed">
                  Adaptive auditory chimes, cabin display flashing, and autonomous safe pull-over
                  advisories.
                </p>
              </div>
              <div className="font-mono-tabular text-[10px] text-[#7dffa2] font-semibold">
                FAIL-SAFE ENGAGED
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Hardware Agnostic Section */}
      <section className="w-full py-16 bg-[#0a0e16] border-y border-[#262a33]/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="bg-[#181c24] border border-[#262a33] rounded-xl p-6 lg:p-8 flex flex-col lg:flex-row items-center gap-8">
            <div className="w-full lg:w-1/2 flex flex-col gap-4">
              <span className="font-mono-tabular text-xs text-[#00e5ff] tracking-widest uppercase font-semibold">
                HARDWARE AGNOSTIC
              </span>
              <h3 className="text-2xl font-bold text-[#dfe2ee]">
                Works Instantly on Any In-Cabin Camera Rig
              </h3>
              <p className="text-sm text-[#bac9cc] leading-relaxed">
                Whether deployed on a commercial fleet driver monitoring system (DMS), an Android
                automotive head unit, or a low-cost Raspberry Pi CM4 telematics box, NeuroDrive requires
                zero cloud bandwidth to prevent road fatalities.
              </p>
              <div className="flex flex-col gap-2.5 pt-2 text-sm text-[#dfe2ee]">
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-[#7dffa2] text-base">check_circle</span>
                  <span>Full compliance with EU General Safety Regulation (GSR) driver drowsiness alerts</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-[#7dffa2] text-base">check_circle</span>
                  <span>100% on-device cryptographic zero-knowledge computation</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-[#7dffa2] text-base">check_circle</span>
                  <span>Dual CAN-bus & OBD-II speed threshold integration</span>
                </div>
              </div>
            </div>

            <div className="w-full lg:w-1/2 bg-[#0a0e16] p-4 rounded-lg border border-[#262a33] shadow-inner">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#262a33]">
                <span className="font-mono-tabular text-[11px] text-[#00e5ff] uppercase font-bold">
                  MOCK PERCLOS SPECTRUM
                </span>
                <span className="font-mono-tabular text-[11px] text-[#bac9cc]">LAST 60 SECONDS</span>
              </div>
              <svg className="w-full h-36" preserveAspectRatio="none" viewBox="0 0 400 120">
                <line x1="0" y1="30" x2="400" y2="30" stroke="#1c2028" strokeWidth="1" />
                <line x1="0" y1="60" x2="400" y2="60" stroke="#1c2028" strokeWidth="1" />
                <line x1="0" y1="90" x2="400" y2="90" stroke="#1c2028" strokeWidth="1" />
                <line x1="0" y1="35" x2="400" y2="35" stroke="#ffb4ab" strokeDasharray="4 4" strokeWidth="1" opacity="0.5" />
                <text x="320" y="30" fill="#ffb4ab" fontFamily="JetBrains Mono" fontSize="8">
                  CRITICAL LIMIT
                </text>

                <defs>
                  <linearGradient id="telemetryGrad" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#00e5ff" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#00e5ff" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <path
                  d="M 0 85 Q 30 80, 60 78 T 120 88 T 180 82 T 240 60 T 280 40 T 320 70 T 360 85 T 400 82 L 400 120 L 0 120 Z"
                  fill="url(#telemetryGrad)"
                />
                <path
                  d="M 0 85 Q 30 80, 60 78 T 120 88 T 180 82 T 240 60 T 280 40 T 320 70 T 360 85 T 400 82"
                  fill="none"
                  stroke="#00e5ff"
                  strokeWidth="2"
                />
                <circle cx="280" cy="40" r="4" fill="#ffb4ab" />
                <circle cx="280" cy="40" r="8" fill="none" stroke="#ffb4ab" strokeWidth="1" opacity="0.6" className="animate-ping" />
              </svg>
              <div className="flex items-center justify-between pt-2 font-mono-tabular text-[10px] text-[#bac9cc]">
                <span>T -60s</span>
                <span className="text-[#ffb4ab] font-bold">MICROSLEEP BLIP DETECTED (T -18s)</span>
                <span className="text-[#7dffa2]">CURRENT: RECOVERED</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Fleet Statistics Bar & Testimonials */}
      <section className="w-full py-16 bg-[#0f131c]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Big Metrics Strip */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 p-6 rounded-xl bg-[#262a33] border border-[#3b494c]/60 shadow-lg">
            <div className="flex flex-col items-center text-center">
              <span className="font-mono-tabular text-4xl font-bold text-[#c3f5ff] tracking-tight">
                4.2M+
              </span>
              <span className="text-base font-semibold text-[#dfe2ee] mt-1">Miles Monitored</span>
              <span className="text-xs text-[#bac9cc]">Across US and European logistics corridors</span>
            </div>
            <div className="flex flex-col items-center text-center">
              <span className="font-mono-tabular text-4xl font-bold text-[#7dffa2] tracking-tight">
                87%
              </span>
              <span className="text-base font-semibold text-[#dfe2ee] mt-1">Incident Reduction</span>
              <span className="text-xs text-[#bac9cc]">Decrease in micro-sleep related roadway events</span>
            </div>
            <div className="flex flex-col items-center text-center">
              <span className="font-mono-tabular text-4xl font-bold text-[#9cf0ff] tracking-tight">
                450+
              </span>
              <span className="text-base font-semibold text-[#dfe2ee] mt-1">Logistics Fleets</span>
              <span className="text-xs text-[#bac9cc]">Active commercial freight integration units</span>
            </div>
          </div>

          {/* Testimonial Quote */}
          <div className="bg-[#181c24] border border-[#262a33] rounded-xl p-6 lg:p-8 flex flex-col md:flex-row items-center gap-6">
            <div className="w-20 h-20 rounded-full overflow-hidden flex-shrink-0 bg-[#262a33] border-2 border-[#00e5ff]/30 shadow-md">
              <img
                alt="Marcus Vaughn"
                className="w-full h-full object-cover"
                src={testimonialImg}
              />
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center text-[#ffc769] gap-1">
                {[...Array(5)].map((_, i) => (
                  <span
                    key={i}
                    className="material-symbols-outlined text-base"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    star
                  </span>
                ))}
              </div>
              <p className="text-base sm:text-lg text-[#dfe2ee] italic leading-relaxed">
                "Before NeuroDrive, our drivers were reliant on coffee and brute will during the 03:00
                to 05:00 shifts. The predictive eye-aspect metrics alert our haulers an average of 45
                seconds before they even realize their lids are dipping. It has saved lives on our routes."
              </p>
              <div className="flex items-center gap-2 font-mono-tabular text-xs">
                <span className="text-[#00e5ff] font-bold">MARCUS VAUGHN</span>
                <span className="text-[#3b494c]">/</span>
                <span className="text-[#bac9cc]">VP OF SAFETY & OPERATIONS, APEX FREIGHT SYSTEMS</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final Call to Action Footer Card */}
      <section className="w-full py-16 bg-[#0a0e16] border-t border-[#262a33]/60 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="rounded-xl bg-gradient-to-br from-[#262a33] via-[#181c24] to-[#0a0e16] p-8 lg:p-12 border border-[#3b494c]/60 shadow-2xl relative overflow-hidden">
            <div className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full bg-[#00e5ff]/10 blur-3xl pointer-events-none" />
            <div className="max-w-3xl flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#00e5ff] animate-ping"></span>
                <span className="font-mono-tabular text-xs text-[#00e5ff] tracking-widest uppercase font-semibold">
                  INSTANT ACTIVATION VIA WEBCAM
                </span>
              </div>
              <h2 className="text-3xl font-bold text-[#dfe2ee] tracking-tight">
                Equip Your Cockpit With Neural Protection
              </h2>
              <p className="text-base text-[#bac9cc] leading-relaxed">
                Test the live computer vision model directly in your browser with zero driver
                installation, or request an edge container build for your fleet telematics hardware.
              </p>
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={() => {
                    soundManager.playBeep(1200);
                    onNavigate('live-dashboard');
                  }}
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded bg-[#00e5ff] text-[#001f24] font-bold text-sm transition-all shadow-[0_0_20px_rgba(0,229,255,0.4)] hover:shadow-[0_0_32px_rgba(0,229,255,0.6)] hover:scale-105 cursor-pointer"
                >
                  <span>Launch Live Pilot</span>
                  <span className="material-symbols-outlined text-lg">arrow_forward</span>
                </button>
                <button
                  onClick={() => {
                    soundManager.playBeep(900);
                    onNavigate('system-settings');
                  }}
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded bg-[#1c2028] hover:bg-[#262a33] text-[#dfe2ee] font-semibold text-sm transition-colors border border-[#3b494c]/60 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base">tune</span>
                  <span>Hardware & Calibration</span>
                </button>
              </div>
              <div className="pt-3 flex flex-wrap gap-3 text-[#bac9cc] font-mono-tabular text-xs">
                <span>COMPATIBLE WITH: WEBCAM 1080P</span>
                <span>•</span>
                <span>LINUX / ANDROID AUTOMOTIVE / JETSON</span>
                <span>•</span>
                <span>END-TO-END ON-PREM COMPLIANT</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full bg-[#0a0e16] py-8 border-t border-[#262a33]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-[#bac9cc] font-mono-tabular text-xs">
          <div className="flex items-center gap-3">
            <img alt="NeuroDrive Logo" className="h-6 w-auto object-contain" src={logoUrl} />
            <span className="text-[#dfe2ee] font-semibold">NeuroDrive Core</span>
            <span>© 2025 Automotive Telematics Edge Systems</span>
          </div>
          <div>
            <span className="text-[#7dffa2] flex items-center gap-1.5 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#7dffa2] animate-pulse"></span>
              STATUS: ALL OPERATIONAL SYSTEMS NOMINAL
            </span>
          </div>
        </div>
      </footer>

      {/* Release Notes Modal */}
      {showNotesModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#181c24] border border-[#3b494c] rounded-xl max-w-lg w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setShowNotesModal(false)}
              className="absolute top-4 right-4 text-[#849396] hover:text-white"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
            <div className="flex items-center gap-2 mb-3">
              <span className="px-2 py-0.5 rounded bg-[#00e5ff]/20 text-[#00e5ff] text-xs font-mono-tabular font-bold">
                RELEASE v3.2
              </span>
              <span className="text-xs text-[#bac9cc] font-mono-tabular">STABLE BUILD 4920</span>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Edge-Tensor-v3 Neural Architecture</h3>
            <div className="space-y-3 text-sm text-[#bac9cc] mb-6">
              <p>
                • <strong>Sub-15ms EAR Processing:</strong> Upgraded TensorFlow-Lite pipeline with 468
                facial mesh points now runs at 60 FPS on embedded automotive chips.
              </p>
              <p>
                • <strong>Dual-Tier Warning Escalation:</strong> Automated transition from gentle amber
                cognitive vibration cues to 88 dB dual-tone siren emergency alarms.
              </p>
              <p>
                • <strong>Zero Data Egress:</strong> Fully compliant with EU General Safety Regulations
                (GSR). Facial visuals stay on-device; only anonymized telemetry counters sync.
              </p>
            </div>
            <button
              onClick={() => setShowNotesModal(false)}
              className="w-full py-2.5 bg-[#00e5ff] text-[#001f24] font-bold rounded-lg hover:bg-[#9cf0ff] transition-colors"
            >
              Acknowledge & Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
