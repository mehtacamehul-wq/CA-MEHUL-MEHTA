import React from 'react';
import { Stock } from '../types/equity';
import { exportTradeHistoryCsv } from '../utils/csvExport';
import { Layers, ShieldCheck, ArrowUpRight, ArrowDownRight, Zap, Target, FileSpreadsheet } from 'lucide-react';

interface VolumeAnalyticsProps {
  stock: Stock;
}

export const VolumeAnalytics: React.FC<VolumeAnalyticsProps> = ({ stock }) => {
  const { volume, avgVolume20d, deliveryPercent, vwap, price, orderBook, volumeProfile, recentBlockDeals } = stock;

  const surgeMultiplier = (volume / avgVolume20d).toFixed(2);
  const isSurging = Number(surgeMultiplier) >= 1.25;

  const totalDepth = orderBook.totalBidQty + orderBook.totalAskQty;
  const bidRatio = Math.round((orderBook.totalBidQty / Math.max(totalDepth, 1)) * 100);
  const askRatio = 100 - bidRatio;

  // Max volume in volume profile for width scaling
  const maxProfileVolume = Math.max(...volumeProfile.map((p) => p.volume), 1);

  const handleExportTradeHistory = () => {
    exportTradeHistoryCsv(stock);
  };

  return (
    <div className="bg-[#0b101c] border border-slate-800/80 rounded-xl p-4.5 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800/60 pb-3 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded bg-cyan-950/80 border border-cyan-800/50 text-cyan-400">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide">Real-Time Volume Profile & Order Flow</h3>
            <p className="text-[11px] text-slate-400">
              Institutional block trade radar, depth imbalance, and delivery absorption
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <span
            className={`text-xs font-mono font-medium px-2.5 py-1 rounded border ${
              isSurging
                ? 'bg-amber-950/40 border-amber-600/50 text-amber-300'
                : 'bg-slate-900 border-slate-700 text-slate-300'
            }`}
          >
            Volume Surge: <span className="font-bold">{surgeMultiplier}x</span> (20-DMA)
          </span>

          <button
            onClick={handleExportTradeHistory}
            className="flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold bg-[#121929] hover:bg-cyan-950/40 border border-slate-700 hover:border-cyan-600/60 text-slate-200 hover:text-cyan-300 transition-colors shadow-sm"
            title="Download CSV audit file of intraday candles, block deals, volume profile & order book depth"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export Trade CSV</span>
          </button>
        </div>
      </div>

      {/* Grid of Key Volume Gauges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Total Traded Volume */}
        <div className="bg-[#090d16] border border-slate-800/80 rounded-lg p-3">
          <div className="text-[11px] text-slate-400 font-mono">TODAY'S TRADED VOLUME</div>
          <div className="text-lg font-bold font-mono text-white mt-0.5">
            {(volume / 1000000).toFixed(2)}M <span className="text-xs text-slate-400 font-normal">shares</span>
          </div>
          <div className="text-[11px] text-slate-500 font-mono mt-1">
            20-DMA Avg: {(avgVolume20d / 1000000).toFixed(2)}M
          </div>
        </div>

        {/* VWAP Benchmark */}
        <div className="bg-[#090d16] border border-slate-800/80 rounded-lg p-3">
          <div className="text-[11px] text-slate-400 font-mono">VWAP (VOL-WEIGHTED AVG)</div>
          <div className="text-lg font-bold font-mono text-cyan-400 mt-0.5">
            ₹{vwap.toLocaleString('en-IN', { minimumFractionDigits: 1 })}
          </div>
          <div className="text-[11px] font-mono mt-1 flex items-center gap-1">
            <span className={price >= vwap ? 'text-emerald-400 font-medium' : 'text-rose-400 font-medium'}>
              {price >= vwap ? '+' : ''}
              {(((price - vwap) / vwap) * 100).toFixed(2)}%
            </span>
            <span className="text-slate-500">vs Current Price</span>
          </div>
        </div>

        {/* Delivery Percentage */}
        <div className="bg-[#090d16] border border-slate-800/80 rounded-lg p-3">
          <div className="text-[11px] text-slate-400 font-mono">DELIVERY VOLUME %</div>
          <div className="text-lg font-bold font-mono text-emerald-400 mt-0.5">
            {deliveryPercent}%
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all"
              style={{ width: `${deliveryPercent}%` }}
            />
          </div>
        </div>

        {/* Order Flow Imbalance */}
        <div className="bg-[#090d16] border border-slate-800/80 rounded-lg p-3">
          <div className="text-[11px] text-slate-400 font-mono">ORDER BOOK DEPTH RATIO</div>
          <div className="flex items-center justify-between font-mono text-xs mt-1">
            <span className="text-emerald-400 font-bold">{bidRatio}% Bid (Buy)</span>
            <span className="text-rose-400 font-bold">{askRatio}% Ask (Sell)</span>
          </div>
          <div className="w-full bg-rose-950/70 h-2 rounded-full mt-1.5 overflow-hidden flex">
            <div
              className="bg-emerald-500 h-full transition-all"
              style={{ width: `${bidRatio}%` }}
            />
          </div>
        </div>
      </div>

      {/* Two Column Layout: Intraday Volume Profile & Order Book Ladder */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Intraday Volume Profile Histogram (7 cols) */}
        <div className="lg:col-span-7 bg-[#090d16] border border-slate-800/70 rounded-lg p-3.5 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-300">Intraday Volume-At-Price (POC & Value Area)</span>
            <span className="text-[11px] font-mono text-cyan-400">Point of Control (POC)</span>
          </div>

          <div className="space-y-2 pt-1">
            {volumeProfile.map((bucket, idx) => {
              const widthPct = Math.round((bucket.volume / maxProfileVolume) * 100);
              const isCurrentBucket = Math.abs(price - bucket.price) < 15;

              return (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className={`font-semibold ${bucket.isPoc ? 'text-amber-300' : 'text-slate-300'}`}>
                      ₹{bucket.price.toLocaleString('en-IN')}
                      {bucket.isPoc && (
                        <span className="ml-1.5 text-[9px] uppercase px-1 py-0.2 rounded bg-amber-950/60 text-amber-300 border border-amber-700/50">
                          POC
                        </span>
                      )}
                      {isCurrentBucket && (
                        <span className="ml-1.5 text-[9px] uppercase px-1 py-0.2 rounded bg-cyan-950/60 text-cyan-300 border border-cyan-700/50">
                          CMP
                        </span>
                      )}
                    </span>
                    <span className="text-slate-400">
                      {(bucket.volume / 1000).toFixed(0)}k shares ({widthPct}%)
                    </span>
                  </div>

                  <div className="w-full bg-slate-900 h-2.5 rounded overflow-hidden">
                    <div
                      className={`h-full rounded transition-all ${
                        bucket.isPoc
                          ? 'bg-gradient-to-r from-amber-500 to-amber-400 shadow-sm shadow-amber-500/50'
                          : isCurrentBucket
                          ? 'bg-gradient-to-r from-cyan-500 to-blue-500'
                          : 'bg-slate-700 hover:bg-slate-600'
                      }`}
                      style={{ width: `${widthPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="text-[10px] text-slate-500 font-mono pt-1">
            * Point of Control (POC) indicates the price cluster with maximum traded volume during the session.
          </div>
        </div>

        {/* Right Column: Level-2 Order Book Ladder (5 cols) */}
        <div className="lg:col-span-5 bg-[#090d16] border border-slate-800/70 rounded-lg p-3.5 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-300">Level-2 Order Depth Ladder</span>
            <span className="text-[11px] font-mono text-slate-500">Live Bids vs Asks</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
            {/* Bids Column */}
            <div>
              <div className="flex justify-between text-slate-500 border-b border-slate-800 pb-1 mb-1">
                <span>Bid (₹)</span>
                <span>Qty</span>
              </div>
              <div className="space-y-1">
                {orderBook.bids.slice(0, 5).map((bid, i) => (
                  <div key={i} className="flex justify-between text-emerald-400">
                    <span className="font-semibold">₹{bid.price.toFixed(1)}</span>
                    <span className="text-slate-300">{bid.quantity.toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Asks Column */}
            <div>
              <div className="flex justify-between text-slate-500 border-b border-slate-800 pb-1 mb-1">
                <span>Ask (₹)</span>
                <span>Qty</span>
              </div>
              <div className="space-y-1">
                {orderBook.asks.slice(0, 5).map((ask, i) => (
                  <div key={i} className="flex justify-between text-rose-400">
                    <span className="font-semibold">₹{ask.price.toFixed(1)}</span>
                    <span className="text-slate-300">{ask.quantity.toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-2 flex justify-between text-[11px] font-mono">
            <span className="text-slate-400">Total Bids: {(orderBook.totalBidQty / 1000).toFixed(0)}k</span>
            <span className="text-slate-400">Total Asks: {(orderBook.totalAskQty / 1000).toFixed(0)}k</span>
          </div>
        </div>
      </div>

      {/* Block Deal Radar Feed */}
      <div className="bg-[#090d16] border border-slate-800/70 rounded-lg p-3 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 font-semibold text-slate-300">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Institutional Block Deal & Bulk Trade Radar (₹50+ Cr)</span>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">Exchange Authenticated</span>
        </div>

        {recentBlockDeals.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-[10px] text-slate-500">
                  <th className="py-1">TIME</th>
                  <th className="py-1">CLIENT / INSTITUTION</th>
                  <th className="py-1">SIDE</th>
                  <th className="py-1">PRICE (₹)</th>
                  <th className="py-1">QUANTITY</th>
                  <th className="py-1 text-right">VALUE (₹ CR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {recentBlockDeals.map((deal) => (
                  <tr key={deal.id} className="hover:bg-slate-800/30">
                    <td className="py-1.5 text-slate-400">{deal.time}</td>
                    <td className="py-1.5 text-slate-200 font-sans font-medium">{deal.client}</td>
                    <td className="py-1.5">
                      <span
                        className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                          deal.type === 'BUY'
                            ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40'
                            : 'bg-rose-950/60 text-rose-400 border border-rose-800/40'
                        }`}
                      >
                        {deal.type}
                      </span>
                    </td>
                    <td className="py-1.5 text-slate-200">₹{deal.price.toFixed(1)}</td>
                    <td className="py-1.5 text-slate-400">{deal.quantity.toLocaleString('en-IN')}</td>
                    <td className="py-1.5 text-right font-bold text-cyan-400">₹{deal.valueCr.toFixed(2)} Cr</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-xs text-slate-500 py-2">
            No institutional block trades recorded in the current session yet.
          </div>
        )}
      </div>
    </div>
  );
};
