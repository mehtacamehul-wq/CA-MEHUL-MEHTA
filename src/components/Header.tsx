import React, { useState, useEffect } from 'react';
import { Activity, Clock, ShieldCheck, Download, RefreshCw, Radio, FileSpreadsheet, BookOpen, Zap } from 'lucide-react';

interface HeaderProps {
  onExportMemo: () => void;
  onExportTradeCsv?: () => void;
  onOpenGuide?: () => void;
  onOpenServerStatus?: () => void;
  onOpenZerodhaModal?: () => void;
  isSimulating: boolean;
  onToggleSimulation: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onExportMemo,
  onExportTradeCsv,
  onOpenGuide,
  onOpenServerStatus,
  onOpenZerodhaModal,
  isSimulating,
  onToggleSimulation,
}) => {
  const [timeIST, setTimeIST] = useState('');
  const [timeUTC, setTimeUTC] = useState('');
  const [timeEST, setTimeEST] = useState('');

  useEffect(() => {
    const updateClocks = () => {
      const now = new Date();
      setTimeIST(
        now.toLocaleTimeString('en-US', {
          timeZone: 'Asia/Kolkata',
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
      setTimeUTC(
        now.toLocaleTimeString('en-US', {
          timeZone: 'UTC',
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
      setTimeEST(
        now.toLocaleTimeString('en-US', {
          timeZone: 'America/New_York',
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
    };

    updateClocks();
    const interval = setInterval(updateClocks, 1000);
    return () => clearInterval(interval);
  }, []);

  const tickerIndices = [
    { name: 'NIFTY 50', value: '25,810.85', change: '+142.30 (+0.55%)', isUp: true },
    { name: 'SENSEX', value: '84,544.30', change: '+418.15 (+0.50%)', isUp: true },
    { name: 'BANK NIFTY', value: '53,790.20', change: '+285.40 (+0.53%)', isUp: true },
    { name: 'BRENT CRUDE', value: '$78.45', change: '-1.15 (-1.44%)', isUp: false },
    { name: 'USD / INR', value: '₹83.92', change: '-0.05 (-0.06%)', isUp: false },
    { name: 'US 10Y', value: '4.14%', change: '+0.04 bps', isUp: true },
    { name: 'BITCOIN', value: '$65,120', change: '+2.91%', isUp: true },
  ];

  return (
    <header className="border-b border-slate-800/80 bg-[#090d16] sticky top-0 z-40 backdrop-blur-md">
      {/* Top Bar with Ticker Tape */}
      <div className="border-b border-slate-800/50 bg-[#060910] px-4 py-1.5 flex items-center justify-between text-xs overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-6 whitespace-nowrap">
          <div className="flex items-center gap-2 text-emerald-400 font-medium">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="tracking-wide">NSE / BSE LIVE (27-SEP-2026)</span>
          </div>

          <div className="h-3 w-px bg-slate-800 hidden sm:block" />

          <div className="flex items-center gap-5 text-slate-300 font-mono text-[11px]">
            {tickerIndices.map((idx, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <span className="text-slate-400 font-sans font-medium">{idx.name}</span>
                <span className="font-semibold text-slate-200">{idx.value}</span>
                <span className={idx.isUp ? 'text-emerald-400' : 'text-rose-400'}>
                  {idx.change}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-4 text-[11px] text-slate-400 font-mono pl-4">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-slate-500" />
            <span>IST</span>
            <span className="text-slate-200 font-semibold">{timeIST}</span>
          </div>
          <span className="text-slate-700">|</span>
          <div className="flex items-center gap-1">
            <span>EST</span>
            <span className="text-slate-300">{timeEST}</span>
          </div>
          <span className="text-slate-700">|</span>
          <div className="flex items-center gap-1">
            <span>UTC</span>
            <span className="text-slate-300">{timeUTC}</span>
          </div>
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="px-4 py-3 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-950/40 text-black font-bold text-lg tracking-wider">
            V
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                VORTEX
                <span className="text-xs font-mono font-normal px-2 py-0.5 rounded bg-slate-800/80 text-cyan-400 border border-cyan-800/30">
                  INSTITUTIONAL DESK
                </span>
              </h1>
            </div>
            <p className="text-xs text-slate-400">
              Equity Research Architecture · Real-Time Volume & Macro Matrix · Algorithmic SIP Desk
            </p>
          </div>
        </div>

        {/* Global Controls */}
        <div className="flex items-center gap-2.5">
          {onOpenServerStatus && (
            <button
              onClick={onOpenServerStatus}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-800/80 text-emerald-300 transition-colors shadow-sm"
              title="Check connection with real-time server and AI endpoints"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>Server Status</span>
            </button>
          )}

          {onOpenZerodhaModal && (
            <button
              onClick={onOpenZerodhaModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-orange-950/70 hover:bg-orange-900 border border-orange-700/60 text-orange-300 transition-colors shadow-sm"
              title="Link Zerodha Kite Connect Real-Time API Endpoints"
            >
              <Zap className="w-3.5 h-3.5 text-orange-400" />
              <span>Zerodha Kite API</span>
            </button>
          )}

          <button
            onClick={onToggleSimulation}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${
              isSimulating
                ? 'bg-emerald-950/40 border-emerald-700/50 text-emerald-300 hover:bg-emerald-900/40'
                : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
            }`}
            title="Toggle live simulated tick and volume matching stream"
          >
            <Radio className={`w-3.5 h-3.5 ${isSimulating ? 'text-emerald-400 animate-pulse' : 'text-slate-400'}`} />
            <span>{isSimulating ? 'Live Feed' : 'Paused'}</span>
          </button>

          {onExportTradeCsv && (
            <button
              onClick={onExportTradeCsv}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-[#121929] hover:bg-slate-800 border border-slate-700 text-slate-200 transition-colors shadow-sm"
              title="Export current asset order book, candles, block deals & volume profile as CSV"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-cyan-400" />
              <span>Export Trade CSV</span>
            </button>
          )}

          <button
            onClick={onExportMemo}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-semibold shadow-md shadow-cyan-950/50 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-950" />
            <span>Export Research Memo</span>
          </button>
        </div>
      </div>
    </header>
  );
};
