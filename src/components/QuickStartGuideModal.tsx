import React, { useState } from 'react';
import {
  HelpCircle,
  X,
  BookOpen,
  Sliders,
  Sparkles,
  Layers,
  Globe,
  Calculator,
  Compass,
  Database,
  ArrowRight,
  TrendingUp,
  FileSpreadsheet,
  Zap,
  Gauge,
} from 'lucide-react';

interface QuickStartGuideModalProps {
  onClose: () => void;
  onNavigateTab: (tab: any) => void;
}

export const QuickStartGuideModal: React.FC<QuickStartGuideModalProps> = ({
  onClose,
  onNavigateTab,
}) => {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      title: 'Welcome to Vortex Institutional Desk',
      badge: 'Platform Architecture',
      icon: BookOpen,
      color: 'text-cyan-400',
      description:
        'Vortex is a modern, user-friendly equity research terminal merging live exchange volume dynamics with global macroeconomic signals, automated news synthesis, and disciplined smart investor trading tips.',
      highlights: [
        'Real-time Level-2 order book depth & Volume-at-Price Point of Control (POC)',
        'Global macro transmission matrix & consolidated daily market sentiment gauge',
        'AI real-time intraday tips with automated entry, target, and trailing stop-loss rules',
        'Full catalog of NSE and BSE stocks with public REST API endpoints and exportable reports',
      ],
    },
    {
      title: 'Real-Time Intraday Tips (Smart Investor Rules)',
      badge: 'Actionable Trading Engine',
      icon: Zap,
      color: 'text-amber-400',
      description:
        'Get clear, non-confusing intraday setups calculated from live market conditions. Smart investor rules ensure you accumulate liquidity pullbacks near VWAP rather than chasing risky spikes.',
      highlights: [
        'Automated Entry Zone: Accumulate at high-probability liquidity absorption bands',
        '3-Tier Target Matrix: Target 1 (book 50%), Target 2 (runner), and Target 3',
        'Strict Stop-Loss & Invalidation Triggers: Exact price levels to preserve capital',
        'Live Radar Auto-Refresh: Periodically re-evaluates order book imbalances every 45 seconds',
      ],
    },
    {
      title: 'Real-Time Volume & Block Deal Radar',
      badge: 'Order Flow Intelligence',
      icon: Layers,
      color: 'text-emerald-400',
      description:
        'Detect institutional accumulation before retail momentum begins. High delivery absorption and volume surges above 20-DMA often signal sovereign and mutual fund block buying.',
      highlights: [
        'Volume Surge Multiplier: Real-time volume traded relative to 20-day historical mean',
        'Point of Control (POC): Price level where the greatest share volume was matched',
        'Delivery %: Ratio of shares taken into demat accounts vs intraday square-offs',
        'Block Deal Tracker: Real-time trades executed above ₹50 Cr with institutional client tags',
      ],
    },
    {
      title: 'Global Macro Sentiment Synthesizer',
      badge: 'Macroeconomic Health',
      icon: Gauge,
      color: 'text-teal-400',
      description:
        'Instantly grasp the daily health of global markets. Synthesizes net trends across Brent crude, sovereign yields, USD/INR currency pairs, and Bitcoin into a single 0-100 meter.',
      highlights: [
        'Daily Bullish/Bearish Summary for domestic risk assets and equities',
        'Pillar-by-Pillar breakdown across Commodities, Currencies, Rates, and Crypto',
        'Sector Transmission Matrix: Understand which sectors benefit or face headwinds',
        'Cross-asset correlations to protect your portfolio against global volatility',
      ],
    },
    {
      title: 'Algorithmic SIP & Weightage Forecast',
      badge: 'Wealth Compounding',
      icon: Calculator,
      color: 'text-blue-400',
      description:
        'Plan systematic investments for Reliance, TCS, or any listed scrip. Calculate evolving portfolio weightage and simulate outcomes across multiple holding horizons.',
      highlights: [
        'Configurable frequency (Daily, Weekly, Monthly, Quarterly) with annual step-up SIP (+5% to +25%)',
        'Portfolio Concentration Guardrails: Automatic caution flag if a single scrip exceeds 20% of net worth',
        '1,000-Path Monte Carlo Simulation for conservative (10th) vs median (50th) vs optimistic (90th) quantiles',
        'One-click CSV download for spreadsheets and offline institutional analysis',
      ],
    },
    {
      title: 'AI News Synthesizer & REST API Gateway',
      badge: 'Market Synthesis',
      icon: Sparkles,
      color: 'text-purple-400',
      description:
        'Powered by Gemini 3.8 Flash with smart caching, Vortex reviews financial portal commentary and pairs it with quantitative valuation bands to provide tactical research memos.',
      highlights: [
        'Synthesizes Moneycontrol market sentiment and Zee Business expert panel debate',
        'Delivers exact tactical entry zone, targets (T1, T2, T3), and stop-loss levels',
        'Query the Interactive Analyst Desk with custom questions on sector or hedging scenarios',
        'Access all NSE & BSE listed stocks programmatically via GET /api/v1/stocks',
      ],
    },
  ];

  const current = steps[activeStep];
  const StepIcon = current.icon;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-[#0b101c] border border-slate-800 rounded-xl max-w-2xl w-full p-6 text-slate-200 shadow-2xl relative">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-400 border border-cyan-800/40">
              USER GUIDE & DESK CHEATSHEET
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-lg bg-slate-900 border border-slate-800 ${current.color}`}>
              <StepIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider">
                {current.badge} · Step {activeStep + 1} of {steps.length}
              </div>
              <h3 className="text-base font-bold text-white mt-0.5">{current.title}</h3>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed bg-[#080c14] border border-slate-800/80 p-3 rounded-lg">
            {current.description}
          </p>

          <div className="space-y-2">
            <div className="text-xs font-semibold text-slate-200">Key Features in this Module:</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {current.highlights.map((h, i) => (
                <div key={i} className="flex items-start gap-2 bg-[#090d16] p-2.5 rounded border border-slate-800/60 text-xs text-slate-300">
                  <span className="text-cyan-400 font-bold mt-0.5">✓</span>
                  <span>{h}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Stepper Dots & Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <div className="flex items-center gap-1.5">
              {steps.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveStep(idx)}
                  className={`h-2 rounded-full transition-all ${
                    activeStep === idx ? 'w-6 bg-cyan-400' : 'w-2 bg-slate-700 hover:bg-slate-600'
                  }`}
                />
              ))}
            </div>

            <div className="flex items-center gap-2">
              {activeStep > 0 && (
                <button
                  onClick={() => setActiveStep(activeStep - 1)}
                  className="px-3 py-1.5 rounded text-xs text-slate-400 hover:text-white"
                >
                  Back
                </button>
              )}

              {activeStep < steps.length - 1 ? (
                <button
                  onClick={() => setActiveStep(activeStep + 1)}
                  className="px-4 py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 text-black font-semibold text-xs transition-colors flex items-center gap-1"
                >
                  <span>Next Feature</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  onClick={() => {
                    onClose();
                    onNavigateTab('OVERVIEW');
                  }}
                  className="px-4 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-black font-semibold text-xs transition-colors flex items-center gap-1"
                >
                  <span>Start Exploring Desk</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
