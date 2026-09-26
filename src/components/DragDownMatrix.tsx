import React, { useState } from 'react';
import { LISTED_NSE_BSE_MASTER, ListedSecurityMeta } from '../data/listedSecuritiesMaster';
import { Stock } from '../types/equity';
import {
  Table,
  Search,
  ArrowUpDown,
  Download,
  Copy,
  CheckCircle2,
  Sliders,
  Sparkles,
  TrendingUp,
  Layers,
  ArrowRight,
  RefreshCw,
  Zap,
} from 'lucide-react';

interface DragDownMatrixProps {
  onSelectStock: (ticker: string) => void;
  onAddStockToTerminal: (stock: Stock) => void;
}

interface MatrixRowItem extends ListedSecurityMeta {
  customTargetPrice: number;
  customStopLoss: number;
  portfolioWeight: number;
}

export const DragDownMatrix: React.FC<DragDownMatrixProps> = ({
  onSelectStock,
  onAddStockToTerminal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSector, setSelectedSector] = useState('ALL');
  const [selectedCap, setSelectedCap] = useState('ALL');
  const [sortField, setSortField] = useState<'ticker' | 'basePrice' | 'pe' | 'dma200'>('ticker');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [copied, setCopied] = useState(false);

  // Initialize spreadsheet rows with custom fillable metrics
  const [rows, setRows] = useState<MatrixRowItem[]>(() =>
    LISTED_NSE_BSE_MASTER.slice(0, 100).map((sec, idx) => ({
      ...sec,
      customTargetPrice: Math.round(sec.basePrice * 1.15),
      customStopLoss: Math.round(sec.basePrice * 0.95),
      portfolioWeight: Number((100 / Math.min(LISTED_NSE_BSE_MASTER.length, 100)).toFixed(2)),
    }))
  );

  // Drag down fill settings
  const [fillMultiplier, setFillMultiplier] = useState<number>(1.20);
  const [fillStopLossPct, setFillStopLossPct] = useState<number>(0.92);

  const sectors = ['ALL', ...Array.from(new Set(LISTED_NSE_BSE_MASTER.map((s) => s.sector)))];

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleCellChange = (ticker: string, field: 'customTargetPrice' | 'customStopLoss' | 'portfolioWeight', value: number) => {
    setRows((prev) =>
      prev.map((r) => (r.ticker === ticker ? { ...r, [field]: value } : r))
    );
  };

  // Drag down fill action (applies formula across all filtered or selected rows)
  const handleDragDownFillAll = () => {
    setRows((prev) =>
      prev.map((r) => {
        const matches =
          (selectedSector === 'ALL' || r.sector === selectedSector) &&
          (selectedCap === 'ALL' || r.marketCapCategory === selectedCap) &&
          (searchQuery === '' ||
            r.ticker.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.name.toLowerCase().includes(searchQuery.toLowerCase()));

        if (!matches) return r;

        return {
          ...r,
          customTargetPrice: Math.round(r.basePrice * fillMultiplier),
          customStopLoss: Math.round(r.basePrice * fillStopLossPct),
        };
      })
    );
  };

  const handleSort = (field: 'ticker' | 'basePrice' | 'pe' | 'dma200') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredRows = rows.filter((r) => {
    const matchesSec = selectedSector === 'ALL' || r.sector === selectedSector;
    const matchesCap = selectedCap === 'ALL' || r.marketCapCategory === selectedCap;
    const matchesQuery =
      searchQuery === '' ||
      r.ticker.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.isin.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.bseScripCode && r.bseScripCode.includes(searchQuery));

    return matchesSec && matchesCap && matchesQuery;
  }).sort((a, b) => {
    let valA = a[sortField];
    let valB = b[sortField];
    if (typeof valA === 'string') {
      return sortDirection === 'asc'
        ? (valA as string).localeCompare(valB as string)
        : (valB as string).localeCompare(valA as string);
    }
    return sortDirection === 'asc' ? (valA as number) - (valB as number) : (valB as number) - (valA as number);
  });

  const handleExportCsv = () => {
    const headers = ['Ticker', 'Company Name', 'Exchange', 'Sector', 'CMP', 'Target Price', 'Stop Loss', 'P/E', 'Weight%'];
    const csvContent = [
      headers.join(','),
      ...filteredRows.map((r) =>
        [
          r.ticker,
          `"${r.name}"`,
          r.exchange,
          `"${r.sector}"`,
          r.basePrice,
          r.customTargetPrice,
          r.customStopLoss,
          r.pe,
          r.portfolioWeight,
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `vortex_matrix_spreadsheet_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleLoadToTerminal = (sec: MatrixRowItem) => {
    const newStock: Stock = {
      ticker: sec.ticker,
      name: sec.name,
      sector: sec.sector,
      exchange: sec.exchange === 'BSE' ? 'BSE' : 'NSE',
      price: sec.basePrice,
      change: Number((sec.basePrice * 0.009).toFixed(1)),
      changePercent: 0.9,
      prevClose: sec.basePrice * 0.991,
      open: sec.basePrice * 0.994,
      high: sec.basePrice * 1.018,
      low: sec.basePrice * 0.988,
      high52w: sec.basePrice * 1.32,
      low52w: sec.basePrice * 0.75,
      volume: 5200000,
      avgVolume20d: 4100000,
      deliveryPercent: 61.2,
      vwap: sec.basePrice * 1.004,
      marketCap: 520000,
      pe: sec.pe,
      medianPe5y: sec.medianPe5y,
      pb: 3.5,
      evEbitda: 13.8,
      roe: 19.1,
      roce: 17.2,
      debtToEquity: 0.28,
      fcfYield: 4.5,
      divYield: 1.2,
      rsi14: 58.2,
      dma50: sec.basePrice * 0.985,
      dma200: sec.dma200,
      beta: 0.95,
      sharesOutstanding: 350.0,
      currency: 'INR',
      orderBook: {
        bids: [{ price: sec.basePrice - 0.5, quantity: 18000, orders: 42 }],
        asks: [{ price: sec.basePrice + 0.5, quantity: 14200, orders: 31 }],
        totalBidQty: 1400000,
        totalAskQty: 1100000,
      },
      volumeProfile: [
        { price: sec.basePrice * 0.98, volume: 500000 },
        { price: sec.basePrice, volume: 2100000, isPoc: true },
        { price: sec.basePrice * 1.02, volume: 750000 },
      ],
      recentBlockDeals: [
        {
          id: `bd-${sec.ticker}`,
          time: '14:30:00',
          price: sec.basePrice,
          quantity: 300000,
          valueCr: Number(((300000 * sec.basePrice) / 10000000).toFixed(2)),
          type: 'BUY',
          client: 'Institutional Matrix Desk',
        },
      ],
      candles: [
        {
          time: '09:15',
          open: sec.basePrice * 0.994,
          high: sec.basePrice * 1.012,
          low: sec.basePrice * 0.989,
          close: sec.basePrice,
          volume: 920000,
          vwap: sec.basePrice,
        },
      ],
    };

    onAddStockToTerminal(newStock);
    onSelectStock(sec.ticker);
  };

  return (
    <div className="bg-[#080c14] border border-slate-800/80 rounded-xl p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-black font-bold shadow-lg shadow-cyan-950/40">
            <Table className="w-5 h-5 text-black" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              Drag-Down Matrix & Ticker Search Spreadsheet
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/60">
                LIVE SPREADSHEET ENGINE
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Instant multi-ticker search, column sorting, editable target formulas, and drag-down batch calculations for Indian equities
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-black shadow-md transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Matrix CSV</span>
          </button>
        </div>
      </div>

      {/* Control Panel: Search & Drag Down Formula Tools */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 bg-[#0b101c] border border-slate-800 p-4 rounded-xl">
        {/* Instant Ticker Search */}
        <div className="lg:col-span-5 space-y-1.5">
          <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
            <Search className="w-3.5 h-3.5 text-cyan-400" />
            <span>Instant Ticker & Company Search</span>
          </label>
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search ticker (e.g. RELIANCE, TCS, INFY, HDFC)..."
              className="w-full px-3.5 py-2 text-xs rounded-lg bg-[#05080f] border border-slate-700 text-white font-mono focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        {/* Sector & Market Cap Filter */}
        <div className="lg:col-span-3 space-y-1.5">
          <label className="text-xs font-medium text-slate-300">Sector & Cap Filter</label>
          <div className="grid grid-cols-2 gap-2">
            <select
              value={selectedSector}
              onChange={(e) => setSelectedSector(e.target.value)}
              className="w-full px-2.5 py-2 text-xs rounded-lg bg-[#05080f] border border-slate-700 text-slate-300 font-mono focus:outline-none focus:border-cyan-500"
            >
              {sectors.map((sec) => (
                <option key={sec} value={sec}>
                  {sec === 'ALL' ? 'All Sectors' : sec}
                </option>
              ))}
            </select>

            <select
              value={selectedCap}
              onChange={(e) => setSelectedCap(e.target.value)}
              className="w-full px-2.5 py-2 text-xs rounded-lg bg-[#05080f] border border-slate-700 text-slate-300 font-mono focus:outline-none focus:border-cyan-500"
            >
              <option value="ALL">All Caps</option>
              <option value="LARGE_CAP">Large Cap</option>
              <option value="MID_CAP">Mid Cap</option>
            </select>
          </div>
        </div>

        {/* Drag Down Batch Formula Tool */}
        <div className="lg:col-span-4 space-y-1.5 bg-[#070b13] border border-cyan-900/40 p-3 rounded-lg">
          <div className="text-xs font-bold text-cyan-300 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Drag-Down Formula Fill</span>
            </span>
            <span className="text-[10px] font-mono text-slate-400">Batch Update</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 text-[11px] text-slate-400">
              Target: <span className="text-white font-mono">CMP × {fillMultiplier}</span>
            </div>
            <button
              onClick={handleDragDownFillAll}
              className="px-3 py-1.5 rounded bg-cyan-950 hover:bg-cyan-900 border border-cyan-700 text-cyan-300 font-semibold text-xs transition-colors shrink-0"
              title="Apply formula across all filtered rows"
            >
              Fill Down Rows
            </button>
          </div>
        </div>
      </div>

      {/* Spreadsheet Grid Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-800/80 bg-[#0b101c]">
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-[#090d16] text-[10px] text-slate-400 border-b border-slate-800">
            <tr>
              <th className="py-3 px-3 cursor-pointer hover:text-white" onClick={() => handleSort('ticker')}>
                <div className="flex items-center gap-1">
                  <span>TICKER / SECURITY</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-500" />
                </div>
              </th>
              <th className="py-3 px-3">EXCHANGE</th>
              <th className="py-3 px-3 cursor-pointer hover:text-white" onClick={() => handleSort('basePrice')}>
                <div className="flex items-center gap-1">
                  <span>CMP (INR)</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-500" />
                </div>
              </th>
              <th className="py-3 px-3">DRAG TARGET (INR)</th>
              <th className="py-3 px-3">DRAG STOP LOSS</th>
              <th className="py-3 px-3">IMPLIED UPSIDE</th>
              <th className="py-3 px-3 cursor-pointer hover:text-white" onClick={() => handleSort('pe')}>
                <div className="flex items-center gap-1">
                  <span>P/E RATIO</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-500" />
                </div>
              </th>
              <th className="py-3 px-3 cursor-pointer hover:text-white" onClick={() => handleSort('dma200')}>
                <div className="flex items-center gap-1">
                  <span>200-DMA</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-500" />
                </div>
              </th>
              <th className="py-3 px-3 text-right">ACTION</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 bg-[#070b13]">
            {filteredRows.slice(0, 50).map((row) => {
              const upside = (((row.customTargetPrice - row.basePrice) / row.basePrice) * 100).toFixed(1);
              return (
                <tr key={row.ticker} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-3">
                    <div className="font-bold text-white tracking-wide text-xs">{row.ticker}</div>
                    <div className="text-[11px] text-slate-400 font-sans font-medium line-clamp-1">
                      {row.name}
                    </div>
                  </td>

                  <td className="py-3 px-3">
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">
                      {row.exchange}
                    </span>
                  </td>

                  <td className="py-3 px-3 font-bold text-white text-xs">
                    ₹{row.basePrice.toLocaleString('en-IN')}
                  </td>

                  {/* Editable Target Price Cell */}
                  <td className="py-3 px-3">
                    <input
                      type="number"
                      value={row.customTargetPrice}
                      onChange={(e) => handleCellChange(row.ticker, 'customTargetPrice', Number(e.target.value))}
                      className="w-24 px-2 py-1 text-xs rounded bg-[#05080f] border border-cyan-800/60 text-cyan-300 font-mono focus:outline-none focus:border-cyan-400"
                    />
                  </td>

                  {/* Editable Stop Loss Cell */}
                  <td className="py-3 px-3">
                    <input
                      type="number"
                      value={row.customStopLoss}
                      onChange={(e) => handleCellChange(row.ticker, 'customStopLoss', Number(e.target.value))}
                      className="w-24 px-2 py-1 text-xs rounded bg-[#05080f] border border-rose-800/60 text-rose-300 font-mono focus:outline-none focus:border-rose-400"
                    />
                  </td>

                  <td className="py-3 px-3">
                    <span className="font-bold text-emerald-400">+{upside}%</span>
                  </td>

                  <td className="py-3 px-3 text-slate-300">
                    {row.pe}x
                  </td>

                  <td className="py-3 px-3 text-slate-300">
                    ₹{row.dma200.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  </td>

                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => handleLoadToTerminal(row)}
                      className="px-2.5 py-1 rounded bg-cyan-950 hover:bg-cyan-900 border border-cyan-700/50 text-cyan-300 text-[11px] font-semibold transition-colors flex items-center gap-1 ml-auto"
                      title="Load into Terminal & AI Desk"
                    >
                      <span>Analyze</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
        <span>Showing {Math.min(filteredRows.length, 50)} of {filteredRows.length} matching securities</span>
        <span>Tip: Edit target/stop-loss values or click "Fill Down Rows" to calculate batch projections.</span>
      </div>
    </div>
  );
};
