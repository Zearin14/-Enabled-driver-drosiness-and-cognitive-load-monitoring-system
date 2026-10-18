/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ScreenType } from './types/telemetry';
import { Navigation } from './components/Navigation';
import { OverviewPage } from './components/OverviewPage';
import { CockpitHudPage } from './components/CockpitHudPage';
import { AlertOverlayPage } from './components/AlertOverlayPage';
import { SessionAnalyticsPage } from './components/SessionAnalyticsPage';
import { FleetManagerPage } from './components/FleetManagerPage';
import { SystemSettingsPage } from './components/SystemSettingsPage';
import { soundManager } from './utils/soundEffects';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('live-dashboard');
  const [alarmEnabled, setAlarmEnabled] = useState(true);
  const [isTestAlertOpen, setIsTestAlertOpen] = useState(false);

  const handleToggleAlarm = () => {
    const next = !alarmEnabled;
    setAlarmEnabled(next);
    soundManager.isMuted = !next;
    if (next) {
      soundManager.playBeep(1200, 0.08);
    }
  };

  const handleTriggerTestAlert = () => {
    soundManager.playSiren(1800);
    setIsTestAlertOpen(true);
  };

  const handleNavigate = (screen: ScreenType) => {
    soundManager.playBeep(900, 0.05);
    setCurrentScreen(screen);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#0f131c] text-[#dfe2ee] font-sans relative selection:bg-[#00e5ff] selection:text-[#001f24]">
      {/* Navigation Layer */}
      <Navigation
        currentScreen={currentScreen}
        onNavigate={handleNavigate}
        alarmEnabled={alarmEnabled}
        onToggleAlarm={handleToggleAlarm}
        onTestAlert={handleTriggerTestAlert}
      />

      {/* Main Content Viewport */}
      <main className={`w-full min-h-screen ${currentScreen !== 'overview' ? 'lg:pl-72' : ''}`}>
        {currentScreen === 'overview' && (
          <OverviewPage onNavigate={handleNavigate} />
        )}

        {currentScreen === 'live-dashboard' && (
          <CockpitHudPage
            alarmEnabled={alarmEnabled}
            onToggleAlarm={handleToggleAlarm}
            onTriggerAlertModal={handleTriggerTestAlert}
          />
        )}

        {currentScreen === 'session-history-and-analytics' && (
          <SessionAnalyticsPage />
        )}

        {currentScreen === 'fleet-manager' && (
          <FleetManagerPage
            onInspectDriverStream={(driverId) => {
              handleNavigate('live-dashboard');
            }}
          />
        )}

        {currentScreen === 'alert-overlay-preview' && (
          <AlertOverlayPage
            onAcknowledgeAlert={() => {
              // Stay on page with safe state
            }}
          />
        )}

        {currentScreen === 'system-settings' && (
          <SystemSettingsPage />
        )}
      </main>

      {/* Global Test Alert Modal Triggered from Header */}
      {isTestAlertOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative max-w-2xl w-full bg-[#0a0e16] border-2 border-[#ff1744] rounded-2xl shadow-[0_0_60px_rgba(255,23,68,0.5)] overflow-hidden">
            <div className="w-full h-2.5 bg-[repeating-linear-gradient(45deg,#ff1744,#ff1744_16px,#1c2028_16px,#1c2028_32px)] animate-pulse" />
            <div className="p-6 sm:p-8 flex flex-col gap-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-xl bg-[#93000a] text-[#ffdad6] flex items-center justify-center animate-bounce shadow-lg">
                    <span className="material-symbols-outlined text-3xl">warning</span>
                  </div>
                  <div>
                    <span className="px-2 py-0.5 rounded bg-[#ff1744] text-[#001f24] font-mono-tabular text-xs font-bold uppercase tracking-wider">
                      MANUAL TEST SIMULATION
                    </span>
                    <h3 className="text-xl font-bold text-[#ffb4ab] mt-1">
                      Cabin Siren & HUD Flash Verification
                    </h3>
                  </div>
                </div>
                <button
                  onClick={() => setIsTestAlertOpen(false)}
                  className="p-1.5 rounded-lg bg-[#181c24] text-[#849396] hover:text-white hover:bg-[#262a33] transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-lg">close</span>
                </button>
              </div>

              <div className="p-3.5 bg-[#181c24] rounded-xl border border-[#262a33] text-xs text-[#bac9cc] space-y-2 leading-relaxed">
                <p>
                  • Acoustic beacon verified: Outputting 88 dB alternating dual-tone distress signal.
                </p>
                <p>
                  • Haptic driver seat transducer pulse: Engaged on lumbar node #01 & #02.
                </p>
                <p>
                  • Telematics packet encrypted & buffered: Zero packet loss over CANbus interface.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => {
                    setIsTestAlertOpen(false);
                    handleNavigate('alert-overlay-preview');
                  }}
                  className="px-4 py-2.5 rounded-lg bg-[#262a33] hover:bg-[#353942] text-[#00e5ff] font-semibold text-xs border border-[#3b494c]/60 cursor-pointer"
                >
                  Open Full Alert Overlay
                </button>
                <button
                  onClick={() => {
                    setIsTestAlertOpen(false);
                    soundManager.playBeep(900, 0.08);
                  }}
                  className="px-5 py-2.5 rounded-lg bg-[#00e5ff] hover:bg-[#9cf0ff] text-[#001f24] font-bold text-xs shadow-[0_0_15px_rgba(0,229,255,0.4)] cursor-pointer"
                >
                  Dismiss Alarm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
