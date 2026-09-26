import React from 'react';
import {
  TrendingUp,
  ShieldCheck,
  Zap,
  Layers,
  Globe,
  Calculator,
  Compass,
  Sparkles,
  ArrowRight,
  Target,
  BarChart3,
  HelpCircle,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { Stock } from '../types/equity';

interface WebsiteUserHeroProps {
  stock: Stock;
  onExploreIntraday: () => void;
  onExploreAiNews: () => void;
  onExploreSip: () => void;
  onExploreMacro: () => void;
  onOpenGuide: () => void;
}

export const WebsiteUserHero: React.FC<WebsiteUserHeroProps> = ({
  stock,
  onExploreIntraday,
  onExploreAiNews,
  onExploreSip,
  onExploreMacro,
  onOpenGuide,
}) => {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-b from-[#0e1629] via-[#090e1a] to-[#070b13] p-5 sm:p-6 lg:p-7 shadow-2xl">
      {/* Decorative background glow elements */}
      <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Left Column: Friendly Value Proposition & Guidance */}
        <div className="space-y-3 max-w-2xl">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-950/80 text-cyan-300 border border-cyan-700/60 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Smart Investor Terminal</span>
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-950/80 text-emerald-300 border border-emerald-800/60">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Live Market Tracking</span>
            </span>
            <span className="text-xs text-slate-400 font-mono hidden sm:inline">
              Selected Stock: <strong className="text-white">{stock.name} ({stock.ticker})</strong>
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white tracking-tight leading-snug">
            Professional Market Analysis Made Simple & Actionable.
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Welcome to your all-in-one investing companion. Get clear real-time entry and exit tips without confusion, understand institutional money flow, and calculate long-term SIP wealth with automated risk guardrails.
          </p>

          {/* Quick-action friendly buttons for immediate utility */}
          <div className="pt-2 flex flex-wrap items-center gap-2.5">
            <button
              onClick={onExploreIntraday}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-xs shadow-lg shadow-amber-950/50 flex items-center gap-2 transition-all transform hover:-translate-y-0.5"
            >
              <Zap className="w-4 h-4 fill-black" />
              <span>See Real-Time Intraday Tips</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={onExploreAiNews}
              className="px-4 py-2.5 rounded-xl bg-[#131d31] hover:bg-[#1a2842] border border-slate-700 text-white font-semibold text-xs transition-all flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>AI News & Sentiment</span>
            </button>

            <button
              onClick={onExploreSip}
              className="px-4 py-2.5 rounded-xl bg-[#131d31] hover:bg-[#1a2842] border border-slate-700 text-white font-semibold text-xs transition-all flex items-center gap-2"
            >
              <Calculator className="w-4 h-4 text-emerald-400" />
              <span>SIP Wealth Planner</span>
            </button>

            <button
              onClick={onOpenGuide}
              className="px-3.5 py-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white font-medium text-xs transition-colors flex items-center gap-1.5"
              title="Step-by-step user guide explaining every feature"
            >
              <HelpCircle className="w-4 h-4 text-cyan-400" />
              <span>How It Works</span>
            </button>
          </div>
        </div>

        {/* Right Column: 3 Friendly Feature Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-2.5 shrink-0 lg:w-80">
          <div className="bg-[#0b111e]/90 border border-slate-800/90 rounded-xl p-3 flex items-start gap-3 shadow-md">
            <div className="p-2 rounded-lg bg-amber-950/70 border border-amber-800/60 text-amber-400 shrink-0 mt-0.5">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">Clear Entry & Exit Rules</h4>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                Smart buy pullbacks with target 1, target 2, and strict stop-loss levels.
              </p>
            </div>
          </div>

          <div className="bg-[#0b111e]/90 border border-slate-800/90 rounded-xl p-3 flex items-start gap-3 shadow-md">
            <div className="p-2 rounded-lg bg-emerald-950/70 border border-emerald-800/60 text-emerald-400 shrink-0 mt-0.5">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">Smart Investor Guardrails</h4>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                Never chase spikes. Backed by delivery volume & 5Y median valuation checks.
              </p>
            </div>
          </div>

          <div className="bg-[#0b111e]/90 border border-slate-800/90 rounded-xl p-3 flex items-start gap-3 shadow-md">
            <div className="p-2 rounded-lg bg-cyan-950/70 border border-cyan-800/60 text-cyan-400 shrink-0 mt-0.5">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">Global Macro Trend Radar</h4>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                Daily health gauge synthesized across crude oil, currency, and crypto.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
