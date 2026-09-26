import React, { useState } from 'react';
import { MACRO_ITEMS, SECTOR_SENSITIVITIES } from '../data/macroData';
import { MacroItem } from '../types/equity';
import {
  Globe,
  TrendingUp,
  TrendingDown,
  HelpCircle,
  ArrowRight,
  Gauge,
  Sparkles,
  ShieldAlert,
  Flame,
  Coins,
  DollarSign,
  Activity,
} from 'lucide-react';

export const MacroDashboard: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<'ALL' | 'RATES' | 'COMMODITIES' | 'CURRENCIES' | 'CRYPTO'>('ALL');
  const [selectedMacroItem, setSelectedMacroItem] = useState<MacroItem | null>(null);

  const filteredItems = activeCategory === 'ALL'
    ? MACRO_ITEMS
    : MACRO_ITEMS.filter((item) => item.category === activeCategory);

  const categories: { key: typeof activeCategory; label: string }[] = [
    { key: 'ALL', label: 'All Macro Pillars' },
    { key: 'RATES', label: 'Interest Rates' },
    { key: 'COMMODITIES', label: 'Commodities' },
    { key: 'CURRENCIES', label: 'Currencies' },
    { key: 'CRYPTO', label: 'Crypto & Digital' },
  ];

  // Synthesize Global Market Sentiment Gauge across Commodities, Currencies, and Crypto
  const commodities = MACRO_ITEMS.filter((i) => i.category === 'COMMODITIES');
  const currencies = MACRO_ITEMS.filter((i) => i.category === 'CURRENCIES');
  const cryptos = MACRO_ITEMS.filter((i) => i.category === 'CRYPTO');
  const rates = MACRO_ITEMS.filter((i) => i.category === 'RATES');

  // Calculate composite impact score
  // Bullish for equities = +1, Bearish = -1, Neutral = 0
  const calculatePillarScore = (items: MacroItem[]) => {
    if (items.length === 0) return 0;
    const total = items.reduce((acc, curr) => {
      if (curr.impactOnEquities === 'BULLISH') return acc + 1;
      if (curr.impactOnEquities === 'BEARISH') return acc - 1;
      return acc;
    }, 0);
    return total / items.length;
  };

  const commScore = calculatePillarScore(commodities);
  const currScore = calculatePillarScore(currencies);
  const cryptoScore = calculatePillarScore(cryptos);
  const ratesScore = calculatePillarScore(rates);

  // Weighted composite sentiment (Equities sensitivity: Commodities 30%, Currencies 25%, Rates 30%, Crypto 15%)
  const compositeScore = (commScore * 0.3) + (currScore * 0.25) + (ratesScore * 0.3) + (cryptoScore * 0.15);

  // Normalize to 0 to 100 gauge value
  const gaugePercent = Math.min(100, Math.max(0, Math.round(((compositeScore + 1) / 2) * 100)));

  const getOverallVerdict = (score: number) => {
    if (score >= 0.35) {
      return {
        verdict: 'STRONG BULLISH',
        headline: 'Favorable Global Macro Tailwind for Indian Equities',
        color: 'text-emerald-400',
        bgColor: 'bg-emerald-950/70 border-emerald-600/60',
        badge: 'BULLISH BIAS',
      };
    } else if (score >= 0.05) {
      return {
        verdict: 'MODERATELY BULLISH',
        headline: 'Softening Yields & Benign Energy Spread Support Risk Assets',
        color: 'text-teal-400',
        bgColor: 'bg-teal-950/70 border-teal-600/60',
        badge: 'MILD BULLISH',
      };
    } else if (score <= -0.35) {
      return {
        verdict: 'STRONG BEARISH',
        headline: 'Elevated Energy Inflation & Hardening Yields Pose Macro Friction',
        color: 'text-rose-400',
        bgColor: 'bg-rose-950/70 border-rose-600/60',
        badge: 'BEARISH CAUTION',
      };
    } else if (score <= -0.05) {
      return {
        verdict: 'CAUTIOUS / BEARISH TILT',
        headline: 'Currency Deprecations & High Crude Pressuring Operating Margins',
        color: 'text-amber-400',
        bgColor: 'bg-amber-950/70 border-amber-600/60',
        badge: 'CAUTIOUS',
      };
    } else {
      return {
        verdict: 'BALANCED / NEUTRAL',
        headline: 'Balanced Macro Cross-Currents; Stock-Specific Stock Picking Advised',
        color: 'text-blue-400',
        bgColor: 'bg-blue-950/70 border-blue-600/60',
        badge: 'NEUTRAL RANGE',
      };
    }
  };

  const sentiment = getOverallVerdict(compositeScore);

  const getPillarLabel = (score: number) => {
    if (score > 0.1) return { label: 'Bullish', color: 'text-emerald-400' };
    if (score < -0.1) return { label: 'Bearish', color: 'text-rose-400' };
    return { label: 'Neutral', color: 'text-slate-400' };
  };

  return (
    <div className="bg-[#0b101c] border border-slate-800/80 rounded-xl p-4.5 space-y-4">
      {/* 1. Global Market Sentiment Gauge Synthesis Card */}
      <div className={`border rounded-xl p-4.5 relative overflow-hidden transition-all ${sentiment.bgColor}`}>
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-5 relative z-10">
          {/* Left: Gauge title & high conviction summary */}
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="p-1 rounded bg-black/40 border border-slate-700 text-cyan-400">
                <Gauge className="w-4 h-4" />
              </span>
              <span className="text-[11px] font-mono tracking-wider uppercase text-slate-300 font-bold">
                Global Macro Sentiment Synthesizer
              </span>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold border ${sentiment.color} bg-black/40`}>
                {sentiment.verdict}
              </span>
            </div>

            <h2 className="text-base lg:text-lg font-bold text-white tracking-wide">
              {sentiment.headline}
            </h2>

            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Consolidated real-time synthesis across energy & commodities (Brent, Gold, Copper), currency pairs (USD/INR, DXY), sovereign yields (India 10Y, US 10Y), and digital liquidity (Bitcoin).
            </p>
          </div>

          {/* Center / Right: Interactive Visual Gauge Meter */}
          <div className="flex items-center gap-4 bg-black/50 border border-slate-800/80 p-3.5 rounded-xl shrink-0">
            {/* Visual Gauge Bar */}
            <div className="space-y-1.5 w-40 sm:w-48">
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                <span className="text-rose-400 font-semibold">Bearish</span>
                <span className="text-slate-400">Neutral</span>
                <span className="text-emerald-400 font-semibold">Bullish</span>
              </div>

              <div className="w-full h-3 rounded-full bg-slate-900 border border-slate-700/80 relative overflow-hidden p-0.5">
                <div
                  className="h-full rounded-full transition-all duration-700 bg-gradient-to-r from-rose-500 via-amber-400 to-emerald-400"
                  style={{ width: `${gaugePercent}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-slate-400 text-[10px]">Macro Score</span>
                <span className={`font-bold ${sentiment.color}`}>
                  {gaugePercent} / 100 ({sentiment.badge})
                </span>
              </div>
            </div>

            {/* 3 Pillar Summary Mini-Pills */}
            <div className="hidden sm:flex flex-col gap-1 border-l border-slate-800 pl-3 font-mono text-[10px]">
              <div className="flex items-center justify-between gap-2">
                <span className="text-slate-400 flex items-center gap-1">
                  <Flame className="w-3 h-3 text-amber-400" />
                  <span>Commodities:</span>
                </span>
                <span className={`font-bold ${getPillarLabel(commScore).color}`}>
                  {getPillarLabel(commScore).label}
                </span>
              </div>

              <div className="flex items-center justify-between gap-2">
                <span className="text-slate-400 flex items-center gap-1">
                  <DollarSign className="w-3 h-3 text-cyan-400" />
                  <span>Currencies:</span>
                </span>
                <span className={`font-bold ${getPillarLabel(currScore).color}`}>
                  {getPillarLabel(currScore).label}
                </span>
              </div>

              <div className="flex items-center justify-between gap-2">
                <span className="text-slate-400 flex items-center gap-1">
                  <Coins className="w-3 h-3 text-purple-400" />
                  <span>Crypto / Digital:</span>
                </span>
                <span className={`font-bold ${getPillarLabel(cryptoScore).color}`}>
                  {getPillarLabel(cryptoScore).label}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800/60 pb-3 pt-1">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded bg-blue-950/80 border border-blue-800/50 text-blue-400">
            <Globe className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide">Macroeconomic Matrix & Cross-Asset Terminal</h3>
            <p className="text-[11px] text-slate-400">
              Tracking sovereign yields, energy, FX flows, and digital liquidity
            </p>
          </div>
        </div>

        {/* Category Segmented Control */}
        <div className="flex items-center gap-1 p-1 bg-[#090d16] border border-slate-800 rounded-lg text-xs overflow-x-auto max-w-full">
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={`px-2.5 py-1 rounded-md font-medium whitespace-nowrap transition-colors ${
                activeCategory === cat.key
                  ? 'bg-blue-600 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Macro Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {filteredItems.map((item) => {
          const isUp = item.change >= 0;
          return (
            <div
              key={item.id}
              onClick={() => setSelectedMacroItem(item)}
              className="bg-[#090d16] border border-slate-800/80 hover:border-blue-700/60 transition-all rounded-lg p-3 cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-500 uppercase">
                    {item.category} · {item.symbol}
                  </span>
                  <span
                    className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-bold ${
                      item.impactOnEquities === 'BULLISH'
                        ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40'
                        : item.impactOnEquities === 'BEARISH'
                        ? 'bg-rose-950/60 text-rose-400 border border-rose-800/40'
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}
                  >
                    {item.impactOnEquities} FOR EQUITIES
                  </span>
                </div>

                <div className="text-sm font-semibold text-slate-200 mt-1 group-hover:text-blue-300 transition-colors">
                  {item.name}
                </div>

                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-lg font-bold font-mono text-white">
                    {item.unit === '₹' || item.unit === '₹/10g' || item.unit === '₹/kg' ? '₹' : ''}
                    {item.value >= 1000 ? item.value.toLocaleString('en-IN') : item.value}
                    <span className="text-xs text-slate-400 font-normal ml-0.5">
                      {item.unit !== '₹' ? ` ${item.unit}` : ''}
                    </span>
                  </span>
                  <span
                    className={`text-xs font-mono font-semibold flex items-center ${
                      isUp ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {isUp ? <TrendingUp className="w-3 h-3 mr-0.5" /> : <TrendingDown className="w-3 h-3 mr-0.5" />}
                    {isUp ? '+' : ''}
                    {item.changePercent.toFixed(2)}%
                  </span>
                </div>
              </div>

              {/* Sparkline & Brief Relevance */}
              <div className="mt-3 pt-2 border-t border-slate-800/60">
                <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono mb-1">
                  <span>24h Range: {item.low24h} - {item.high24h}</span>
                </div>

                {/* SVG Sparkline */}
                <div className="h-6 w-full py-0.5">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 100 20" preserveAspectRatio="none">
                    {(() => {
                      const min = Math.min(...item.sparkline);
                      const max = Math.max(...item.sparkline);
                      const range = max - min || 1;
                      const points = item.sparkline
                        .map((val, idx) => {
                          const x = (idx / (item.sparkline.length - 1)) * 100;
                          const y = 20 - ((val - min) / range) * 16 - 2;
                          return `${x},${y}`;
                        })
                        .join(' ');
                      return (
                        <polyline
                          fill="none"
                          stroke={isUp ? '#10b981' : '#f43f5e'}
                          strokeWidth="2"
                          strokeLinecap="round"
                          points={points}
                        />
                      );
                    })()}
                  </svg>
                </div>

                <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">
                  {item.relevance}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Sector Macro Sensitivity Cross-Currents Table */}
      <div className="bg-[#090d16] border border-slate-800/80 rounded-lg p-3.5 space-y-2.5 mt-2">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold text-slate-200 tracking-wide">
              Equities Macro Transmission Matrix (Sector Cross-Impact)
            </h4>
            <p className="text-[11px] text-slate-400">
              Sensitivity to crude oil spreads, sovereign yields, and currency volatility
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-[10px] text-slate-500 font-mono">
                <th className="py-1.5 w-1/4">SECTOR & ASSETS</th>
                <th className="py-1.5 w-1/4">BRENT CRUDE TRANSMISSION</th>
                <th className="py-1.5 w-1/4">RATES & YIELDS (RBI / US 10Y)</th>
                <th className="py-1.5 w-1/4">CURRENCY (USD/INR, GBP)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {SECTOR_SENSITIVITIES.map((sec, idx) => (
                <tr key={idx} className="hover:bg-slate-800/30">
                  <td className="py-2.5 pr-2 font-medium text-slate-200">
                    <div>{sec.sector}</div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      Keys: {sec.keyStocks.join(', ')}
                    </div>
                  </td>
                  <td className="py-2.5 pr-2 text-slate-300 text-[11px]">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span
                        className={`text-[9px] font-mono px-1 py-0.2 rounded font-bold ${
                          sec.crudeImpact.score > 0
                            ? 'bg-emerald-950/70 text-emerald-400 border border-emerald-800/40'
                            : sec.crudeImpact.score < 0
                            ? 'bg-rose-950/70 text-rose-400 border border-rose-800/40'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {sec.crudeImpact.score > 0 ? '+ BENEFICIAL' : sec.crudeImpact.score < 0 ? '- HEADWIND' : 'NEUTRAL'}
                      </span>
                    </div>
                    {sec.crudeImpact.text}
                  </td>
                  <td className="py-2.5 pr-2 text-slate-300 text-[11px]">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span
                        className={`text-[9px] font-mono px-1 py-0.2 rounded font-bold ${
                          sec.interestRateImpact.score > 0
                            ? 'bg-emerald-950/70 text-emerald-400 border border-emerald-800/40'
                            : sec.interestRateImpact.score < 0
                            ? 'bg-rose-950/70 text-rose-400 border border-rose-800/40'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {sec.interestRateImpact.score > 0 ? '+ SENSITIVE' : sec.interestRateImpact.score < 0 ? '- HEADWIND' : 'MODERATE'}
                      </span>
                    </div>
                    {sec.interestRateImpact.text}
                  </td>
                  <td className="py-2.5 text-slate-300 text-[11px]">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span
                        className={`text-[9px] font-mono px-1 py-0.2 rounded font-bold ${
                          sec.currencyImpact.score > 0
                            ? 'bg-emerald-950/70 text-emerald-400 border border-emerald-800/40'
                            : sec.currencyImpact.score < 0
                            ? 'bg-rose-950/70 text-rose-400 border border-rose-800/40'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {sec.currencyImpact.score > 0 ? '+ FX BENEFIT' : sec.currencyImpact.score < 0 ? '- FX HEADWIND' : 'HEDGED'}
                      </span>
                    </div>
                    {sec.currencyImpact.text}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
