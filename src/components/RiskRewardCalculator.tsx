import React, { useState } from 'react';
import { Stock } from '../types/equity';
import { Sliders, Calculator, ShieldAlert, Target, CheckCircle2, DollarSign } from 'lucide-react';

interface RiskRewardCalculatorProps {
  stock: Stock;
  currentPrice: number;
}

export const RiskRewardCalculator: React.FC<RiskRewardCalculatorProps> = ({
  stock,
  currentPrice,
}) => {
  const [capital, setCapital] = useState<number>(150000); // Default ₹1.5L capital allocation
  const [riskPct, setRiskPct] = useState<number>(1.2); // 1.2% account risk
  const [rewardRatio, setRewardRatio] = useState<number>(3.0); // 1:3 risk reward ratio

  // Calculations
  const riskAmount = (capital * (riskPct / 100));
  const stopLossPrice = Number((currentPrice * (1 - riskPct / 100)).toFixed(2));
  const riskPerShare = Number((currentPrice - stopLossPrice).toFixed(2));
  const quantity = riskPerShare > 0 ? Math.floor(riskAmount / riskPerShare) : 100;
  const targetPrice = Number((currentPrice + riskPerShare * rewardRatio).toFixed(2));
  const potentialProfit = Number((quantity * (targetPrice - currentPrice)).toFixed(2));
  const potentialLoss = Number((quantity * (currentPrice - stopLossPrice)).toFixed(2));

  return (
    <div className="bg-[#0b101c] border border-cyan-500/40 rounded-xl p-4 lg:p-5 space-y-4 shadow-lg">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-800">
            <Calculator className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white flex items-center gap-2">
              Risk/Reward Ratio & Capital Allocation Calculator
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                POSITION SIZING
              </span>
            </h4>
            <p className="text-[10px] text-slate-400">
              Automatically computes exact stop-loss, target price, and position quantity for <strong className="text-white">{stock.ticker}</strong>
            </p>
          </div>
        </div>

        <div className="text-right font-mono">
          <div className="text-[10px] text-slate-400">Risk : Reward</div>
          <div className="text-sm font-bold text-cyan-400">1 : {rewardRatio.toFixed(1)}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono">
        <div className="space-y-1.5 bg-[#070b13] p-3 rounded-lg border border-slate-800">
          <label className="text-[11px] text-slate-400 flex items-center justify-between">
            <span>Capital Allocation</span>
            <span className="text-white font-bold">₹{capital.toLocaleString()}</span>
          </label>
          <input
            type="range"
            min="25000"
            max="1000000"
            step="25000"
            value={capital}
            onChange={(e) => setCapital(Number(e.target.value))}
            className="w-full accent-cyan-500 cursor-pointer"
          />
        </div>

        <div className="space-y-1.5 bg-[#070b13] p-3 rounded-lg border border-slate-800">
          <label className="text-[11px] text-slate-400 flex items-center justify-between">
            <span>Stop Loss / Risk %</span>
            <span className="text-rose-400 font-bold">{riskPct}%</span>
          </label>
          <input
            type="range"
            min="0.5"
            max="4.0"
            step="0.1"
            value={riskPct}
            onChange={(e) => setRiskPct(Number(e.target.value))}
            className="w-full accent-rose-500 cursor-pointer"
          />
        </div>

        <div className="space-y-1.5 bg-[#070b13] p-3 rounded-lg border border-slate-800">
          <label className="text-[11px] text-slate-400 flex items-center justify-between">
            <span>Reward Multiplier</span>
            <span className="text-emerald-400 font-bold">{rewardRatio}x Risk</span>
          </label>
          <input
            type="range"
            min="1.5"
            max="6.0"
            step="0.5"
            value={rewardRatio}
            onChange={(e) => setRewardRatio(Number(e.target.value))}
            className="w-full accent-emerald-500 cursor-pointer"
          />
        </div>
      </div>

      {/* Computed Outputs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
        <div className="bg-[#05080f] p-3 rounded-lg border border-slate-800 space-y-0.5">
          <div className="text-[10px] text-slate-400">Entry Price (CMP)</div>
          <div className="text-sm font-bold text-white">₹{currentPrice}</div>
        </div>

        <div className="bg-[#05080f] p-3 rounded-lg border border-rose-900/60 space-y-0.5">
          <div className="text-[10px] text-rose-400 font-bold">Stop-Loss Price</div>
          <div className="text-sm font-bold text-rose-300">₹{stopLossPrice}</div>
          <div className="text-[10px] text-slate-500">Max Risk: -₹{potentialLoss.toLocaleString()}</div>
        </div>

        <div className="bg-[#05080f] p-3 rounded-lg border border-emerald-900/60 space-y-0.5">
          <div className="text-[10px] text-emerald-400 font-bold">Target Price</div>
          <div className="text-sm font-bold text-emerald-300">₹{targetPrice}</div>
          <div className="text-[10px] text-slate-500">Target Profit: +₹{potentialProfit.toLocaleString()}</div>
        </div>

        <div className="bg-[#05080f] p-3 rounded-lg border border-cyan-950 space-y-0.5">
          <div className="text-[10px] text-cyan-400 font-bold">Position Quantity</div>
          <div className="text-sm font-bold text-cyan-300">{quantity} Shares</div>
          <div className="text-[10px] text-slate-500">Exposure: ₹{(quantity * currentPrice).toLocaleString()}</div>
        </div>
      </div>
    </div>
  );
};
