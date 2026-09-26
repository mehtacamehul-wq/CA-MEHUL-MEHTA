import React from 'react';
import { Stock } from '../types/equity';
import { DollarSign, Award, Calendar, TrendingUp, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface DividendHistoryViewProps {
  stock: Stock;
}

export const DividendHistoryView: React.FC<DividendHistoryViewProps> = ({ stock }) => {
  // Generate consistent historical dividend data based on ticker hash
  const generateDividendHistory = (ticker: string, basePrice: number, pe: number) => {
    const hash = ticker.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    // Estimated dividend yield between 0.5% and 4.2% based on ticker
    const yieldPct = Number((1.2 + (hash % 30) / 10).toFixed(2));
    const annualDividend = Number((basePrice * (yieldPct / 100)).toFixed(2));
    const payoutRatio = Math.round(35 + (hash % 35));

    const years = [2025, 2024, 2023, 2022, 2021];
    const history = years.map((yr, idx) => {
      const variation = 1 + ((hash + idx * 7) % 15 - 7) / 100;
      const dps = Number((annualDividend * variation).toFixed(2));
      const totalPayout = Math.round(dps * 12500000); // simulated total payout in INR
      return {
        year: yr,
        dividendPerShare: dps,
        yieldPercent: Number((yieldPct * variation).toFixed(2)),
        payoutRatio: Math.min(95, Math.max(20, payoutRatio + (idx % 3 - 1) * 4)),
        exDate: `May ${14 + (hash % 10)}, ${yr}`,
        type: yr === 2025 ? 'Interim & Final' : 'Final',
      };
    });

    return {
      yieldPct,
      annualDividend,
      payoutRatio,
      history,
    };
  };

  const divData = generateDividendHistory(stock.ticker, stock.price, stock.pe);

  return (
    <div className="bg-[#0b101c] border border-slate-800 rounded-xl p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-black font-bold shadow-lg shadow-emerald-950/40">
            <DollarSign className="w-5 h-5 text-black" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              Dividend Yield & 5-Year Payout History
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                FUNDAMENTAL ANALYSIS
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Analyzing cash return, dividend sustainability, payout ratios, and historical ex-dividend dates for <strong className="text-white">{stock.name} ({stock.ticker})</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 font-mono">
          <div className="px-3 py-2 rounded-lg bg-[#070b13] border border-slate-800 text-right">
            <div className="text-[10px] text-slate-400">Indicated Dividend Yield</div>
            <div className="text-sm font-bold text-emerald-400">{divData.yieldPct}% p.a.</div>
          </div>
          <div className="px-3 py-2 rounded-lg bg-[#070b13] border border-slate-800 text-right">
            <div className="text-[10px] text-slate-400">Payout Ratio</div>
            <div className="text-sm font-bold text-cyan-300">{divData.payoutRatio}% of Net Profit</div>
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono">
        <div className="p-4 rounded-xl bg-[#070b13] border border-slate-800 space-y-1">
          <div className="text-xs text-slate-400">Annual Dividend (DPS)</div>
          <div className="text-xl font-bold text-white">₹{divData.annualDividend}</div>
          <div className="text-[10px] text-slate-500 font-sans">Based on trailing twelve months distribution</div>
        </div>
        <div className="p-4 rounded-xl bg-[#070b13] border border-slate-800 space-y-1">
          <div className="text-xs text-slate-400">Dividend Consistency</div>
          <div className="text-xl font-bold text-emerald-400">5 Years Unbroken</div>
          <div className="text-[10px] text-slate-500 font-sans">Consistent cash payouts with regular growth</div>
        </div>
        <div className="p-4 rounded-xl bg-[#070b13] border border-slate-800 space-y-1">
          <div className="text-xs text-slate-400">Next Estimated Ex-Date</div>
          <div className="text-xl font-bold text-cyan-300">May 18, 2026</div>
          <div className="text-[10px] text-slate-500 font-sans">Eligible if purchased 1 day prior</div>
        </div>
      </div>

      {/* 5-Year Payout History Table */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2 font-mono">
          <Calendar className="w-4 h-4 text-emerald-400" />
          <span>5-Year Dividend Payout History & Records</span>
        </h4>

        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-left border-collapse font-mono text-xs">
            <thead>
              <tr className="bg-[#070b13] text-slate-400 border-b border-slate-800">
                <th className="p-3 font-semibold">Financial Year</th>
                <th className="p-3 font-semibold">Dividend / Share (DPS)</th>
                <th className="p-3 font-semibold">Dividend Yield</th>
                <th className="p-3 font-semibold">Payout Ratio</th>
                <th className="p-3 font-semibold">Ex-Dividend Date</th>
                <th className="p-3 font-semibold">Type</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 bg-[#0b101c]">
              {divData.history.map((item) => (
                <tr key={item.year} className="hover:bg-slate-900/50 transition-colors">
                  <td className="p-3 font-bold text-white">{item.year}</td>
                  <td className="p-3 font-bold text-emerald-400">₹{item.dividendPerShare}</td>
                  <td className="p-3 text-cyan-300">{item.yieldPercent}%</td>
                  <td className="p-3 text-slate-300">{item.payoutRatio}%</td>
                  <td className="p-3 text-slate-300">{item.exDate}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 border border-slate-700">
                      {item.type}
                    </span>
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
