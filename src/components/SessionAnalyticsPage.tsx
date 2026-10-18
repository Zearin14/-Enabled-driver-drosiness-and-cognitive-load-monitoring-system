import React, { useState } from 'react';
import { HaulLogSession } from '../types/telemetry';
import { soundManager } from '../utils/soundEffects';

export const SessionAnalyticsPage: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'24H' | '7D' | '14D' | '30D'>('14D');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSessionId, setSelectedSessionId] = useState('SES-8921-TN');
  const [scrubberCursor, setScrubberCursor] = useState('04:18:22 (Event 3 of 4)');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const incidentImg =
    'https://lh3.googleusercontent.com/aida-public/AB6AXuANyFMd251FPIvrTA84YfiIqL88lxhwixDb5I_wG6e22q9RTQUevNT8a6X7phw6PAu7wCK55ZcePSQ24fu117J_71-PWiUYocnOeZ1ZSYkYy-BGVwIWpwjsWgaiMFcAnlPM4EmmyVhohpRX6MofzQm0sjyvsEB_ecWiuhpyBEHrLn_acp_XUc_aiJXytY9clWt0hKHr-SgfXx0ZOoM6c3TEzuIEYcGuuLE_jHIoPZ0GELa54ro13mjWlA';

  const haulLogs: HaulLogSession[] = [
    {
      id: 'SES-8921-TN',
      date: 'May 15, 2024',
      timeRange: '02:14:20 - 09:44:00 (CST)',
      routeFrom: 'Dallas, TX',
      routeTo: 'Memphis, TN',
      truckUnit: 'TRK-8812',
      truckModel: 'Freightliner',
      duration: '07h 29m 40s',
      avgDrowsiness: 54.8,
      maxDrowsiness: 89,
      criticalAlerts: 1,
      minorAlerts: 3,
      cognitiveStrain: 'High',
      riskBadge: 'CRITICAL INTERVENTION',
    },
    {
      id: 'SES-8919-MI',
      date: 'May 14, 2024',
      timeRange: '18:02:11 - 23:55:00 (EST)',
      routeFrom: 'Chicago, IL',
      routeTo: 'Detroit, MI',
      truckUnit: 'TRK-4401',
      truckModel: 'Peterbilt 579',
      duration: '05h 52m 49s',
      avgDrowsiness: 29.4,
      maxDrowsiness: 48,
      criticalAlerts: 0,
      minorAlerts: 2,
      cognitiveStrain: 'Med',
      riskBadge: 'ELEVATED',
    },
    {
      id: 'SES-8902-GA',
      date: 'May 14, 2024',
      timeRange: '08:00:15 - 14:15:20 (EST)',
      routeFrom: 'Atlanta, GA',
      routeTo: 'Charlotte, NC',
      truckUnit: 'TRK-9022',
      truckModel: 'Volvo VNL',
      duration: '06h 15m 05s',
      avgDrowsiness: 11.2,
      maxDrowsiness: 19,
      criticalAlerts: 0,
      minorAlerts: 0,
      cognitiveStrain: 'Low',
      riskBadge: 'LOW RISK',
    },
    {
      id: 'SES-8890-AZ',
      date: 'May 13, 2024',
      timeRange: '10:30:00 - 16:45:10 (MST)',
      routeFrom: 'Phoenix, AZ',
      routeTo: 'San Diego, CA',
      truckUnit: 'TRK-1109',
      truckModel: 'Kenworth T680',
      duration: '06h 15m 10s',
      avgDrowsiness: 14.7,
      maxDrowsiness: 24,
      criticalAlerts: 0,
      minorAlerts: 1,
      cognitiveStrain: 'Low',
      riskBadge: 'LOW RISK',
    },
    {
      id: 'SES-8877-OH',
      date: 'May 12, 2024',
      timeRange: '21:10:00 - 05:20:30 (EST)',
      routeFrom: 'Columbus, OH',
      routeTo: 'Harrisburg, PA',
      truckUnit: 'TRK-7740',
      truckModel: 'Freightliner Cascadia',
      duration: '08h 10m 30s',
      avgDrowsiness: 34.2,
      maxDrowsiness: 62,
      criticalAlerts: 0,
      minorAlerts: 3,
      cognitiveStrain: 'Med',
      riskBadge: 'ELEVATED',
    },
  ];

  const filteredLogs = haulLogs.filter(
    (log) =>
      log.routeFrom.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.routeTo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.truckUnit.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.truckModel.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleExportParquet = () => {
    soundManager.playBeep(1100, 0.1);
    setToastMessage('Export initiated: telemetry_log_14d_rolling.parquet (4.2 MB) packaged.');
    setTimeout(() => setToastMessage(null), 3500);
  };

  const selectSession = (id: string) => {
    setSelectedSessionId(id);
    soundManager.playBeep(950, 0.08);
  };

  return (
    <div className="w-full pt-16 min-h-screen bg-[#0f131c] text-[#dfe2ee] px-4 sm:px-6 pb-16">
      {/* Top Command Ribbon & Filter Strip */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 mt-2">
        <div className="flex flex-col">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono-tabular text-xs text-[#00e5ff] uppercase tracking-widest flex items-center gap-1.5 font-bold">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#00e5ff] animate-pulse"></span>
              Archive Station • Tier-1 Fleet Diagnostics
            </span>
            <span className="text-[#849396] text-xs">/</span>
            <span className="font-mono-tabular text-xs text-[#bac9cc]">SESS_LOG_REV_4.9</span>
          </div>
          <div className="flex items-baseline gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-[#dfe2ee] tracking-tight">
              Cognitive Telemetry Archive
            </h1>
            <span className="font-mono-tabular text-xs text-[#7dffa2] bg-[#262a33] px-2.5 py-0.5 rounded border border-[#3b494c]/40 font-bold">
              SYNCED TO EDGE TPU
            </span>
          </div>
        </div>

        {/* Time Window Selector & Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center bg-[#181c24] p-1 rounded-lg border border-[#262a33]">
            {(['24H', '7D', '14D', '30D'] as const).map((r) => (
              <button
                key={r}
                onClick={() => {
                  setTimeRange(r);
                  soundManager.playBeep(850, 0.05);
                }}
                className={`px-3 py-1 rounded font-mono-tabular text-xs transition-colors cursor-pointer ${
                  timeRange === r
                    ? 'bg-[#00e5ff] text-[#001f24] font-bold shadow-sm'
                    : 'text-[#bac9cc] hover:text-white'
                }`}
                type="button"
              >
                {r === '14D' ? '14D ROLLING' : r}
              </button>
            ))}
          </div>

          <button
            onClick={() => {
              soundManager.playBeep(900, 0.08);
              setToastMessage('Unit filter: Applied default Cascadia #V-109 + #V-204 fleet filter.');
              setTimeout(() => setToastMessage(null), 3000);
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#262a33] hover:bg-[#353942] text-[#dfe2ee] transition-all text-xs font-semibold border border-[#3b494c]/60 cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-base text-[#00e5ff]">filter_alt</span>
            <span>Filter Unit</span>
          </button>

          <button
            onClick={handleExportParquet}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#00e5ff] hover:bg-[#9cf0ff] text-[#001f24] transition-all text-xs font-bold shadow-lg shadow-[#00e5ff]/20 cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-base">file_download</span>
            <span>Batch Telemetry (.parquet)</span>
          </button>
        </div>
      </div>

      {/* Section 1: Header Stats Bar (Bento Ribbon) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {/* Stat 1 */}
        <div className="relative overflow-hidden p-4 rounded-xl bg-[#1c2028]/80 backdrop-blur-xl border border-[#262a33] flex flex-col justify-between shadow-md hover:bg-[#262a33]/70 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono-tabular text-xs uppercase tracking-wider text-[#bac9cc] font-semibold">
              Total Monitored Hours
            </span>
            <span className="material-symbols-outlined text-[#00e5ff] text-xl">timelapse</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-mono-tabular text-3xl font-bold text-[#dfe2ee]">142.5</span>
            <span className="font-mono-tabular text-xs text-[#849396]">HRS</span>
          </div>
          <div className="mt-3 flex items-center justify-between font-mono-tabular text-xs">
            <span className="text-[#7dffa2] flex items-center gap-1 font-semibold">
              <span className="material-symbols-outlined text-xs">trending_up</span>+18.4% vs last period
            </span>
            <span className="text-[#849396]">61 Sessions</span>
          </div>
        </div>

        {/* Stat 2 */}
        <div className="relative overflow-hidden p-4 rounded-xl bg-[#1c2028]/80 backdrop-blur-xl border border-[#262a33] flex flex-col justify-between shadow-md hover:bg-[#262a33]/70 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono-tabular text-xs uppercase tracking-wider text-[#bac9cc] font-semibold">
              Average Drowsiness Index
            </span>
            <span className="material-symbols-outlined text-[#7dffa2] text-xl">neurology</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-mono-tabular text-3xl font-bold text-[#7dffa2]">18.2</span>
            <span className="font-mono-tabular text-xs text-[#849396]">/ 100</span>
          </div>
          <div className="mt-3 flex items-center justify-between font-mono-tabular text-xs">
            <span className="text-[#7dffa2] flex items-center gap-1 font-semibold">
              <span className="material-symbols-outlined text-xs">arrow_downward</span>-3.1 pts (Fatigue Reduced)
            </span>
            <span className="text-[#849396]">Nominal &lt; 25.0</span>
          </div>
        </div>

        {/* Stat 3 */}
        <div className="relative overflow-hidden p-4 rounded-xl bg-[#1c2028]/80 backdrop-blur-xl border border-[#262a33] flex flex-col justify-between shadow-md hover:bg-[#262a33]/70 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono-tabular text-xs uppercase tracking-wider text-[#bac9cc] font-semibold">
              Critical Incidents Avoided
            </span>
            <span className="material-symbols-outlined text-[#ffb4ab] text-xl">shield_with_heart</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-mono-tabular text-3xl font-bold text-[#ffb4ab]">14</span>
            <span className="font-mono-tabular text-xs text-[#849396]">EVENTS</span>
          </div>
          <div className="mt-3 flex items-center justify-between font-mono-tabular text-xs">
            <span className="text-[#bac9cc]">Haptic / Audio Interventions</span>
            <span className="text-[#7dffa2] font-bold">100% Mitigated</span>
          </div>
        </div>

        {/* Stat 4 */}
        <div className="relative overflow-hidden p-4 rounded-xl bg-[#1c2028]/80 backdrop-blur-xl border border-[#262a33] flex flex-col justify-between shadow-md hover:bg-[#262a33]/70 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono-tabular text-xs uppercase tracking-wider text-[#bac9cc] font-semibold">
              Safety Compliance Score
            </span>
            <span className="material-symbols-outlined text-[#00e5ff] text-xl">verified</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-mono-tabular text-3xl font-bold text-[#dfe2ee]">96.8</span>
            <span className="font-mono-tabular text-xs text-[#849396]">%</span>
          </div>
          <div className="mt-3 flex items-center justify-between font-mono-tabular text-xs">
            <span className="text-[#7dffa2] font-semibold">FMCSA Class-A Level</span>
            <span className="text-[#849396]">Top 3% Fleet</span>
          </div>
        </div>
      </div>

      {/* Section 2: Analytical Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-6">
        {/* Chart 1: Alerts per Session (Left 5 Cols) */}
        <div className="lg:col-span-5 rounded-xl bg-[#1c2028]/80 backdrop-blur-xl p-4 border border-[#262a33] flex flex-col justify-between shadow-md">
          <div className="flex items-center justify-between mb-2">
            <div className="flex flex-col">
              <span className="text-sm font-bold text-[#dfe2ee]">Alerts per Session</span>
              <span className="font-mono-tabular text-xs text-[#bac9cc]">
                14-Day Breakdown by Severity Category
              </span>
            </div>
            <div className="flex items-center gap-3 font-mono-tabular text-[11px]">
              <span className="inline-flex items-center gap-1 text-[#7dffa2]">
                <span className="w-2 h-2 rounded-full bg-[#7dffa2]"></span> 0-1
              </span>
              <span className="inline-flex items-center gap-1 text-[#ffba38]">
                <span className="w-2 h-2 rounded-full bg-[#ffba38]"></span> 2-3
              </span>
              <span className="inline-flex items-center gap-1 text-[#ffb4ab]">
                <span className="w-2 h-2 rounded-full bg-[#ffb4ab]"></span> 4+
              </span>
            </div>
          </div>

          <div className="h-56 w-full relative flex items-end">
            <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 460 220">
              <line x1="0" y1="40" x2="460" y2="40" stroke="#353942" strokeDasharray="2 3" strokeWidth="1" opacity="0.4" />
              <line x1="0" y1="95" x2="460" y2="95" stroke="#353942" strokeDasharray="2 3" strokeWidth="1" opacity="0.4" />
              <line x1="0" y1="150" x2="460" y2="150" stroke="#353942" strokeDasharray="2 3" strokeWidth="1" opacity="0.4" />
              <line x1="0" y1="200" x2="460" y2="200" stroke="#3b494c" strokeWidth="1" opacity="0.6" />

              {/* Day 1 - 14 */}
              <rect x="12" y="160" width="16" height="40" rx="2" fill="#7dffa2" opacity="0.9" />
              <rect x="44" y="175" width="16" height="25" rx="2" fill="#7dffa2" opacity="0.9" />
              <rect x="76" y="110" width="16" height="90" rx="2" fill="#ffba38" opacity="0.9" />
              <rect x="108" y="165" width="16" height="35" rx="2" fill="#7dffa2" opacity="0.9" />
              <rect x="140" y="35" width="16" height="165" rx="2" fill="#ffb4ab" opacity="0.95" />
              <circle cx="148" cy="24" r="4" fill="#ffb4ab" className="animate-ping" />
              <rect x="172" y="125" width="16" height="75" rx="2" fill="#ffba38" opacity="0.9" />
              <rect x="204" y="180" width="16" height="20" rx="2" fill="#7dffa2" opacity="0.9" />
              <rect x="236" y="150" width="16" height="50" rx="2" fill="#7dffa2" opacity="0.9" />
              <rect x="268" y="105" width="16" height="95" rx="2" fill="#ffba38" opacity="0.9" />
              <rect x="300" y="55" width="16" height="145" rx="2" fill="#ffb4ab" opacity="0.95" />
              <rect x="332" y="170" width="16" height="30" rx="2" fill="#7dffa2" opacity="0.9" />
              <rect x="364" y="130" width="16" height="70" rx="2" fill="#ffba38" opacity="0.9" />
              <rect x="396" y="185" width="16" height="15" rx="2" fill="#7dffa2" opacity="0.9" />
              <rect x="428" y="165" width="16" height="35" rx="2" fill="#7dffa2" opacity="0.9" />
            </svg>
          </div>
          <div className="flex justify-between font-mono-tabular text-xs text-[#849396] pt-2 border-t border-[#262a33]">
            <span>MAY 05</span>
            <span>MAY 08</span>
            <span>MAY 12</span>
            <span>MAY 15</span>
            <span>TODAY</span>
          </div>
        </div>

        {/* Chart 2: Drowsiness Trend Over Shift Hours (Right 7 Cols) */}
        <div className="lg:col-span-7 rounded-xl bg-[#1c2028]/80 backdrop-blur-xl p-4 border border-[#262a33] flex flex-col justify-between shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
            <div className="flex flex-col">
              <span className="text-sm font-bold text-[#dfe2ee]">Drowsiness Trend Curve</span>
              <span className="font-mono-tabular text-xs text-[#bac9cc]">
                7-Day Rolling Fatigue Curve by Shift Archetype
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3 font-mono-tabular text-[11px]">
              <span className="flex items-center gap-1.5 text-[#00daf3]">
                <span className="w-3 h-0.5 bg-[#00daf3] inline-block"></span> Morning (06:00-14:00)
              </span>
              <span className="flex items-center gap-1.5 text-[#7dffa2]">
                <span className="w-3 h-0.5 bg-[#7dffa2] inline-block"></span> Swing (14:00-22:00)
              </span>
              <span className="flex items-center gap-1.5 text-[#ffb4ab]">
                <span className="w-3 h-0.5 bg-[#ffb4ab] inline-block"></span> Graveyard (22:00-06:00)
              </span>
            </div>
          </div>

          <div className="h-56 w-full relative">
            <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 650 220">
              <defs>
                <linearGradient id="graveyardGrad" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#ffb4ab" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#ffb4ab" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              <line x1="0" y1="35" x2="650" y2="35" stroke="#353942" strokeDasharray="2 3" strokeWidth="1" opacity="0.4" />
              <line x1="0" y1="90" x2="650" y2="90" stroke="#353942" strokeDasharray="2 3" strokeWidth="1" opacity="0.4" />
              <line x1="0" y1="145" x2="650" y2="145" stroke="#353942" strokeDasharray="2 3" strokeWidth="1" opacity="0.4" />
              <line x1="0" y1="200" x2="650" y2="200" stroke="#3b494c" strokeWidth="1" opacity="0.6" />

              <rect x="0" y="20" width="650" height="30" fill="#93000a" opacity="0.12" />
              <text x="10" y="32" fill="#ffb4ab" fontFamily="JetBrains Mono" fontSize="10" opacity="0.7">
                HAZARD CEILING (PERCLOS &gt; 0.28)
              </text>

              {/* Graveyard path */}
              <path
                d="M 0,160 C 90,150 180,120 270,70 C 350,25 430,30 520,75 C 580,110 620,130 650,140 L 650,200 L 0,200 Z"
                fill="url(#graveyardGrad)"
              />
              <path
                d="M 0,160 C 90,150 180,120 270,70 C 350,25 430,30 520,75 C 580,110 620,130 650,140"
                fill="none"
                stroke="#ffb4ab"
                strokeWidth="2.5"
              />

              {/* Swing path */}
              <path
                d="M 0,185 C 100,180 200,160 300,140 C 400,125 500,130 600,110 L 650,105"
                fill="none"
                stroke="#7dffa2"
                strokeDasharray="4 2"
                strokeWidth="2"
              />

              {/* Morning path */}
              <path
                d="M 0,195 C 120,190 220,175 320,178 C 420,180 520,165 650,155"
                fill="none"
                stroke="#00daf3"
                strokeWidth="2"
              />

              {/* Peak Marker */}
              <circle cx="370" cy="32" r="5" fill="#ffb4ab" stroke="#0f131c" strokeWidth="2" />
              <rect x="330" y="4" width="80" height="18" rx="3" fill="#262a33" />
              <text x="340" y="16" fill="#ffb4ab" fontFamily="JetBrains Mono" fontSize="10" fontWeight="bold">
                PEAK 78.4
              </text>
            </svg>
          </div>
          <div className="flex justify-between font-mono-tabular text-xs text-[#849396] pt-2 border-t border-[#262a33]">
            <span>HR 1 (+0h)</span>
            <span>HR 2 (+2h)</span>
            <span>HR 4 (+4h)</span>
            <span>HR 6 (+6h)</span>
            <span>HR 8 (+8h)</span>
            <span>HR 10 (+10h MAX)</span>
          </div>
        </div>
      </div>

      {/* Section 2.3: Full Width Heatmap */}
      <div className="rounded-xl bg-[#1c2028]/80 backdrop-blur-xl p-4 mb-6 border border-[#262a33] shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm sm:text-base font-bold text-[#dfe2ee]">
                Time-of-Day Fatigue & Risk Heatmap
              </span>
              <span className="px-2 py-0.5 rounded bg-[#93000a]/40 text-[#ffb4ab] font-mono-tabular text-[10px] font-bold">
                CIRCADIAN ZONE ACTIVE
              </span>
            </div>
            <p className="font-mono-tabular text-xs text-[#bac9cc] mt-0.5">
              Normalized 24-hour micro-nod and gaze deflection density across shift cycles (Mon–Sun)
            </p>
          </div>
          <div className="flex items-center gap-3 font-mono-tabular text-xs">
            <span className="text-[#849396]">Risk Density:</span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-[#262a33]"></span> Low
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-[#7dffa2]/40"></span> Mod
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-[#ffba38]/80"></span> Elev
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-[#ff1744]"></span> Severe Dip
            </span>
          </div>
        </div>

        {/* Heatmap Grid Container */}
        <div className="overflow-x-auto pb-2">
          <div className="min-w-[860px]">
            {/* Hours Header */}
            <div className="grid grid-cols-[80px_repeat(24,1fr)] gap-1 mb-1 font-mono-tabular text-[10px] text-[#849396] text-center">
              <div className="text-left font-bold text-[#dfe2ee]">DAY \ HR</div>
              <div>00</div>
              <div>01</div>
              <div className="text-[#ff1744] font-bold">02</div>
              <div className="text-[#ff1744] font-bold">03</div>
              <div className="text-[#ff1744] font-bold">04</div>
              <div className="text-[#ff1744] font-bold">05</div>
              <div>06</div>
              <div>07</div>
              <div>08</div>
              <div>09</div>
              <div>10</div>
              <div>11</div>
              <div>12</div>
              <div className="text-[#ffba38]">13</div>
              <div className="text-[#ffba38]">14</div>
              <div>15</div>
              <div>16</div>
              <div>17</div>
              <div>18</div>
              <div>19</div>
              <div>20</div>
              <div>21</div>
              <div>22</div>
              <div>23</div>
            </div>

            {/* Days Rows */}
            {[
              {
                day: 'MON',
                pattern: [
                  'low', 'mid-low', 'crit', 'crit', 'crit', 'elev', 'low', 'mod', 'low', 'low',
                  'mod', 'mod', 'mod', 'elev', 'elev', 'mod', 'low', 'low', 'mod', 'low',
                  'mod', 'elev', 'elev', 'mid-low'
                ],
              },
              {
                day: 'TUE',
                pattern: [
                  'low', 'mid-low', 'crit', 'crit', 'crit', 'crit', 'low', 'low', 'mod', 'low',
                  'mod', 'mod', 'mod', 'elev', 'elev', 'mod', 'low', 'low', 'low', 'mod',
                  'mid-low', 'elev', 'elev', 'crit'
                ],
              },
              {
                day: 'WED',
                pattern: [
                  'low', 'elev', 'crit', 'crit', 'crit', 'crit', 'low', 'mod', 'mod', 'low',
                  'mod', 'low', 'mod', 'elev', 'elev', 'mod', 'low', 'low', 'low', 'mod',
                  'low', 'mod', 'elev', 'mid-low'
                ],
              },
              {
                day: 'THU',
                pattern: [
                  'low', 'mod', 'crit', 'crit', 'crit', 'elev', 'low', 'mod', 'mod', 'low',
                  'mod', 'mod', 'mod', 'elev', 'elev', 'mod', 'low', 'mod', 'low', 'mod',
                  'mid-low', 'elev', 'crit', 'mid-low'
                ],
              },
              {
                day: 'FRI',
                pattern: [
                  'mid-low', 'elev', 'crit', 'crit', 'crit', 'crit', 'elev', 'low', 'low', 'mod',
                  'low', 'mod', 'mod', 'elev', 'elev', 'mod', 'low', 'low', 'low', 'mod',
                  'elev', 'elev', 'crit', 'crit'
                ],
              },
              {
                day: 'SAT',
                pattern: [
                  'mod', 'low', 'crit', 'crit', 'crit', 'mod', 'low', 'low', 'low', 'low',
                  'low', 'low', 'mod', 'mod', 'low', 'low', 'low', 'low', 'low', 'low',
                  'low', 'mod', 'mod', 'low'
                ],
              },
              {
                day: 'SUN',
                pattern: [
                  'low', 'low', 'crit', 'crit', 'crit', 'mod', 'low', 'low', 'low', 'low',
                  'low', 'low', 'low', 'mod', 'mod', 'low', 'low', 'low', 'low', 'low',
                  'low', 'mod', 'elev', 'mod'
                ],
              },
            ].map(({ day, pattern }) => (
              <div
                key={day}
                className="grid grid-cols-[80px_repeat(24,1fr)] gap-1 mb-1 items-center"
              >
                <span className="font-mono-tabular text-xs text-[#dfe2ee] font-semibold">
                  {day}
                </span>
                {pattern.map((type, i) => {
                  let bgClass = 'bg-[#262a33]';
                  if (type === 'crit') bgClass = 'bg-[#ff1744]';
                  else if (type === 'elev') bgClass = 'bg-[#ffba38]/80';
                  else if (type === 'mod') bgClass = 'bg-[#7dffa2]/40';
                  else if (type === 'mid-low') bgClass = 'bg-[#31353e]';

                  return (
                    <div
                      key={i}
                      className={`h-6 rounded transition-all hover:scale-105 cursor-pointer ${bgClass}`}
                      title={`${day} ${String(i).padStart(2, '0')}:00 - Risk tier: ${type.toUpperCase()}`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Section 3: Past Sessions Telemetry Log Table */}
      <div className="rounded-xl bg-[#1c2028]/80 backdrop-blur-xl p-4 mb-6 border border-[#262a33] shadow-md flex flex-col">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-[#dfe2ee]">Recent Monitored Haul Logs</h3>
            <p className="font-mono-tabular text-xs text-[#bac9cc]">
              Click any entry to expand edge sensor timeline & face mesh metrics
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-[#0a0e16] text-[#dfe2ee] text-xs pl-8 pr-3 py-2 rounded-lg border border-[#262a33] focus:outline-none focus:border-[#00e5ff] w-56 sm:w-72 placeholder:text-[#849396]"
                placeholder="Search route, truck, or driver..."
                type="text"
              />
              <span className="material-symbols-outlined text-[#849396] absolute left-2 top-2 text-base">
                search
              </span>
            </div>
          </div>
        </div>

        {/* Table Responsive Scroller */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[960px]">
            <thead>
              <tr className="bg-[#0a0e16]/70 text-[#bac9cc] font-mono-tabular text-[11px] uppercase tracking-wider border-b border-[#262a33]">
                <th className="py-2.5 px-3 rounded-l-lg">Session Timestamp</th>
                <th className="py-2.5 px-3">Route / Truck ID</th>
                <th className="py-2.5 px-3">Duration</th>
                <th className="py-2.5 px-3">Avg Drowsiness</th>
                <th className="py-2.5 px-3">Total Alerts</th>
                <th className="py-2.5 px-3">Cognitive Strain</th>
                <th className="py-2.5 px-3">Risk Badge</th>
                <th className="py-2.5 px-3 text-right rounded-r-lg">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#262a33]/60 font-mono-tabular text-xs">
              {filteredLogs.map((log) => (
                <tr
                  key={log.id}
                  onClick={() => selectSession(log.id)}
                  className={`hover:bg-[#262a33]/60 transition-colors group cursor-pointer ${
                    selectedSessionId === log.id ? 'bg-[#262a33]/80' : ''
                  }`}
                >
                  <td className="py-3 px-3">
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-[#dfe2ee] font-sans">
                        {log.date}
                      </span>
                      <span className="text-[11px] text-[#849396]">{log.timeRange}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-[#00e5ff] flex items-center gap-1 font-sans">
                        {log.routeFrom}{' '}
                        <span className="material-symbols-outlined text-xs">arrow_forward</span>{' '}
                        {log.routeTo}
                      </span>
                      <span className="text-[11px] text-[#bac9cc]">
                        Unit #{log.truckUnit} • {log.truckModel}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-[#dfe2ee] font-semibold">{log.duration}</td>
                  <td className="py-3 px-3">
                    <div className="flex flex-col gap-1 w-32">
                      <div className="flex items-center justify-between text-[11px]">
                        <span
                          className={`font-bold ${
                            log.avgDrowsiness > 40
                              ? 'text-[#ffb4ab]'
                              : log.avgDrowsiness > 20
                              ? 'text-[#ffc769]'
                              : 'text-[#7dffa2]'
                          }`}
                        >
                          {log.avgDrowsiness} / 100
                        </span>
                        <span className="text-[#849396]">Max: {log.maxDrowsiness}</span>
                      </div>
                      <div className="w-full bg-[#31353e] h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            log.avgDrowsiness > 40
                              ? 'bg-[#ff1744]'
                              : log.avgDrowsiness > 20
                              ? 'bg-[#ffba38]'
                              : 'bg-[#7dffa2]'
                          }`}
                          style={{ width: `${log.avgDrowsiness}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {log.criticalAlerts > 0 && (
                        <span className="px-2 py-0.5 rounded bg-[#93000a] text-[#ffdad6] text-[10px] font-bold">
                          {log.criticalAlerts} Critical
                        </span>
                      )}
                      {log.minorAlerts > 0 ? (
                        <span className="px-2 py-0.5 rounded bg-[#31353e] text-[#ffc769] text-[10px]">
                          {log.minorAlerts} Minor
                        </span>
                      ) : log.criticalAlerts === 0 ? (
                        <span className="px-2 py-0.5 rounded bg-[#31353e] text-[#7dffa2] text-[10px]">
                          0 Alerts
                        </span>
                      ) : null}
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`inline-flex items-center gap-1.5 ${
                        log.cognitiveStrain === 'High'
                          ? 'text-[#ffb4ab]'
                          : log.cognitiveStrain === 'Med'
                          ? 'text-[#ffc769]'
                          : 'text-[#7dffa2]'
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${
                          log.cognitiveStrain === 'High'
                            ? 'bg-[#ff1744] animate-ping'
                            : log.cognitiveStrain === 'Med'
                            ? 'bg-[#ffba38]'
                            : 'bg-[#7dffa2]'
                        }`}
                      ></span>
                      {log.cognitiveStrain}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider inline-block shadow-sm ${
                        log.riskBadge === 'CRITICAL INTERVENTION'
                          ? 'bg-[#93000a] text-[#ffdad6]'
                          : log.riskBadge === 'ELEVATED'
                          ? 'bg-[#ffc769]/30 text-[#ffc769]'
                          : 'bg-[#05e777]/20 text-[#7dffa2]'
                      }`}
                    >
                      {log.riskBadge}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        selectSession(log.id);
                      }}
                      className="px-2.5 py-1 rounded bg-[#262a33] text-[#00e5ff] hover:bg-[#00e5ff] hover:text-[#001f24] transition-all text-xs font-semibold cursor-pointer"
                    >
                      Inspect
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Table Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between pt-3 gap-2 font-mono-tabular text-xs text-[#849396] border-t border-[#262a33]/60">
          <span>SHOWING {filteredLogs.length} OF 61 RECORDED SESSIONS</span>
          <div className="flex items-center gap-1">
            <button className="px-2 py-1 rounded bg-[#00e5ff] text-[#001f24] font-bold">1</button>
            <button className="px-2 py-1 rounded bg-[#0a0e16] text-[#dfe2ee] hover:bg-[#262a33]">
              2
            </button>
            <button className="px-2 py-1 rounded bg-[#0a0e16] text-[#dfe2ee] hover:bg-[#262a33]">
              3
            </button>
            <span className="px-1 text-[#849396]">...</span>
            <button className="px-2 py-1 rounded bg-[#0a0e16] text-[#dfe2ee] hover:bg-[#262a33]">
              12
            </button>
          </div>
        </div>
      </div>

      {/* Section 4: Session Detail Drill-Down Modal / Drawer Preview */}
      <div
        id="telemetryDrawer"
        className="rounded-xl bg-[#181c24]/95 backdrop-blur-2xl p-6 border-2 border-[#00e5ff]/40 shadow-2xl relative overflow-hidden transition-all duration-300"
      >
        {/* Header with Close & Identity */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#262a33] gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-[#93000a]/30 flex items-center justify-center text-[#ff1744] border border-[#ff1744]/40">
              <span className="material-symbols-outlined text-2xl">crisis_alert</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-[#dfe2ee]">{selectedSessionId}</span>
                <span className="px-2 py-0.5 rounded bg-[#93000a] text-[#ffdad6] font-mono-tabular text-xs font-bold">
                  CRITICAL EVENT CAPTURED
                </span>
              </div>
              <p className="font-mono-tabular text-xs text-[#bac9cc]">
                Driver: Marcus Vance (#ND-842) • Route: Dallas, TX -&gt; Memphis, TN • Night Shift
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                soundManager.playBeep(1100, 0.1);
                setToastMessage('Replaying 1080p optical stream at timestamp 04:18:22...');
                setTimeout(() => setToastMessage(null), 3000);
              }}
              className="px-3 py-1.5 rounded-lg bg-[#262a33] hover:bg-[#353942] text-[#dfe2ee] font-semibold text-xs flex items-center gap-1.5 transition-colors border border-[#3b494c]/60 cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-base text-[#00e5ff]">video_library</span>{' '}
              Video Replay (1080p)
            </button>
            <button
              onClick={() => {
                soundManager.playBeep(1200, 0.1);
                setToastMessage('Audit report generated for SES-8921-TN (PDF Ready).');
                setTimeout(() => setToastMessage(null), 3000);
              }}
              className="px-3 py-1.5 rounded-lg bg-[#00e5ff] hover:bg-[#9cf0ff] text-[#001f24] font-bold text-xs flex items-center gap-1.5 transition-colors shadow cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-base">print</span> Export Audit
            </button>
          </div>
        </div>

        {/* Scrubber HUD & Multi-Axis Breakdown */}
        <div className="mt-4 grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Left Column: Video Snapshot & Frame (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-2.5">
            <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-[#0a0e16] border border-[#262a33]">
              <img
                alt="Captured Incident Frame"
                className="w-full h-full object-cover"
                src={incidentImg}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0e16] via-transparent to-transparent" />
              <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-[#0a0e16]/80 backdrop-blur font-mono-tabular text-[10px] text-[#ffb4ab] flex items-center gap-1 border border-[#93000a]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#ff1744] animate-ping"></span>
                INCIDENT TS: 04:18:22.410
              </div>
              <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-[#0a0e16]/80 backdrop-blur font-mono-tabular text-[10px] text-[#00e5ff] border border-[#00e5ff]/40">
                EAR: 0.12 (MICROSLEEP DETECTED)
              </div>
              <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between font-mono-tabular text-[10px] text-[#dfe2ee]">
                <span>PERCLOS: 82%</span>
                <span>Head Pitch: -14.2° (Droop)</span>
                <span>Yawn Count: 4 / 10m</span>
              </div>
            </div>

            {/* Biometric Metric Chips */}
            <div className="grid grid-cols-3 gap-2 font-mono-tabular">
              <div className="p-2 rounded bg-[#262a33]/60 border border-[#3b494c]/40 flex flex-col">
                <span className="text-[10px] text-[#849396]">HEART RATE EST.</span>
                <span className="text-xs text-[#dfe2ee] font-semibold">58 BPM (Brady)</span>
              </div>
              <div className="p-2 rounded bg-[#262a33]/60 border border-[#3b494c]/40 flex flex-col">
                <span className="text-[10px] text-[#849396]">BLINK DURATION</span>
                <span className="text-xs text-[#ffb4ab] font-bold">680 ms (&gt;400ms)</span>
              </div>
              <div className="p-2 rounded bg-[#262a33]/60 border border-[#3b494c]/40 flex flex-col">
                <span className="text-[10px] text-[#849396]">CABIN LUX</span>
                <span className="text-xs text-[#bac9cc] font-semibold">1.4 Lux (Dark)</span>
              </div>
            </div>
          </div>

          {/* Right Column: Timeline Scrubber & Event Cascade (7 cols) */}
          <div className="lg:col-span-7 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-bold text-[#dfe2ee]">
                  Telemetry Waveform & Incident Scrubber
                </span>
                <span className="font-mono-tabular text-xs text-[#00e5ff] font-bold">
                  Cursor: {scrubberCursor}
                </span>
              </div>
              <p className="font-mono-tabular text-[11px] text-[#bac9cc] mb-2">
                Hover over flags to jump frame. Real-time eye closure duration mapped below.
              </p>

              {/* SVG Waveform Scrubber */}
              <div className="w-full h-32 bg-[#0a0e16] rounded-lg p-2 relative overflow-hidden border border-[#262a33]">
                <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 600 100">
                  <line x1="0" y1="25" x2="600" y2="25" stroke="#262a33" strokeWidth="1" />
                  <line x1="0" y1="50" x2="600" y2="50" stroke="#262a33" strokeWidth="1" />
                  <line x1="0" y1="75" x2="600" y2="75" stroke="#262a33" strokeWidth="1" />

                  {/* Baseline EAR Waveform (Cyan) */}
                  <path
                    d="M 0,60 Q 30,58 60,62 T 120,59 T 180,63 T 240,60 T 300,70 T 360,95 T 390,92 T 420,60 T 480,58 T 540,61 T 600,60"
                    fill="none"
                    stroke="#00daf3"
                    strokeWidth="1.5"
                  />

                  {/* Hazard Curve */}
                  <path
                    d="M 320,68 C 340,78 350,96 375,98 C 400,98 410,75 425,62"
                    fill="none"
                    stroke="#ffb4ab"
                    strokeWidth="3"
                  />

                  {/* Event Marker 1 */}
                  <line x1="140" y1="10" x2="140" y2="90" stroke="#ffba38" strokeDasharray="2 2" strokeWidth="1" />
                  <circle
                    cx="140"
                    cy="20"
                    r="4"
                    fill="#ffba38"
                    className="cursor-pointer hover:r-5"
                    onMouseEnter={() => setScrubberCursor('03:52:10 (Yawn Cluster)')}
                  />

                  {/* Event Marker 2 */}
                  <line x1="240" y1="10" x2="240" y2="90" stroke="#ffba38" strokeDasharray="2 2" strokeWidth="1" />
                  <circle
                    cx="240"
                    cy="20"
                    r="4"
                    fill="#ffba38"
                    className="cursor-pointer hover:r-5"
                    onMouseEnter={() => setScrubberCursor('04:02:15 (Gaze Deviation)')}
                  />

                  {/* Event Marker 3: Micro-Sleep CRITICAL STOP (Active Scrubber Cursor) */}
                  <line x1="375" y1="0" x2="375" y2="100" stroke="#ff1744" strokeWidth="2" />
                  <polygon points="370,5 380,5 375,15" fill="#ff1744" />

                  {/* Event Marker 4 */}
                  <line x1="435" y1="10" x2="435" y2="90" stroke="#7dffa2" strokeDasharray="2 2" strokeWidth="1" />
                  <circle
                    cx="435"
                    cy="20"
                    r="4"
                    fill="#7dffa2"
                    className="cursor-pointer hover:r-5"
                    onMouseEnter={() => setScrubberCursor('04:26:00 (Rest Pause Recovered)')}
                  />
                </svg>
              </div>

              {/* Scrubber Timeline Labels */}
              <div className="flex justify-between font-mono-tabular text-[10px] text-[#849396] mt-1.5">
                <span>02:14 (DEPART)</span>
                <span>03:30</span>
                <span className="text-[#ffba38]">03:52 (Yawn Cluster)</span>
                <span className="text-[#ffb4ab] font-bold">04:18 (Micro-Sleep Alert)</span>
                <span className="text-[#7dffa2]">04:26 (Rest Pause)</span>
                <span>09:44 (ARRIVE)</span>
              </div>
            </div>

            {/* Audit Log Chips */}
            <div className="flex flex-col gap-1.5 mt-3">
              <div className="px-3 py-1.5 rounded bg-[#262a33]/60 border border-[#93000a]/50 flex items-center justify-between text-xs font-mono-tabular">
                <span className="flex items-center gap-2 text-[#ffb4ab] font-bold">
                  <span className="material-symbols-outlined text-sm">alarm_on</span>
                  04:18:22 — Microsleep Confirmed (680ms EAR &lt; 0.15)
                </span>
                <span className="text-[#849396]">Audio Tone Lvl 3 Fired • Haptic Pulsed</span>
              </div>
              <div className="px-3 py-1.5 rounded bg-[#262a33]/60 border border-[#3b494c]/40 flex items-center justify-between text-xs font-mono-tabular">
                <span className="flex items-center gap-2 text-[#ffba38]">
                  <span className="material-symbols-outlined text-sm">face</span>
                  03:52:10 — Yawn Duration Cluster (3 Yawns &gt; 3.5s in 4m)
                </span>
                <span className="text-[#849396]">Advisory Alert Triggered</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#181c24] border border-[#00e5ff] text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 font-mono-tabular text-xs">
          <span className="material-symbols-outlined text-[#00e5ff]">info</span>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
