import React from 'react';
import { Stock } from '../types/equity';
import { generateFundamentalSignal } from '../utils/calculator';
import { Activity, ShieldCheck, CheckCircle2, AlertTriangle, ArrowRight, Compass, Zap } from 'lucide-react';

interface AlgorithmicSignalsProps {
  stock: Stock;
}

export const AlgorithmicSignals: React.FC<AlgorithmicSignalsProps> = ({ stock }) => {
  const signal = generateFundamentalSignal(stock);

  return (
    <div className="bg-[#0b101c] border border-slate-800/80 rounded-xl p-4.5 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800/60 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded bg-cyan-950/80 border border-cyan-800/50 text-cyan-400">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide">
              Algorithmic Entry & Exit Engine (Fundamental Quant)
            </h3>
            <p className="text-[11px] text-slate-400">
              Rules-based execution triggers derived from 5Y median P/E, EV/EBITDA, ROE, and 200-DMA confluence
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-medium text-slate-400">
            Quant Strength:{' '}
            <span className="font-bold text-cyan-400 text-sm">{signal.strength}%</span>
          </span>
        </div>
      </div>

      {/* Main Signal Banner */}
      <div className="bg-[#090d16] border border-slate-800/90 rounded-lg p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
            PRIMARY ALGORITHMIC ACTION
          </div>
          <div className="flex items-center gap-2.5 mt-1">
            <span
              className={`text-base font-extrabold px-3 py-1 rounded font-mono border ${
                signal.action === 'STRONG_ACCUMULATE' || signal.action === 'VALUE_BUY'
                  ? 'bg-emerald-950/80 border-emerald-600/70 text-emerald-400'
                  : signal.action === 'TRIM_PROFIT'
                  ? 'bg-rose-950/80 border-rose-600/70 text-rose-400'
                  : 'bg-cyan-950/80 border-cyan-600/70 text-cyan-300'
              }`}
            >
              {signal.title.toUpperCase()}
            </span>

            <span className="text-xs font-mono text-slate-400">
              Dynamic SIP Multiplier:{' '}
              <span className="font-bold text-amber-400">{signal.sipMultiplier}x</span>
            </span>
          </div>
          <p className="text-xs text-slate-300 mt-2 max-w-2xl leading-relaxed">
            {signal.verdict}
          </p>
        </div>

        {/* Action Tranche Execution Targets */}
        <div className="bg-[#101726] border border-slate-800 rounded-lg p-3 text-xs font-mono space-y-1.5 shrink-0 min-w-[220px]">
          <div className="text-[10px] text-slate-500 uppercase">ALGORITHMIC EXECUTION LEVELS</div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Target Entry Zone:</span>
            <span className="font-bold text-emerald-400">
              ₹{signal.targetBuyRange[0]} - ₹{signal.targetBuyRange[1]}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Algorithmic Trim Exit:</span>
            <span className="font-bold text-rose-400">₹{signal.exitTrimLevel}</span>
          </div>
          <div className="flex justify-between items-center pt-1 border-t border-slate-800 text-[10px]">
            <span className="text-slate-500">Suggested Action:</span>
            <span className="text-cyan-400 font-semibold">
              {signal.sipMultiplier > 1.0 ? 'Boost Deposit Tranche' : 'Maintain Standard SIP'}
            </span>
          </div>
        </div>
      </div>

      {/* Factor Confluence Scorecard */}
      <div className="space-y-2">
        <div className="text-xs font-semibold text-slate-200">
          Fundamental & Quantitative Factor Scorecard
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {signal.factors.map((factor, idx) => (
            <div
              key={idx}
              className="bg-[#090d16] border border-slate-800/80 rounded-lg p-2.5 flex items-start gap-2.5 text-xs"
            >
              <div className="mt-0.5">
                {factor.status === 'FAVORABLE' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : factor.status === 'CAUTION' ? (
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                ) : (
                  <Activity className="w-4 h-4 text-amber-400" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-200">{factor.label}</span>
                  <span
                    className={`text-[9px] font-mono px-1 py-0.2 rounded font-bold ${
                      factor.status === 'FAVORABLE'
                        ? 'bg-emerald-950/60 text-emerald-400'
                        : factor.status === 'CAUTION'
                        ? 'bg-rose-950/60 text-rose-400'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {factor.status}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 font-mono mt-0.5">{factor.detail}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
