import React, { useState, useMemo, useCallback } from 'react';
import { motion } from 'motion/react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine
} from 'recharts';
import {
  ProgressLogEntry,
  Language
} from '../types';
import {
  Activity,
  Calendar,
  Layers,
  Ruler,
  Sliders,
  Trash2,
  Edit3,
  ExternalLink,
  Sparkles,
  HeartPulse,
  TrendingDown,
  Info
} from 'lucide-react';

export type ChartMetricMode = 'combined' | 'infection' | 'area' | 'dimensions' | 'granulation' | 'pain';
export type ChartCurveType = 'monotone' | 'natural' | 'linear' | 'basis';

interface HealingProgressChartProps {
  logs: ProgressLogEntry[];
  selectedPointIndex: number | null;
  onSelectPoint: (index: number | null) => void;
  highContrast?: boolean;
  currentLang?: Language;
  onSelectProgressImage?: (imageUrl: string) => void;
  onEditLog?: (log: ProgressLogEntry) => void;
  onDeleteLog?: (id: string, e?: React.MouseEvent) => void;
}

// Ramanujan Ellipse Perimeter Approximation
const calculatePerimeterCm = (lengthCm: number, widthCm: number): number => {
  if (lengthCm <= 0 || widthCm <= 0) return 0;
  const a = lengthCm / 2;
  const b = widthCm / 2;
  const h = Math.pow(a - b, 2) / Math.max(0.0001, Math.pow(a + b, 2));
  const perimeter = Math.PI * (a + b) * (1 + (3 * h) / (10 + Math.sqrt(Math.max(0.0001, 4 - 3 * h))));
  return Math.round(perimeter * 100) / 100;
};

// Clinical PUSH (Pressure Ulcer Scale for Healing) Tool Index (0-17)
const calculatePushScore = (areaCm2: number, severity: string = 'Moderate', granulationPct: number = 50): number => {
  let areaScore = 0;
  if (areaCm2 === 0) areaScore = 0;
  else if (areaCm2 < 0.3) areaScore = 1;
  else if (areaCm2 <= 0.6) areaScore = 2;
  else if (areaCm2 <= 1.0) areaScore = 3;
  else if (areaCm2 <= 2.0) areaScore = 4;
  else if (areaCm2 <= 3.0) areaScore = 5;
  else if (areaCm2 <= 4.0) areaScore = 6;
  else if (areaCm2 <= 8.0) areaScore = 7;
  else if (areaCm2 <= 12.0) areaScore = 8;
  else if (areaCm2 <= 24.0) areaScore = 9;
  else areaScore = 10;

  const exudateScore = severity === 'Severe' ? 3 : severity === 'Moderate' ? 2 : areaCm2 > 0 ? 1 : 0;
  const tissueScore = granulationPct >= 80 ? 1 : granulationPct >= 40 ? 2 : severity === 'Severe' ? 3 : 2;

  return areaScore + exudateScore + tissueScore;
};

export const HealingProgressChart: React.FC<HealingProgressChartProps> = React.memo(({
  logs,
  selectedPointIndex,
  onSelectPoint,
  highContrast = false,
  currentLang = 'en',
  onSelectProgressImage,
  onEditLog,
  onDeleteLog
}) => {
  const [metricMode, setMetricMode] = useState<ChartMetricMode>('combined');
  const [curveType, setCurveType] = useState<ChartCurveType>('monotone');

  // Format data directly and accurately from each logged checkpoint's actual recorded values
  const chartData = useMemo(() => {
    if (!logs || logs.length === 0) return [];

    // Sort chronologically by date and dayNumber so the series scales cleanly and monotonically
    const sorted = [...logs].sort((a, b) => {
      const timeA = new Date(a.date).getTime() || 0;
      const timeB = new Date(b.date).getTime() || 0;
      if (timeA !== timeB) return timeA - timeB;
      return ((a.dayNumber || 0) - (b.dayNumber || 0)) || (a.id || '').localeCompare(b.id || '');
    });

    return sorted.map((log, index) => {
      const length = typeof log.lengthCm === 'number' ? log.lengthCm : parseFloat(String(log.lengthCm || 0)) || 0;
      const width = typeof log.widthCm === 'number' ? log.widthCm : parseFloat(String(log.widthCm || 0)) || 0;
      
      // Pull recorded area directly without rounding drift, fallback to elliptical area if not recorded
      let calcArea: number;
      if (log.areaCm2 !== undefined && log.areaCm2 !== null && !isNaN(Number(log.areaCm2))) {
        calcArea = Math.round(Number(log.areaCm2) * 100) / 100;
      } else {
        calcArea = Math.round((length * width * 0.7854) * 100) / 100;
      }

      const perimeterCm = calculatePerimeterCm(length, width);
      const prevLog = index > 0 ? sorted[index - 1] : null;
      const prevLength = prevLog ? (typeof prevLog.lengthCm === 'number' ? prevLog.lengthCm : parseFloat(String(prevLog.lengthCm || 0)) || 0) : length;
      const prevWidth = prevLog ? (typeof prevLog.widthCm === 'number' ? prevLog.widthCm : parseFloat(String(prevLog.widthCm || 0)) || 0) : width;
      const prevArea = prevLog
        ? (prevLog.areaCm2 !== undefined && prevLog.areaCm2 !== null && !isNaN(Number(prevLog.areaCm2))
            ? Number(prevLog.areaCm2)
            : Number((prevLength * prevWidth * 0.7854).toFixed(2)))
        : calcArea;
      const prevPerimeter = prevLog ? calculatePerimeterCm(prevLength, prevWidth) : perimeterCm;

      const dayNum = log.dayNumber !== undefined && log.dayNumber !== null ? log.dayNumber : (index + 1);
      const prevDay = prevLog ? (prevLog.dayNumber !== undefined && prevLog.dayNumber !== null ? prevLog.dayNumber : index) : (dayNum - 1);
      const deltaDays = Math.max(1, dayNum - prevDay);

      // Gilman Linear Advance Velocity: Delta Area / (Mean Perimeter * Delta Time) in cm/day
      const meanPerimeter = Math.max(0.1, (perimeterCm + prevPerimeter) / 2);
      const areaDelta = prevArea - calcArea;
      const gilmanVelocity = index > 0 && areaDelta > 0
        ? parseFloat((areaDelta / (meanPerimeter * deltaDays)).toFixed(3))
        : 0;

      const dailyAreaRate = index > 0 ? parseFloat((areaDelta / deltaDays).toFixed(2)) : 0;
      const percentContraction = prevArea > 0 ? Math.round(((prevArea - calcArea) / prevArea) * 100) : 0;

      // Exact recorded values
      const risk = typeof log.infectionRiskScore === 'number' ? log.infectionRiskScore : parseInt(String(log.infectionRiskScore || 0), 10);
      const granulation = log.granulationPercent !== undefined && log.granulationPercent !== null
        ? Number(log.granulationPercent)
        : Math.max(10, 100 - risk);
      const pushScore = calculatePushScore(calcArea, log.severity || 'Moderate', granulation);

      // Dynamic Day and real Date labels
      const formattedDate = log.date ? (log.date.length > 10 ? log.date.slice(0, 10) : log.date) : new Date().toISOString().split('T')[0];
      const dayLabel = `Day ${dayNum} (${formattedDate.slice(5)})`;

      return {
        id: log.id || `log-${index}-${Date.now()}`,
        rawLog: log,
        index,
        date: formattedDate,
        dayNumber: dayNum,
        dayLabel,
        shortDate: formattedDate.slice(5),
        infectionRiskScore: risk,
        surfaceAreaCm2: calcArea,
        lengthCm: length,
        widthCm: width,
        perimeterCm,
        gilmanVelocity,
        dailyAreaRate,
        percentContraction,
        pushScore,
        granulationPercent: granulation,
        painLevel: Number(log.painLevel ?? 3),
        comparisonStatus: log.comparisonStatus || (index === 0 ? 'Stable' : (calcArea < prevArea || risk < (prevLog?.infectionRiskScore || risk)) ? 'Healing' : 'Stable'),
        comparisonNotes: log.comparisonNotes || '',
        imageUrl: log.imageUrl,
        severity: log.severity || 'Minor',
        woundType: log.woundType || 'General Wound',
        patientName: log.patientName || 'Patient'
      };
    });
  }, [logs]);

  // Calculate dynamic axis domains tailored to the real min/max of active data
  const axisDomains = useMemo(() => {
    if (chartData.length === 0) {
      return {
        leftDomain: [0, 100] as [number, number],
        rightDomain: [0, 10] as [number, number],
        maxArea: 10,
        maxDim: 10,
        maxRisk: 100,
        maxGran: 100
      };
    }

    const areas = chartData.map(d => d.surfaceAreaCm2).filter(v => typeof v === 'number' && !isNaN(v));
    const lengths = chartData.map(d => d.lengthCm).filter(v => typeof v === 'number' && !isNaN(v));
    const widths = chartData.map(d => d.widthCm).filter(v => typeof v === 'number' && !isNaN(v));
    const risks = chartData.map(d => d.infectionRiskScore).filter(v => typeof v === 'number' && !isNaN(v));
    const grans = chartData.map(d => d.granulationPercent).filter(v => typeof v === 'number' && !isNaN(v));

    const maxArea = areas.length > 0 ? Math.max(...areas) : 5;
    const minArea = areas.length > 0 ? Math.min(...areas) : 0;
    const maxDim = Math.max(...lengths, ...widths, 1);
    const maxRisk = risks.length > 0 ? Math.max(...risks) : 50;
    const minRisk = risks.length > 0 ? Math.min(...risks) : 0;
    const maxGran = grans.length > 0 ? Math.max(...grans) : 80;

    // Right Axis Domain for Area (cm²)
    // Scale dynamically with comfortable upper headroom so 0.5 cm² isn't squished and 45 cm² fits gracefully
    const rightMax = Math.max(0.5, Math.ceil(maxArea * 1.25 * 10) / 10);
    const rightDomain: [number, number] = [0, rightMax];

    // Left Axis Domain depends on metric mode
    let leftDomain: [number, number] = [0, 100];
    if (metricMode === 'dimensions') {
      const dimMax = Math.max(2, Math.ceil(maxDim * 1.3 * 10) / 10);
      leftDomain = [0, dimMax];
    } else if (metricMode === 'area') {
      leftDomain = [0, rightMax];
    } else if (metricMode === 'pain') {
      leftDomain = [0, 10];
    } else if (metricMode === 'infection') {
      // Focus scale for infection risk
      leftDomain = [0, Math.min(100, Math.max(30, Math.ceil(maxRisk * 1.15)))];
    } else {
      // Combined / Granulation (standard 0-100% scale)
      leftDomain = [0, 100];
    }

    return {
      leftDomain,
      rightDomain,
      maxArea,
      maxDim,
      maxRisk,
      maxGran
    };
  }, [chartData, metricMode]);

  // Selected point object
  const selectedPoint = useMemo(() => {
    if (selectedPointIndex === null || selectedPointIndex < 0 || selectedPointIndex >= chartData.length) {
      return null;
    }
    return chartData[selectedPointIndex];
  }, [chartData, selectedPointIndex]);

  // Custom Chart Tooltip
  const CustomChartTooltip = useCallback(({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white/95 backdrop-blur-md p-3.5 rounded-2xl border border-[#e2dfd5] shadow-xl text-[#2c2c2c] max-w-xs space-y-2.5 z-50 text-xs">
          <div className="flex items-center justify-between border-b border-[#f0ede4] pb-1.5">
            <span className="font-serif font-bold text-[#5A5A40] flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#5A5A40]" />
              <span>{data.dayLabel}</span>
            </span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
              data.comparisonStatus?.includes('Healing') || data.comparisonStatus?.includes('Closure')
                ? 'bg-emerald-100 text-emerald-800'
                : data.comparisonStatus?.includes('Worsening')
                ? 'bg-red-100 text-red-800'
                : 'bg-amber-100 text-amber-800'
            }`}>
              {data.comparisonStatus}
            </span>
          </div>

          {/* Photo Preview on Hover */}
          {data.imageUrl && (
            <div className="relative h-20 w-full rounded-lg overflow-hidden bg-[#f0ede4] border border-[#e2dfd5]">
              <img
                src={data.imageUrl}
                alt="Wound Point"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-1 right-1 bg-black/75 text-white text-[9px] px-1.5 py-0.2 rounded font-mono">
                {data.lengthCm}x{data.widthCm} cm ({data.surfaceAreaCm2} cm²)
              </div>
            </div>
          )}

          {/* Primary Metric Grid */}
          <div className="grid grid-cols-2 gap-1.5 text-[11px] pt-0.5">
            <div className="bg-[#fdfcf8] p-1.5 rounded-lg border border-[#e2dfd5]">
              <span className="text-[#8e8b82] block text-[10px]">Infection Risk</span>
              <strong className={`font-mono text-xs ${data.infectionRiskScore > 50 ? 'text-red-600' : 'text-emerald-700'}`}>
                {data.infectionRiskScore}%
              </strong>
            </div>
            <div className="bg-[#fdfcf8] p-1.5 rounded-lg border border-[#e2dfd5]">
              <span className="text-[#8e8b82] block text-[10px]">Surface Area</span>
              <strong className="font-mono text-xs text-indigo-700">
                {data.surfaceAreaCm2} cm²
              </strong>
            </div>
            <div className="bg-[#fdfcf8] p-1.5 rounded-lg border border-[#e2dfd5]">
              <span className="text-[#8e8b82] block text-[10px]">Granulation Bed</span>
              <strong className="font-mono text-xs text-emerald-600">
                {data.granulationPercent}%
              </strong>
            </div>
            <div className="bg-[#fdfcf8] p-1.5 rounded-lg border border-[#e2dfd5]">
              <span className="text-[#8e8b82] block text-[10px]">Dimensions</span>
              <strong className="font-mono text-xs text-cyan-700">
                {data.lengthCm} × {data.widthCm} cm
              </strong>
            </div>
          </div>

          {/* Advanced Telemetry Sub-Row */}
          <div className="grid grid-cols-2 gap-1.5 text-[10px] text-[#525252] bg-[#f8f7f4] p-1.5 rounded-lg border border-[#e8e5dc]">
            <div>
              <span className="text-[#8e8b82] block">Gilman Rate:</span>
              <span className="font-mono font-semibold text-[#2c2c2c]">{data.gilmanVelocity} cm/d</span>
            </div>
            <div>
              <span className="text-[#8e8b82] block">PUSH Score:</span>
              <span className="font-mono font-semibold text-[#2c2c2c]">{data.pushScore}/17</span>
            </div>
          </div>

          {data.comparisonNotes && (
            <p className="text-[10px] text-[#8e8b82] italic line-clamp-2 border-t border-[#f0ede4] pt-1">
              "{data.comparisonNotes}"
            </p>
          )}
        </div>
      );
    }
    return null;
  }, []);

  return (
    <div className="p-5 rounded-3xl bg-[#fdfcf8] border border-[#e2dfd5] shadow-xs space-y-4">
      {/* Chart Header & Controls */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 pb-3 border-b border-[#e2dfd5]">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#5A5A40]" />
            <h3 className="text-sm font-serif font-bold text-[#5A5A40]">
              Healing Progress Trajectory Chart
            </h3>
          </div>
          <p className="text-[11px] text-[#8e8b82]">
            Real-time multi-checkpoint plot with auto-scaled dual axes ({chartData.length} checkpoints recorded)
          </p>
        </div>

        {/* Metric Selector Pills & Curve Type Controls */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] text-[#8e8b82] font-semibold mr-1">Display Metric:</span>

          <button
            type="button"
            onClick={() => setMetricMode('combined')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition cursor-pointer ${
              metricMode === 'combined'
                ? 'bg-[#5A5A40] text-white font-bold shadow-2xs'
                : 'bg-white text-[#525252] border border-[#e2dfd5] hover:bg-[#f0ede4]'
            }`}
          >
            Multi-Metric (Dual Axis)
          </button>

          <button
            type="button"
            onClick={() => setMetricMode('infection')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition cursor-pointer flex items-center gap-1 ${
              metricMode === 'infection'
                ? 'bg-red-600 text-white font-bold shadow-2xs'
                : 'bg-white text-[#525252] border border-[#e2dfd5] hover:bg-[#f0ede4]'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-red-500"></span>
            Infection Risk %
          </button>

          <button
            type="button"
            onClick={() => setMetricMode('area')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition cursor-pointer flex items-center gap-1 ${
              metricMode === 'area'
                ? 'bg-indigo-700 text-white font-bold shadow-2xs'
                : 'bg-white text-[#525252] border border-[#e2dfd5] hover:bg-[#f0ede4]'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
            Surface Area (cm²)
          </button>

          <button
            type="button"
            onClick={() => setMetricMode('dimensions')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition cursor-pointer flex items-center gap-1 ${
              metricMode === 'dimensions'
                ? 'bg-cyan-700 text-white font-bold shadow-2xs'
                : 'bg-white text-[#525252] border border-[#e2dfd5] hover:bg-[#f0ede4]'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-cyan-500"></span>
            Dimensions (L × W cm)
          </button>

          <button
            type="button"
            onClick={() => setMetricMode('granulation')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition cursor-pointer flex items-center gap-1 ${
              metricMode === 'granulation'
                ? 'bg-emerald-700 text-white font-bold shadow-2xs'
                : 'bg-white text-[#525252] border border-[#e2dfd5] hover:bg-[#f0ede4]'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Granulation %
          </button>

          <button
            type="button"
            onClick={() => setMetricMode('pain')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition cursor-pointer flex items-center gap-1 ${
              metricMode === 'pain'
                ? 'bg-amber-600 text-white font-bold shadow-2xs'
                : 'bg-white text-[#525252] border border-[#e2dfd5] hover:bg-[#f0ede4]'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            Pain (1-10)
          </button>
        </div>
      </div>

      {/* Curve Interpolation Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-xs">
        <div className="flex items-center gap-1.5 text-[#5A5A40] font-semibold text-[11px]">
          <Sliders className="w-3.5 h-3.5" />
          <span>Curve Smoothing:</span>
          {(['monotone', 'natural', 'linear', 'basis'] as ChartCurveType[]).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCurveType(c)}
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold transition capitalize cursor-pointer ${
                curveType === c
                  ? 'bg-[#5A5A40] text-white shadow-xs'
                  : 'bg-white text-[#525252] border border-[#e2dfd5] hover:bg-[#f0ede4]'
              }`}
            >
              {c === 'monotone' ? '📐 Monotone' : c === 'natural' ? '🌿 Natural' : c === 'linear' ? '⚡ Linear' : '〰️ Basis'}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 text-[10px] text-[#8e8b82] font-mono">
          <span>Dual-Axis Auto Scale: Active</span>
          <span>Max Area: {axisDomains.maxArea} cm²</span>
        </div>
      </div>

      {/* Recharts Render Stage */}
      {chartData.length === 0 ? (
        <div className="h-64 flex flex-col items-center justify-center text-center p-6 bg-white rounded-2xl border border-dashed border-[#e2dfd5]">
          <Activity className="w-8 h-8 text-[#8e8b82] mb-2" />
          <p className="text-sm font-serif font-bold text-[#5A5A40]">No Checkpoint Logs Recorded</p>
          <p className="text-xs text-[#8e8b82] max-w-xs mt-1">
            Log a new daily checkpoint or apply a preset to plot the real-time healing trajectory.
          </p>
        </div>
      ) : (
        <div className="w-full h-84 pt-2 pb-1">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={chartData}
              margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
              onClick={(e: any) => {
                if (e && e.activeTooltipIndex !== undefined && e.activeTooltipIndex !== null) {
                  onSelectPoint(e.activeTooltipIndex);
                }
              }}
            >
              <defs>
                <linearGradient id="hpAreaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4338ca" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#4338ca" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="hpInfectionGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#dc2626" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#dc2626" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="hpGranulationGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#059669" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#059669" stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#e2dfd5" vertical={false} />

              <XAxis
                dataKey="dayLabel"
                stroke="#8e8b82"
                tick={{ fontSize: 11, fill: '#525252' }}
                tickLine={{ stroke: '#e2dfd5' }}
                interval={chartData.length > 12 ? 'preserveStartEnd' : 0}
              />

              {/* Left Y-Axis: Scaled dynamically based on active metric mode */}
              <YAxis
                yAxisId="left"
                stroke="#8e8b82"
                domain={axisDomains.leftDomain}
                tick={{ fontSize: 11, fill: '#525252' }}
                tickFormatter={(val) => {
                  if (metricMode === 'dimensions') return `${val} cm`;
                  if (metricMode === 'area') return `${val} cm²`;
                  if (metricMode === 'pain') return `${val}/10`;
                  return `${val}%`;
                }}
                tickLine={{ stroke: '#e2dfd5' }}
              />

              {/* Right Y-Axis: Dynamic scale for Area (cm²) during combined/dual-axis mode */}
              {(metricMode === 'combined') && (
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  stroke="#4338ca"
                  domain={axisDomains.rightDomain}
                  tick={{ fontSize: 11, fill: '#4338ca' }}
                  tickFormatter={(val) => `${val} cm²`}
                  tickLine={{ stroke: '#e2dfd5' }}
                />
              )}

              <Tooltip content={<CustomChartTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                iconType="circle"
              />

              {/* Clinical Reference Threshold Lines */}
              {(metricMode === 'combined' || metricMode === 'infection') && (
                <ReferenceLine
                  yAxisId="left"
                  y={65}
                  stroke="#dc2626"
                  strokeDasharray="4 4"
                  label={{ value: 'High Risk Alert (>65%)', fill: '#dc2626', fontSize: 10, position: 'insideTopLeft' }}
                />
              )}

              {(metricMode === 'combined' || metricMode === 'granulation') && (
                <ReferenceLine
                  yAxisId="left"
                  y={80}
                  stroke="#059669"
                  strokeDasharray="3 3"
                  label={{ value: 'Target Granulation (≥80%)', fill: '#059669', fontSize: 10, position: 'insideBottomLeft' }}
                />
              )}

              {/* Plotted Curves with smooth animated transitions and non-distorting easing */}
              {(metricMode === 'combined' || metricMode === 'infection') && (
                <Area
                  yAxisId="left"
                  type={curveType}
                  dataKey="infectionRiskScore"
                  name="Infection Risk Score (%)"
                  stroke="#dc2626"
                  strokeWidth={3}
                  fill="url(#hpInfectionGradient)"
                  isAnimationActive={true}
                  animationDuration={450}
                  animationEasing="ease-out"
                  dot={{ r: 5, fill: '#dc2626', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 8, stroke: '#dc2626', strokeWidth: 2, fill: '#fff' }}
                />
              )}

              {(metricMode === 'combined' || metricMode === 'area') && (
                <Area
                  yAxisId={metricMode === 'area' ? 'left' : 'right'}
                  type={curveType}
                  dataKey="surfaceAreaCm2"
                  name="Wound Surface Area (cm²)"
                  stroke="#4338ca"
                  strokeWidth={3}
                  fill="url(#hpAreaGradient)"
                  isAnimationActive={true}
                  animationDuration={450}
                  animationEasing="ease-out"
                  dot={{ r: 5, fill: '#4338ca', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 8, stroke: '#4338ca', strokeWidth: 2, fill: '#fff' }}
                />
              )}

              {(metricMode === 'combined' || metricMode === 'granulation') && (
                <Line
                  yAxisId="left"
                  type={curveType}
                  dataKey="granulationPercent"
                  name="Granulation Bed (%)"
                  stroke="#059669"
                  strokeWidth={2.5}
                  strokeDasharray={metricMode === 'combined' ? '4 2' : undefined}
                  isAnimationActive={true}
                  animationDuration={450}
                  animationEasing="ease-out"
                  dot={{ r: 4, fill: '#059669', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 7, stroke: '#059669', strokeWidth: 2, fill: '#fff' }}
                />
              )}

              {metricMode === 'dimensions' && (
                <>
                  <Line
                    yAxisId="left"
                    type={curveType}
                    dataKey="lengthCm"
                    name="Wound Length (cm)"
                    stroke="#0284c7"
                    strokeWidth={3}
                    isAnimationActive={true}
                    animationDuration={450}
                    animationEasing="ease-out"
                    dot={{ r: 5, fill: '#0284c7', strokeWidth: 2, stroke: '#fff' }}
                    activeDot={{ r: 8, stroke: '#0284c7', strokeWidth: 2, fill: '#fff' }}
                  />
                  <Line
                    yAxisId="left"
                    type={curveType}
                    dataKey="widthCm"
                    name="Wound Width (cm)"
                    stroke="#0d9488"
                    strokeWidth={3}
                    isAnimationActive={true}
                    animationDuration={450}
                    animationEasing="ease-out"
                    dot={{ r: 5, fill: '#0d9488', strokeWidth: 2, stroke: '#fff' }}
                    activeDot={{ r: 8, stroke: '#0d9488', strokeWidth: 2, fill: '#fff' }}
                  />
                </>
              )}

              {metricMode === 'pain' && (
                <Line
                  yAxisId="left"
                  type={curveType}
                  dataKey="painLevel"
                  name="Subjective Pain VAS (1-10)"
                  stroke="#d97706"
                  strokeWidth={3}
                  isAnimationActive={true}
                  animationDuration={450}
                  animationEasing="ease-out"
                  dot={{ r: 5, fill: '#d97706', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 8, stroke: '#d97706', strokeWidth: 2, fill: '#fff' }}
                />
              )}

            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Selected Data Point Inspector Box with Live Edit / Delete */}
      {selectedPoint && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-2xl bg-white border border-[#e2dfd5] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-2xs"
        >
          <div className="flex items-center gap-3">
            <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-[#f0ede4] shrink-0 border border-[#e2dfd5]">
              <img
                src={selectedPoint.imageUrl}
                alt={selectedPoint.dayLabel}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover cursor-pointer hover:scale-105 transition"
                onClick={() => onSelectProgressImage && onSelectProgressImage(selectedPoint.imageUrl)}
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif font-bold text-sm text-[#2c2c2c]">
                  {selectedPoint.dayLabel} • {selectedPoint.woundType}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  selectedPoint.comparisonStatus === 'Healing'
                    ? 'bg-emerald-100 text-emerald-800'
                    : selectedPoint.comparisonStatus === 'Worsening'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {selectedPoint.comparisonStatus}
                </span>
              </div>
              <p className="text-xs text-[#8e8b82] mt-0.5 line-clamp-1">
                {selectedPoint.comparisonNotes || 'Recorded clinical checkpoint.'}
              </p>
              <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono mt-1 text-[#525252]">
                <span className="bg-[#f5f7f2] px-2 py-0.5 rounded border border-[#d8e0d0]">
                  📏 {selectedPoint.lengthCm} × {selectedPoint.widthCm} cm ({selectedPoint.surfaceAreaCm2} cm²)
                </span>
                <span className="bg-red-50 text-red-700 px-2 py-0.5 rounded border border-red-200 font-bold">
                  🦠 Risk: {selectedPoint.infectionRiskScore}%
                </span>
                <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200 font-bold">
                  🌱 Granulation: {selectedPoint.granulationPercent}%
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
            {onEditLog && (
              <button
                type="button"
                onClick={() => onEditLog(selectedPoint.rawLog)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#f5f7f2] text-[#5A5A40] border border-[#d8e0d0] hover:bg-[#e8ede3] transition text-xs font-semibold cursor-pointer"
                title="Edit this checkpoint's data"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>
            )}
            {onDeleteLog && (
              <button
                type="button"
                onClick={(e) => onDeleteLog(selectedPoint.id, e)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 text-red-700 border border-red-200 hover:bg-red-600 hover:text-white transition text-xs font-medium cursor-pointer"
                title="Delete this checkpoint"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
});

HealingProgressChart.displayName = 'HealingProgressChart';
