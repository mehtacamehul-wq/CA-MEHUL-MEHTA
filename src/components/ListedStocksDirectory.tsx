import React, { useState, useEffect } from 'react';
import { LISTED_NSE_BSE_MASTER, ListedSecurityMeta } from '../data/listedSecuritiesMaster';
import { INITIAL_STOCKS } from '../data/mockEquities';
import { Stock } from '../types/equity';
import { InteractiveChart } from './InteractiveChart';
import {
  Key,
  Database,
  Search,
  Code,
  CheckCircle2,
  Copy,
  ExternalLink,
  Filter,
  Layers,
  ArrowRight,
  TrendingUp,
  Download,
  Terminal,
  ShieldCheck,
  BarChart3,
  X,
} from 'lucide-react';

interface ListedStocksDirectoryProps {
  onSelectStock: (ticker: string) => void;
  onAddStockToTerminal: (stock: Stock) => void;
}

export const ListedStocksDirectory: React.FC<ListedStocksDirectoryProps> = ({
  onSelectStock,
  onAddStockToTerminal,
}) => {
  const [apiKey, setApiKey] = useState('vortex_live_nse_bse_access_token_8892');
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedCurl, setCopiedCurl] = useState(false);
  const [selectedExchange, setSelectedExchange] = useState<'ALL' | 'NSE' | 'BSE'>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | 'LARGE_CAP' | 'MID_CAP'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSector, setSelectedSector] = useState<string>('ALL');
  const [testResponse, setTestResponse] = useState<any>(null);
  const [loadingTest, setLoadingTest] = useState(false);
  const [activeCodeTab, setActiveCodeTab] = useState<'CURL' | 'JS' | 'PYTHON'>('CURL');
  const [quickChartMeta, setQuickChartMeta] = useState<ListedSecurityMeta | null>(null);

  const generateStockFromMeta = (meta: ListedSecurityMeta): Stock => {
    const found = INITIAL_STOCKS.find((s) => s.ticker === meta.ticker);
    if (found) return found;

    const base = meta.basePrice;
    const candles = Array.from({ length: 24 }, (_, i) => {
      const jitter = (Math.sin(i + meta.ticker.charCodeAt(0)) * 0.015) * base;
      const open = base + jitter;
      const close = open + (Math.cos(i) * 0.01) * base;
      const high = Math.max(open, close) + Math.abs(jitter) * 0.5;
      const low = Math.min(open, close) - Math.abs(jitter) * 0.5;
      const volume = Math.floor(100000 + Math.abs(Math.sin(i) * 500000));
      const time = `${9 + Math.floor(i / 4)}:${(15 + (i % 4) * 15) % 60}`;
      return { time, open, high, low, close, volume, vwap: (open + close) / 2 };
    });

    return {
      ticker: meta.ticker,
      name: meta.name,
      sector: meta.sector,
      exchange: meta.exchange === 'BOTH' ? 'NSE' : meta.exchange,
      price: meta.basePrice,
      change: meta.basePrice * 0.012,
      changePercent: 1.25,
      prevClose: meta.basePrice * 0.988,
      open: meta.basePrice * 0.99,
      high: meta.basePrice * 1.015,
      low: meta.basePrice * 0.985,
      high52w: meta.basePrice * 1.3,
      low52w: meta.basePrice * 0.7,
      volume: 1250000,
      avgVolume20d: 1100000,
      deliveryPercent: 52.4,
      vwap: meta.basePrice * 0.998,
      marketCap: 75000,
      pe: meta.pe,
      medianPe5y: meta.medianPe5y,
      pb: 3.2,
      evEbitda: 15.4,
      roe: 14.5,
      roce: 16.2,
      debtToEquity: 0.25,
      fcfYield: 3.2,
      divYield: 1.1,
      rsi14: 55.4,
      dma50: meta.basePrice * 0.99,
      dma200: meta.dma200,
      beta: 1.05,
      sharesOutstanding: 250,
      currency: 'INR',
      orderBook: {
        bids: [
          { price: meta.basePrice * 0.999, quantity: 1200, orders: 15 },
          { price: meta.basePrice * 0.998, quantity: 2400, orders: 28 },
        ],
        asks: [
          { price: meta.basePrice * 1.001, quantity: 1500, orders: 18 },
          { price: meta.basePrice * 1.002, quantity: 3100, orders: 35 },
        ],
        totalBidQty: 15200,
        totalAskQty: 18400,
      },
      volumeProfile: [
        { price: meta.basePrice * 0.99, volume: 50000 },
        { price: meta.basePrice, volume: 120000, isPoc: true },
        { price: meta.basePrice * 1.01, volume: 80000 },
      ],
      recentBlockDeals: [],
      candles,
    };
  };

  // Distinct sectors
  const sectors = ['ALL', ...Array.from(new Set(LISTED_NSE_BSE_MASTER.map((s) => s.sector)))];

  const filteredSecurities = LISTED_NSE_BSE_MASTER.filter((item) => {
    const matchesExchange =
      selectedExchange === 'ALL' || item.exchange === selectedExchange || item.exchange === 'BOTH';
    const matchesCategory =
      selectedCategory === 'ALL' || item.marketCapCategory === selectedCategory;
    const matchesSector = selectedSector === 'ALL' || item.sector === selectedSector;
    const matchesQuery =
      item.ticker.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.isin.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.bseScripCode && item.bseScripCode.includes(searchQuery));

    return matchesExchange && matchesCategory && matchesSector && matchesQuery;
  });

  const handleCopyKey = () => {
    navigator.clipboard.writeText(apiKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleTestApi = async () => {
    setLoadingTest(true);
    try {
      const url = `/api/v1/stocks?exchange=${selectedExchange}&limit=5`;
      const res = await fetch(url, {
        headers: {
          'x-api-key': apiKey,
        },
      });
      const data = await res.json();
      setTestResponse(data);
    } catch (err: any) {
      setTestResponse({ error: 'Failed to test endpoint', details: err.message });
    } finally {
      setLoadingTest(false);
    }
  };

  const curlCommand = `curl -X GET "${window.location.origin}/api/v1/stocks?exchange=NSE&limit=25" \\
  -H "x-api-key: ${apiKey}"`;

  const jsCode = `// Fetch all NSE & BSE listed stocks via Vortex API
const response = await fetch("${window.location.origin}/api/v1/stocks?exchange=BOTH", {
  headers: {
    "x-api-key": "${apiKey}"
  }
});
const { totalCount, data } = await response.json();
console.log(\`Retrieved \${totalCount} listed securities\`, data);`;

  const pythonCode = `import requests

url = "${window.location.origin}/api/v1/stocks"
headers = {
    "x-api-key": "${apiKey}"
}
params = {
    "exchange": "NSE",
    "limit": 50
}

response = requests.get(url, headers=headers, params=params)
data = response.json()
print("Listed Stocks:", len(data.get("data", [])))`;

  const handleCopyCurl = () => {
    const textToCopy =
      activeCodeTab === 'CURL' ? curlCommand : activeCodeTab === 'JS' ? jsCode : pythonCode;
    navigator.clipboard.writeText(textToCopy);
    setCopiedCurl(true);
    setTimeout(() => setCopiedCurl(false), 2000);
  };

  const handleLoadIntoTerminal = (sec: ListedSecurityMeta) => {
    const newStock: Stock = {
      ticker: sec.ticker,
      name: sec.name,
      sector: sec.sector,
      exchange: sec.exchange === 'BSE' ? 'BSE' : 'NSE',
      price: sec.basePrice,
      change: Number((sec.basePrice * 0.008).toFixed(1)),
      changePercent: 0.8,
      prevClose: sec.basePrice * 0.992,
      open: sec.basePrice * 0.995,
      high: sec.basePrice * 1.015,
      low: sec.basePrice * 0.99,
      high52w: sec.basePrice * 1.35,
      low52w: sec.basePrice * 0.72,
      volume: 4500000,
      avgVolume20d: 3800000,
      deliveryPercent: 58.4,
      vwap: sec.basePrice * 1.002,
      marketCap: 450000,
      pe: sec.pe,
      medianPe5y: sec.medianPe5y,
      pb: 3.8,
      evEbitda: 14.5,
      roe: 18.2,
      roce: 16.4,
      debtToEquity: 0.35,
      fcfYield: 4.1,
      divYield: 1.1,
      rsi14: 55.4,
      dma50: sec.basePrice * 0.98,
      dma200: sec.dma200,
      beta: 0.98,
      sharesOutstanding: 320.0,
      currency: 'INR',
      orderBook: {
        bids: [{ price: sec.basePrice - 0.5, quantity: 15400, orders: 34 }],
        asks: [{ price: sec.basePrice + 0.5, quantity: 12800, orders: 28 }],
        totalBidQty: 1200000,
        totalAskQty: 980000,
      },
      volumeProfile: [
        { price: sec.basePrice * 0.98, volume: 450000 },
        { price: sec.basePrice, volume: 1850000, isPoc: true },
        { price: sec.basePrice * 1.02, volume: 620000 },
      ],
      recentBlockDeals: [
        {
          id: `bd-${sec.ticker}`,
          time: '14:15:00',
          price: sec.basePrice,
          quantity: 250000,
          valueCr: Number(((250000 * sec.basePrice) / 10000000).toFixed(2)),
          type: 'BUY',
          client: 'Institutional Block Desk',
        },
      ],
      candles: [
        {
          time: '09:15',
          open: sec.basePrice * 0.995,
          high: sec.basePrice * 1.01,
          low: sec.basePrice * 0.99,
          close: sec.basePrice,
          volume: 850000,
          vwap: sec.basePrice,
        },
      ],
    };

    onAddStockToTerminal(newStock);
    onSelectStock(sec.ticker);
  };

  return (
    <div className="bg-[#0b101c] border border-slate-800/80 rounded-xl p-4.5 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800/60 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded bg-cyan-950/80 border border-cyan-800/50 text-cyan-400">
            <Database className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
              NSE & BSE Listed Securities Registry · API Key Gateway
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800/50">
                REST v1 LIVE
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Access all stocks listed on National Stock Exchange (NSE) and Bombay Stock Exchange (BSE) with institutional REST endpoints
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-400">
            Securities in Registry:{' '}
            <span className="font-bold text-cyan-400">{LISTED_NSE_BSE_MASTER.length}</span>
          </span>
        </div>
      </div>

      {/* API Key Credentials & Endpoint Documentation Card */}
      <div className="bg-[#090d16] border border-slate-800/90 rounded-lg p-4 space-y-3.5">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 border-b border-slate-800/60 pb-3">
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-amber-400" />
              <span>Institutional API Key & Bearer Authentication</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Authenticate requests by including this key in the <code className="text-cyan-300 font-mono">x-api-key</code> request header or <code className="text-cyan-300 font-mono">?apiKey=</code> URL param.
            </p>
          </div>

          {/* API Key Display & Copy */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="px-3 py-1.5 rounded bg-[#101726] border border-slate-700 font-mono text-xs text-amber-300 flex items-center justify-between gap-3 min-w-[280px]">
              <span className="truncate">{apiKey}</span>
              <button
                onClick={handleCopyKey}
                className="text-slate-400 hover:text-white transition-colors"
                title="Copy API Key"
              >
                {copiedKey ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>

            <button
              onClick={handleTestApi}
              disabled={loadingTest}
              className="px-3 py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 text-black font-semibold text-xs transition-colors shrink-0 flex items-center gap-1"
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>{loadingTest ? 'Executing...' : 'Test API'}</span>
            </button>
          </div>
        </div>

        {/* REST API Endpoints Specs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded bg-[#0b101c] border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-400 font-bold border border-emerald-800">
                GET
              </span>
              <span className="font-mono text-slate-400 text-[11px]">/api/v1/stocks</span>
            </div>
            <p className="text-[11px] text-slate-300">
              Query all stocks across NSE and BSE. Filter by <code className="text-cyan-300 font-mono">exchange</code>, <code className="text-cyan-300 font-mono">sector</code>, <code className="text-cyan-300 font-mono">query</code>, and <code className="text-cyan-300 font-mono">limit</code>.
            </p>
          </div>

          <div className="p-3 rounded bg-[#0b101c] border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-400 font-bold border border-emerald-800">
                GET
              </span>
              <span className="font-mono text-slate-400 text-[11px]">/api/v1/stocks/:ticker</span>
            </div>
            <p className="text-[11px] text-slate-300">
              Retrieve real-time metrics, ISIN, BSE Scrip Code, 5Y Median P/E, and 200-DMA for a specific security.
            </p>
          </div>
        </div>

        {/* Code Snippets & Test Runner */}
        <div className="border-t border-slate-800/60 pt-3 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-mono">
              {(['CURL', 'JS', 'PYTHON'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveCodeTab(tab)}
                  className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
                    activeCodeTab === tab
                      ? 'bg-slate-800 text-cyan-300 border border-slate-700'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <button
              onClick={handleCopyCurl}
              className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white transition-colors"
            >
              {copiedCurl ? (
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              ) : (
                <Copy className="w-3 h-3" />
              )}
              <span>{copiedCurl ? 'Copied' : 'Copy Code'}</span>
            </button>
          </div>

          <pre className="p-3 rounded-lg bg-[#060910] border border-slate-800 font-mono text-[11px] text-slate-300 overflow-x-auto whitespace-pre">
            {activeCodeTab === 'CURL' ? curlCommand : activeCodeTab === 'JS' ? jsCode : pythonCode}
          </pre>

          {/* Test Live Response Panel */}
          {testResponse && (
            <div className="p-3 rounded-lg bg-[#04070d] border border-cyan-800/40 space-y-1">
              <div className="text-[10px] font-mono text-cyan-400 flex items-center justify-between">
                <span>API RESPONSE (HTTP 200 OK)</span>
                <span>{testResponse.timestamp || 'Ready'}</span>
              </div>
              <pre className="font-mono text-[10px] text-emerald-300/90 max-h-40 overflow-y-auto whitespace-pre-wrap">
                {JSON.stringify(testResponse, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>

      {/* Interactive Stock Directory Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#090d16] border border-slate-800/80 p-3 rounded-lg">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Ticker, Company Name, BSE Scrip Code, or ISIN..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-md bg-[#05080f] border border-slate-700 text-slate-200 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Exchange Filter */}
          <div className="flex items-center p-0.5 rounded bg-[#05080f] border border-slate-800 text-xs font-mono">
            {(['ALL', 'NSE', 'BSE'] as const).map((ex) => (
              <button
                key={ex}
                onClick={() => setSelectedExchange(ex)}
                className={`px-2.5 py-1 rounded text-[10px] font-semibold transition-colors ${
                  selectedExchange === ex
                    ? 'bg-cyan-600 text-black'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {ex}
              </button>
            ))}
          </div>

          {/* Market Cap Category Filter */}
          <div className="flex items-center p-0.5 rounded bg-[#05080f] border border-slate-800 text-xs font-mono">
            {(['ALL', 'LARGE_CAP', 'MID_CAP'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded text-[10px] font-semibold transition-colors ${
                  selectedCategory === cat
                    ? 'bg-amber-600 text-black'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {cat === 'LARGE_CAP' ? 'Large Cap' : cat === 'MID_CAP' ? 'Mid Cap' : 'All Caps'}
              </button>
            ))}
          </div>

          {/* Sector Dropdown */}
          <select
            value={selectedSector}
            onChange={(e) => setSelectedSector(e.target.value)}
            className="px-2.5 py-1 rounded bg-[#05080f] border border-slate-700 text-xs text-slate-300 focus:outline-none focus:border-cyan-500 font-mono"
          >
            {sectors.map((sec) => (
              <option key={sec} value={sec}>
                {sec === 'ALL' ? 'All Sectors' : sec}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Securities Master Table */}
      <div className="overflow-x-auto rounded-lg border border-slate-800/80">
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-[#090d16] text-[10px] text-slate-400 border-b border-slate-800">
            <tr>
              <th className="py-2.5 px-3">TICKER & SECURITY</th>
              <th className="py-2.5 px-3">EXCHANGE</th>
              <th className="py-2.5 px-3">BSE CODE / ISIN</th>
              <th className="py-2.5 px-3">SECTOR & INDUSTRY</th>
              <th className="py-2.5 px-3">PRICE (INR)</th>
              <th className="py-2.5 px-3">P/E vs 5Y MEDIAN</th>
              <th className="py-2.5 px-3">200-DMA</th>
              <th className="py-2.5 px-3 text-right">ACTION</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 bg-[#070b13]">
            {filteredSecurities.map((sec) => {
              const peDiff = (((sec.pe - sec.medianPe5y) / sec.medianPe5y) * 100).toFixed(1);
              return (
                <tr key={sec.ticker} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-2.5 px-3">
                    <div className="font-bold text-white tracking-wide text-xs">{sec.ticker}</div>
                    <div className="text-[11px] text-slate-400 font-sans font-medium line-clamp-1">
                      {sec.name}
                    </div>
                  </td>

                  <td className="py-2.5 px-3">
                    <span
                      className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                        sec.exchange === 'BOTH'
                          ? 'bg-blue-950/70 text-blue-300 border border-blue-800/50'
                          : sec.exchange === 'NSE'
                          ? 'bg-emerald-950/70 text-emerald-300 border border-emerald-800/50'
                          : 'bg-amber-950/70 text-amber-300 border border-amber-800/50'
                      }`}
                    >
                      {sec.exchange === 'BOTH' ? 'NSE & BSE' : sec.exchange}
                    </span>
                  </td>

                  <td className="py-2.5 px-3 text-[11px] text-slate-400">
                    <div>{sec.bseScripCode || '-'}</div>
                    <div className="text-[10px] text-slate-500">{sec.isin}</div>
                  </td>

                  <td className="py-2.5 px-3 font-sans text-[11px]">
                    <div className="text-slate-300">{sec.sector}</div>
                    <div className="text-[10px] text-slate-500 line-clamp-1">{sec.industry}</div>
                  </td>

                  <td className="py-2.5 px-3 font-bold text-white text-xs">
                    ₹{sec.basePrice.toLocaleString('en-IN', { maximumFractionDigits: 1 })}
                  </td>

                  <td className="py-2.5 px-3">
                    <div className="text-slate-200">{sec.pe}x</div>
                    <div
                      className={`text-[10px] ${
                        Number(peDiff) <= 0 ? 'text-emerald-400' : 'text-amber-400'
                      }`}
                    >
                      {Number(peDiff) > 0 ? '+' : ''}
                      {peDiff}% vs 5Y
                    </div>
                  </td>

                  <td className="py-2.5 px-3 text-slate-300 text-[11px]">
                    ₹{sec.dma200.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  </td>

                  <td className="py-2.5 px-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setQuickChartMeta(sec)}
                        className="px-2.5 py-1 rounded bg-amber-950/80 hover:bg-amber-900 border border-amber-700/60 text-amber-300 text-[11px] font-semibold transition-colors flex items-center gap-1"
                        title="View interactive chart for this ticker"
                      >
                        <BarChart3 className="w-3 h-3 text-amber-400" />
                        <span>Chart</span>
                      </button>

                      <button
                        onClick={() => handleLoadIntoTerminal(sec)}
                        className="px-2.5 py-1 rounded bg-cyan-950 hover:bg-cyan-900/60 border border-cyan-700/50 text-cyan-300 text-[11px] font-semibold transition-colors flex items-center gap-1"
                        title="Load security into Interactive Terminal, Volume Flow & AI Desk"
                      >
                        <span>Analyze</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="text-[11px] text-slate-500 font-mono flex items-center justify-between pt-1">
        <span>Showing {filteredSecurities.length} of {LISTED_NSE_BSE_MASTER.length} listed securities</span>
        <span>Authenticated via Vortex Institutional Core Feed · NSE/BSE ISIN Compliant</span>
      </div>

      {/* Quick Interactive Chart Modal for Any Ticker */}
      {quickChartMeta && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#0b101c] border border-cyan-500/60 rounded-xl p-5 max-w-4xl w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-amber-950 text-amber-400 border border-amber-800">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    {quickChartMeta.ticker} — {quickChartMeta.name}
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                      CMP: ₹{quickChartMeta.basePrice}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    Sector: {quickChartMeta.sector} | Exchange: {quickChartMeta.exchange} | 200-DMA: ₹{quickChartMeta.dma200}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setQuickChartMeta(null)}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <InteractiveChart stock={generateStockFromMeta(quickChartMeta)} />

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setQuickChartMeta(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono font-bold"
              >
                Close
              </button>
              <button
                onClick={() => {
                  const stockObj = generateStockFromMeta(quickChartMeta);
                  onAddStockToTerminal(stockObj);
                  onSelectStock(quickChartMeta.ticker);
                  setQuickChartMeta(null);
                }}
                className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-black text-xs font-mono font-bold shadow-md flex items-center gap-1.5"
              >
                <span>Load into Full Terminal</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
