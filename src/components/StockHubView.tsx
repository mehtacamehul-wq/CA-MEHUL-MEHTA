import React, { useState } from 'react';
import { Stock } from '../types/equity';
import {
  TrendingUp,
  TrendingDown,
  BarChart2,
  Activity,
  Sparkles,
  Calculator,
  ShieldAlert,
  Layers,
  ArrowRight,
  Info,
  DollarSign,
  PieChart,
  Sliders,
  CheckCircle2,
  FileText,
  Target,
  Clock,
  Compass,
} from 'lucide-react';

interface StockHubViewProps {
  stock: Stock;
  activeSubView: SubModuleView;
  onChangeSubView: (view: SubModuleView) => void;
  onOpenReportMemo: () => void;
  onNavigateTab: (tabId: any) => void;
  onToggleWatchlist?: (ticker: string) => void;
  isWatched?: boolean;
}

export type SubModuleView =
  | 'INTRADAY_TIPS'
  | 'CHART_TECHNICALS'
  | 'VOLUME_FLOW'
  | 'AI_SIGNALS'
  | 'SIP_VALUATION'
  | 'DIVIDEND_HISTORY';

export const StockHubView: React.FC<StockHubViewProps> = ({
  stock,
  activeSubView,
  onChangeSubView,
  onOpenReportMemo,
  onNavigateTab,
}) => {

  // Key derived metrics
  const isPositive = stock.change >= 0;
  const volumeMultiplier = (stock.volume / stock.avgVolume20d).toFixed(2);
  const peDiff = (((stock.pe - stock.medianPe5y) / stock.medianPe5y) * 100).toFixed(1);
  const dmaDiff = (((stock.price - stock.dma200) / stock.dma200) * 100).toFixed(1);

  // Status assessments for non-experts
  const valuationStatus =
    Number(peDiff) <= -5
      ? { label: 'Undervalued vs 5Y', color: 'text-emerald-400 bg-emerald-950/70 border-emerald-800' }
      : Number(peDiff) >= 15
      ? { label: 'Premium Valuation', color: 'text-rose-400 bg-rose-950/70 border-rose-800' }
      : { label: 'Fairly Valued', color: 'text-amber-400 bg-amber-950/70 border-amber-800' };

  const trendStatus =
    Number(dmaDiff) > 0
      ? { label: 'Bullish (Above 200-DMA)', color: 'text-emerald-400 bg-emerald-950/70 border-emerald-800' }
      : { label: 'Bearish (Below 200-DMA)', color: 'text-rose-400 bg-rose-950/70 border-rose-800' };

  const rsiStatus =
    stock.rsi14 >= 70
      ? { label: 'Overbought (Caution)', color: 'text-rose-400' }
      : stock.rsi14 <= 35
      ? { label: 'Oversold (Dip Zone)', color: 'text-emerald-400' }
      : { label: 'Neutral Momentum', color: 'text-slate-300' };

  const modules = [
    {
      id: 'INTRADAY_TIPS' as SubModuleView,
      title: '⚡ Real-Time Intraday Tips',
      subtitle: 'AI smart entry/exit levels & sentiment radar',
      icon: Target,
      color: 'text-amber-400',
    },
    {
      id: 'CHART_TECHNICALS' as SubModuleView,
      title: '1. Price & Technicals',
      subtitle: 'Candlesticks, 200-DMA, Support & Targets',
      icon: Activity,
      color: 'text-cyan-400',
    },
    {
      id: 'VOLUME_FLOW' as SubModuleView,
      title: '2. Volume & Block Deals',
      subtitle: 'Order book, Delivery % & Institutional Trades',
      icon: Layers,
      color: 'text-emerald-400',
    },
    {
      id: 'AI_SIGNALS' as SubModuleView,
      title: '3. AI Intelligence & News',
      subtitle: 'Moneycontrol & Zee synthesis, Entry / Stop-loss',
      icon: Sparkles,
      color: 'text-purple-400',
    },
    {
      id: 'SIP_VALUATION' as SubModuleView,
      title: '4. SIP & Valuation Engine',
      subtitle: 'Systematic compounding & 5Y Median P/E test',
      icon: Calculator,
      color: 'text-blue-400',
    },
    {
      id: 'DIVIDEND_HISTORY' as SubModuleView,
      title: '5. Dividend & Payout History',
      subtitle: 'Yield, 5Y DPS records & payout ratios',
      icon: DollarSign,
      color: 'text-emerald-400',
    },
  ];

  return (
    <div className="bg-[#0b101c] border border-slate-800 rounded-xl p-4 lg:p-5 space-y-5">
      {/* 1. Systematic Top Summary Card */}
      <div className="bg-[#080c14] border border-slate-800/90 rounded-lg p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Company details */}
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800 font-bold">
                {stock.exchange}
              </span>
              <span className="text-xs text-slate-400 font-medium">
                {stock.sector}
              </span>
            </div>
            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
              <h2 className="text-lg lg:text-xl font-bold text-white tracking-wide">
                {stock.name}
              </h2>
              <span className="text-sm font-mono text-cyan-400 font-semibold">
                ({stock.ticker})
              </span>
            </div>
          </div>

          {/* Real-time price & status pills */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div>
              <div className="text-[10px] font-mono text-slate-400">CURRENT MARKET PRICE (CMP)</div>
              <div className="flex items-baseline gap-2 font-mono">
                <span className="text-xl lg:text-2xl font-bold text-white">
                  ₹{stock.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
                <span
                  className={`flex items-center text-xs font-bold ${
                    isPositive ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {isPositive ? <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> : <TrendingDown className="w-3.5 h-3.5 mr-0.5" />}
                  {isPositive ? '+' : ''}
                  {stock.change.toFixed(2)} ({stock.changePercent.toFixed(2)}%)
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-1.5 text-[11px]">
              <div className={`px-2.5 py-0.5 rounded-full border text-center font-medium ${valuationStatus.color}`}>
                {valuationStatus.label}
              </div>
              <div className={`px-2.5 py-0.5 rounded-full border text-center font-medium ${trendStatus.color}`}>
                {trendStatus.label}
              </div>
            </div>
          </div>
        </div>

        {/* 4 Systematic Core Pillars (Quick glance for beginners & pros) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-4 pt-3.5 border-t border-slate-800/80 font-mono text-xs">
          <div className="p-2.5 rounded bg-[#0b101c] border border-slate-800/80">
            <span className="text-[10px] text-slate-400 block font-sans">1. Valuation (P/E)</span>
            <span className="font-bold text-slate-200">{stock.pe}x</span>
            <span className="text-[10px] text-slate-400 block mt-0.5 font-sans">
              Median 5Y: {stock.medianPe5y}x ({Number(peDiff) >= 0 ? '+' : ''}{peDiff}%)
            </span>
          </div>

          <div className="p-2.5 rounded bg-[#0b101c] border border-slate-800/80">
            <span className="text-[10px] text-slate-400 block font-sans">2. Momentum (RSI 14)</span>
            <span className={`font-bold ${rsiStatus.color}`}>{stock.rsi14} / 100</span>
            <span className="text-[10px] text-slate-400 block mt-0.5 font-sans">
              {rsiStatus.label}
            </span>
          </div>

          <div className="p-2.5 rounded bg-[#0b101c] border border-slate-800/80">
            <span className="text-[10px] text-slate-400 block font-sans">3. 20-DMA Volume Surge</span>
            <span className="font-bold text-slate-200">{volumeMultiplier}x Average</span>
            <span className="text-[10px] text-slate-400 block mt-0.5 font-sans">
              Delivery: {stock.deliveryPercent}% Demat
            </span>
          </div>

          <div className="p-2.5 rounded bg-[#0b101c] border border-slate-800/80">
            <span className="text-[10px] text-slate-400 block font-sans">4. 52-Week Range</span>
            <span className="font-bold text-slate-200">₹{stock.low52w.toFixed(0)} - ₹{stock.high52w.toFixed(0)}</span>
            <span className="text-[10px] text-slate-400 block mt-0.5 font-sans">
              200-DMA: ₹{stock.dma200.toFixed(0)}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Systematic Module Navigator (Easily Understood 4-Module Switcher) */}
      <div>
        <div className="text-xs font-semibold text-slate-300 mb-2 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-cyan-400" />
            <span>Select What You Want to Analyze for {stock.ticker}:</span>
          </span>
          <span className="text-[11px] text-slate-500 font-normal">
            Organized systematically from Price to AI & Wealth Planning
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
          {modules.map((mod) => {
            const Icon = mod.icon;
            const isSelected = activeSubView === mod.id;
            return (
              <button
                key={mod.id}
                onClick={() => onChangeSubView(mod.id)}
                className={`p-3 rounded-lg text-left transition-all border flex flex-col justify-between ${
                  isSelected
                    ? 'bg-[#101726] border-cyan-500/80 text-white shadow-lg shadow-cyan-950/40 ring-1 ring-cyan-500/40'
                    : 'bg-[#080c14] border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className={`p-1.5 rounded-md bg-slate-900 border border-slate-800 ${mod.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  {isSelected && (
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                      ACTIVE
                    </span>
                  )}
                </div>
                <div>
                  <div className="font-bold text-xs text-white">{mod.title}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                    {mod.subtitle}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Systematic Explanatory Guide Box for Selected Mode */}
      <div className="bg-[#090d16] border border-slate-800/80 p-3 rounded-lg flex items-center justify-between gap-3 text-xs flex-wrap">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-cyan-400 shrink-0" />
          <span className="text-slate-300">
            {activeSubView === 'INTRADAY_TIPS' &&
              `Real-time AI Intraday Tips active for ${stock.ticker}. Evaluating live order book imbalances, Moneycontrol & Zee Business sentiment to generate disciplined smart investor entry, target, and stop-loss levels.`}
            {activeSubView === 'CHART_TECHNICALS' &&
              `Currently viewing technical chart, price action, Fibonacci levels, and algorithmic signals for ${stock.ticker}.`}
            {activeSubView === 'VOLUME_FLOW' &&
              `Currently inspecting Level-2 order book liquidity, Volume-at-Price Point of Control (POC), and institutional block deals.`}
            {activeSubView === 'AI_SIGNALS' &&
              `Currently analyzing synthesized commentary from Moneycontrol and Zee Business, entry zones, and stop-loss targets.`}
            {activeSubView === 'SIP_VALUATION' &&
              `Currently simulating disciplined SIP wealth accumulation, portfolio concentration limits, and historical P/E multiples.`}
            {activeSubView === 'DIVIDEND_HISTORY' &&
              `Currently analyzing fundamental dividend yield, 5-year dividend per share records, payout ratio sustainability, and ex-dividend calendar for ${stock.ticker}.`}
          </span>
        </div>

        <button
          onClick={onOpenReportMemo}
          className="text-[11px] font-semibold text-cyan-300 hover:text-cyan-200 flex items-center gap-1 shrink-0 ml-auto"
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Print Research Memo</span>
        </button>
      </div>
    </div>
  );
};
