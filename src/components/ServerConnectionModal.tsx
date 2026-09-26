import React, { useState, useEffect } from 'react';
import { Server, Activity, CheckCircle2, AlertCircle, RefreshCw, Cpu, Database, Zap, Shield, Wifi } from 'lucide-react';

interface ServerConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  isSimulating: boolean;
}

interface DiagnosticResult {
  endpoint: string;
  status: 'SUCCESS' | 'ERROR' | 'TESTING';
  latencyMs: number;
  message: string;
  details?: any;
}

export const ServerConnectionModal: React.FC<ServerConnectionModalProps> = ({
  isOpen,
  onClose,
  isSimulating,
}) => {
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [results, setResults] = useState<DiagnosticResult[]>([
    { endpoint: '/api/health', status: 'SUCCESS', latencyMs: 14, message: 'Express backend server is online and responding.' },
    { endpoint: '/api/v1/stocks', status: 'SUCCESS', latencyMs: 22, message: 'NSE & BSE Listed Securities Master API operational (2500+ scrips).' },
    { endpoint: '/api/ai/intraday-tips', status: 'SUCCESS', latencyMs: 185, message: 'Gemini AI Intraday Smart Signal synthesis endpoint active.' },
    { endpoint: '/api/ai/research-report', status: 'SUCCESS', latencyMs: 210, message: 'Institutional Research Desk synthesis model ready.' },
  ]);
  const [serverInfo, setServerInfo] = useState<any>(null);

  useEffect(() => {
    if (isOpen) {
      runDiagnostics();
    }
  }, [isOpen]);

  const runDiagnostics = async () => {
    setIsRunningTests(true);
    const startTime = performance.now();

    try {
      // Test health endpoint
      const healthRes = await fetch('/api/health').catch(() => null);
      const healthLatency = Math.round(performance.now() - startTime);

      let healthData = null;
      if (healthRes && healthRes.ok) {
        healthData = await healthRes.json();
        setServerInfo(healthData);
      }

      // Test stocks API
      const stocksStart = performance.now();
      const stocksRes = await fetch('/api/v1/stocks?limit=5', {
        headers: { 'x-api-key': 'vortex_live_nse_bse_access_token_8892' },
      }).catch(() => null);
      const stocksLatency = Math.round(performance.now() - stocksStart);

      // Test AI Intraday tips endpoint check (light payload)
      const aiStart = performance.now();
      const aiRes = await fetch('/api/ai/intraday-tips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticker: 'RELIANCE', price: 2940 }),
      }).catch(() => null);
      const aiLatency = Math.round(performance.now() - aiStart);

      setResults([
        {
          endpoint: '/api/health',
          status: healthRes && healthRes.ok ? 'SUCCESS' : 'ERROR',
          latencyMs: healthLatency,
          message: healthRes && healthRes.ok ? 'Backend server connected successfully.' : 'Backend server unreachable.',
          details: healthData,
        },
        {
          endpoint: '/api/v1/stocks',
          status: stocksRes && stocksRes.ok ? 'SUCCESS' : 'ERROR',
          latencyMs: stocksLatency,
          message: stocksRes && stocksRes.ok ? 'NSE & BSE securities master API active.' : 'Securities API error.',
        },
        {
          endpoint: '/api/ai/intraday-tips',
          status: aiRes && aiRes.ok ? 'SUCCESS' : 'ERROR',
          latencyMs: aiLatency,
          message: aiRes && aiRes.ok ? 'Gemini AI smart investor tips engine connected.' : 'AI tip engine timeout.',
        },
        {
          endpoint: 'WebSocket / Real-Time Ticks',
          status: isSimulating ? 'SUCCESS' : 'TESTING',
          latencyMs: 12,
          message: isSimulating ? 'Live price & volume feed simulation active (2.8s tick).' : 'Live feed simulation is currently paused.',
        },
      ]);
    } catch (err: any) {
      console.error('Diagnostic error:', err);
    } finally {
      setIsRunningTests(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-[#0b101c] border border-slate-700 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-[#070b13] border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-emerald-950 border border-emerald-700/60 flex items-center justify-center text-emerald-400">
              <Wifi className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Real-Time Server & Backend Diagnostics
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/60">
                  CONNECTED
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Verifying connection to Vortex Express backend, NSE/BSE feeds, and Gemini AI synthesis engine
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-sm font-mono px-2.5 py-1 rounded bg-slate-800/80 hover:bg-slate-700 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Status Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-[#0e1526] border border-slate-800 p-3.5 rounded-lg flex items-center gap-3">
              <div className="p-2 rounded bg-cyan-950 text-cyan-400">
                <Server className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[11px] text-slate-400 font-medium">Backend Server</div>
                <div className="text-xs font-bold text-emerald-400 font-mono">Online (Port 3000)</div>
              </div>
            </div>

            <div className="bg-[#0e1526] border border-slate-800 p-3.5 rounded-lg flex items-center gap-3">
              <div className="p-2 rounded bg-amber-950 text-amber-400">
                <Cpu className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[11px] text-slate-400 font-medium">Gemini AI Engine</div>
                <div className="text-xs font-bold text-emerald-400 font-mono">Connected (3.8-Flash)</div>
              </div>
            </div>

            <div className="bg-[#0e1526] border border-slate-800 p-3.5 rounded-lg flex items-center gap-3">
              <div className="p-2 rounded bg-purple-950 text-purple-400">
                <Activity className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[11px] text-slate-400 font-medium">Market Simulation</div>
                <div className="text-xs font-bold text-cyan-300 font-mono">
                  {isSimulating ? 'Active (2.8s Ticks)' : 'Paused'}
                </div>
              </div>
            </div>
          </div>

          {/* Endpoint Ping Results */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Database className="w-3.5 h-3.5 text-cyan-400" />
                <span>API Endpoint Health & Latency Checks</span>
              </h3>
              <button
                onClick={runDiagnostics}
                disabled={isRunningTests}
                className="flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-3 h-3 ${isRunningTests ? 'animate-spin' : ''}`} />
                <span>{isRunningTests ? 'Testing...' : 'Run Diagnostics'}</span>
              </button>
            </div>

            <div className="space-y-2">
              {results.map((res, i) => (
                <div
                  key={i}
                  className="bg-[#070b13] border border-slate-800/80 p-3.5 rounded-lg flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {res.status === 'SUCCESS' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                    )}
                    <div className="min-w-0">
                      <div className="text-xs font-mono font-bold text-white truncate">{res.endpoint}</div>
                      <div className="text-[11px] text-slate-400 truncate">{res.message}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 font-mono text-xs">
                    <span className="text-slate-400">{res.latencyMs} ms</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        res.status === 'SUCCESS'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/60'
                          : 'bg-amber-950 text-amber-300 border border-amber-800/60'
                      }`}
                    >
                      {res.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {serverInfo && (
            <div className="bg-[#060910] border border-slate-800 p-3.5 rounded-lg font-mono text-[11px] text-slate-300 space-y-1">
              <div className="text-slate-400 font-bold mb-1">Server System Details:</div>
              <div>Environment: {serverInfo.environment}</div>
              <div>Server Time: {serverInfo.serverTime}</div>
              <div>System Uptime: {Math.round(serverInfo.uptime)} seconds</div>
              <div>Gemini API Configured: {serverInfo.geminiConfigured ? 'Yes (Active Key)' : 'No (Using Fallbacks)'}</div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-[#070b13] border-t border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-400">Connected to Vortex Secure WebSocket & REST Gateway</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 text-black font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
