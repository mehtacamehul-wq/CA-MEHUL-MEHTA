import React, { useState } from 'react';
import { Stock } from '../types/equity';
import { BarChart3, TrendingUp, Maximize2, Eye, EyeOff, Target, ShieldAlert, CheckCircle2, Edit3, Square, ArrowUpRight, Type, Trash2 } from 'lucide-react';

export interface ChartTradeLevels {
  entryPrice: number;
  stopLoss: number;
  target1: number;
  target2?: number;
  action: 'BUY' | 'SELL' | 'ACCUMULATE' | 'NEUTRAL';
  rationale?: string;
}

export interface ChartAnnotation {
  id: string;
  type: 'RECTANGLE' | 'TRENDLINE' | 'TEXT_NOTE';
  x: number;
  y: number;
  x2?: number;
  y2?: number;
  text?: string;
  price?: number;
}

interface InteractiveChartProps {
  stock: Stock;
  tradeLevels?: ChartTradeLevels | null;
  onClearTradeLevels?: () => void;
}

export const InteractiveChart: React.FC<InteractiveChartProps> = ({
  stock,
  tradeLevels,
  onClearTradeLevels,
}) => {
  const [timeframe, setTimeframe] = useState<'1D' | '1W' | '1M' | '1Y'>('1D');
  const [showVwap, setShowVwap] = useState(true);
  const [showDma, setShowDma] = useState(true);
  const [showAiLevels, setShowAiLevels] = useState(true);
  const [hoveredCandle, setHoveredCandle] = useState<Stock['candles'][0] | null>(null);

  // Drawing Tools State
  const [drawingTool, setDrawingTool] = useState<'NONE' | 'RECTANGLE' | 'TRENDLINE' | 'TEXT_NOTE'>('NONE');
  const [annotations, setAnnotations] = useState<ChartAnnotation[]>([
    { id: 'ann-1', type: 'TEXT_NOTE', x: 200, y: 80, text: 'Strong Volume Accumulation Zone', price: stock.price * 1.01 },
    { id: 'ann-2', type: 'RECTANGLE', x: 100, y: 120, x2: 450, y2: 150, text: 'Support Base' },
  ]);
  const [activeNoteInput, setActiveNoteInput] = useState<{ x: number; y: number; price: number } | null>(null);
  const [customNoteText, setCustomNoteText] = useState('');

  const candles = stock.candles;

  // Find min and max price across candles and include trade levels if provided
  const prices = candles.flatMap((c) => [c.low, c.high]);
  if (tradeLevels) {
    prices.push(tradeLevels.entryPrice, tradeLevels.stopLoss, tradeLevels.target1);
    if (tradeLevels.target2) prices.push(tradeLevels.target2);
  }

  const minPrice = Math.min(...prices, stock.dma200 || Infinity, stock.vwap) * 0.995;
  const maxPrice = Math.max(...prices, stock.vwap) * 1.005;
  const priceRange = maxPrice - minPrice || 1;

  // Max volume for volume sub-chart
  const maxVol = Math.max(...candles.map((c) => c.volume), 1);

  const svgWidth = 800;
  const svgHeight = 280;
  const priceChartHeight = 200;
  const volumeChartHeight = 70;

  const candleWidth = Math.max(12, Math.floor((svgWidth - 60) / candles.length) - 10);

  const getY = (val: number) => {
    return priceChartHeight - ((val - minPrice) / priceRange) * (priceChartHeight - 20) - 10;
  };

  const getPriceFromY = (yVal: number) => {
    const raw = minPrice + ((priceChartHeight - 10 - yVal) / (priceChartHeight - 20)) * priceRange;
    return Number(raw.toFixed(1));
  };

  const getVolY = (vol: number) => {
    const barH = (vol / maxVol) * (volumeChartHeight - 10);
    return svgHeight - barH;
  };

  const handleSvgClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (drawingTool === 'NONE') return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / rect.width) * svgWidth;
    const clickY = ((e.clientY - rect.top) / rect.height) * svgHeight;
    const clickPrice = getPriceFromY(clickY);

    if (drawingTool === 'TEXT_NOTE') {
      setActiveNoteInput({ x: clickX, y: clickY, price: clickPrice });
      setCustomNoteText('');
    } else if (drawingTool === 'RECTANGLE') {
      setAnnotations((prev) => [
        ...prev,
        {
          id: `ann-${Date.now()}`,
          type: 'RECTANGLE',
          x: Math.max(20, clickX - 80),
          y: Math.max(20, clickY - 20),
          x2: Math.min(svgWidth - 20, clickX + 80),
          y2: Math.min(priceChartHeight, clickY + 20),
          text: `Zone @ ₹${clickPrice}`,
        },
      ]);
      setDrawingTool('NONE');
    } else if (drawingTool === 'TRENDLINE') {
      setAnnotations((prev) => [
        ...prev,
        {
          id: `ann-${Date.now()}`,
          type: 'TRENDLINE',
          x: Math.max(20, clickX - 100),
          y: clickY + 30,
          x2: Math.min(svgWidth - 20, clickX + 100),
          y2: clickY - 30,
          text: `Trendline @ ₹${clickPrice}`,
        },
      ]);
      setDrawingTool('NONE');
    }
  };

  const handleSaveTextNote = () => {
    if (!activeNoteInput || !customNoteText.trim()) return;
    setAnnotations((prev) => [
      ...prev,
      {
        id: `ann-${Date.now()}`,
        type: 'TEXT_NOTE',
        x: activeNoteInput.x,
        y: activeNoteInput.y,
        text: customNoteText.trim(),
        price: activeNoteInput.price,
      },
    ]);
    setActiveNoteInput(null);
    setCustomNoteText('');
    setDrawingTool('NONE');
  };

  const activeCandle = hoveredCandle || candles[candles.length - 1];

  return (
    <div className="bg-[#0b101c] border border-slate-800/80 rounded-xl p-4.5 space-y-3">
      {/* Chart Top Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800/60 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded bg-cyan-950/80 border border-cyan-800/50 text-cyan-400">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide">
              Volume-Weighted Price Action & Technical Drawing Layer
            </h3>
            <div className="text-[11px] font-mono text-slate-400 flex items-center gap-3">
              <span>
                O: <span className="text-slate-200">₹{activeCandle?.open.toFixed(1)}</span>
              </span>
              <span>
                H: <span className="text-slate-200">₹{activeCandle?.high.toFixed(1)}</span>
              </span>
              <span>
                L: <span className="text-slate-200">₹{activeCandle?.low.toFixed(1)}</span>
              </span>
              <span>
                C: <span className="text-slate-200">₹{activeCandle?.close.toFixed(1)}</span>
              </span>
              <span>
                Vol: <span className="text-cyan-400">{(activeCandle?.volume / 1000).toFixed(0)}k</span>
              </span>
            </div>
          </div>
        </div>

        {/* Timeframe & Overlays & Drawing Tools */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowVwap(!showVwap)}
            className={`px-2 py-1 rounded text-[10px] font-mono border transition-colors ${
              showVwap
                ? 'bg-amber-950/60 border-amber-600/50 text-amber-300'
                : 'bg-slate-900 border-slate-800 text-slate-500'
            }`}
          >
            VWAP (₹{stock.vwap.toFixed(1)})
          </button>

          <button
            onClick={() => setShowDma(!showDma)}
            className={`px-2 py-1 rounded text-[10px] font-mono border transition-colors ${
              showDma
                ? 'bg-blue-950/60 border-blue-600/50 text-blue-300'
                : 'bg-slate-900 border-slate-800 text-slate-500'
            }`}
          >
            200-DMA (₹{stock.dma200.toFixed(0)})
          </button>

          {/* AI Entry/Exit Levels Toggle Button */}
          {tradeLevels && (
            <button
              onClick={() => setShowAiLevels(!showAiLevels)}
              className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold border transition-colors flex items-center gap-1.5 ${
                showAiLevels
                  ? 'bg-amber-950/70 border-amber-500/70 text-amber-300 shadow-sm'
                  : 'bg-slate-900 border-slate-800 text-slate-500'
              }`}
            >
              <Target className="w-3 h-3 text-amber-400" />
              <span>AI Levels: {tradeLevels.action}</span>
            </button>
          )}

          <div className="flex items-center p-0.5 rounded bg-[#090d16] border border-slate-800 text-xs">
            {(['1D', '1W', '1M', '1Y'] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-2 py-0.5 rounded font-mono text-[11px] ${
                  timeframe === tf
                    ? 'bg-cyan-600 text-black font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Drawing Tools Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-[#070b13] px-3 py-2 rounded-lg border border-slate-800 font-mono text-xs">
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-400 font-bold flex items-center gap-1">
            <Edit3 className="w-3.5 h-3.5 text-cyan-400" />
            <span>Technical Drawing Layer:</span>
          </span>

          <button
            onClick={() => setDrawingTool(drawingTool === 'RECTANGLE' ? 'NONE' : 'RECTANGLE')}
            className={`px-2.5 py-1 rounded border flex items-center gap-1.5 transition-all ${
              drawingTool === 'RECTANGLE'
                ? 'bg-cyan-950 border-cyan-500 text-cyan-300 font-bold'
                : 'bg-[#05080f] border-slate-700 text-slate-300 hover:text-white'
            }`}
          >
            <Square className="w-3 h-3 text-cyan-400" />
            <span>Zone Box</span>
          </button>

          <button
            onClick={() => setDrawingTool(drawingTool === 'TRENDLINE' ? 'NONE' : 'TRENDLINE')}
            className={`px-2.5 py-1 rounded border flex items-center gap-1.5 transition-all ${
              drawingTool === 'TRENDLINE'
                ? 'bg-amber-950 border-amber-500 text-amber-300 font-bold'
                : 'bg-[#05080f] border-slate-700 text-slate-300 hover:text-white'
            }`}
          >
            <ArrowUpRight className="w-3 h-3 text-amber-400" />
            <span>Trendline</span>
          </button>

          <button
            onClick={() => setDrawingTool(drawingTool === 'TEXT_NOTE' ? 'NONE' : 'TEXT_NOTE')}
            className={`px-2.5 py-1 rounded border flex items-center gap-1.5 transition-all ${
              drawingTool === 'TEXT_NOTE'
                ? 'bg-emerald-950 border-emerald-500 text-emerald-300 font-bold'
                : 'bg-[#05080f] border-slate-700 text-slate-300 hover:text-white'
            }`}
          >
            <Type className="w-3 h-3 text-emerald-400" />
            <span>Text Note</span>
          </button>

          {drawingTool !== 'NONE' && (
            <span className="text-[10px] text-amber-400 animate-pulse font-bold">
              👉 Click anywhere on chart canvas to place {drawingTool.toLowerCase().replace('_', ' ')}!
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[10px] text-slate-400">{annotations.length} Annotations Active</span>
          {annotations.length > 0 && (
            <button
              onClick={() => setAnnotations([])}
              className="text-[11px] text-rose-400 hover:underline flex items-center gap-1"
            >
              <Trash2 className="w-3 h-3" />
              <span>Clear Drawings</span>
            </button>
          )}
        </div>
      </div>

      {/* Text Note Input Modal Overlay */}
      {activeNoteInput && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#0b101c] border border-cyan-500/60 rounded-xl p-5 max-w-md w-full space-y-4 shadow-2xl font-mono">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="text-xs font-bold text-white flex items-center gap-2">
                <Type className="w-4 h-4 text-emerald-400" />
                <span>Add Technical Documentation Note</span>
              </h4>
              <span className="text-[10px] text-slate-400">Price Level: ₹{activeNoteInput.price}</span>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-slate-300 font-sans">Enter Note / Observation:</label>
              <input
                type="text"
                value={customNoteText}
                onChange={(e) => setCustomNoteText(e.target.value)}
                placeholder="e.g. Breakout retest expected here, stop-loss protected..."
                className="w-full px-3 py-2 text-xs rounded-lg bg-[#05080f] border border-slate-700 text-white focus:outline-none focus:border-cyan-500 font-mono"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveTextNote();
                }}
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setActiveNoteInput(null)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveTextNote}
                className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-black text-xs font-bold shadow-md"
              >
                Place Note on Chart
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SVG Canvas */}
      <div className="relative w-full overflow-x-auto bg-[#070b12] rounded-lg p-2 border border-slate-900">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className={`w-full h-auto min-w-[650px] select-none ${drawingTool !== 'NONE' ? 'cursor-crosshair' : ''}`}
          onClick={handleSvgClick}
        >
          {/* Grid lines */}
          <line x1="30" y1={priceChartHeight * 0.25} x2={svgWidth - 20} y2={priceChartHeight * 0.25} stroke="#1e293b" strokeDasharray="3 3" opacity="0.4" />
          <line x1="30" y1={priceChartHeight * 0.5} x2={svgWidth - 20} y2={priceChartHeight * 0.5} stroke="#1e293b" strokeDasharray="3 3" opacity="0.4" />
          <line x1="30" y1={priceChartHeight * 0.75} x2={svgWidth - 20} y2={priceChartHeight * 0.75} stroke="#1e293b" strokeDasharray="3 3" opacity="0.4" />
          <line x1="30" y1={priceChartHeight} x2={svgWidth - 20} y2={priceChartHeight} stroke="#334155" opacity="0.6" />

          {/* VWAP Horizontal / Step Line */}
          {showVwap && (
            <g>
              <line
                x1="30"
                y1={getY(stock.vwap)}
                x2={svgWidth - 20}
                y2={getY(stock.vwap)}
                stroke="#f59e0b"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />
              <text
                x={svgWidth - 65}
                y={getY(stock.vwap) - 4}
                fill="#f59e0b"
                fontSize="9"
                fontFamily="monospace"
              >
                VWAP ₹{stock.vwap.toFixed(1)}
              </text>
            </g>
          )}

          {/* 200-DMA Line */}
          {showDma && (
            <g>
              <line
                x1="30"
                y1={getY(stock.dma200)}
                x2={svgWidth - 20}
                y2={getY(stock.dma200)}
                stroke="#38bdf8"
                strokeWidth="1.5"
                strokeDasharray="5 3"
              />
              <text
                x={35}
                y={getY(stock.dma200) - 4}
                fill="#38bdf8"
                fontSize="9"
                fontFamily="monospace"
              >
                200-DMA ₹{stock.dma200.toFixed(0)}
              </text>
            </g>
          )}

          {/* AI Recommended Entry, Exit Targets & Stop-Loss Visual Highlights */}
          {tradeLevels && showAiLevels && (
            <g className="ai-trade-levels transition-opacity">
              {/* Target 1 Highlight Line & Label */}
              <line
                x1="30"
                y1={getY(tradeLevels.target1)}
                x2={svgWidth - 20}
                y2={getY(tradeLevels.target1)}
                stroke="#10b981"
                strokeWidth="2"
                strokeDasharray="4 2"
              />
              <rect
                x={svgWidth - 145}
                y={getY(tradeLevels.target1) - 10}
                width="125"
                height="18"
                rx="3"
                fill="#064e3b"
                stroke="#10b981"
                strokeWidth="1"
              />
              <text
                x={svgWidth - 140}
                y={getY(tradeLevels.target1) + 2}
                fill="#34d399"
                fontSize="9.5"
                fontWeight="bold"
                fontFamily="monospace"
              >
                TARGET: ₹{tradeLevels.target1.toFixed(1)}
              </text>

              {/* Target 2 Highlight Line & Label if present */}
              {tradeLevels.target2 && (
                <>
                  <line
                    x1="30"
                    y1={getY(tradeLevels.target2)}
                    x2={svgWidth - 20}
                    y2={getY(tradeLevels.target2)}
                    stroke="#059669"
                    strokeWidth="1.5"
                    strokeDasharray="2 2"
                  />
                  <rect
                    x={svgWidth - 145}
                    y={getY(tradeLevels.target2) - 9}
                    width="125"
                    height="16"
                    rx="3"
                    fill="#064e3b"
                    stroke="#059669"
                    strokeWidth="1"
                  />
                  <text
                    x={svgWidth - 140}
                    y={getY(tradeLevels.target2) + 2}
                    fill="#6ee7b7"
                    fontSize="9"
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    T2 (RUN): ₹{tradeLevels.target2.toFixed(1)}
                  </text>
                </>
              )}

              {/* Entry Zone Highlight Band & Line */}
              <rect
                x="30"
                y={getY(tradeLevels.entryPrice) - 6}
                width={svgWidth - 50}
                height="12"
                fill="#3b82f6"
                fillOpacity="0.12"
              />
              <line
                x1="30"
                y1={getY(tradeLevels.entryPrice)}
                x2={svgWidth - 20}
                y2={getY(tradeLevels.entryPrice)}
                stroke="#3b82f6"
                strokeWidth="2"
              />
              <rect
                x="35"
                y={getY(tradeLevels.entryPrice) - 10}
                width="135"
                height="18"
                rx="3"
                fill="#1e3a8a"
                stroke="#3b82f6"
                strokeWidth="1"
              />
              <text
                x="40"
                y={getY(tradeLevels.entryPrice) + 2}
                fill="#93c5fd"
                fontSize="9.5"
                fontWeight="bold"
                fontFamily="monospace"
              >
                ★ AI ENTRY: ₹{tradeLevels.entryPrice.toFixed(1)}
              </text>

              {/* Stop-Loss Highlight Line & Label */}
              <line
                x1="30"
                y1={getY(tradeLevels.stopLoss)}
                x2={svgWidth - 20}
                y2={getY(tradeLevels.stopLoss)}
                stroke="#ef4444"
                strokeWidth="2"
                strokeDasharray="4 2"
              />
              <rect
                x="35"
                y={getY(tradeLevels.stopLoss) - 10}
                width="145"
                height="18"
                rx="3"
                fill="#7f1d1d"
                stroke="#ef4444"
                strokeWidth="1"
              />
              <text
                x="40"
                y={getY(tradeLevels.stopLoss) + 2}
                fill="#fca5a5"
                fontSize="9.5"
                fontWeight="bold"
                fontFamily="monospace"
              >
                STOP-LOSS: ₹{tradeLevels.stopLoss.toFixed(1)}
              </text>
            </g>
          )}

          {/* User Drawing & Annotation Layer */}
          {annotations.map((ann) => {
            if (ann.type === 'RECTANGLE' && ann.x2 && ann.y2) {
              const rectX = Math.min(ann.x, ann.x2);
              const rectY = Math.min(ann.y, ann.y2);
              const rectW = Math.abs(ann.x2 - ann.x);
              const rectH = Math.abs(ann.y2 - ann.y);
              return (
                <g key={ann.id}>
                  <rect
                    x={rectX}
                    y={rectY}
                    width={rectW}
                    height={rectH}
                    fill="#38bdf8"
                    fillOpacity="0.15"
                    stroke="#38bdf8"
                    strokeWidth="1.5"
                    strokeDasharray="3 3"
                    rx="3"
                  />
                  <text
                    x={rectX + 6}
                    y={rectY + 14}
                    fill="#38bdf8"
                    fontSize="9.5"
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    {ann.text}
                  </text>
                </g>
              );
            }

            if (ann.type === 'TRENDLINE' && ann.x2 && ann.y2) {
              return (
                <g key={ann.id}>
                  <line
                    x1={ann.x}
                    y1={ann.y}
                    x2={ann.x2}
                    y2={ann.y2}
                    stroke="#f59e0b"
                    strokeWidth="2"
                  />
                  <circle cx={ann.x} cy={ann.y} r="3.5" fill="#f59e0b" />
                  <circle cx={ann.x2} cy={ann.y2} r="3.5" fill="#f59e0b" />
                  <text
                    x={ann.x + 8}
                    y={ann.y - 5}
                    fill="#f59e0b"
                    fontSize="9"
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    {ann.text}
                  </text>
                </g>
              );
            }

            if (ann.type === 'TEXT_NOTE') {
              return (
                <g key={ann.id} transform={`translate(${ann.x}, ${ann.y})`}>
                  <rect
                    x="-4"
                    y="-12"
                    width={Math.max(80, (ann.text?.length || 10) * 6.5)}
                    height="20"
                    rx="4"
                    fill="#0f172a"
                    stroke="#10b981"
                    strokeWidth="1.2"
                  />
                  <text
                    x="2"
                    y="2"
                    fill="#34d399"
                    fontSize="9.5"
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    💬 {ann.text}
                  </text>
                </g>
              );
            }

            return null;
          })}

          {/* Candlesticks & Volume Bars */}
          {candles.map((candle, idx) => {
            const isBull = candle.close >= candle.open;
            const x = 50 + idx * ((svgWidth - 100) / candles.length);
            const highY = getY(candle.high);
            const lowY = getY(candle.low);
            const openY = getY(candle.open);
            const closeY = getY(candle.close);
            const bodyTop = Math.min(openY, closeY);
            const bodyHeight = Math.max(Math.abs(closeY - openY), 2);

            const volY = getVolY(candle.volume);
            const volHeight = svgHeight - volY;

            return (
              <g
                key={idx}
                onMouseEnter={() => setHoveredCandle(candle)}
                onMouseLeave={() => setHoveredCandle(null)}
                className="cursor-pointer group"
              >
                {/* Wick */}
                <line
                  x1={x}
                  y1={highY}
                  x2={x}
                  y2={lowY}
                  stroke={isBull ? '#10b981' : '#f43f5e'}
                  strokeWidth="1.5"
                />

                {/* Candle Body */}
                <rect
                  x={x - candleWidth / 2}
                  y={bodyTop}
                  width={candleWidth}
                  height={bodyHeight}
                  fill={isBull ? '#10b981' : '#f43f5e'}
                  rx="1"
                  className="transition-opacity group-hover:opacity-80"
                />

                {/* Volume Bar */}
                <rect
                  x={x - candleWidth / 2}
                  y={volY}
                  width={candleWidth}
                  height={volHeight}
                  fill={isBull ? '#065f46' : '#881337'}
                  opacity="0.8"
                  rx="1"
                />

                {/* Time Label on bottom */}
                <text
                  x={x}
                  y={svgHeight - 2}
                  textAnchor="middle"
                  fill="#64748b"
                  fontSize="9"
                  fontFamily="monospace"
                >
                  {candle.time}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};
