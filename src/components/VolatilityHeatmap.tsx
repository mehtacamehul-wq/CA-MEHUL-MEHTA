import React, { useState } from 'react';
import { Stock } from '../types/equity';
import { Activity, Flame, ArrowUpRight, ArrowDownRight, Layers, Zap, Filter } from 'lucide-react';

interface VolatilityHeatmapProps {
  stocks: Stock[];
  selectedTicker: string;
  onSelectStock: (ticker: string) => void;
}

export const VolatilityHeatmap: React.FC<VolatilityHeatmapProps> = ({
  stocks,
  selectedTicker,
  onSelectStock,
}) => {
  const [filterMode, setFilterMode] = useState<'ALL' | 'GAINERS' | 'LOSERS' | 'HIGH_VOLATILITY'>('ALL');

  // Calculate intraday range percentage for volatility
  const enrichedStocks = stocks.map((stock) => {
    const rangePct = Number((((stock.high - stock.low) / stock.prevClose) * 100).toFixed(2));
    return {
      ...stock,
      rangePct,
    };
  });

  const filteredStocks = enrichedStocks.filter((stock) => {
    if (filterMode === 'GAINERS') return stock.changePercent > 0;
    if (filterMode === 'LOSERS') return stock.changePercent < 0;
    if (filterMode === 'HIGH_VOLATILITY') return stock.rangePct >= 1.2;
    return true;
  }).sort((a, b) => b.rangePct - a.rangePct); // Sort by volatility/range descending

  return (
    <div className="bg-[#0b101c] border border-slate-800/80 rounded-xl p-4 lg:p-6 space-y-4 shadow-xl">
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-rose-500 to-amber-600 flex items-center justify-center text-black font-bold shadow-md">
            <Flame className="w-4 h-4 text-black" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              Intraday Volatility Heatmap
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800/60">
                LIVE HEATMAP
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Visualizing price range volatility and percentage fluctuations across tracked equities
            </p>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 bg-[#070b13] p-1 rounded-lg border border-slate-800">
          {(['ALL', 'GAINERS', 'LOSERS', 'HIGH_VOLATILITY'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setFilterMode(mode)}
              className={`px-2.5 py-1 rounded text-[11px] font-mono font-medium transition-colors ${
                filterMode === mode
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-700/60 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              {mode === 'ALL' && 'All Stocks'}
              {mode === 'GAINERS' && 'Top Gainers'}
              {mode === 'LOSERS' && 'Top Losers'}
              {mode === 'HIGH_VOLATILITY' && '⚡ High Volatility'}
            </button>
          ))}
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {filteredStocks.map((stock) => {
          const isSelected = stock.ticker === selectedTicker;
          const isUp = stock.changePercent >= 0;
          const absChange = Math.abs(stock.changePercent);

          // Dynamic background color intensity based on price change & volatility
          let bgClass = 'bg-[#0f172a] border-slate-800';
          let textAccent = 'text-emerald-400';

          if (isUp) {
            if (absChange >= 2.0) {
              bgClass = 'bg-emerald-950/70 border-emerald-600/70 shadow-lg shadow-emerald-950/40';
              textAccent = 'text-emerald-300 font-bold';
            } else if (absChange >= 1.0) {
              bgClass = 'bg-emerald-950/40 border-emerald-700/50';
              textAccent = 'text-emerald-400';
            } else {
              bgClass = 'bg-slate-900/80 border-slate-800';
              textAccent = 'text-emerald-400/80';
            }
          } else {
            if (absChange >= 2.0) {
              bgClass = 'bg-rose-950/70 border-rose-600/70 shadow-lg shadow-rose-950/40';
              textAccent = 'text-rose-300 font-bold';
            } else if (absChange >= 1.0) {
              bgClass = 'bg-rose-950/40 border-rose-700/50';
              textAccent = 'text-rose-400';
            } else {
              bgClass = 'bg-slate-900/80 border-slate-800';
              textAccent = 'text-rose-400/80';
            }
          }

          if (isSelected) {
            bgClass += ' ring-2 ring-cyan-400';
          }

          return (
            <div
              key={stock.ticker}
              onClick={() => onSelectStock(stock.ticker)}
              className={`p-3 rounded-xl border cursor-pointer transition-all hover:scale-[1.02] flex flex-col justify-between gap-2 ${bgClass}`}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-white text-xs tracking-wide">{stock.ticker}</span>
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded flex items-center gap-0.5 ${isUp ? 'bg-emerald-900/60 text-emerald-300' : 'bg-rose-900/60 text-rose-300'}`}>
                  {isUp ? <ArrowUpRight className="w-2.5 h-2.5" /> : <ArrowDownRight className="w-2.5 h-2.5" />}
                  {isUp ? '+' : ''}{stock.changePercent}%
                </span>
              </div>

              <div>
                <div className="text-sm font-mono font-bold text-white">₹{stock.price.toLocaleString('en-IN')}</div>
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mt-1">
                  <span>Vol: {(stock.volume / 100000).toFixed(1)}L</span>
                  <span className="text-amber-300">R: {stock.rangePct}%</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
