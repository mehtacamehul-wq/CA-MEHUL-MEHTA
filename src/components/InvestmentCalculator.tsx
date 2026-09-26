import React, { useState, useMemo } from 'react';
import { Stock, SipParameters } from '../types/equity';
import { calculateSipProjection } from '../utils/calculator';
import { exportSipForecastCsv } from '../utils/csvExport';
import { Calculator, TrendingUp, ShieldAlert, Award, PieChart, Sparkles, AlertCircle, Download, FileSpreadsheet } from 'lucide-react';

interface InvestmentCalculatorProps {
  stock: Stock;
}

export const InvestmentCalculator: React.FC<InvestmentCalculatorProps> = ({ stock }) => {
  const [periodicDeposit, setPeriodicDeposit] = useState<number>(10000);
  const [frequency, setFrequency] = useState<SipParameters['frequency']>('MONTHLY');
  const [holdingPeriodYears, setHoldingPeriodYears] = useState<number>(10);
  const [annualStepUpPercent, setAnnualStepUpPercent] = useState<number>(10);
  const [expectedCagr, setExpectedCagr] = useState<number>(15.5);
  const [totalNetWorth, setTotalNetWorth] = useState<number>(5000000); // ₹50 Lakhs default
  const [reinvestDividends, setReinvestDividends] = useState<boolean>(true);
  const [adjustForInflation, setAdjustForInflation] = useState<boolean>(false);
  const [inflationRate, setInflationRate] = useState<number>(6.0);

  const sipParams: SipParameters = {
    periodicDeposit,
    frequency,
    holdingPeriodYears,
    annualStepUpPercent,
    expectedCagr,
    totalNetWorth,
    reinvestDividends,
    adjustForInflation,
    inflationRate,
  };

  const projection = useMemo(() => {
    return calculateSipProjection(stock, sipParams);
  }, [
    stock,
    periodicDeposit,
    frequency,
    holdingPeriodYears,
    annualStepUpPercent,
    expectedCagr,
    totalNetWorth,
    reinvestDividends,
    adjustForInflation,
    inflationRate,
  ]);

  const handleExportCsv = () => {
    exportSipForecastCsv(stock, sipParams, projection);
  };

  const weightage = projection.finalWeightagePercent;
  const isConcentrated = weightage > 20;
  const isModerate = weightage >= 10 && weightage <= 20;

  const quickAmounts = [2500, 5000, 10000, 25000, 50000];
  const quickHorizons = [1, 3, 5, 10, 15, 20];

  return (
    <div className="bg-[#0b101c] border border-slate-800/80 rounded-xl p-4.5 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800/60 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded bg-amber-950/80 border border-amber-800/50 text-amber-400">
            <Calculator className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide">
              Flexible Systematic Investment (SIP) Calculator & Forecasting Engine
            </h3>
            <p className="text-[11px] text-slate-400">
              Simulating systematic deposits for {stock.name} with automatic portfolio weightage & scenario forecasting
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[11px] font-mono text-slate-400">
            Current Price:{' '}
            <span className="font-bold text-white">
              ₹{stock.price.toLocaleString('en-IN', { maximumFractionDigits: 1 })}
            </span>
          </span>

          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-[#121929] hover:bg-amber-950/40 border border-slate-700 hover:border-amber-600/60 text-slate-200 hover:text-amber-300 transition-colors shadow-sm"
            title="Download CSV report of forecast breakdown, scenarios, and Monte Carlo runs"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-amber-400" />
            <span>Export Forecast CSV</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Input Parameters (Left 5 Cols) vs Forecast Projections (Right 7 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Interactive Parameters */}
        <div className="lg:col-span-5 bg-[#090d16] border border-slate-800/80 rounded-lg p-3.5 space-y-3.5 text-xs">
          <div className="font-semibold text-slate-200 border-b border-slate-800 pb-1.5">
            Systematic Deposit Configuration
          </div>

          {/* Periodic Deposit Amount */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-slate-400 font-mono text-[11px]">Periodic Deposit Amount</label>
              <span className="font-bold font-mono text-white text-sm">
                ₹{periodicDeposit.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="flex items-center gap-1.5 mb-2">
              {quickAmounts.map((amt) => (
                <button
                  key={amt}
                  onClick={() => setPeriodicDeposit(amt)}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors ${
                    periodicDeposit === amt
                      ? 'bg-amber-600 text-black font-bold'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  ₹{(amt / 1000).toFixed(0)}k
                </button>
              ))}
            </div>

            <input
              type="range"
              min={1000}
              max={100000}
              step={1000}
              value={periodicDeposit}
              onChange={(e) => setPeriodicDeposit(Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
          </div>

          {/* Deposit Frequency */}
          <div>
            <label className="block text-slate-400 font-mono text-[11px] mb-1.5">
              Deposit Frequency
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {(['DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFrequency(f)}
                  className={`py-1.5 text-center rounded text-[10px] font-mono font-medium transition-colors border ${
                    frequency === f
                      ? 'bg-amber-950/70 border-amber-600/70 text-amber-300 font-bold'
                      : 'bg-[#101726] border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Holding Horizon */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-slate-400 font-mono text-[11px]">Investment Horizon</label>
              <span className="font-bold font-mono text-white">{holdingPeriodYears} Years</span>
            </div>
            <div className="flex items-center gap-1.5 mb-1.5">
              {quickHorizons.map((yr) => (
                <button
                  key={yr}
                  onClick={() => setHoldingPeriodYears(yr)}
                  className={`px-2.5 py-0.5 rounded text-[10px] font-mono transition-colors ${
                    holdingPeriodYears === yr
                      ? 'bg-amber-600 text-black font-bold'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {yr}Y
                </button>
              ))}
            </div>
          </div>

          {/* Annual Step-Up SIP % */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-slate-400 font-mono text-[11px]">
                Annual Step-Up Deposit (+%)
              </label>
              <span className="font-bold font-mono text-cyan-400">+{annualStepUpPercent}% / yr</span>
            </div>
            <input
              type="range"
              min={0}
              max={25}
              step={5}
              value={annualStepUpPercent}
              onChange={(e) => setAnnualStepUpPercent(Number(e.target.value))}
              className="w-full accent-cyan-500 cursor-pointer"
            />
          </div>

          {/* Expected CAGR */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-slate-400 font-mono text-[11px]">
                Expected Annual Return (CAGR)
              </label>
              <span className="font-bold font-mono text-emerald-400">{expectedCagr}%</span>
            </div>
            <input
              type="range"
              min={6}
              max={28}
              step={0.5}
              value={expectedCagr}
              onChange={(e) => setExpectedCagr(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
          </div>

          {/* Total Net Worth (for automatic weightage) */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-slate-400 font-mono text-[11px]">
                Total Portfolio / Net Worth Size (₹)
              </label>
              <span className="font-bold font-mono text-slate-200">
                ₹{(totalNetWorth / 100000).toFixed(0)} Lakhs
              </span>
            </div>
            <input
              type="range"
              min={500000}
              max={50000000}
              step={500000}
              value={totalNetWorth}
              onChange={(e) => setTotalNetWorth(Number(e.target.value))}
              className="w-full accent-slate-400 cursor-pointer"
            />
          </div>

          {/* Toggles: Reinvest Dividends & Adjust for Inflation */}
          <div className="pt-2 border-t border-slate-800 space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={reinvestDividends}
                onChange={(e) => setReinvestDividends(e.target.checked)}
                className="rounded accent-emerald-500"
              />
              <span className="text-slate-300 text-[11px]">
                Reinvest Dividends (DRIP): +{stock.divYield}% yield
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={adjustForInflation}
                onChange={(e) => setAdjustForInflation(e.target.checked)}
                className="rounded accent-amber-500"
              />
              <span className="text-slate-300 text-[11px]">
                Inflation-Adjusted Real Returns (6% CPI)
              </span>
            </label>
          </div>
        </div>

        {/* Right Column: Dynamic Projections, Weightage, Scenarios & Monte Carlo */}
        <div className="lg:col-span-7 space-y-4">
          {/* Key Result Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-[#090d16] border border-slate-800/90 rounded-lg p-3">
              <div className="text-[10px] text-slate-500 font-mono">TOTAL INVESTED</div>
              <div className="text-lg font-bold font-mono text-slate-200 mt-0.5">
                ₹{(projection.totalInvested / 100000).toFixed(2)} Lakhs
              </div>
              <div className="text-[10px] text-slate-500 font-mono mt-1">
                Accumulated: ~{projection.sharesAccumulated.toLocaleString('en-IN')} shares
              </div>
            </div>

            <div className="bg-[#090d16] border border-emerald-900/40 rounded-lg p-3">
              <div className="text-[10px] text-emerald-400 font-mono">PROJECTED FUTURE WEALTH</div>
              <div className="text-lg font-bold font-mono text-emerald-400 mt-0.5">
                ₹{(projection.futureValue / 100000).toFixed(2)} Lakhs
              </div>
              <div className="text-[10px] text-emerald-500 font-mono mt-1">
                Net Gain: +₹{(projection.wealthGained / 100000).toFixed(2)}L
              </div>
            </div>

            <div className="bg-[#090d16] border border-slate-800/90 rounded-lg p-3">
              <div className="text-[10px] text-slate-500 font-mono">PORTFOLIO WEIGHTAGE</div>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-lg font-bold font-mono text-white">
                  {projection.finalWeightagePercent.toFixed(1)}%
                </span>
                <span
                  className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-bold ${
                    isConcentrated
                      ? 'bg-rose-950/70 text-rose-300 border border-rose-800/40'
                      : isModerate
                      ? 'bg-amber-950/70 text-amber-300 border border-amber-800/40'
                      : 'bg-emerald-950/70 text-emerald-300 border border-emerald-800/40'
                  }`}
                >
                  {isConcentrated ? 'CONCENTRATED' : isModerate ? 'BALANCED' : 'DIVERSIFIED'}
                </span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    isConcentrated ? 'bg-rose-500' : isModerate ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(100, projection.finalWeightagePercent)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Concentration Warning Banner if > 20% */}
          {isConcentrated && (
            <div className="bg-rose-950/30 border border-rose-800/50 rounded-lg p-3 flex items-start gap-2 text-xs text-rose-300">
              <AlertCircle className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" />
              <div>
                <span className="font-bold">Portfolio Concentration Threshold Reached: </span>
                At {projection.finalWeightagePercent.toFixed(1)}%, {stock.ticker} will exceed the institutional 20% single-stock ceiling. We recommend activating an algorithmic rebalancing rule once the position surpasses 18% of total portfolio net worth.
              </div>
            </div>
          )}

          {/* Multi-Horizon Scenario Comparison Table */}
          <div className="bg-[#090d16] border border-slate-800/80 rounded-lg p-3.5 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-200">
                Holding Horizon Return Forecasting Matrix
              </span>
              <span className="text-[11px] font-mono text-slate-500">
                Bear (-4.5%) vs Base ({expectedCagr}%) vs Bull (+4.5%)
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-800 text-[10px] text-slate-500">
                    <th className="py-1">HORIZON</th>
                    <th className="py-1 text-rose-400">BEAR CASE (-4.5%)</th>
                    <th className="py-1 text-slate-200">BASE CASE ({expectedCagr}%)</th>
                    <th className="py-1 text-emerald-400">BULL CASE (+4.5%)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {projection.scenarios.map((sc) => (
                    <tr key={sc.periodYears} className="hover:bg-slate-800/30">
                      <td className="py-1.5 font-bold text-slate-300">{sc.periodYears} Year{sc.periodYears > 1 ? 's' : ''}</td>
                      <td className="py-1.5 text-rose-300">₹{(sc.bearCase / 100000).toFixed(2)}L</td>
                      <td className="py-1.5 font-bold text-slate-100">₹{(sc.baseCase / 100000).toFixed(2)}L</td>
                      <td className="py-1.5 text-emerald-300">₹{(sc.bullCase / 100000).toFixed(2)}L</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Monte Carlo Probability Distribution Box */}
          <div className="bg-[#090d16] border border-slate-800/80 rounded-lg p-3.5 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>1,000-Path Monte Carlo Wealth Probability Distribution</span>
              </span>
              <span className="text-[10px] font-mono text-cyan-400">Beta: {stock.beta}</span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs font-mono">
              <div className="p-2.5 rounded bg-[#101726] border border-slate-800">
                <span className="text-[10px] text-slate-500 block">10th Percentile (Conservative)</span>
                <span className="text-slate-300 font-bold text-sm">
                  ₹{(projection.monteCarlo.percentile10 / 100000).toFixed(2)} Lakhs
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">90% probability to exceed</span>
              </div>

              <div className="p-2.5 rounded bg-[#101726] border border-cyan-800/50">
                <span className="text-[10px] text-cyan-400 block font-semibold">50th Percentile (Median)</span>
                <span className="text-cyan-300 font-bold text-sm">
                  ₹{(projection.monteCarlo.percentile50 / 100000).toFixed(2)} Lakhs
                </span>
                <span className="text-[10px] text-cyan-500 block mt-0.5">Most probable outcome</span>
              </div>

              <div className="p-2.5 rounded bg-[#101726] border border-slate-800">
                <span className="text-[10px] text-emerald-400 block">90th Percentile (Optimistic)</span>
                <span className="text-emerald-300 font-bold text-sm">
                  ₹{(projection.monteCarlo.percentile90 / 100000).toFixed(2)} Lakhs
                </span>
                <span className="text-[10px] text-emerald-600 block mt-0.5">10% upside breakout</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
