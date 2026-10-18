import React, { useState } from 'react';
import { DriverNode, IncidentEvent } from '../types/telemetry';
import { soundManager } from '../utils/soundEffects';

interface FleetManagerPageProps {
  onInspectDriverStream: (driverId: string) => void;
}

export const FleetManagerPage: React.FC<FleetManagerPageProps> = ({ onInspectDriverStream }) => {
  const [filterStatus, setFilterStatus] = useState<'all' | 'safe' | 'drowsy' | 'critical'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const drivers: DriverNode[] = [
    {
      id: 'dave-k',
      name: 'Dave Kowalski',
      truckId: 'V-204',
      truckModel: 'Kenworth T680',
      avatarUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuBWoVMTleQRiA8T3gjhAhBl13htbUKgVptoYokOLWGh_gRfE16bLdCCaGI9o3Y85bBNEeh_T2ntBDRG289cx-NIfVbgfK6ZpvwbLVIQLDpgjfTxg6hnVdecTnZ_N6MTH60gqP7rfnzX_92xqlr6DQQVhMzC7BXGKXVXcFl8zoYYWGz-AXvyTrugYBRTEQB1dvomtAqgtE22MOYRlnFuxxiUAdmKLZRBQ2y_NtMVSUc09GgRHX3OYF0lkw',
      route: 'I-80 Eastbound (MP 142)',
      status: 'critical',
      cognitiveIndex: 89,
      ear: 0.18,
      perclos: 34.8,
      blinkRate: 8,
      alertTimeAgo: 'ALERT 42s AGO',
      shiftDuration: '4h 15m',
      headPose: { pitch: -14.2, yaw: +0.4, roll: +2.1 },
    },
    {
      id: 'sarah-j',
      name: 'Sarah Jenkins',
      truckId: 'V-118',
      truckModel: 'Volvo VNL',
      avatarUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuD5RZJ4c7ppl3-yAYJTvgpk_woSxJdlMJKX9sAPfvOuTCJWm1DeUhnxxdcKxySATDFB0nqWcyjxU2igcjfL-SCYP17QRJkxNDJmNnq_Zp2dsGvzHUQ4ZI7LSBTh3ssTU0prvek0mtu2UwyoccM7rLxU7GDWxQwfHhz02_N-Pshw2v8-A3L-pLr0lTaAE5GvK_wMiL6EFY1a-PcDhms7Df2F03TxciFDpiGiMZ8H0NWW6lechADN4r_3cQ',
      route: 'I-95 South (Mile 78)',
      status: 'elevated',
      cognitiveIndex: 68,
      ear: 0.24,
      perclos: 12.4,
      blinkRate: 11,
      alertTimeAgo: 'ALERT 6m AGO',
      shiftDuration: '3h 40m',
      headPose: { pitch: -4.1, yaw: +6.8, roll: -1.0 },
    },
    {
      id: 'marcus-v',
      name: 'Marcus Vance',
      truckId: 'ND-842',
      truckModel: 'Freightliner Cascadia',
      avatarUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuCawr0Ty66jQO49zl9OxPaW25yG7aWWb3AYKLfMb57Sp4duplX_oHOYxPHSGW16HtfQLPRuZK34mnz_GdcBbmWZQlJvz9gYBTDlOae1pKUK27xMfNasW6aVQ2TGPw90fUnZR52KTTr3Q5TdT9IVGXXbn9lJSw9MzOFEPShPY-ia50fbXW_bYy0uhpMXoI69la1CYSs6TyRY_Q-sOD6qE3Hif5DdNZlHSAwo8SWQzHT3ZcCDKDylSvxEgA',
      route: 'US-101 North',
      status: 'nominal',
      cognitiveIndex: 18,
      ear: 0.34,
      perclos: 4.2,
      blinkRate: 14,
      shiftDuration: '2h 45m',
      headPose: { pitch: -2.1, yaw: +0.8, roll: +1.2 },
    },
    {
      id: 'elena-r',
      name: 'Elena Rostova',
      truckId: 'V-309',
      truckModel: 'Peterbilt 579',
      avatarUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuBy2SXhF6isTLtloA1QcoyEZ8OTwPOjATJvR_3oE0YzBw59OBqhKOZf0T2FFMARnPDjx8k0sQvPiWZ01ClSQx01zBG6tbmwmf7VBIyMvGVobvQsHO0b8yxZByW99-EX8OmVdw3HnKBucLd9KxRIvxztek3vVBfKXF9Ix5pY1EChl4-KD7-n5eVFMWY45WUFwSyvb_XkO-Mlbxw6AkNgtXiOHS0bky5lJKflljCzl9wFWOjRQ-f4jXnBMQ',
      route: 'I-70 Westbound',
      status: 'nominal',
      cognitiveIndex: 14,
      ear: 0.36,
      perclos: 3.8,
      blinkRate: 16,
      shiftDuration: '1h 10m',
      headPose: { pitch: -1.2, yaw: -0.4, roll: 0 },
    },
    {
      id: 'terrence-h',
      name: 'Terrence Hughes',
      truckId: 'V-512',
      truckModel: 'Mack Anthem',
      avatarUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuCM7Mb6KqdlNh_UEZdg3HeWqnMXktobrZ_G2xFg-unAcWwXTRblRaOby7yxP_I06pWF1xQ6asPNTE3dOPn3-Dog1MGvRmjRFHGrSk2JDAGLoVpczya6w-wiy8FclXQ4UAQY908lX-CrS7wMfON6IkjeZOCcUxkG0qjhAdSeN2MnzvCJ4rgEHAsYCK0BepZ9GJuoDDov186oY61pHLSomW8LCGDA9yI39XvhXOPBNVVF3tPiqDKnzPlMoQ',
      route: 'I-35 Northbound',
      status: 'nominal',
      cognitiveIndex: 22,
      ear: 0.31,
      perclos: 5.1,
      blinkRate: 18,
      shiftDuration: '3h 22m',
      headPose: { pitch: -1.8, yaw: +1.1, roll: -0.5 },
    },
    {
      id: 'arun-p',
      name: 'Arun Patel',
      truckId: 'V-405',
      truckModel: 'Kenworth W990',
      avatarUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuB3HgCfNXIkE_NwvNMRn_RXPg0H0_VmYF4gWQAbrFEQxQbE-A0odhi8oZmDi5_Y5IZRf7EAX2wASJBYWaR9wbNAdAh9HouXFZHPfsPjrNUcge3cYOVeIXpb1QUI54h5oezcBp3K95bGeJLbETGUjQn_szF3hDdQBqeemfHdi6HRzr19BGOOrfs86TlmdUSetVHDF9OAw8RIY4kLUXMCS1EFKjMun874sG5fUdI6LbWD5KeKIb3qb0ccwA',
      route: 'I-10 Eastbound',
      status: 'nominal',
      cognitiveIndex: 12,
      ear: 0.38,
      perclos: 2.9,
      blinkRate: 12,
      shiftDuration: '0h 48m',
      headPose: { pitch: -0.5, yaw: +0.2, roll: +0.2 },
    },
  ];

  const incidentEvents: IncidentEvent[] = [
    {
      id: 'ev-1',
      type: 'MICRO-SLEEP',
      severity: 'critical',
      driverName: 'Dave Kowalski',
      timeAgo: '42s ago',
      details:
        'Driver closed eyes for 2.4s consecutive (EAR 0.18). Level 3 acoustic cabin alert triggered.',
      truckMeta: 'TRUCK #V-204 • I-80',
      actionText: 'Acknowledge SOS',
    },
    {
      id: 'ev-2',
      type: 'GAZE DEVIATION',
      severity: 'warning',
      driverName: 'Sarah Jenkins',
      timeAgo: '6m ago',
      details:
        'Gaze angle off forward path > 5.2s. Cognitive warning banner delivered to steering wheel HUD.',
      truckMeta: 'TRUCK #V-118 • I-95',
      actionText: 'ACKNOWLEDGED BY DRIVER',
    },
    {
      id: 'ev-3',
      type: 'SENSOR CLEARED',
      severity: 'info',
      driverName: 'Marcus Vance',
      timeAgo: '18m ago',
      details:
        'Cabin optical glare occlusion resolved. 68-point mesh tracking re-stabilized at 30 FPS.',
      truckMeta: 'TRUCK #ND-842 • US-101',
      actionText: 'EDGE TPU NORMAL',
    },
    {
      id: 'ev-4',
      type: 'HOS COMPLIANCE',
      severity: 'warning',
      driverName: 'Mateo Gomez',
      timeAgo: '32m ago',
      details: '4h consecutive drive reached. Route automated rest-stop recommendations transmitted.',
      truckMeta: 'TRUCK #V-103 • I-40',
      actionText: 'ROUTE UPDATED',
    },
    {
      id: 'ev-5',
      type: 'SHIFT HANDOFF',
      severity: 'info',
      driverName: 'Elena Rostova',
      timeAgo: '1h 10m ago',
      details:
        'Driver facial recognition authentication verified. Baseline PERCLOS initialized at 14%.',
      truckMeta: 'TRUCK #V-309 • I-70',
      actionText: 'AUTHENTICATED',
    },
  ];

  const filteredDrivers = drivers.filter((d) => {
    if (filterStatus === 'safe' && d.status !== 'nominal') return false;
    if (filterStatus === 'drowsy' && d.status !== 'elevated') return false;
    if (filterStatus === 'critical' && d.status !== 'critical') return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        d.name.toLowerCase().includes(q) ||
        d.truckId.toLowerCase().includes(q) ||
        d.route.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const showToast = (msg: string) => {
    soundManager.playBeep(1100, 0.08);
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  return (
    <div className="w-full pt-16 min-h-screen bg-[#0f131c] text-[#dfe2ee] px-4 sm:px-6 pb-12">
      {/* Top Metric Strip */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mt-2 mb-4">
        {/* Metric 1 */}
        <div className="bg-[#181c24] border border-[#262a33] p-4 rounded-xl flex items-center justify-between shadow-md">
          <div className="flex flex-col">
            <span className="font-mono-tabular text-xs uppercase text-[#849396] tracking-wider font-semibold">
              Active Vehicles
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="font-mono-tabular text-3xl font-bold text-[#00e5ff] tracking-tight">
                28
              </span>
              <span className="font-mono-tabular text-xs text-[#bac9cc]">/ 32 DEPLOYED</span>
            </div>
            <span className="text-xs text-[#849396] mt-1">87.5% fleet capacity in transit</span>
          </div>
          <div className="w-12 h-12 rounded-lg bg-[#262a33] flex items-center justify-center text-[#00e5ff] border border-[#3b494c]/40">
            <span className="material-symbols-outlined text-2xl">local_shipping</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-[#181c24] border border-[#262a33] p-4 rounded-xl flex items-center justify-between shadow-md">
          <div className="flex flex-col">
            <span className="font-mono-tabular text-xs uppercase text-[#7dffa2] tracking-wider flex items-center gap-1.5 font-semibold">
              <span className="w-2 h-2 rounded-full bg-[#7dffa2] inline-block"></span>
              Safe Telemetry
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="font-mono-tabular text-3xl font-bold text-[#7dffa2] tracking-tight">
                24
              </span>
              <span className="font-mono-tabular text-xs text-[#7dffa2]">(85.7%)</span>
            </div>
            <span className="text-xs text-[#849396] mt-1">EAR &gt; 0.30 • Zero micro-sleeps</span>
          </div>
          <div className="w-12 h-12 rounded-lg bg-[#262a33] flex items-center justify-center text-[#7dffa2] border border-[#3b494c]/40">
            <span className="material-symbols-outlined text-2xl">verified_user</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-[#181c24] border border-[#262a33] p-4 rounded-xl flex items-center justify-between shadow-md">
          <div className="flex flex-col">
            <span className="font-mono-tabular text-xs uppercase text-[#ffc769] tracking-wider flex items-center gap-1.5 font-semibold">
              <span className="w-2 h-2 rounded-full bg-[#ffc769] inline-block"></span>
              Elevated Strain
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="font-mono-tabular text-3xl font-bold text-[#ffc769] tracking-tight">
                3
              </span>
              <span className="font-mono-tabular text-xs text-[#ffc769]">(10.7%)</span>
            </div>
            <span className="text-xs text-[#849396] mt-1">Off-road gaze &gt; 8% • Rest prompt</span>
          </div>
          <div className="w-12 h-12 rounded-lg bg-[#262a33] flex items-center justify-center text-[#ffc769] border border-[#3b494c]/40">
            <span className="material-symbols-outlined text-2xl">warning</span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-[#181c24] border border-[#262a33] p-4 rounded-xl flex items-center justify-between shadow-md relative overflow-hidden">
          <div className="absolute inset-x-0 bottom-0 h-1 bg-[#ff1744]"></div>
          <div className="flex flex-col">
            <span className="font-mono-tabular text-xs uppercase text-[#ffb4ab] tracking-wider flex items-center gap-1.5 font-bold">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ff1744] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#ff1744]"></span>
              </span>
              Critical Alert
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="font-mono-tabular text-3xl font-bold text-[#ffb4ab] tracking-tight">
                1
              </span>
              <span className="font-mono-tabular text-xs text-[#ffb4ab] font-bold">(3.6%)</span>
            </div>
            <span className="text-xs text-[#ffb4ab]/90 mt-1 font-semibold">
              SOS Protocol Ready • Immediate
            </span>
          </div>
          <div className="w-12 h-12 rounded-lg bg-[#93000a]/40 flex items-center justify-center text-[#ff1744] animate-pulse border border-[#ff1744]/40">
            <span className="material-symbols-outlined text-2xl">fmd_bad</span>
          </div>
        </div>
      </div>

      {/* Operational Control Bar */}
      <div className="bg-[#181c24] border border-[#262a33] p-3 rounded-xl shadow-md flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-lg font-mono-tabular text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
              filterStatus === 'all'
                ? 'bg-[#31353e] text-[#00e5ff] font-bold shadow-sm'
                : 'text-[#bac9cc] hover:text-white'
            }`}
          >
            <span>ALL ACTIVE</span>
            <span className="px-1.5 py-0.5 rounded bg-[#1c2028] text-white text-[11px] font-bold">
              28
            </span>
          </button>

          <button
            onClick={() => setFilterStatus('safe')}
            className={`px-3 py-1.5 rounded-lg font-mono-tabular text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
              filterStatus === 'safe'
                ? 'bg-[#31353e] text-[#7dffa2] font-bold shadow-sm'
                : 'text-[#bac9cc] hover:text-white'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#7dffa2]"></span>
            <span>SAFE</span>
            <span className="px-1.5 py-0.5 rounded bg-[#1c2028] text-[#7dffa2] text-[11px] font-bold">
              24
            </span>
          </button>

          <button
            onClick={() => setFilterStatus('drowsy')}
            className={`px-3 py-1.5 rounded-lg font-mono-tabular text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
              filterStatus === 'drowsy'
                ? 'bg-[#31353e] text-[#ffc769] font-bold shadow-sm'
                : 'text-[#bac9cc] hover:text-white'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#ffc769]"></span>
            <span>DROWSY / STRAIN</span>
            <span className="px-1.5 py-0.5 rounded bg-[#1c2028] text-[#ffc769] text-[11px] font-bold">
              3
            </span>
          </button>

          <button
            onClick={() => setFilterStatus('critical')}
            className={`px-3 py-1.5 rounded-lg font-mono-tabular text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
              filterStatus === 'critical'
                ? 'bg-[#93000a] text-[#ffdad6] font-bold shadow-md'
                : 'bg-[#93000a]/30 text-[#ffb4ab] hover:bg-[#93000a]/50'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#ff1744] animate-ping"></span>
            <span>CRITICAL RISK</span>
            <span className="px-1.5 py-0.5 rounded bg-[#ff1744]/20 text-[#ffb4ab] text-[11px] font-bold">
              1
            </span>
          </button>
        </div>

        {/* Right Search and Filter */}
        <div className="flex items-center gap-3 flex-1 sm:flex-initial justify-end">
          <div className="relative w-full sm:w-64">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-[#849396] text-base">
              search
            </span>
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0a0e16] text-[#dfe2ee] pl-9 pr-3 py-1.5 rounded-lg text-xs border border-[#262a33] focus:outline-none focus:border-[#00e5ff] placeholder-[#849396]"
              placeholder="Filter route, truck, or driver..."
              type="text"
            />
          </div>
          <button
            onClick={() => showToast('HUD sorted by risk score priority descending.')}
            className="px-3 py-1.5 rounded-lg bg-[#262a33] text-[#dfe2ee] hover:text-[#00e5ff] font-mono-tabular text-xs flex items-center gap-1 border border-[#3b494c]/60 cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">tune</span>
            <span>HUD SORT</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Driver Cards (8 cols) + Real-Time Incident Feed (4 cols) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Live Driver Cards Grid */}
        <div className="xl:col-span-8 flex flex-col gap-4">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <span className="font-mono-tabular text-xs uppercase text-[#849396] tracking-widest font-semibold">
                Active Neural Telemetry Nodes
              </span>
              <span className="w-1 h-1 rounded-full bg-[#849396]"></span>
              <span className="font-mono-tabular text-xs text-[#00e5ff] font-bold">
                LIVE LATENCY 14ms
              </span>
            </div>
            <span className="font-mono-tabular text-xs text-[#849396]">AUTO-REFRESH: REALTIME</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredDrivers.map((driver) => {
              const isCrit = driver.status === 'critical';
              const isElev = driver.status === 'elevated';

              return (
                <div
                  key={driver.id}
                  className={`bg-[#181c24] rounded-xl p-5 shadow-xl flex flex-col justify-between relative overflow-hidden group border ${
                    isCrit
                      ? 'border-[#ff1744]/60'
                      : isElev
                      ? 'border-[#ffc769]/50'
                      : 'border-[#262a33]'
                  }`}
                >
                  {/* Top Bar Accent */}
                  <div
                    className={`absolute top-0 inset-x-0 h-1.5 ${
                      isCrit
                        ? 'bg-[#ff1744] animate-pulse'
                        : isElev
                        ? 'bg-[#ffc769]'
                        : 'bg-[#7dffa2]/60'
                    }`}
                  />

                  <div>
                    {/* Header bar */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <img
                            alt={driver.name}
                            className="w-12 h-12 rounded-lg object-cover bg-[#262a33] shadow-md border border-[#3b494c]/40"
                            src={driver.avatarUrl}
                          />
                          <span
                            className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-[#181c24] flex items-center justify-center ${
                              isCrit
                                ? 'bg-[#ff1744]'
                                : isElev
                                ? 'bg-[#ffc769]'
                                : 'bg-[#7dffa2]'
                            }`}
                          >
                            {isCrit && <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>}
                          </span>
                        </div>
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-base font-bold text-[#dfe2ee] truncate">
                              {driver.name}
                            </span>
                            <span
                              className={`px-1.5 py-0.5 rounded font-mono-tabular text-[10px] font-bold ${
                                isCrit
                                  ? 'bg-[#93000a] text-[#ffdad6]'
                                  : isElev
                                  ? 'bg-[#ffc769]/30 text-[#ffc769]'
                                  : 'bg-[#7dffa2]/20 text-[#7dffa2]'
                              }`}
                            >
                              {isCrit ? 'CRITICAL' : isElev ? 'ELEVATED' : 'NOMINAL'}
                            </span>
                          </div>
                          <span className="text-xs text-[#bac9cc] flex items-center gap-1">
                            <span className="material-symbols-outlined text-xs text-[#849396]">
                              local_shipping
                            </span>
                            {driver.truckModel} #{driver.truckId}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col items-end">
                        <span
                          className={`font-mono-tabular text-xs font-bold tracking-tight ${
                            isCrit
                              ? 'text-[#ffb4ab]'
                              : isElev
                              ? 'text-[#ffc769]'
                              : 'text-[#7dffa2]'
                          }`}
                        >
                          {driver.alertTimeAgo || 'OPTIMAL'}
                        </span>
                        <span className="font-mono-tabular text-[11px] text-[#849396] text-right truncate max-w-[150px]">
                          {driver.route}
                        </span>
                      </div>
                    </div>

                    {/* Telemetry HUD readout */}
                    <div className="mt-4 p-3 rounded-lg bg-[#0a0e16]/80 flex items-center justify-between gap-2 border border-[#262a33] shadow-inner">
                      <div className="flex flex-col">
                        <span className="font-mono-tabular text-[10px] text-[#849396]">
                          {isCrit ? 'COGNITIVE INDEX' : 'COGNITIVE LOAD'}
                        </span>
                        <div className="flex items-baseline gap-1 mt-0.5">
                          <span
                            className={`font-mono-tabular text-xl font-bold ${
                              isCrit
                                ? 'text-[#ffb4ab]'
                                : isElev
                                ? 'text-[#ffc769]'
                                : 'text-[#7dffa2]'
                            }`}
                          >
                            {driver.cognitiveIndex}
                          </span>
                          <span className="font-mono-tabular text-xs text-[#849396]">/100</span>
                        </div>
                        <span
                          className={`font-mono-tabular text-[10px] flex items-center gap-1 mt-0.5 ${
                            isCrit
                              ? 'text-[#ffb4ab] font-bold'
                              : isElev
                              ? 'text-[#ffc769]'
                              : 'text-[#849396]'
                          }`}
                        >
                          {isCrit ? (
                            <>
                              <span className="material-symbols-outlined text-xs">priority_high</span>{' '}
                              Severe Hypovigilance
                            </>
                          ) : isElev ? (
                            'Off-Road Gaze: 12%'
                          ) : (
                            'Focus: Road Center'
                          )}
                        </span>
                      </div>

                      <div className="flex flex-col items-end">
                        <span className="font-mono-tabular text-[10px] text-[#849396]">
                          EYE RATIO (EAR)
                        </span>
                        <div className="flex items-baseline gap-1 mt-0.5">
                          <span
                            className={`font-mono-tabular text-xl font-bold ${
                              driver.ear < 0.22
                                ? 'text-[#ffb4ab]'
                                : driver.ear < 0.28
                                ? 'text-[#dfe2ee]'
                                : 'text-[#7dffa2]'
                            }`}
                          >
                            {driver.ear}
                          </span>
                          <span className="font-mono-tabular text-[10px] text-[#849396]">
                            {driver.ear < 0.22 ? '< 0.22' : 'CLEAR'}
                          </span>
                        </div>
                        <span
                          className={`font-mono-tabular text-[10px] font-semibold mt-0.5 ${
                            isCrit
                              ? 'text-[#ffb4ab]'
                              : isElev
                              ? 'text-[#ffc769]'
                              : 'text-[#849396]'
                          }`}
                        >
                          {isCrit
                            ? 'Micro-Sleep Detected'
                            : isElev
                            ? 'Warning Chime Sent'
                            : `Blink: ${driver.blinkRate} / min`}
                        </span>
                      </div>

                      {/* Radial Progress */}
                      <div className="w-14 h-14 relative flex items-center justify-center flex-shrink-0">
                        <svg className="w-14 h-14 transform -rotate-90" viewBox="0 0 36 36">
                          <path
                            className="text-[#262a33]"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3.5"
                          />
                          <path
                            className={
                              isCrit ? 'text-[#ff1744]' : isElev ? 'text-[#ffc769]' : 'text-[#7dffa2]'
                            }
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="currentColor"
                            strokeDasharray={`${driver.cognitiveIndex}, 100`}
                            strokeLinecap="round"
                            strokeWidth="3.5"
                          />
                        </svg>
                        <span
                          className={`absolute font-mono-tabular text-[11px] font-bold ${
                            isCrit
                              ? 'text-[#ffb4ab]'
                              : isElev
                              ? 'text-[#ffc769]'
                              : 'text-[#7dffa2]'
                          }`}
                        >
                          {driver.cognitiveIndex}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  {isCrit ? (
                    <div className="mt-4 pt-3 flex items-center gap-2 border-t border-[#262a33]">
                      <button
                        onClick={() => showToast(`Initiating priority duplex audio link to ${driver.name}...`)}
                        className="flex-1 py-2 px-3 rounded-lg bg-[#262a33] hover:bg-[#353942] text-[#00e5ff] font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors border border-[#3b494c]/50 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-base">phone_in_talk</span>
                        <span>Audio Call</span>
                      </button>
                      <button
                        onClick={() => showToast(`CRITICAL: Dispatch SOS sent to ${driver.name} (#${driver.truckId}) with coordinates.`)}
                        className="flex-1 py-2 px-3 rounded-lg bg-[#93000a] hover:bg-[#ba1a1a] text-[#ffdad6] font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-md cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-base">emergency</span>
                        <span>Dispatch SOS</span>
                      </button>
                    </div>
                  ) : isElev ? (
                    <div className="mt-4 pt-3 flex items-center gap-2 border-t border-[#262a33]">
                      <button
                        onClick={() => showToast(`Haptic vibration beacon re-sent to seat of ${driver.name}.`)}
                        className="flex-1 py-2 px-3 rounded-lg bg-[#262a33] hover:bg-[#353942] text-[#00e5ff] font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors border border-[#3b494c]/50 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-base">notifications</span>
                        <span>Re-send Haptic</span>
                      </button>
                      <button
                        onClick={() => showToast(`Automated rest stop advisory transmitted to ${driver.name} HUD.`)}
                        className="flex-1 py-2 px-3 rounded-lg bg-[#1c2028] hover:bg-[#262a33] text-[#dfe2ee] font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors border border-[#3b494c]/50 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-base">coffee</span>
                        <span>Suggest Rest Stop</span>
                      </button>
                    </div>
                  ) : (
                    <div className="mt-4 pt-3 flex items-center justify-between text-[#849396] border-t border-[#262a33]">
                      <span className="font-mono-tabular text-xs">
                        SHIFT DURATION: {driver.shiftDuration}
                      </span>
                      <button
                        onClick={() => onInspectDriverStream(driver.id)}
                        className="font-mono-tabular text-xs text-[#00e5ff] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <span>Inspect Stream</span>
                        <span className="material-symbols-outlined text-xs">arrow_forward</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: Real-Time Incident & Safety Event Feed */}
        <div className="xl:col-span-4 flex flex-col gap-4">
          {/* Supervisor Tactical Broadcast Module */}
          <div className="bg-[#181c24] border border-[#262a33] rounded-xl p-4 shadow-md flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="font-mono-tabular text-xs uppercase text-[#849396] tracking-wider flex items-center gap-1.5 font-semibold">
                <span className="material-symbols-outlined text-[#00e5ff] text-base">podcasts</span>
                Fleet-Wide Broadcast
              </span>
              <span className="px-2 py-0.5 rounded bg-[#262a33] text-[#7dffa2] font-mono-tabular text-[11px] font-bold border border-[#3b494c]/40">
                ALL CHANNELS
              </span>
            </div>
            <p className="text-xs text-[#bac9cc] leading-relaxed">
              Send immediate priority telemetry alerts, severe weather warnings, or mandatory waypoint
              instructions to all active rigs.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => showToast('Severe weather advisory broadcasted to all 28 active rigs.')}
                className="flex-1 py-2 px-3 rounded-lg bg-[#262a33] hover:bg-[#353942] text-[#00e5ff] font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors border border-[#3b494c]/50 cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">thunderstorm</span>
                <span>Weather Advisory</span>
              </button>
              <button
                onClick={() => showToast('Live mic channel opened to Fleet Master Frequency.')}
                className="py-2 px-3 rounded-lg bg-[#262a33] hover:bg-[#353942] text-[#dfe2ee] font-semibold text-xs flex items-center justify-center transition-colors border border-[#3b494c]/50 cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">mic</span>
              </button>
            </div>
          </div>

          {/* Live Event Feed Header */}
          <div className="bg-[#181c24] border border-[#262a33] rounded-xl p-4 shadow-md flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00e5ff] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00e5ff]"></span>
                </span>
                <span className="text-sm font-bold text-[#dfe2ee]">Incident Event Stream</span>
              </div>
              <span className="font-mono-tabular text-xs text-[#849396]">FILTER: SEV &gt; 1</span>
            </div>

            {/* Scrolling Event Log List */}
            <div className="flex flex-col gap-2.5 mt-1">
              {incidentEvents.map((ev) => (
                <div
                  key={ev.id}
                  className="p-3 rounded-lg bg-[#0a0e16] border border-[#262a33] shadow-sm flex flex-col gap-1.5 relative overflow-hidden"
                >
                  <div
                    className={`absolute left-0 inset-y-0 w-1 ${
                      ev.severity === 'critical'
                        ? 'bg-[#ff1744]'
                        : ev.severity === 'warning'
                        ? 'bg-[#ffc769]'
                        : 'bg-[#00e5ff]'
                    }`}
                  />
                  <div className="flex items-start justify-between gap-2 pl-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-1.5 py-0.5 rounded font-mono-tabular text-[10px] font-bold ${
                          ev.severity === 'critical'
                            ? 'bg-[#93000a] text-[#ffdad6]'
                            : ev.severity === 'warning'
                            ? 'bg-[#ffc769]/30 text-[#ffc769]'
                            : 'bg-[#00e5ff]/20 text-[#00e5ff]'
                        }`}
                      >
                        {ev.type}
                      </span>
                      <span className="text-xs font-semibold text-[#dfe2ee] truncate font-sans">
                        {ev.driverName}
                      </span>
                    </div>
                    <span className="font-mono-tabular text-[10px] text-[#849396]">{ev.timeAgo}</span>
                  </div>

                  <p className="text-xs text-[#bac9cc] pl-2 leading-relaxed">{ev.details}</p>

                  <div className="flex items-center justify-between pl-2 pt-1 border-t border-[#262a33]/60">
                    <span className="font-mono-tabular text-[10px] text-[#849396]">
                      {ev.truckMeta}
                    </span>
                    {ev.actionText && (
                      <button
                        onClick={() => showToast(`Action confirmed: ${ev.actionText} on ${ev.driverName}`)}
                        className={`font-mono-tabular text-[11px] font-bold hover:underline flex items-center gap-1 cursor-pointer ${
                          ev.severity === 'critical'
                            ? 'text-[#ffb4ab]'
                            : ev.severity === 'warning'
                            ? 'text-[#ffc769]'
                            : 'text-[#7dffa2]'
                        }`}
                      >
                        <span>{ev.actionText}</span>
                        {ev.severity === 'critical' && (
                          <span className="material-symbols-outlined text-xs">open_in_new</span>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Export & Full Audit Link */}
            <div className="pt-2 flex items-center justify-between border-t border-[#262a33] font-mono-tabular text-xs">
              <span className="text-[#849396]">Showing 5 of 142 logged today</span>
              <button
                onClick={() => showToast('Opening comprehensive fleet audit log viewer...')}
                className="text-[#00e5ff] hover:underline flex items-center gap-1 font-bold cursor-pointer"
              >
                <span>View Full Audit Log</span>
                <span className="material-symbols-outlined text-xs">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Feedback Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#181c24] border border-[#00e5ff] text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 font-mono-tabular text-xs">
          <span className="material-symbols-outlined text-[#00e5ff]">info</span>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
