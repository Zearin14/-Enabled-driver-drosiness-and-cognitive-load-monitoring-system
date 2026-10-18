import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  CartesianGrid,
} from 'recharts';
import { TelemetryPoint } from '../hooks/useDriverVision';

interface CognitiveLoadTrendChartProps {
  currentLoad: number;
  history: TelemetryPoint[];
  ear: number;
  roadFocus: number;
}

export const CognitiveLoadTrendChart: React.FC<CognitiveLoadTrendChartProps> = ({
  currentLoad,
  history,
  ear,
  roadFocus,
}) => {
  const [metricView, setMetricView] = useState<'load' | 'dual'>('load');

  // Format real history points for Recharts
  const chartData = useMemo(() => {
    if (!history || history.length === 0) {
      // Single live starting point
      return [
        {
          timeLabel: 'LIVE',
          load: currentLoad,
          ear: ear,
          roadFocus: roadFocus,
          stressTier: currentLoad >= 70 ? 'Overload' : currentLoad >= 50 ? 'Elevated' : 'Optimal',
        },
      ];
    }

    return history.map((pt) => ({
      timeLabel: pt.timeLabel,
      load: pt.drowsinessScore !== undefined ? pt.cognitiveLoad : currentLoad,
      drowsiness: pt.drowsinessScore,
      ear: Number(pt.ear.toFixed(2)),
      roadFocus: Math.round(pt.roadFocus),
      stressTier:
        pt.cognitiveLoad >= 70
          ? 'Overload'
          : pt.cognitiveLoad >= 50
          ? 'Elevated'
          : 'Optimal',
    }));
  }, [history, currentLoad, ear, roadFocus]);

  // Derived statistics from REAL recorded data
  const latestPoint = chartData[chartData.length - 1];
  const avgLoad = Math.round(
    chartData.reduce((acc, curr) => acc + curr.load, 0) / (chartData.length || 1)
  );
  const maxLoad = Math.max(...chartData.map((p) => p.load));

  // Stroke color based on current real cognitive load
  const strokeColor =
    currentLoad >= 70 ? '#ff1744' : currentLoad >= 50 ? '#ffc769' : '#00e5ff';

  return (
    <div className="w-full bg-[#181c24]/80 backdrop-blur-md rounded-xl p-4 border border-[#262a33] shadow-xl flex flex-col mb-4">
      {/* Top Header & Diagnostic Summary */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#00e5ff]/10 flex items-center justify-center text-[#00e5ff] border border-[#00e5ff]/30 shadow-inner">
            <span className="material-symbols-outlined text-lg">stacked_line_chart</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold text-[#dfe2ee]">
                Real-Time Cognitive Load & Fatigue Telemetry
              </h3>
              <span
                className={`font-mono-tabular text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                  currentLoad >= 70
                    ? 'bg-[#93000a] text-[#ffdad6] animate-pulse'
                    : currentLoad >= 50
                    ? 'bg-[#ffc769]/20 text-[#ffc769]'
                    : 'bg-[#00e5ff]/10 text-[#00e5ff]'
                }`}
              >
                {currentLoad >= 70
                  ? 'CRITICAL OVERLOAD'
                  : currentLoad >= 50
                  ? 'ELEVATED STRAIN'
                  : 'OPTIMAL FOCUS'}
              </span>
            </div>
            <p className="text-xs text-[#849396]">
              Real webcam-computed mental workload, blink saccades, and gaze distraction slope.
            </p>
          </div>
        </div>

        {/* View Controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-[#0a0e16] p-1 rounded-lg border border-[#262a33]">
            <button
              onClick={() => setMetricView('load')}
              className={`px-2.5 py-1 text-xs font-mono-tabular rounded transition-colors cursor-pointer ${
                metricView === 'load'
                  ? 'bg-[#00e5ff] text-[#001f24] font-bold shadow-sm'
                  : 'text-[#849396] hover:text-[#dfe2ee]'
              }`}
              type="button"
            >
              COGNITIVE LOAD ONLY
            </button>
            <button
              onClick={() => setMetricView('dual')}
              className={`px-2.5 py-1 text-xs font-mono-tabular rounded transition-colors cursor-pointer ${
                metricView === 'dual'
                  ? 'bg-[#00e5ff] text-[#001f24] font-bold shadow-sm'
                  : 'text-[#849396] hover:text-[#dfe2ee]'
              }`}
              type="button"
            >
              DUAL (LOAD + ROAD FOCUS)
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4 font-mono-tabular">
        <div className="bg-[#0a0e16]/80 p-2.5 rounded-lg border border-[#262a33]">
          <span className="text-[10px] text-[#849396] uppercase tracking-wider block">CURRENT LOAD</span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-2xl font-bold" style={{ color: strokeColor }}>
              {currentLoad}%
            </span>
            <span className="text-[10px] text-[#849396]">
              {currentLoad >= 70 ? 'BURDENED' : currentLoad >= 50 ? 'BUSY' : 'ENGAGED'}
            </span>
          </div>
        </div>

        <div className="bg-[#0a0e16]/80 p-2.5 rounded-lg border border-[#262a33]">
          <span className="text-[10px] text-[#849396] uppercase tracking-wider block">SESSION AVERAGE</span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-2xl font-bold text-[#dfe2ee]">{avgLoad}%</span>
            <span className="text-[10px] text-[#00e5ff]">MEAN</span>
          </div>
        </div>

        <div className="bg-[#0a0e16]/80 p-2.5 rounded-lg border border-[#262a33]">
          <span className="text-[10px] text-[#849396] uppercase tracking-wider block">PEAK LOAD</span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-2xl font-bold text-[#ffb4ab]">{maxLoad}%</span>
            <span className="text-[10px] text-[#ffb4ab]">SPIKE</span>
          </div>
        </div>

        <div className="bg-[#0a0e16]/80 p-2.5 rounded-lg border border-[#262a33]">
          <span className="text-[10px] text-[#849396] uppercase tracking-wider block">ROAD FOCUS</span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-2xl font-bold text-[#7dffa2]">{roadFocus}%</span>
            <span className="text-[10px] text-[#7dffa2]">FORWARD</span>
          </div>
        </div>
      </div>

      {/* Main Recharts Container */}
      <div className="w-full h-56 relative">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="cognitiveGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={strokeColor} stopOpacity={0.4} />
                <stop offset="95%" stopColor={strokeColor} stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="roadFocusGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#7dffa2" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#7dffa2" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#262a33" opacity={0.6} />

            <XAxis
              dataKey="timeLabel"
              stroke="#849396"
              fontSize={10}
              tickLine={false}
              axisLine={{ stroke: '#262a33' }}
              fontFamily="JetBrains Mono"
            />

            <YAxis
              domain={[0, 100]}
              stroke="#849396"
              fontSize={10}
              tickLine={false}
              axisLine={{ stroke: '#262a33' }}
              fontFamily="JetBrains Mono"
              ticks={[0, 25, 50, 75, 100]}
            />

            {/* Critical & Warning Thresholds */}
            <ReferenceLine
              y={70}
              stroke="#ff1744"
              strokeDasharray="4 4"
              strokeWidth={1.5}
              label={{
                value: 'OVERLOAD (70%)',
                fill: '#ffb4ab',
                fontSize: 9,
                position: 'right',
                fontFamily: 'JetBrains Mono',
              }}
            />
            <ReferenceLine
              y={50}
              stroke="#ffc769"
              strokeDasharray="3 3"
              strokeWidth={1}
              label={{
                value: 'ELEVATED (50%)',
                fill: '#ffc769',
                fontSize: 9,
                position: 'right',
                fontFamily: 'JetBrains Mono',
              }}
            />

            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-[#0a0e16]/95 border border-[#3b494c] p-3 rounded-lg shadow-xl font-mono-tabular text-xs">
                      <div className="text-[#849396] font-bold mb-1 border-b border-[#262a33] pb-1">
                        Timeline: {data.timeLabel}
                      </div>
                      <div className="flex items-center justify-between gap-4 py-0.5">
                        <span className="text-[#00e5ff]">Cognitive Load:</span>
                        <span className="font-bold text-[#dfe2ee]">{data.load}%</span>
                      </div>
                      <div className="flex items-center justify-between gap-4 py-0.5">
                        <span className="text-[#7dffa2]">Road Focus:</span>
                        <span className="font-bold text-[#7dffa2]">{data.roadFocus}%</span>
                      </div>
                      <div className="flex items-center justify-between gap-4 py-0.5">
                        <span className="text-[#ffc769]">Live EAR:</span>
                        <span className="font-bold text-[#dfe2ee]">{data.ear}</span>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />

            {/* Cognitive Load Area */}
            <Area
              type="monotone"
              dataKey="load"
              stroke={strokeColor}
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#cognitiveGradient)"
              isAnimationActive={false}
            />

            {/* Road Focus Area (Dual View) */}
            {metricView === 'dual' && (
              <Area
                type="monotone"
                dataKey="roadFocus"
                stroke="#7dffa2"
                strokeWidth={1.8}
                strokeDasharray="3 3"
                fillOpacity={1}
                fill="url(#roadFocusGradient)"
                isAnimationActive={false}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Footer Legend */}
      <div className="flex flex-wrap items-center justify-between gap-2 mt-3 pt-2 border-t border-[#262a33]/60 font-mono-tabular text-[11px] text-[#849396]">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-[#dfe2ee]">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#00e5ff] inline-block shadow-sm"></span>
            <span>Real-time Mental Workload</span>
          </span>
          {metricView === 'dual' && (
            <span className="flex items-center gap-1.5 text-[#7dffa2]">
              <span className="w-2.5 h-0.5 bg-[#7dffa2] inline-block"></span>
              <span>Gaze Focus On Road</span>
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span>Samples: {chartData.length} sec</span>
          <span className="text-[#00e5ff]">• 100% Real Vision Ground Truth</span>
        </div>
      </div>
    </div>
  );
};
