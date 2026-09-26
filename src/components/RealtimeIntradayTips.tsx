import React, { useState, useEffect } from 'react';
import { Stock, IntradayTip } from '../types/equity';
import {
  Zap,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Target,
  ShieldAlert,
  ArrowRight,
  Clock,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Compass,
  Radio,
  Share2,
  Sliders,
  DollarSign,
  Activity,
  Layers,
} from 'lucide-react';

interface RealtimeIntradayTipsProps {
  stock: Stock;
}

export const RealtimeIntradayTips: React.FC<RealtimeIntradayTipsProps> = ({ stock }) => {
  const [tip, setTip] = useState<IntradayTip | null>(null);
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const fetchIntradayTip = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ai/intraday-tips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticker: stock.ticker,
          companyName: stock.name,
          price: stock.price,
          changePercent: stock.changePercent,
          volume: stock.volume,
          avgVolume20d: stock.avgVolume20d,
          deliveryPercent: stock.deliveryPercent,
          rsi14: stock.rsi14,
          vwap: stock.vwap,
          orderBook: stock.orderBook,
          macroContext: {
            crude: '78.50',
            usdinr: '84.15',
            repoRate: '6.50',
          },
        }),
      });

      const data = await res.json();
      if (data.tip) {
        setTip(data.tip);
        setLastUpdated(new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      }
    } catch (err) {
      console.error('Failed to fetch real-time intraday tip:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIntradayTip();
  }, [stock.ticker]);

  // Periodic simulated live check if auto-refresh is active (every 45s)
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      fetchIntradayTip();
    }, 45000);
    return () => clearInterval(interval);
  }, [autoRefresh, stock.ticker]);

  const copyOrderParams = () => {
    if (!tip) return;
    const text = `VORTEX AI INTRADAY TIP: ${tip.ticker} (${tip.signalType})
CMP: ₹${tip.currentPrice}
Entry Range: ₹${tip.entryRange[0]} - ₹${tip.entryRange[1]}
Target 1: ₹${tip.target1} | Target 2: ₹${tip.target2} | Target 3: ₹${tip.target3}
Strict Stop-Loss: ₹${tip.stopLoss}
Risk-Reward: ${tip.riskReward}
Exit Strategy: ${tip.smartInvestorLogic.exitStrategy}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getSignalBadge = (type: string) => {
    switch (type) {
      case 'SMART_BUY':
        return { label: 'SMART BUY (PULLBACK)', bg: 'bg-emerald-950/80 border-emerald-500/70 text-emerald-300' };
      case 'ACCUMULATE_DIP':
        return { label: 'ACCUMULATE VWAP DIP', bg: 'bg-cyan-950/80 border-cyan-500/70 text-cyan-300' };
      case 'SCALP_LONG':
        return { label: 'MOMENTUM SCALP LONG', bg: 'bg-teal-950/80 border-teal-500/70 text-teal-300' };
      case 'SMART_SELL':
      case 'SCALP_SHORT':
        return { label: 'SMART SELL (EXHAUSTION)', bg: 'bg-rose-950/80 border-rose-500/70 text-rose-300' };
      default:
        return { label: 'TACTICAL INTRADAY', bg: 'bg-blue-950/80 border-blue-500/70 text-blue-300' };
    }
  };

  const getSentimentBadge = (sentiment: string) => {
    if (sentiment.includes('BULLISH')) {
      return { text: sentiment.replace('_', ' '), color: 'text-emerald-400 bg-emerald-950/60 border-emerald-800' };
    } else if (sentiment.includes('BEARISH')) {
      return { text: sentiment.replace('_', ' '), color: 'text-rose-400 bg-rose-950/60 border-rose-800' };
    }
    return { text: sentiment.replace('_', ' '), color: 'text-amber-400 bg-amber-950/60 border-amber-800' };
  };

  return (
    <div className="bg-[#0b101c] border border-slate-800 rounded-xl overflow-hidden shadow-xl">
      {/* Header Bar */}
      <div className="p-4 bg-[#080d18] border-b border-slate-800 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-cyan-950/80 border border-cyan-800/80 text-cyan-400">
            <Zap className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
                <span>AI Real-Time Intraday Tips</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950/80 text-purple-300 border border-purple-800/60">
                  SMART INVESTOR ENGINE
                </span>
              </h3>
            </div>
            <p className="text-[11px] text-slate-400">
              Live market condition signals with automated entry/exit levels & sentiment-based risk management
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {lastUpdated && (
            <span className="text-[11px] font-mono text-slate-400 hidden sm:inline">
              Updated: {lastUpdated}
            </span>
          )}

          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-2.5 py-1.5 rounded text-xs font-mono border transition-colors flex items-center gap-1.5 ${
              autoRefresh
                ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
                : 'bg-slate-900 border-slate-700 text-slate-400'
            }`}
            title="Auto refresh signal based on live order book & volume shifts"
          >
            <Radio className={`w-3 h-3 ${autoRefresh ? 'text-emerald-400 animate-pulse' : 'text-slate-500'}`} />
            <span>{autoRefresh ? 'Live Radar (45s)' : 'Manual'}</span>
          </button>

          <button
            onClick={fetchIntradayTip}
            disabled={loading}
            className="p-1.5 rounded bg-[#121929] hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-colors disabled:opacity-50"
            title="Force refresh AI execution model"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
          </button>
        </div>
      </div>

      {loading && !tip && (
        <div className="py-12 flex flex-col items-center justify-center space-y-3">
          <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
          <span className="text-xs font-mono text-slate-400">
            Synthesizing Level-2 order book, Moneycontrol Market Buzz & Zee Business intraday desk for {stock.ticker}...
          </span>
        </div>
      )}

      {tip && (
        <div className="p-4 lg:p-5 space-y-5 text-xs">
          {/* Top Real-Time Signal Banner */}
          <div className="bg-[#070b13] border border-slate-800/90 rounded-lg p-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span
                    className={`text-xs font-mono font-bold px-2.5 py-1 rounded border shadow-sm ${
                      getSignalBadge(tip.signalType).bg
                    }`}
                  >
                    {getSignalBadge(tip.signalType).label}
                  </span>

                  <span
                    className={`text-[11px] font-mono px-2 py-0.5 rounded border uppercase font-semibold ${
                      getSentimentBadge(tip.sentimentVerdict).color
                    }`}
                  >
                    Sentiment: {getSentimentBadge(tip.sentimentVerdict).text}
                  </span>

                  <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-cyan-400" />
                    <span>Horizon: {tip.timeFrame}</span>
                  </span>
                </div>

                <div className="flex items-baseline gap-2 mt-2">
                  <h4 className="text-base font-bold text-white">
                    {tip.ticker} ({tip.companyName})
                  </h4>
                  <span className="font-mono text-xs text-slate-400">
                    CMP: ₹{tip.currentPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* Confidence Score & Risk Reward */}
              <div className="flex items-center gap-3">
                <div className="bg-[#0b101c] border border-slate-800 px-3 py-2 rounded text-center">
                  <div className="text-[10px] text-slate-400 font-mono">CONFIDENCE</div>
                  <div className="text-base font-bold font-mono text-cyan-300">
                    {tip.confidenceScore}%
                  </div>
                </div>

                <div className="bg-[#0b101c] border border-slate-800 px-3 py-2 rounded text-center">
                  <div className="text-[10px] text-slate-400 font-mono">RISK / REWARD</div>
                  <div className="text-base font-bold font-mono text-emerald-400">
                    {tip.riskReward}
                  </div>
                </div>

                <button
                  onClick={copyOrderParams}
                  className="px-3 py-2.5 rounded bg-[#121929] hover:bg-slate-800 border border-slate-700 text-slate-200 transition-colors flex items-center gap-1.5 text-xs font-semibold"
                  title="Copy full trade order details"
                >
                  {copied ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-300 font-mono">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Copy Order</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Tactical Execution Matrix: Entry, Targets, Stop-loss */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 mt-4 pt-3.5 border-t border-slate-800/80 font-mono">
              <div className="p-2.5 rounded bg-[#0b101c] border border-cyan-800/50">
                <span className="text-[10px] text-cyan-400 block font-sans font-bold">
                  SMART ENTRY ZONE
                </span>
                <span className="text-sm font-bold text-white block mt-0.5">
                  ₹{tip.entryRange[0]} - ₹{tip.entryRange[1]}
                </span>
                <span className="text-[10px] text-slate-400 font-sans block mt-0.5">
                  Liquidity absorption band
                </span>
              </div>

              <div className="p-2.5 rounded bg-[#0b101c] border border-emerald-900/60">
                <span className="text-[10px] text-emerald-400 block font-sans font-semibold">
                  TARGET 1 (Book 50%)
                </span>
                <span className="text-sm font-bold text-emerald-300 block mt-0.5">
                  ₹{tip.target1}
                </span>
                <span className="text-[10px] text-slate-400 font-sans block mt-0.5">
                  +{(((tip.target1 - tip.currentPrice) / tip.currentPrice) * 100).toFixed(1)}% from CMP
                </span>
              </div>

              <div className="p-2.5 rounded bg-[#0b101c] border border-emerald-900/60">
                <span className="text-[10px] text-emerald-400 block font-sans font-semibold">
                  TARGET 2 (Runner)
                </span>
                <span className="text-sm font-bold text-emerald-300 block mt-0.5">
                  ₹{tip.target2}
                </span>
                <span className="text-[10px] text-slate-400 font-sans block mt-0.5">
                  +{(((tip.target2 - tip.currentPrice) / tip.currentPrice) * 100).toFixed(1)}% from CMP
                </span>
              </div>

              <div className="p-2.5 rounded bg-[#0b101c] border border-emerald-900/60">
                <span className="text-[10px] text-emerald-400 block font-sans font-semibold">
                  TARGET 3 (Super Bull)
                </span>
                <span className="text-sm font-bold text-emerald-300 block mt-0.5">
                  ₹{tip.target3}
                </span>
                <span className="text-[10px] text-slate-400 font-sans block mt-0.5">
                  +{(((tip.target3 - tip.currentPrice) / tip.currentPrice) * 100).toFixed(1)}% from CMP
                </span>
              </div>

              <div className="p-2.5 rounded bg-[#0b101c] border border-rose-900/60">
                <span className="text-[10px] text-rose-400 block font-sans font-bold">
                  STRICT STOP-LOSS
                </span>
                <span className="text-sm font-bold text-rose-400 block mt-0.5">
                  ₹{tip.stopLoss}
                </span>
                <span className="text-[10px] text-slate-400 font-sans block mt-0.5">
                  -{(((tip.currentPrice - tip.stopLoss) / tip.currentPrice) * 100).toFixed(1)}% risk limit
                </span>
              </div>
            </div>
          </div>

          {/* 2-Column Institutional Breakdown: Smart Investor Logic vs Market Conditions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Left: Smart Investor Discipline (Entry & Exit Rules) */}
            <div className="bg-[#080c14] border border-slate-800 rounded-lg p-4 space-y-3">
              <div className="text-xs font-bold text-slate-200 flex items-center gap-2">
                <Target className="w-4 h-4 text-cyan-400" />
                <span>Smart Investor Discipline (No Retail Chasing)</span>
              </div>

              <div className="space-y-2.5">
                <div className="p-2.5 rounded bg-[#0b101c] border border-slate-800/80">
                  <span className="text-[10px] font-mono text-cyan-400 uppercase font-semibold block mb-0.5">
                    Why Smart Money Enters Here:
                  </span>
                  <p className="text-slate-300 leading-relaxed">
                    {tip.smartInvestorLogic.entryReason}
                  </p>
                </div>

                <div className="p-2.5 rounded bg-[#0b101c] border border-slate-800/80">
                  <span className="text-[10px] font-mono text-emerald-400 uppercase font-semibold block mb-0.5">
                    Automated Exit & Scale-Out Strategy:
                  </span>
                  <p className="text-slate-300 leading-relaxed">
                    {tip.smartInvestorLogic.exitStrategy}
                  </p>
                </div>

                <div className="p-2.5 rounded bg-[#0b101c] border border-slate-800/80">
                  <span className="text-[10px] font-mono text-amber-400 uppercase font-semibold block mb-0.5">
                    Trailing Stop-Loss Rule:
                  </span>
                  <p className="text-slate-300 leading-relaxed">
                    {tip.smartInvestorLogic.trailingStopLossGuideline}
                  </p>
                </div>

                <div className="p-2.5 rounded bg-[#0b101c] border border-rose-950/60 text-slate-300 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] font-mono text-rose-400 uppercase font-bold block mb-0.5">
                      Hard Invalidation Trigger:
                    </span>
                    <span>{tip.smartInvestorLogic.invalidationTrigger}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Live Market Condition & Sentiment Drivers */}
            <div className="bg-[#080c14] border border-slate-800 rounded-lg p-4 space-y-3">
              <div className="text-xs font-bold text-slate-200 flex items-center gap-2">
                <Activity className="w-4 h-4 text-purple-400" />
                <span>Real-Time Condition & Sentiment Synthesis</span>
              </div>

              <div className="space-y-2.5">
                {/* Real-time Order Flow Signals */}
                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                  <div className="p-2 rounded bg-[#0b101c] border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Volume vs 20-DMA</span>
                    <span className="text-slate-200 font-bold">
                      {tip.marketCondition.volumeSurgeRatio}x Surge
                    </span>
                  </div>

                  <div className="p-2 rounded bg-[#0b101c] border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Order Book Bias</span>
                    <span
                      className={`font-bold ${
                        tip.marketCondition.orderBookImbalance === 'BUY_PRESSURE'
                          ? 'text-emerald-400'
                          : tip.marketCondition.orderBookImbalance === 'SELL_PRESSURE'
                          ? 'text-rose-400'
                          : 'text-amber-400'
                      }`}
                    >
                      {tip.marketCondition.orderBookImbalance.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                {/* Delivery & POC Context */}
                <div className="p-2.5 rounded bg-[#0b101c] border border-slate-800/80">
                  <span className="text-[10px] font-mono text-slate-400 uppercase block mb-0.5">
                    Delivery Absorption vs Noise:
                  </span>
                  <p className="text-slate-300">
                    {tip.marketCondition.deliveryStrength}
                  </p>
                </div>

                {/* Media Sentiment Synthesizer Sources */}
                <div className="p-2.5 rounded bg-[#0b101c] border border-slate-800/80 space-y-2">
                  <span className="text-[10px] font-mono text-purple-400 uppercase font-semibold block">
                    Financial Portal Commentary:
                  </span>
                  <div className="text-slate-300 space-y-1.5 text-[11px]">
                    <div className="flex items-start gap-1.5">
                      <span className="text-cyan-400 font-bold">•</span>
                      <span>
                        <strong className="text-white">Moneycontrol Buzz:</strong>{' '}
                        {tip.marketCondition.sentimentSources.moneycontrol}
                      </span>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <span className="text-cyan-400 font-bold">•</span>
                      <span>
                        <strong className="text-white">Zee Business Traders Diary:</strong>{' '}
                        {tip.marketCondition.sentimentSources.zeeBusiness}
                      </span>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <span className="text-cyan-400 font-bold">•</span>
                      <span>
                        <strong className="text-white">FII / DII Institutional Flow:</strong>{' '}
                        {tip.marketCondition.sentimentSources.fiiDiiFlow}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
