import React, { useState, useEffect } from 'react';
import { ScreenType } from '../types/telemetry';
import { soundManager } from '../utils/soundEffects';

interface NavigationProps {
  currentScreen: ScreenType;
  onNavigate: (screen: ScreenType) => void;
  alarmEnabled: boolean;
  onToggleAlarm: () => void;
  onTestAlert: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentScreen,
  onNavigate,
  alarmEnabled,
  onToggleAlarm,
  onTestAlert,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [time, setTime] = useState<{ utc: string; loc: string }>({
    utc: '14:28:09',
    loc: '09:28:09',
  });

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const utc = now.toTimeString().split(' ')[0];
      const loc = now.toLocaleTimeString('en-US', { hour12: false });
      setTime({ utc, loc });
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const logoUrl =
    'https://lh3.googleusercontent.com/aida/AEtjO1WSr2GpDwe4UxrPaPSD4KSEBJk4MFRhxVHw97CKTPfCygezbCS8AbeBnYyUXKBjF11w7O__Cny4GKi8wfCTflUkLSLVRa_dAf1fWyzrkso6SKFc7g1w_iOhzmD5faNAHMdY8jO_rrNfJQkdvmbq6ux64sSzRjy3VCgb-hO64mE0A67BAwd_Yfj5Tb3B4ZNgl_QxTOEWgi4TeUKncn-fAdBDrvyod6ruxnmFBuzWpQ9tDNLzRWGLhJoV5oWj';
  const profileUrl =
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCawr0Ty66jQO49zl9OxPaW25yG7aWWb3AYKLfMb57Sp4duplX_oHOYxPHSGW16HtfQLPRuZK34mnz_GdcBbmWZQlJvz9gYBTDlOae1pKUK27xMfNasW6aVQ2TGPw90fUnZR52KTTr3Q5TdT9IVGXXbn9lJSw9MzOFEPShPY-ia50fbXW_bYy0uhpMXoI69la1CYSs6TyRY_Q-sOD6qE3Hif5DdNZlHSAwo8SWQzHT3ZcCDKDylSvxEgA';

  // Landing Page Top Navigation
  if (currentScreen === 'overview') {
    return (
      <header className="fixed top-0 w-full z-50 bg-[#0a0e16]/80 backdrop-blur-xl border-b border-[#262a33]/60 shadow-[0_1px_8px_rgba(0,0,0,0.3)]">
        <div className="h-16 w-full max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          {/* Brand */}
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => onNavigate('overview')}
          >
            <img alt="NeuroDrive Logo" className="h-8 w-auto object-contain" src={logoUrl} />
            <span className="font-semibold text-lg text-[#c3f5ff] tracking-wide">NeuroDrive</span>
            <span className="font-mono-tabular text-[11px] text-[#bac9cc] uppercase tracking-wider hidden sm:inline px-2 py-0.5 rounded bg-[#181c24] border border-[#3b494c]/40">
              AI TELEMETRY
            </span>
          </div>

          {/* Links */}
          <nav className="hidden md:flex items-center gap-6">
            <button
              onClick={() => onNavigate('overview')}
              className="text-[#c3f5ff] font-bold text-sm transition-colors cursor-pointer"
            >
              Platform
            </button>
            <button
              onClick={() => onNavigate('live-dashboard')}
              className="text-[#bac9cc] hover:text-white text-sm transition-colors cursor-pointer"
            >
              Cockpit HUD
            </button>
            <button
              onClick={() => onNavigate('fleet-manager')}
              className="text-[#bac9cc] hover:text-white text-sm transition-colors cursor-pointer"
            >
              Fleet Safety
            </button>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                soundManager.playBeep(1200);
                onNavigate('live-dashboard');
              }}
              className="px-4 py-1.5 rounded bg-[#00e5ff] text-[#001f24] font-semibold text-sm hover:shadow-[0_0_16px_rgba(0,229,255,0.5)] transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
            >
              <span>Launch HUD</span>
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </button>
            <img
              alt="Profile"
              className="w-8 h-8 rounded-full object-cover ring-1 ring-[#00e5ff]/40"
              src={profileUrl}
            />
          </div>
        </div>
      </header>
    );
  }

  // Dashboard Nav: Left Sidebar + Top Command Bar
  return (
    <>
      {/* Mobile Header Bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-[#0a0e16]/95 backdrop-blur-xl z-50 px-4 flex items-center justify-between border-b border-[#262a33]">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-[#dfe2ee] hover:text-[#00e5ff] transition-colors"
          >
            <span className="material-symbols-outlined">{mobileMenuOpen ? 'close' : 'menu'}</span>
          </button>
          <img alt="NeuroDrive Logo" className="h-7 w-auto object-contain" src={logoUrl} />
          <span className="font-semibold text-base text-[#c3f5ff]">NeuroDrive</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onTestAlert}
            className="px-2.5 py-1 rounded bg-[#93000a] text-[#ffdad6] text-xs font-semibold flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-sm">notification_important</span>
            <span>Alert</span>
          </button>
          <img
            alt="Profile"
            className="w-7 h-7 rounded-full object-cover ring-1 ring-[#00e5ff]/40"
            src={profileUrl}
          />
        </div>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed left-0 top-0 h-full w-72 bg-[#0a0e16]/95 backdrop-blur-xl z-50 flex flex-col justify-between border-r border-[#262a33]/60 shadow-[0_1px_8px_rgba(0,0,0,0.4)] transition-transform duration-300 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col">
          {/* Logo Header */}
          <div
            className="h-16 px-4 flex items-center gap-3 bg-[#181c24]/50 border-b border-[#262a33]/40 cursor-pointer"
            onClick={() => {
              onNavigate('overview');
              setMobileMenuOpen(false);
            }}
          >
            <img alt="NeuroDrive Logo" className="h-8 w-auto object-contain" src={logoUrl} />
            <div className="flex flex-col min-w-0">
              <span className="font-semibold text-base text-[#c3f5ff] tracking-wide truncate">
                NeuroDrive
              </span>
              <span className="font-mono-tabular text-[10px] text-[#bac9cc] uppercase tracking-wider truncate">
                AI VISION TELEMETRY
              </span>
            </div>
          </div>

          {/* Section Heading */}
          <div className="px-5 py-3">
            <div className="font-mono-tabular text-[11px] uppercase text-[#849396] tracking-widest">
              Tactical HUD Units
            </div>
          </div>

          {/* Nav Links */}
          <nav className="flex flex-col gap-1.5 px-3">
            {/* Live Dashboard */}
            <button
              onClick={() => {
                onNavigate('live-dashboard');
                setMobileMenuOpen(false);
              }}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg transition-all group text-left cursor-pointer ${
                currentScreen === 'live-dashboard'
                  ? 'bg-[#262a33] text-[#c3f5ff] font-bold shadow-[0_0_15px_-3px_rgba(0,229,255,0.2)]'
                  : 'text-[#bac9cc] hover:bg-[#262a33]/70 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[20px] group-hover:text-[#00e5ff] transition-colors">
                  visibility
                </span>
                <span className="text-sm font-medium">Live Dashboard</span>
              </div>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#7dffa2] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#7dffa2]"></span>
              </span>
            </button>

            {/* Session Analytics */}
            <button
              onClick={() => {
                onNavigate('session-history-and-analytics');
                setMobileMenuOpen(false);
              }}
              className={`flex items-center px-3.5 py-2.5 rounded-lg transition-all group text-left cursor-pointer ${
                currentScreen === 'session-history-and-analytics'
                  ? 'bg-[#262a33] text-[#c3f5ff] font-bold shadow-[0_0_15px_-3px_rgba(0,229,255,0.2)]'
                  : 'text-[#bac9cc] hover:bg-[#262a33]/70 hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[20px] mr-3 group-hover:text-[#00e5ff] transition-colors">
                monitoring
              </span>
              <span className="text-sm font-medium">Session Analytics</span>
            </button>

            {/* Fleet Manager */}
            <button
              onClick={() => {
                onNavigate('fleet-manager');
                setMobileMenuOpen(false);
              }}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg transition-all group text-left cursor-pointer ${
                currentScreen === 'fleet-manager'
                  ? 'bg-[#262a33] text-[#c3f5ff] font-bold shadow-[0_0_15px_-3px_rgba(0,229,255,0.2)]'
                  : 'text-[#bac9cc] hover:bg-[#262a33]/70 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[20px] group-hover:text-[#00e5ff] transition-colors">
                  local_shipping
                </span>
                <span className="text-sm font-medium">Fleet Manager</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-[#93000a] text-[#ffdad6] font-mono-tabular text-[11px] font-bold">
                3
              </span>
            </button>

            {/* Alert Overlay */}
            <button
              onClick={() => {
                onNavigate('alert-overlay-preview');
                setMobileMenuOpen(false);
              }}
              className={`flex items-center px-3.5 py-2.5 rounded-lg transition-all group text-left cursor-pointer ${
                currentScreen === 'alert-overlay-preview'
                  ? 'bg-[#262a33] text-[#c3f5ff] font-bold shadow-[0_0_15px_-3px_rgba(0,229,255,0.2)]'
                  : 'text-[#bac9cc] hover:bg-[#262a33]/70 hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[20px] mr-3 group-hover:text-[#00e5ff] transition-colors">
                crisis_alert
              </span>
              <span className="text-sm font-medium">Alert Overlay</span>
            </button>

            {/* System Settings */}
            <button
              onClick={() => {
                onNavigate('system-settings');
                setMobileMenuOpen(false);
              }}
              className={`flex items-center px-3.5 py-2.5 rounded-lg transition-all group text-left cursor-pointer ${
                currentScreen === 'system-settings'
                  ? 'bg-[#262a33] text-[#c3f5ff] font-bold shadow-[0_0_15px_-3px_rgba(0,229,255,0.2)]'
                  : 'text-[#bac9cc] hover:bg-[#262a33]/70 hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[20px] mr-3 group-hover:text-[#00e5ff] transition-colors">
                tune
              </span>
              <span className="text-sm font-medium">System Settings</span>
            </button>
          </nav>
        </div>

        {/* Bottom Sidebar Status & Link back to overview */}
        <div className="p-3 flex flex-col gap-2 bg-[#181c24]/40 border-t border-[#262a33]/50">
          <div className="px-3 py-1.5 rounded bg-[#31353e]/60 flex items-center justify-between">
            <span className="font-mono-tabular text-[11px] text-[#bac9cc]">LINK PROTOCOL</span>
            <span className="font-mono-tabular text-[11px] text-[#7dffa2] flex items-center gap-1.5 font-bold">
              <span className="h-1.5 w-1.5 rounded-full bg-[#7dffa2] inline-block animate-pulse"></span>
              STABLE
            </span>
          </div>
          <button
            onClick={() => {
              onNavigate('overview');
              setMobileMenuOpen(false);
            }}
            className="flex items-center justify-between px-3 py-2 rounded-lg text-[#bac9cc] hover:bg-[#262a33] hover:text-white transition-all group text-left cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-[18px] group-hover:text-[#00e5ff]">
                home
              </span>
              <span className="text-xs font-medium">Landing Overview</span>
            </div>
            <span className="material-symbols-outlined text-sm text-[#849396]">north_east</span>
          </button>
        </div>
      </aside>

      {/* Top Header Bar (Desktop, attached to left-72) */}
      <header className="fixed top-0 left-0 lg:left-72 right-0 h-16 bg-[#0a0e16]/80 backdrop-blur-xl z-40 px-4 sm:px-6 hidden lg:flex items-center justify-between border-b border-[#262a33]/60 shadow-[0_1px_8px_rgba(0,0,0,0.3)]">
        {/* Left Telemetry Clock & Diagnostics */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#181c24] border border-[#3b494c]/30">
            <span className="material-symbols-outlined text-[#849396] text-base">schedule</span>
            <div className="flex items-center gap-1.5 font-mono-tabular text-xs">
              <span className="text-[#dfe2ee] font-semibold">{time.utc}</span>
              <span className="text-[#849396]">UTC</span>
              <span className="text-[#849396]">|</span>
              <span className="text-[#00e5ff] font-semibold">{time.loc}</span>
              <span className="text-[#849396]">LOC</span>
            </div>
          </div>

          <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#181c24] border border-[#3b494c]/30">
            <span className="material-symbols-outlined text-[#7dffa2] text-base">memory</span>
            <span className="font-mono-tabular text-xs text-[#dfe2ee]">
              30 FPS <span className="text-[#849396]">•</span>{' '}
              <span className="text-[#7dffa2] font-semibold">12ms</span> Edge TPU
            </span>
          </div>

          <div className="hidden 2xl:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#181c24] border border-[#3b494c]/30">
            <span className="material-symbols-outlined text-[#00e5ff] text-base">videocam</span>
            <span className="font-mono-tabular text-xs text-[#dfe2ee]">
              Active <span className="text-[#849396]">•</span> Wide-Angle 1080p
            </span>
          </div>
        </div>

        {/* Right Actions & Driver Profile */}
        <div className="flex items-center gap-4">
          {/* Sound Alarm Switch */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#262a33]/60 border border-[#3b494c]/40">
            <span className="material-symbols-outlined text-[#00e5ff] text-base">
              {alarmEnabled ? 'volume_up' : 'volume_off'}
            </span>
            <span className="font-mono-tabular text-xs text-[#dfe2ee] uppercase">Alarm</span>
            <button
              onClick={onToggleAlarm}
              className={`w-9 h-5 rounded-full relative p-0.5 transition-colors focus:outline-none cursor-pointer ${
                alarmEnabled ? 'bg-[#00e5ff]' : 'bg-[#31353e]'
              }`}
              type="button"
            >
              <span
                className={`block w-4 h-4 rounded-full shadow transition-transform ${
                  alarmEnabled
                    ? 'translate-x-4 bg-[#0a0e16]'
                    : 'translate-x-0 bg-[#849396]'
                }`}
              />
            </button>
          </div>

          {/* Test Alert Button */}
          <button
            onClick={onTestAlert}
            className="px-3 py-1.5 rounded bg-[#93000a] hover:bg-[#ba1a1a] text-[#ffdad6] hover:text-white font-semibold text-xs flex items-center gap-1.5 transition-all shadow-[0_0_12px_rgba(147,0,10,0.5)] cursor-pointer active:scale-95"
            type="button"
          >
            <span className="material-symbols-outlined text-sm">notification_important</span>
            <span>Test Alert</span>
          </button>

          {/* Profile Meta */}
          <div className="flex items-center gap-2.5 pl-2 border-l border-[#262a33]">
            <div className="flex flex-col items-end">
              <span className="text-xs font-semibold text-[#dfe2ee] leading-tight">
                Marcus Vance
              </span>
              <span className="font-mono-tabular text-[10px] text-[#00daf3]">#ND-842</span>
            </div>
            <img
              alt="Profile"
              className="w-8 h-8 rounded-full object-cover ring-1 ring-[#00e5ff]/40 shadow-sm"
              src={profileUrl}
            />
          </div>
        </div>
      </header>
    </>
  );
};
