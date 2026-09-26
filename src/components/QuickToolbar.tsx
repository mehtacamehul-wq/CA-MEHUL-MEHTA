import React, { useState } from 'react';
import { Stock } from '../types/equity';
import {
  SlidersHorizontal,
  Bell,
  Eye,
  Activity,
  Layers,
  Sparkles,
  Maximize2,
  RefreshCw,
  Zap,
  Info,
} from 'lucide-react';

interface QuickToolbarProps {
  stock: Stock;
  isSimulating: boolean;
  onToggleSimulation: () => void;
  onOpenGuide: () => void;
  onOpenRegistry: () => void;
  onExportCsv: () => void;
  onOpenIntradayTips?: () => void;
}

export const QuickToolbar: React.FC<QuickToolbarProps> = ({
  stock,
  isSimulating,
  onToggleSimulation,
  onOpenGuide,
  onOpenRegistry,
  onExportCsv,
  onOpenIntradayTips,
}) => {
  const [activeAlertPrice, setActiveAlertPrice] = useState<string>('');
  const [alertSet, setAlertSet] = useState(false);
  const [showPriceAlertPopover, setShowPriceAlertPopover] = useState(false);

  const handleSetAlert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeAlertPrice) return;
    setAlertSet(true);
    setTimeout(() => {
      setShowPriceAlertPopover(false);
      setAlertSet(false);
    }, 1500);
  };

  return (
    <div className="bg-[#0b101c] border border-slate-800/80 rounded-xl px-4 py-2.5 flex items-center justify-between flex-wrap gap-3">
      {/* Left side: Quick status badges */}
      <div className="flex items-center gap-3 text-xs flex-wrap">
        <span className="text-slate-400 font-medium flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-cyan-400" />
          <span>Active Asset:</span>
          <span className="font-bold text-white font-mono">{stock.ticker}</span>
        </span>

        <span className="text-slate-600">|</span>

        <div className="flex items-center gap-2 font-mono text-[11px]">
          <span className="text-slate-400">RSI(14):</span>
          <span
            className={`font-bold ${
              stock.rsi14 >= 70
                ? 'text-rose-400'
                : stock.rsi14 <= 35
                ? 'text-emerald-400'
                : 'text-amber-300'
            }`}
          >
            {stock.rsi14}
          </span>
          <span className="text-slate-500">
            ({stock.rsi14 >= 70 ? 'Overbought' : stock.rsi14 <= 35 ? 'Oversold' : 'Neutral'})
          </span>
        </div>

        <span className="text-slate-600 hidden sm:inline">|</span>

        <div className="hidden sm:flex items-center gap-2 font-mono text-[11px]">
          <span className="text-slate-400">200-DMA:</span>
          <span className="font-bold text-slate-200">₹{stock.dma200.toFixed(0)}</span>
          <span
            className={`text-[10px] ${
              stock.price >= stock.dma200 ? 'text-emerald-400 font-semibold' : 'text-rose-400 font-semibold'
            }`}
          >
            ({stock.price >= stock.dma200 ? '+' : ''}
            {(((stock.price - stock.dma200) / stock.dma200) * 100).toFixed(1)}%)
          </span>
        </div>
      </div>

      {/* Right side: Quick Tool Buttons */}
      <div className="flex items-center gap-2 text-xs flex-wrap">
        {/* Set Quick Price Alert */}
        <div className="relative">
          <button
            onClick={() => setShowPriceAlertPopover(!showPriceAlertPopover)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-[#101726] border border-slate-700/80 text-slate-300 hover:text-white hover:border-slate-600 transition-colors font-medium text-[11px]"
            title="Set price trigger alert"
          >
            <Bell className="w-3.5 h-3.5 text-amber-400" />
            <span>Price Alert</span>
          </button>

          {showPriceAlertPopover && (
            <div className="absolute right-0 top-full mt-2 z-50 bg-[#101726] border border-slate-700 p-3 rounded-lg shadow-xl w-64 space-y-2">
              <div className="text-xs font-bold text-white flex items-center justify-between">
                <span>Set Trigger for {stock.ticker}</span>
                <span className="font-mono text-cyan-400 text-[11px]">₹{stock.price}</span>
              </div>
              <form onSubmit={handleSetAlert} className="space-y-2">
                <input
                  type="number"
                  step="0.5"
                  required
                  placeholder={`Target (e.g. ${(stock.price * 1.05).toFixed(0)})`}
                  value={activeAlertPrice}
                  onChange={(e) => setActiveAlertPrice(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded bg-[#070b13] border border-slate-700 text-white font-mono focus:border-cyan-500 focus:outline-none"
                />
                <button
                  type="submit"
                  className="w-full py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 text-black font-semibold text-xs transition-colors"
                >
                  {alertSet ? 'Trigger Armed!' : 'Save Trigger'}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Real-time AI Intraday Tips Quick Launcher */}
        {onOpenIntradayTips && (
          <button
            onClick={onOpenIntradayTips}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-amber-950/60 border border-amber-700/70 text-amber-300 hover:bg-amber-900/60 transition-colors font-semibold text-[11px] shadow-sm animate-pulse"
            title="Real-time AI Intraday Tips with smart entry & exit targets"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span>AI Intraday Tips</span>
          </button>
        )}

        {/* Browse All Listed Stocks */}
        <button
          onClick={onOpenRegistry}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-[#101726] border border-slate-700/80 text-slate-300 hover:text-cyan-300 hover:border-cyan-700/60 transition-colors font-medium text-[11px]"
          title="Browse NSE & BSE securities master"
        >
          <Layers className="w-3.5 h-3.5 text-cyan-400" />
          <span>Stock Directory (API)</span>
        </button>

        {/* User Guide & Tutorial */}
        <button
          onClick={onOpenGuide}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-cyan-950/60 border border-cyan-800/60 text-cyan-200 hover:bg-cyan-900/60 transition-colors font-medium text-[11px]"
          title="Open interactive terminal user guide"
        >
          <Info className="w-3.5 h-3.5 text-cyan-400" />
          <span>Terminal Guide</span>
        </button>
      </div>
    </div>
  );
};
