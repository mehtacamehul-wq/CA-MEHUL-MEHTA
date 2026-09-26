import React, { useState } from 'react';
import { Stock } from '../types/equity';
import { History, CheckCircle2, ArrowUpRight, ArrowDownRight, Plus, RefreshCw, Trash2, DollarSign } from 'lucide-react';

export interface PaperTrade {
  id: string;
  ticker: string;
  name: string;
  type: 'BUY' | 'SELL';
  entryPrice: number;
  exitPrice?: number;
  quantity: number;
  entryTimestamp: string;
  exitTimestamp?: string;
  status: 'OPEN' | 'CLOSED';
  pnl?: number;
  pnlPercent?: number;
}

interface PaperTradingLogViewProps {
  stocks: Stock[];
  trades: PaperTrade[];
  onAddTrade: (trade: PaperTrade) => void;
  onCloseTrade: (tradeId: string, exitPrice: number) => void;
  onClearTrades: () => void;
}

export const PaperTradingLogView: React.FC<PaperTradingLogViewProps> = ({
  stocks,
  trades,
  onAddTrade,
  onCloseTrade,
  onClearTrades,
}) => {
  const [selectedTicker, setSelectedTicker] = useState(stocks[0]?.ticker || 'RELIANCE');
  const [tradeType, setTradeType] = useState<'BUY' | 'SELL'>('BUY');
  const [quantity, setQuantity] = useState<number>(100);

  const currentStock = stocks.find((s) => s.ticker === selectedTicker) || stocks[0];

  const handleExecutePaperTrade = () => {
    const newTrade: PaperTrade = {
      id: `trade-${Date.now()}`,
      ticker: currentStock.ticker,
      name: currentStock.name,
      type: tradeType,
      entryPrice: currentStock.price,
      quantity,
      entryTimestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      status: 'OPEN',
    };
    onAddTrade(newTrade);
  };

  const totalRealizedPnl = trades
    .filter((t) => t.status === 'CLOSED' && t.pnl !== undefined)
    .reduce((acc, t) => acc + (t.pnl || 0), 0);

  const openPositionsCount = trades.filter((t) => t.status === 'OPEN').length;

  return (
    <div className="bg-[#0b101c] border border-slate-800 rounded-xl p-4 lg:p-6 space-y-6 shadow-xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-black font-bold shadow-lg shadow-cyan-950/40">
            <History className="w-5 h-5 text-black" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              Paper Trading Log & Trade History
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                SIMULATED EXECUTION
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Captures entry/exit timestamps, quantities, and real-time P&L results dispatched from Smart Chart Analyzer
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 font-mono">
          <div className="px-3 py-2 rounded-lg bg-[#070b13] border border-slate-800 text-right">
            <div className="text-[10px] text-slate-400">Realized P&L</div>
            <div className={`text-sm font-bold ${totalRealizedPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {totalRealizedPnl >= 0 ? '+' : ''}₹{totalRealizedPnl.toFixed(2)}
            </div>
          </div>
          <div className="px-3 py-2 rounded-lg bg-[#070b13] border border-slate-800 text-right">
            <div className="text-[10px] text-slate-400">Open Positions</div>
            <div className="text-sm font-bold text-cyan-300">{openPositionsCount} Active</div>
          </div>
        </div>
      </div>

      {/* Quick Trade Dispatcher Form */}
      <div className="bg-[#070b13] border border-slate-800 p-4 rounded-xl space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono flex items-center gap-2">
          <Plus className="w-4 h-4 text-cyan-400" />
          <span>Dispatch Simulated Paper Trade</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="space-y-1">
            <label className="text-[11px] font-mono text-slate-400">Select Stock</label>
            <select
              value={selectedTicker}
              onChange={(e) => setSelectedTicker(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[#05080f] border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-cyan-500"
            >
              {stocks.map((s) => (
                <option key={s.ticker} value={s.ticker}>
                  {s.ticker} (₹{s.price})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-mono text-slate-400">Position Type</label>
            <select
              value={tradeType}
              onChange={(e) => setTradeType(e.target.value as 'BUY' | 'SELL')}
              className="w-full px-3 py-2 rounded-lg bg-[#05080f] border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-cyan-500"
            >
              <option value="BUY">BUY (Long)</option>
              <option value="SELL">SELL (Short)</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-mono text-slate-400">Quantity (Shares)</label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full px-3 py-2 rounded-lg bg-[#05080f] border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={handleExecutePaperTrade}
              className="w-full py-2 px-4 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-black font-bold font-mono text-xs transition-colors shadow-md"
            >
              Execute Paper Trade
            </button>
          </div>
        </div>
      </div>

      {/* Trade Log Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
            Captured Paper Trade History ({trades.length})
          </h4>
          {trades.length > 0 && (
            <button
              onClick={onClearTrades}
              className="text-[11px] font-mono text-rose-400 hover:underline flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
          )}
        </div>

        {trades.length === 0 ? (
          <div className="p-8 text-center bg-[#070b13] border border-slate-800 rounded-xl space-y-2">
            <History className="w-8 h-8 text-slate-600 mx-auto" />
            <div className="text-xs font-mono text-slate-300 font-bold">No Paper Trades Logged Yet</div>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Dispatch a simulated trade above or use the Smart Real-Time Chart Analyzer to log entry/exit timestamps and P&L results.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left border-collapse font-mono text-xs">
              <thead>
                <tr className="bg-[#070b13] text-slate-400 border-b border-slate-800">
                  <th className="p-3 font-semibold">Ticker / Name</th>
                  <th className="p-3 font-semibold">Type</th>
                  <th className="p-3 font-semibold">Qty</th>
                  <th className="p-3 font-semibold">Entry / Exit Price</th>
                  <th className="p-3 font-semibold">Timestamps</th>
                  <th className="p-3 font-semibold">Status</th>
                  <th className="p-3 font-semibold text-right">Realized P&L</th>
                  <th className="p-3 font-semibold text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 bg-[#0b101c]">
                {trades.map((trade) => {
                  const stockObj = stocks.find((s) => s.ticker === trade.ticker) || stocks[0];
                  const currentPrice = stockObj.price;
                  const livePnl =
                    trade.status === 'OPEN'
                      ? (trade.type === 'BUY'
                          ? (currentPrice - trade.entryPrice) * trade.quantity
                          : (trade.entryPrice - currentPrice) * trade.quantity)
                      : trade.pnl || 0;

                  const isProfit = livePnl >= 0;

                  return (
                    <tr key={trade.id} className="hover:bg-slate-900/50 transition-colors">
                      <td className="p-3">
                        <div className="font-bold text-white">{trade.ticker}</div>
                        <div className="text-[10px] text-slate-400">{trade.name}</div>
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            trade.type === 'BUY'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              : 'bg-rose-950 text-rose-300 border border-rose-800'
                          }`}
                        >
                          {trade.type}
                        </span>
                      </td>
                      <td className="p-3 text-slate-300">{trade.quantity}</td>
                      <td className="p-3">
                        <div className="text-slate-200">Entry: ₹{trade.entryPrice}</div>
                        {trade.exitPrice && <div className="text-[10px] text-cyan-300">Exit: ₹{trade.exitPrice}</div>}
                      </td>
                      <td className="p-3 text-[11px] text-slate-400">
                        <div>In: {trade.entryTimestamp}</div>
                        {trade.exitTimestamp && <div>Out: {trade.exitTimestamp}</div>}
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] ${
                            trade.status === 'OPEN'
                              ? 'bg-amber-950 text-amber-300 border border-amber-800'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {trade.status}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <div className={`font-bold ${isProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {isProfit ? '+' : ''}₹{livePnl.toFixed(2)}
                        </div>
                      </td>
                      <td className="p-3 text-center">
                        {trade.status === 'OPEN' ? (
                          <button
                            onClick={() => onCloseTrade(trade.id, currentPrice)}
                            className="px-2.5 py-1 rounded bg-amber-950 hover:bg-amber-900 text-amber-300 border border-amber-800 text-[10px] font-bold transition-colors"
                          >
                            Close Trade
                          </button>
                        ) : (
                          <span className="text-[10px] text-slate-500">Settled</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
