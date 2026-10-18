import React, { useState, useEffect } from 'react';
import { CalibrationConfig } from '../types/telemetry';
import { soundManager } from '../utils/soundEffects';

export const SystemSettingsPage: React.FC = () => {
  const [config, setConfig] = useState<CalibrationConfig>({
    earThreshold: 0.22,
    durationLimit: 1.8,
    yawnLimit: 3,
    droopAngle: 15,
    cameraStream: 'brio',
    nightIrMode: 'AUTO',
    inferenceFps: 30,
    alarmTone: 'dual_tone',
    masterVolumeDb: 88,
    dispatchSyncEnabled: true,
    sosContactName: 'Apex Dispatch Center - Shift A',
    sosEmergencyLine: '+1 (512) 804-9912',
  });

  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [waveformBars, setWaveformBars] = useState([12, 24, 16, 32, 20, 8]);
  const [toastMessage, setToastMessage] = useState<{ title: string; desc: string } | null>(null);

  const marcusPortraitImg =
    'https://lh3.googleusercontent.com/aida-public/AB6AXuB1pSbDbRUY31DQ9ncfK8grXAXI8Tw6HJrx7Slt28d_6UgrZ16OudkKcM-rc_WU7aGvGMzFeCR5ZoWYTNsvQ-lnRrTtrUDbq8TxoUXKqXPL2vYM_PydyFcWeNB3JiG5ttwusocY1RbxBi366rFvIuvr8V2f4ryp7q28M_4Px2aA42qjAf4KhazOlowJrsbHeMw6dVSFBE87UTImBwMXp9qw9RzXmqEk3kqIoJo3AgEgtY9epdLgR4E1lQ';

  // Waveform animation during audio testing
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlayingAudio) {
      interval = setInterval(() => {
        setWaveformBars([
          Math.floor(Math.random() * 24) + 6,
          Math.floor(Math.random() * 26) + 6,
          Math.floor(Math.random() * 22) + 6,
          Math.floor(Math.random() * 30) + 6,
          Math.floor(Math.random() * 25) + 6,
          Math.floor(Math.random() * 18) + 6,
        ]);
      }, 120);
    } else {
      setWaveformBars([12, 24, 16, 32, 20, 8]);
    }
    return () => clearInterval(interval);
  }, [isPlayingAudio]);

  const toggleTestAudio = () => {
    if (isPlayingAudio) {
      setIsPlayingAudio(false);
    } else {
      setIsPlayingAudio(true);
      if (config.alarmTone === 'dual_tone') {
        soundManager.playSiren(3500);
      } else if (config.alarmTone === 'pulse_chime') {
        soundManager.playChime();
      } else {
        soundManager.playBeep(450, 0.4);
      }
      setTimeout(() => {
        setIsPlayingAudio(false);
      }, 3500);
    }
  };

  const handleSaveConfig = () => {
    soundManager.playBeep(1200, 0.15);
    setToastMessage({
      title: 'Configuration Stored',
      desc: 'Calibration committed to Coral Edge NVRAM successfully.',
    });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleResetDefaults = () => {
    soundManager.playBeep(900, 0.1);
    setConfig({
      earThreshold: 0.22,
      durationLimit: 1.8,
      yawnLimit: 3,
      droopAngle: 15,
      cameraStream: 'brio',
      nightIrMode: 'AUTO',
      inferenceFps: 30,
      alarmTone: 'dual_tone',
      masterVolumeDb: 88,
      dispatchSyncEnabled: true,
      sosContactName: 'Apex Dispatch Center - Shift A',
      sosEmergencyLine: '+1 (512) 804-9912',
    });
    setToastMessage({
      title: 'Defaults Restored',
      desc: 'Reset all parameters to FMCSA baseline regulations.',
    });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleTestSms = () => {
    soundManager.playBeep(1000, 0.1);
    setToastMessage({
      title: 'Test SOS Sent',
      desc: `Simulation ping dispatched to ${config.sosEmergencyLine} via SMS carrier gateway.`,
    });
    setTimeout(() => setToastMessage(null), 4000);
  };

  return (
    <div className="w-full pt-16 min-h-screen bg-[#0f131c] text-[#dfe2ee] px-4 sm:px-6 pb-16">
      {/* Status & Header Meta Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-3 mb-4 mt-2">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 font-mono-tabular text-xs text-[#849396] uppercase tracking-wider">
            <span>Calibration Suite</span>
            <span>/</span>
            <span className="text-[#00e5ff]">Tuning Station #04</span>
            <span>/</span>
            <span className="text-[#7dffa2] font-bold">Hardware Synchronized</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#dfe2ee] tracking-tight">
            System Settings & Calibration
          </h2>
        </div>

        {/* Quick Actions / Diagnostic Status */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-2 px-3.5 py-1.5 bg-[#181c24] rounded-xl border border-[#262a33] shadow-inner font-mono-tabular text-xs">
            <span className="h-2 w-2 rounded-full bg-[#7dffa2] animate-pulse"></span>
            <span className="text-[#dfe2ee]">TPU INFERENCE: 11.4ms</span>
          </div>

          <button
            onClick={handleResetDefaults}
            className="px-3.5 py-2 bg-[#262a33] hover:bg-[#353942] text-[#dfe2ee] font-semibold text-xs rounded-lg transition-all flex items-center gap-1.5 border border-[#3b494c]/60 cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-base text-[#849396]">history</span>
            <span>Reset to FMCSA Defaults</span>
          </button>

          <button
            onClick={handleSaveConfig}
            className="px-4 py-2 bg-[#00e5ff] hover:bg-[#9cf0ff] text-[#001f24] font-bold text-xs rounded-lg transition-all shadow-[0_0_20px_rgba(0,229,255,0.45)] flex items-center gap-1.5 cursor-pointer active:scale-95"
            type="button"
          >
            <span className="material-symbols-outlined text-base font-bold">save</span>
            <span>Save Configuration</span>
          </button>
        </div>
      </div>

      {/* Bento Grid System */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Left 7 Cols: Driver / Telematics Link + AI Sensitivity Core */}
        <div className="xl:col-span-7 flex flex-col gap-6">
          {/* Module 1: Driver Profile & Vehicle Pairing Bento */}
          <div className="bg-[#1c2028] border border-[#262a33] rounded-xl p-5 shadow-md relative overflow-hidden">
            <div className="absolute -right-8 -top-8 w-44 h-44 bg-[#00e5ff]/5 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#262a33]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#00e5ff] text-xl">badge</span>
                <span className="font-mono-tabular text-xs text-[#00e5ff] uppercase tracking-widest font-bold">
                  01 // ASSIGNED TELEMATICS NODE
                </span>
              </div>
              <span className="font-mono-tabular text-[11px] px-2 py-0.5 rounded bg-[#05e777]/20 text-[#7dffa2] font-bold">
                PAIRING ACTIVE
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              {/* Driver Photo & Meta */}
              <div className="md:col-span-7 flex items-center gap-3.5 bg-[#181c24] p-3 rounded-lg border border-[#262a33]">
                <img
                  alt="Marcus Vance Profile"
                  className="w-16 h-16 rounded-lg object-cover shadow-sm border border-[#3b494c]/40"
                  src={marcusPortraitImg}
                />
                <div className="flex flex-col min-w-0">
                  <span className="text-base font-bold text-[#dfe2ee] truncate">Marcus Vance</span>
                  <span className="font-mono-tabular text-xs text-[#00daf3]">CDL-A #49102-TX</span>
                  <span className="text-xs text-[#bac9cc] truncate mt-0.5">
                    Carrier: <strong className="text-[#dfe2ee] font-medium">Apex Logistics Fleet Inc.</strong>
                  </span>
                </div>
              </div>

              {/* Paired Hardware Box */}
              <div className="md:col-span-5 flex flex-col justify-between bg-[#181c24] p-3 rounded-lg border border-[#262a33]">
                <div className="flex flex-col gap-1">
                  <span className="font-mono-tabular text-[10px] text-[#849396] uppercase tracking-wider font-semibold">
                    Edge Acceleration
                  </span>
                  <span className="text-sm font-semibold text-[#dfe2ee] flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[#7dffa2] text-sm">memory_alt</span>
                    Google Coral TPU v2
                  </span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-[#262a33]/60 font-mono-tabular text-[11px]">
                  <span className="text-[#bac9cc]">BUS ID: PCI-E 00:1f.3</span>
                  <span className="text-[#7dffa2] font-bold">4.0 TOPS</span>
                </div>
              </div>
            </div>

            {/* Hardware Peripheral Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 mt-4">
              <div className="flex items-center justify-between p-2.5 bg-[#0a0e16]/60 rounded-lg border border-[#262a33]">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#849396] text-base">videocam</span>
                  <span className="text-xs text-[#dfe2ee]">Logitech Brio 4K</span>
                </div>
                <span className="h-2 w-2 rounded-full bg-[#7dffa2]"></span>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-[#0a0e16]/60 rounded-lg border border-[#262a33]">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#849396] text-base">
                    wb_iridescent
                  </span>
                  <span className="text-xs text-[#dfe2ee]">Cabin IR Array (940nm)</span>
                </div>
                <span className="h-2 w-2 rounded-full bg-[#7dffa2]"></span>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-[#0a0e16]/60 rounded-lg border border-[#262a33]">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#849396] text-base">speed</span>
                  <span className="text-xs text-[#dfe2ee]">OBD-II CANbus Link</span>
                </div>
                <span className="h-2 w-2 rounded-full bg-[#7dffa2]"></span>
              </div>
            </div>
          </div>

          {/* Module 2: Sensitivity & AI Detection Calibration */}
          <div className="bg-[#1c2028] border border-[#262a33] rounded-xl p-5 shadow-md flex flex-col gap-5">
            <div className="flex items-center justify-between border-b border-[#262a33] pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#00e5ff] text-xl">tune</span>
                <span className="font-mono-tabular text-xs text-[#00e5ff] uppercase tracking-widest font-bold">
                  02 // COGNITIVE THRESHOLD MATRIX
                </span>
              </div>
              <span className="font-mono-tabular text-xs text-[#849396]">LATENCY BUDGET: &lt;15ms</span>
            </div>

            {/* Metric 1: Eye Aspect Ratio (EAR) */}
            <div className="flex flex-col gap-2.5 p-3.5 bg-[#181c24] rounded-lg border border-[#262a33]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <label className="text-sm font-bold text-[#dfe2ee]" htmlFor="earSlider">
                    Eye Aspect Ratio (EAR) Threshold
                  </label>
                  <span
                    className="material-symbols-outlined text-[#849396] text-sm cursor-help"
                    title="Eye contour geometric ratio for closed eyelid classification"
                  >
                    info
                  </span>
                </div>
                <div className="flex items-center gap-2 font-mono-tabular text-base text-[#00e5ff] bg-[#0a0e16] px-2.5 py-0.5 rounded border border-[#262a33]">
                  <span>{config.earThreshold.toFixed(2)}</span>
                  <span className="font-mono-tabular text-xs text-[#849396]">EAR</span>
                </div>
              </div>

              {/* Slider */}
              <div className="flex flex-col gap-1 pt-1">
                <input
                  id="earSlider"
                  type="range"
                  min="0.15"
                  max="0.30"
                  step="0.01"
                  value={config.earThreshold}
                  onChange={(e) =>
                    setConfig({ ...config, earThreshold: parseFloat(e.target.value) })
                  }
                  className="w-full h-1.5 bg-[#31353e] rounded-lg appearance-none cursor-pointer accent-[#00e5ff]"
                />
                <div className="flex justify-between font-mono-tabular text-[10px] text-[#849396]">
                  <span>0.15 (High Sensitivity)</span>
                  <span className="text-[#7dffa2]">FMCSA Standard: 0.22</span>
                  <span>0.30 (Permissive)</span>
                </div>
              </div>

              {/* Dynamic Landmark Contour Visualizer */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="flex items-center gap-3 bg-[#1c2028] p-2.5 rounded border border-[#262a33]">
                  <svg className="w-14 h-9 text-[#7dffa2] flex-shrink-0" fill="none" viewBox="0 0 56 36">
                    <path
                      d="M4 18C12 7 24 7 28 7C32 7 44 7 52 18C44 29 32 29 28 29C24 29 12 29 4 18Z"
                      stroke="currentColor"
                      strokeDasharray="2 1"
                      strokeWidth="1.5"
                    />
                    <circle cx="28" cy="18" r="7" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.2" />
                    <circle cx="28" cy="18" r="2.5" fill="currentColor" />
                    <line x1="28" y1="7" x2="28" y2="29" stroke="currentColor" strokeDasharray="1 1" strokeWidth="1" />
                  </svg>
                  <div className="flex flex-col min-w-0 font-mono-tabular">
                    <span className="text-xs text-[#7dffa2] font-bold">STATE: AWAKE (0.34)</span>
                    <span className="text-[11px] text-[#849396] truncate">Pupil tracking locked</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-[#1c2028] p-2.5 rounded border border-[#262a33]">
                  <svg className="w-14 h-9 text-[#ffb4ab] flex-shrink-0" fill="none" viewBox="0 0 56 36">
                    <path
                      d="M4 18C14 14 24 14 28 14C32 14 42 14 52 18C42 22 32 22 28 22C24 22 14 22 4 18Z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                    <line x1="18" y1="18" x2="38" y2="18" stroke="currentColor" strokeWidth="2" />
                    <line x1="28" y1="14" x2="28" y2="22" stroke="currentColor" strokeDasharray="1 1" strokeWidth="1.5" />
                  </svg>
                  <div className="flex flex-col min-w-0 font-mono-tabular">
                    <span className="text-xs text-[#ffb4ab] font-bold">
                      TRIGGER LEVEL (&lt; {config.earThreshold.toFixed(2)})
                    </span>
                    <span className="text-[11px] text-[#849396] truncate">Microsleep window flag</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Metric 2: Eyes-Closed Duration Limit */}
            <div className="flex flex-col gap-2.5 p-3.5 bg-[#181c24] rounded-lg border border-[#262a33]">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-bold text-[#dfe2ee]" htmlFor="durationSlider">
                    Eyes-Closed Duration Limit
                  </label>
                  <p className="text-xs text-[#849396]">
                    Continuous eyelid occlusion required before audible escalation trigger.
                  </p>
                </div>
                <div className="flex items-center gap-2 font-mono-tabular text-base text-[#00e5ff] bg-[#0a0e16] px-2.5 py-0.5 rounded border border-[#262a33]">
                  <span>{config.durationLimit.toFixed(1)}</span>
                  <span className="font-mono-tabular text-xs text-[#849396]">SEC</span>
                </div>
              </div>

              <div className="pt-1">
                <input
                  id="durationSlider"
                  type="range"
                  min="1.0"
                  max="3.5"
                  step="0.1"
                  value={config.durationLimit}
                  onChange={(e) =>
                    setConfig({ ...config, durationLimit: parseFloat(e.target.value) })
                  }
                  className="w-full h-1.5 bg-[#31353e] rounded-lg appearance-none cursor-pointer accent-[#00e5ff]"
                />
                <div className="flex justify-between font-mono-tabular text-[10px] text-[#849396] mt-1">
                  <span>1.0s (Aggressive)</span>
                  <span className="text-[#00e5ff] font-semibold">
                    {config.durationLimit.toFixed(1)}s (Current Preset)
                  </span>
                  <span>3.5s (Delayed)</span>
                </div>
              </div>
            </div>

            {/* Metric 3 & 4: Yawn Limit & Droop Angle */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Yawn Limit */}
              <div className="flex flex-col justify-between p-3.5 bg-[#181c24] rounded-lg border border-[#262a33] gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#ffc769] text-base">
                      sentiment_very_dissatisfied
                    </span>
                    <span className="text-xs font-semibold text-[#dfe2ee]">Yawn Limit</span>
                  </div>
                  <span className="font-mono-tabular text-sm text-[#ffc769] font-bold">
                    {config.yawnLimit} / 5min
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="6"
                  step="1"
                  value={config.yawnLimit}
                  onChange={(e) => setConfig({ ...config, yawnLimit: parseInt(e.target.value) })}
                  className="w-full h-1.5 bg-[#31353e] rounded-lg appearance-none cursor-pointer accent-[#ffc769]"
                />
                <div className="flex justify-between font-mono-tabular text-[10px] text-[#849396]">
                  <span>1 yawn</span>
                  <span>Default: 3</span>
                  <span>6 yawns</span>
                </div>
              </div>

              {/* Head Droop Angle */}
              <div className="flex flex-col justify-between p-3.5 bg-[#181c24] rounded-lg border border-[#262a33] gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#ffb4ab] text-base">
                      screen_rotation_alt
                    </span>
                    <span className="text-xs font-semibold text-[#dfe2ee]">Droop Angle</span>
                  </div>
                  <span className="font-mono-tabular text-sm text-[#ffb4ab] font-bold">
                    {config.droopAngle}° Pitch
                  </span>
                </div>
                <input
                  type="range"
                  min="8"
                  max="30"
                  step="1"
                  value={config.droopAngle}
                  onChange={(e) => setConfig({ ...config, droopAngle: parseInt(e.target.value) })}
                  className="w-full h-1.5 bg-[#31353e] rounded-lg appearance-none cursor-pointer accent-[#ff1744]"
                />
                <div className="flex justify-between font-mono-tabular text-[10px] text-[#849396]">
                  <span>8° (Slight nod)</span>
                  <span>Default: 15°</span>
                  <span>30° (Severe)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right 5 Cols: Hardware Ingest, Escalation Acoustics, Emergency Dispatch */}
        <div className="xl:col-span-5 flex flex-col gap-6">
          {/* Module 3: Camera & Sensor Hardware Setup */}
          <div className="bg-[#1c2028] border border-[#262a33] rounded-xl p-5 shadow-md flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-[#262a33] pb-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#00e5ff] text-xl">camera</span>
                <span className="font-mono-tabular text-xs text-[#00e5ff] uppercase tracking-widest font-bold">
                  03 // OPTICAL SENSORS
                </span>
              </div>
              <span className="h-2 w-2 rounded-full bg-[#7dffa2]"></span>
            </div>

            {/* Camera Select */}
            <div className="flex flex-col gap-1.5">
              <label className="font-mono-tabular text-xs text-[#849396] uppercase" htmlFor="cameraSelect">
                Primary Video Stream
              </label>
              <div className="relative">
                <select
                  id="cameraSelect"
                  value={config.cameraStream}
                  onChange={(e) => setConfig({ ...config, cameraStream: e.target.value })}
                  className="w-full bg-[#0a0e16] text-[#dfe2ee] px-3.5 py-2.5 rounded-lg appearance-none text-xs border border-[#262a33] focus:outline-none focus:border-[#00e5ff] pr-10 cursor-pointer"
                >
                  <option value="brio">Logitech Brio 4K In-Cabin DMS (Default USB 3.0)</option>
                  <option value="internal">Internal HD Webcam (Integrated 720p)</option>
                  <option value="aux_ir">Sony STARVIS 2 NightIR Auxiliary [CAM-02]</option>
                </select>
                <span className="material-symbols-outlined absolute right-3 top-2.5 text-[#849396] pointer-events-none text-base">
                  expand_more
                </span>
              </div>
            </div>

            {/* Night IR & FPS toggles */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              {/* IR Mode */}
              <div className="flex flex-col justify-between p-3 bg-[#181c24] rounded-lg border border-[#262a33] gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#dfe2ee]">Night IR Sensor</span>
                  <span className="material-symbols-outlined text-[#849396] text-base">
                    nightlight
                  </span>
                </div>
                <div className="flex items-center justify-between bg-[#0a0e16] p-1 rounded border border-[#262a33]">
                  <button
                    type="button"
                    onClick={() => setConfig({ ...config, nightIrMode: 'AUTO' })}
                    className={`px-2 py-1 font-mono-tabular text-xs rounded transition-all w-1/2 text-center cursor-pointer ${
                      config.nightIrMode === 'AUTO'
                        ? 'bg-[#262a33] text-[#00e5ff] font-bold'
                        : 'text-[#849396] hover:text-white'
                    }`}
                  >
                    AUTO
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfig({ ...config, nightIrMode: 'ALWAYS' })}
                    className={`px-2 py-1 font-mono-tabular text-xs rounded transition-all w-1/2 text-center cursor-pointer ${
                      config.nightIrMode === 'ALWAYS'
                        ? 'bg-[#262a33] text-[#00e5ff] font-bold'
                        : 'text-[#849396] hover:text-white'
                    }`}
                  >
                    ALWAYS
                  </button>
                </div>
              </div>

              {/* Inference Rate */}
              <div className="flex flex-col justify-between p-3 bg-[#181c24] rounded-lg border border-[#262a33] gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#dfe2ee]">Inference FPS</span>
                  <span className="material-symbols-outlined text-[#849396] text-base">
                    developer_board
                  </span>
                </div>
                <div className="flex items-center justify-between bg-[#0a0e16] p-1 rounded border border-[#262a33]">
                  <button
                    type="button"
                    onClick={() => setConfig({ ...config, inferenceFps: 30 })}
                    className={`px-2 py-1 font-mono-tabular text-xs rounded transition-all w-1/2 text-center cursor-pointer ${
                      config.inferenceFps === 30
                        ? 'bg-[#262a33] text-[#00e5ff] font-bold'
                        : 'text-[#849396] hover:text-white'
                    }`}
                  >
                    30 FPS
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfig({ ...config, inferenceFps: 60 })}
                    className={`px-2 py-1 font-mono-tabular text-xs rounded transition-all w-1/2 text-center cursor-pointer ${
                      config.inferenceFps === 60
                        ? 'bg-[#262a33] text-[#00e5ff] font-bold'
                        : 'text-[#849396] hover:text-white'
                    }`}
                  >
                    60 FPS
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Module 4: Siren & Alert Audio Suite */}
          <div className="bg-[#1c2028] border border-[#262a33] rounded-xl p-5 shadow-md flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-[#262a33] pb-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#00e5ff] text-xl">volume_up</span>
                <span className="font-mono-tabular text-xs text-[#00e5ff] uppercase tracking-widest font-bold">
                  04 // ESCALATION ACOUSTICS
                </span>
              </div>
              <span className="font-mono-tabular text-xs text-[#849396]">SPEAKER ID #01</span>
            </div>

            {/* Radio Tones */}
            <div className="flex flex-col gap-2">
              <label
                onClick={() => setConfig({ ...config, alarmTone: 'dual_tone' })}
                className={`flex items-center justify-between p-3 rounded-lg border transition-colors cursor-pointer ${
                  config.alarmTone === 'dual_tone'
                    ? 'bg-[#262a33] border-[#00e5ff]/50'
                    : 'bg-[#181c24] border-[#262a33] hover:bg-[#262a33]/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <input
                    type="radio"
                    name="alarmTone"
                    checked={config.alarmTone === 'dual_tone'}
                    onChange={() => setConfig({ ...config, alarmTone: 'dual_tone' })}
                    className="accent-[#00e5ff] h-4 w-4"
                  />
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-[#dfe2ee]">Dual-Tone Tactical Siren</span>
                    <span className="text-[11px] text-[#849396]">
                      High-penetration alternating 88 dB acoustic alert
                    </span>
                  </div>
                </div>
                <span className="font-mono-tabular text-[10px] text-[#ffb4ab] bg-[#93000a]/30 px-2 py-0.5 rounded font-bold">
                  RECOMMENDED
                </span>
              </label>

              <label
                onClick={() => setConfig({ ...config, alarmTone: 'pulse_chime' })}
                className={`flex items-center justify-between p-3 rounded-lg border transition-colors cursor-pointer ${
                  config.alarmTone === 'pulse_chime'
                    ? 'bg-[#262a33] border-[#00e5ff]/50'
                    : 'bg-[#181c24] border-[#262a33] hover:bg-[#262a33]/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <input
                    type="radio"
                    name="alarmTone"
                    checked={config.alarmTone === 'pulse_chime'}
                    onChange={() => setConfig({ ...config, alarmTone: 'pulse_chime' })}
                    className="accent-[#00e5ff] h-4 w-4"
                  />
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-[#dfe2ee]">Pulse Beacon Chime</span>
                    <span className="text-[11px] text-[#849396]">
                      Ascending synchronic chime sequence
                    </span>
                  </div>
                </div>
                <span className="font-mono-tabular text-[10px] text-[#849396]">78 dB</span>
              </label>

              <label
                onClick={() => setConfig({ ...config, alarmTone: 'haptic_voice' })}
                className={`flex items-center justify-between p-3 rounded-lg border transition-colors cursor-pointer ${
                  config.alarmTone === 'haptic_voice'
                    ? 'bg-[#262a33] border-[#00e5ff]/50'
                    : 'bg-[#181c24] border-[#262a33] hover:bg-[#262a33]/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <input
                    type="radio"
                    name="alarmTone"
                    checked={config.alarmTone === 'haptic_voice'}
                    onChange={() => setConfig({ ...config, alarmTone: 'haptic_voice' })}
                    className="accent-[#00e5ff] h-4 w-4"
                  />
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-[#dfe2ee]">
                      Haptic Seat Vibration + Voice
                    </span>
                    <span className="text-[11px] text-[#849396]">
                      Sub-woofer lumbar pulse accompanied by synthetic voice
                    </span>
                  </div>
                </div>
                <span className="font-mono-tabular text-[10px] text-[#7dffa2] bg-[#05e777]/20 px-2 py-0.5 rounded font-bold">
                  HYBRID
                </span>
              </label>
            </div>

            {/* Interactive Audio Player & Volume */}
            <div className="p-3.5 bg-[#181c24] rounded-lg border border-[#262a33] flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={toggleTestAudio}
                    className="w-10 h-10 rounded-full bg-[#00e5ff] text-[#001f24] flex items-center justify-center hover:bg-[#9cf0ff] transition-all shadow-[0_0_12px_rgba(0,229,255,0.4)] cursor-pointer"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-xl">
                      {isPlayingAudio ? 'stop' : 'play_arrow'}
                    </span>
                  </button>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-[#dfe2ee]">Audio Sample Test</span>
                    <span
                      className={`font-mono-tabular text-[10px] font-bold ${
                        isPlayingAudio ? 'text-[#7dffa2] animate-pulse' : 'text-[#849396]'
                      }`}
                    >
                      {isPlayingAudio ? 'EMITTING AUDITORY PULSE...' : 'READY // CLICK TO EMIT'}
                    </span>
                  </div>
                </div>

                {/* Animated Waveform Simulation */}
                <div className="h-8 flex items-center gap-1">
                  {waveformBars.map((height, i) => (
                    <span
                      key={i}
                      className="w-1.5 bg-[#00e5ff] rounded-full transition-all duration-100"
                      style={{ height: `${height}px` }}
                    />
                  ))}
                </div>
              </div>

              {/* Master Volume */}
              <div className="flex flex-col gap-1 pt-1 border-t border-[#262a33]">
                <div className="flex justify-between items-center">
                  <span className="font-mono-tabular text-[10px] text-[#849396] uppercase">
                    Master Acoustic Limiter
                  </span>
                  <span className="font-mono-tabular text-sm font-bold text-[#dfe2ee]">
                    {config.masterVolumeDb} dB
                  </span>
                </div>
                <input
                  type="range"
                  min="60"
                  max="95"
                  step="1"
                  value={config.masterVolumeDb}
                  onChange={(e) =>
                    setConfig({ ...config, masterVolumeDb: parseInt(e.target.value) })
                  }
                  className="w-full h-1.5 bg-[#31353e] rounded-lg appearance-none cursor-pointer accent-[#00e5ff]"
                />
                <div className="flex justify-between font-mono-tabular text-[10px] text-[#849396]">
                  <span>60 dB (Soft)</span>
                  <span className="text-[#ffb4ab] font-bold">Critical Max: 95 dB</span>
                </div>
              </div>
            </div>
          </div>

          {/* Module 5: SOS Escalation Protocol */}
          <div className="bg-[#1c2028] border border-[#262a33] rounded-xl p-5 shadow-md flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-[#262a33] pb-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#ff1744] text-xl">
                  emergency_share
                </span>
                <span className="font-mono-tabular text-xs text-[#ffb4ab] uppercase tracking-widest font-bold">
                  05 // SOS ESCALATION PROTOCOL
                </span>
              </div>
              <span className="px-2 py-0.5 rounded bg-[#93000a]/40 text-[#ffb4ab] font-mono-tabular text-[10px] font-bold">
                TIER 1 SAFETY
              </span>
            </div>

            {/* Automated Dispatch Toggle */}
            <div className="flex items-center justify-between p-3 bg-[#181c24] rounded-lg border border-[#262a33]">
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-bold text-[#dfe2ee]">
                  Automated Fleet Dispatch Sync
                </span>
                <span className="text-[11px] text-[#849396]">
                  Transmits GPS fix, telemetry log & cabin photo on unacknowledged alarm
                </span>
              </div>
              <button
                type="button"
                onClick={() =>
                  setConfig({ ...config, dispatchSyncEnabled: !config.dispatchSyncEnabled })
                }
                className={`w-12 h-6 rounded-full relative p-1 transition-colors focus:outline-none cursor-pointer ${
                  config.dispatchSyncEnabled ? 'bg-[#7dffa2]' : 'bg-[#31353e]'
                }`}
              >
                <span
                  className={`block w-4 h-4 rounded-full shadow transition-transform ${
                    config.dispatchSyncEnabled
                      ? 'translate-x-6 bg-[#001f24]'
                      : 'translate-x-0 bg-[#849396]'
                  }`}
                />
              </button>
            </div>

            {/* Contact Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="font-mono-tabular text-[10px] text-[#849396] uppercase font-semibold">
                  Contact Name
                </label>
                <input
                  type="text"
                  value={config.sosContactName}
                  onChange={(e) => setConfig({ ...config, sosContactName: e.target.value })}
                  className="w-full bg-[#0a0e16] text-[#dfe2ee] px-3 py-2 rounded-lg text-xs border border-[#262a33] focus:outline-none focus:border-[#00e5ff]"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-mono-tabular text-[10px] text-[#849396] uppercase font-semibold">
                  Emergency Line
                </label>
                <input
                  type="tel"
                  value={config.sosEmergencyLine}
                  onChange={(e) => setConfig({ ...config, sosEmergencyLine: e.target.value })}
                  className="w-full bg-[#0a0e16] text-[#dfe2ee] px-3 py-2 rounded-lg font-mono-tabular text-xs border border-[#262a33] focus:outline-none focus:border-[#00e5ff]"
                />
              </div>
            </div>

            {/* Test SOS Button */}
            <div className="flex items-center justify-between pt-1 border-t border-[#262a33]">
              <span className="font-mono-tabular text-[10px] text-[#849396]">
                CARRIER API: TWILIO FLEET RELAY
              </span>
              <button
                type="button"
                onClick={handleTestSms}
                className="px-3 py-1.5 bg-[#262a33] hover:bg-[#353942] text-[#dfe2ee] font-mono-tabular text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 border border-[#3b494c]/60 cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm text-[#7dffa2]">send</span>
                <span>SEND TEST SOS SMS</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Stored Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#181c24] border border-[#00e5ff] text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-bounce">
          <span className="material-symbols-outlined text-[#7dffa2] text-2xl">check_circle</span>
          <div className="flex flex-col">
            <span className="font-bold text-sm text-[#dfe2ee]">{toastMessage.title}</span>
            <span className="font-mono-tabular text-xs text-[#bac9cc]">{toastMessage.desc}</span>
          </div>
        </div>
      )}
    </div>
  );
};
