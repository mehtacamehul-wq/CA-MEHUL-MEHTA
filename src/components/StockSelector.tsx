import React, { useState, useEffect } from 'react';
import { Stock } from '../types/equity';
import { Search, Plus, TrendingUp, TrendingDown, Layers, BarChart2, Database, Star, Trash2 } from 'lucide-react';

interface StockSelectorProps {
  stocks: Stock[];
  selectedTicker: string;
  onSelectStock: (ticker: string) => void;
  onAddCustomStock?: (customStock: Stock) => void;
  onOpenRegistry?: () => void;
}

const WATCHLIST_STORAGE_KEY = 'vortex_my_watchlist_tickers_v1';
const DEFAULT_WATCHLIST = ['RELIANCE', 'TCS', 'HDFCBANK', 'ICICIBANK'];

export const StockSelector: React.FC<StockSelectorProps> = ({
  stocks,
  selectedTicker,
  onSelectStock,
  onAddCustomStock,
  onOpenRegistry,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [customTicker, setCustomTicker] = useState('');
  const [customName, setCustomName] = useState('');
  const [customPrice, setCustomPrice] = useState(1500);
  const [customPe, setCustomPe] = useState(22);
  const [customMedianPe, setCustomMedianPe] = useState(25);
  const [activeTabFilter, setActiveTabFilter] = useState<'ALL' | 'WATCHLIST'>('ALL');
  const [showWatchlistSidebar, setShowWatchlistSidebar] = useState(false);

  // Persistent Watchlist state in localStorage
  const [watchlistTickers, setWatchlistTickers] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(WATCHLIST_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed to read watchlist from localStorage', e);
    }
    return DEFAULT_WATCHLIST;
  });

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify(watchlistTickers));
    } catch (e) {
      console.error('Failed to write watchlist to localStorage', e);
    }
  }, [watchlistTickers]);

  const toggleWatchlist = (ticker: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setWatchlistTickers((prev) => {
      if (prev.includes(ticker)) {
        return prev.filter((t) => t !== ticker);
      } else {
        return [...prev, ticker];
      }
    });
  };

  const activeStock = stocks.find((s) => s.ticker === selectedTicker) || stocks[0];
  const isCurrentInWatchlist = watchlistTickers.includes(activeStock.ticker);

  const filteredStocks = stocks.filter((s) => {
    const matchesQuery =
      s.ticker.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.name.toLowerCase().includes(searchQuery.toLowerCase());
    if (activeTabFilter === 'WATCHLIST') {
      return matchesQuery && watchlistTickers.includes(s.ticker);
    }
    return matchesQuery;
  });

  const watchlistStocks = stocks.filter((s) => watchlistTickers.includes(s.ticker));

  const handleCreateCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTicker.trim() || !customName.trim()) return;

    const newStock: Stock = {
      ticker: customTicker.toUpperCase().trim(),
      name: customName.trim(),
      sector: 'Custom Tracked Asset',
      exchange: 'NSE',
      price: Number(customPrice),
      change: 0,
      changePercent: 0,
      prevClose: Number(customPrice),
      open: Number(customPrice),
      high: Number(customPrice * 1.02),
      low: Number(customPrice * 0.98),
      high52w: Number(customPrice * 1.25),
      low52w: Number(customPrice * 0.75),
      volume: 2500000,
      avgVolume20d: 2200000,
      deliveryPercent: 55,
      vwap: Number(customPrice),
      marketCap: 150000,
      pe: Number(customPe),
      medianPe5y: Number(customMedianPe),
      pb: 3.5,
      evEbitda: 14,
      roe: 18,
      roce: 16,
      debtToEquity: 0.4,
      fcfYield: 4.0,
      divYield: 1.0,
      rsi14: 52,
      dma50: Number(customPrice * 0.98),
      dma200: Number(customPrice * 0.94),
      beta: 1.0,
      sharesOutstanding: 100,
      currency: 'INR',
      orderBook: {
        bids: [{ price: customPrice - 1, quantity: 5000, orders: 12 }],
        asks: [{ price: customPrice + 1, quantity: 4500, orders: 10 }],
        totalBidQty: 100000,
        totalAskQty: 95000,
      },
      volumeProfile: [
        { price: customPrice * 0.98, volume: 500000 },
        { price: customPrice, volume: 1500000, isPoc: true },
        { price: customPrice * 1.02, volume: 500000 },
      ],
      recentBlockDeals: [],
      candles: [
        { time: '09:15', open: customPrice * 0.99, high: customPrice * 1.01, low: customPrice * 0.98, close: customPrice, volume: 500000, vwap: customPrice },
      ],
    };

    onAddCustomStock?.(newStock);
    onSelectStock(newStock.ticker);
    setShowAddModal(false);
    setCustomTicker('');
    setCustomName('');
  };

  const volumeSurge = (activeStock.volume / activeStock.avgVolume20d).toFixed(2);
  const peDelta = (((activeStock.pe - activeStock.medianPe5y) / activeStock.medianPe5y) * 100).toFixed(1);
  const dmaDistance = (((activeStock.price - activeStock.dma200) / activeStock.dma200) * 100).toFixed(1);

  return (
    <div className="bg-[#0e1422] border-b border-slate-800/80 px-4 py-3">
      <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-4">
        {/* Stock Selector Pill Carousel & Search */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 xl:pb-0 scrollbar-none flex-1">
          {/* Watchlist Toggle Pill Button */}
          <button
            onClick={() => setShowWatchlistSidebar(!showWatchlistSidebar)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-colors border shrink-0 ${
              showWatchlistSidebar
                ? 'bg-amber-950/70 border-amber-500/70 text-amber-300'
                : 'bg-[#121929] border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
            }`}
            title="Open persistent My Watchlist sidebar"
          >
            <Star
              className={`w-3.5 h-3.5 ${
                watchlistTickers.length > 0 ? 'text-amber-400 fill-amber-400' : 'text-slate-400'
              }`}
            />
            <span>My Watchlist ({watchlistTickers.length})</span>
          </button>

          {/* Quick Filter: All vs Watchlist */}
          <div className="flex items-center p-0.5 rounded bg-[#090d16] border border-slate-800 text-xs shrink-0 font-mono">
            <button
              onClick={() => setActiveTabFilter('ALL')}
              className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
                activeTabFilter === 'ALL'
                  ? 'bg-slate-800 text-cyan-300'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All ({stocks.length})
            </button>
            <button
              onClick={() => setActiveTabFilter('WATCHLIST')}
              className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors flex items-center gap-1 ${
                activeTabFilter === 'WATCHLIST'
                  ? 'bg-amber-950/60 text-amber-300 border border-amber-800/40'
                  : 'text-slate-400 hover:text-amber-300'
              }`}
            >
              <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
              <span>Starred ({watchlistTickers.length})</span>
            </button>
          </div>

          <div className="relative min-w-[130px] max-w-[170px] shrink-0">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Filter ticker..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-2 py-1.5 text-xs rounded-md bg-[#090d16] border border-slate-800 text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="flex items-center gap-1.5 flex-nowrap">
            {filteredStocks.map((stock) => {
              const isSelected = stock.ticker === selectedTicker;
              const isWatched = watchlistTickers.includes(stock.ticker);
              return (
                <div
                  key={stock.ticker}
                  className={`group relative flex items-center rounded-md border text-xs font-medium whitespace-nowrap transition-all ${
                    isSelected
                      ? 'bg-cyan-950/60 border-cyan-500/60 text-cyan-200 shadow-sm'
                      : 'bg-[#121929] border-slate-800/90 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <button
                    onClick={() => onSelectStock(stock.ticker)}
                    className="pl-3 pr-2 py-1.5 flex items-center gap-2"
                  >
                    <span className="font-bold tracking-wide">{stock.ticker}</span>
                    <span className="font-mono text-[11px] text-slate-300">
                      ₹{stock.price.toLocaleString('en-IN', { maximumFractionDigits: 1 })}
                    </span>
                    <span
                      className={`text-[10px] font-mono ${
                        stock.change >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {stock.change >= 0 ? '+' : ''}
                      {stock.changePercent.toFixed(1)}%
                    </span>
                  </button>

                  <button
                    onClick={(e) => toggleWatchlist(stock.ticker, e)}
                    className={`pr-2 pl-0.5 py-1.5 transition-colors ${
                      isWatched
                        ? 'text-amber-400 hover:text-amber-300'
                        : 'text-slate-600 hover:text-amber-400'
                    }`}
                    title={isWatched ? 'Remove from My Watchlist' : 'Add to My Watchlist'}
                  >
                    <Star
                      className={`w-3 h-3 ${isWatched ? 'fill-amber-400 text-amber-400' : ''}`}
                    />
                  </button>
                </div>
              );
            })}

            {filteredStocks.length === 0 && (
              <span className="text-xs text-slate-500 italic px-2">No matching assets in this view</span>
            )}

            {onOpenRegistry && (
              <button
                onClick={onOpenRegistry}
                className="px-2.5 py-1.5 rounded-md text-xs font-semibold bg-cyan-950/50 border border-cyan-800/60 text-cyan-300 hover:bg-cyan-900/60 flex items-center gap-1.5 whitespace-nowrap transition-colors shadow-sm shrink-0"
                title="Browse all NSE & BSE listed stocks and test REST API endpoints"
              >
                <Database className="w-3.5 h-3.5 text-cyan-400" />
                <span>All Listed Stocks (API)</span>
              </button>
            )}

            <button
              onClick={() => setShowAddModal(true)}
              className="px-2.5 py-1.5 rounded-md text-xs font-medium bg-[#121929] border border-dashed border-slate-700 text-slate-400 hover:text-cyan-400 hover:border-cyan-700 flex items-center gap-1 whitespace-nowrap shrink-0"
              title="Add custom stock to track"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Stock</span>
            </button>
          </div>
        </div>

        {/* Selected Stock Live Headline Strip */}
        <div className="flex items-center gap-4 flex-wrap text-xs bg-[#090d16] border border-slate-800/80 px-3.5 py-2 rounded-lg shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => toggleWatchlist(activeStock.ticker, e)}
              className="p-1 rounded hover:bg-slate-800 text-slate-400 transition-colors"
              title={isCurrentInWatchlist ? 'Remove from My Watchlist' : 'Save to My Watchlist'}
            >
              <Star
                className={`w-4 h-4 ${
                  isCurrentInWatchlist
                    ? 'text-amber-400 fill-amber-400'
                    : 'text-slate-500 hover:text-amber-400'
                }`}
              />
            </button>
            <div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wider font-mono">
                {activeStock.exchange}: {activeStock.sector}
              </div>
              <div className="font-bold text-slate-200 text-sm flex items-center gap-2">
                <span>{activeStock.name}</span>
                <span className="text-xs font-mono font-medium text-slate-400">
                  ({activeStock.ticker})
                </span>
              </div>
            </div>
          </div>

          <div className="h-6 w-px bg-slate-800 hidden sm:block" />

          {/* Current Price */}
          <div>
            <div className="text-[10px] text-slate-500 font-mono">CMP (LAST PRICE)</div>
            <div className="flex items-baseline gap-2">
              <span className="text-base font-bold font-mono text-white">
                ₹{activeStock.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
              <span
                className={`flex items-center text-xs font-mono font-semibold ${
                  activeStock.change >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {activeStock.change >= 0 ? (
                  <TrendingUp className="w-3 h-3 mr-0.5" />
                ) : (
                  <TrendingDown className="w-3 h-3 mr-0.5" />
                )}
                {activeStock.change >= 0 ? '+' : ''}
                {activeStock.change.toFixed(2)} ({activeStock.changePercent.toFixed(2)}%)
              </span>
            </div>
          </div>

          <div className="h-6 w-px bg-slate-800 hidden md:block" />

          {/* Volume Metric */}
          <div className="hidden md:block">
            <div className="text-[10px] text-slate-500 font-mono">TODAY'S VOLUME</div>
            <div className="flex items-center gap-2 font-mono">
              <span className="font-semibold text-slate-200">
                {(activeStock.volume / 1000000).toFixed(2)}M
              </span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded border ${
                  Number(volumeSurge) >= 1.2
                    ? 'bg-amber-950/40 border-amber-700/50 text-amber-300'
                    : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}
              >
                {volumeSurge}x 20-DMA
              </span>
            </div>
          </div>

          <div className="h-6 w-px bg-slate-800 hidden lg:block" />

          {/* Valuation vs 5Y Median */}
          <div className="hidden lg:block">
            <div className="text-[10px] text-slate-500 font-mono">P/E vs 5Y MEDIAN</div>
            <div className="flex items-center gap-1.5 font-mono">
              <span className="font-semibold text-slate-200">{activeStock.pe}x</span>
              <span className="text-slate-500 text-[11px]">/ {activeStock.medianPe5y}x</span>
              <span
                className={`text-[11px] font-semibold ${
                  Number(peDelta) < 0 ? 'text-emerald-400' : 'text-amber-400'
                }`}
              >
                ({Number(peDelta) >= 0 ? '+' : ''}
                {peDelta}%)
              </span>
            </div>
          </div>

          <div className="h-6 w-px bg-slate-800 hidden xl:block" />

          {/* 200-DMA Distance */}
          <div className="hidden xl:block">
            <div className="text-[10px] text-slate-500 font-mono">200-DMA DISTANCE</div>
            <div className="font-mono text-slate-300">
              <span className="font-semibold">
                {Number(dmaDistance) >= 0 ? '+' : ''}
                {dmaDistance}%
              </span>{' '}
              <span className="text-[10px] text-slate-500">(₹{activeStock.dma200.toFixed(0)})</span>
            </div>
          </div>
        </div>
      </div>

      {/* Flyout 'My Watchlist' Sidebar Drawer */}
      {showWatchlistSidebar && (
        <div className="absolute left-4 top-full mt-2 z-40 bg-[#0b101c] border border-slate-700 rounded-xl shadow-2xl p-4 w-80 text-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-1.5 text-white font-bold">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span>My Watchlist (Persistent)</span>
            </div>
            <button
              onClick={() => setShowWatchlistSidebar(false)}
              className="text-slate-500 hover:text-white text-xs"
            >
              Close
            </button>
          </div>

          <p className="text-[11px] text-slate-400">
            Saved to browser storage. Quick access to your high-conviction institutional positions.
          </p>

          <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1">
            {watchlistStocks.map((stock) => (
              <div
                key={stock.ticker}
                className={`p-2 rounded-lg flex items-center justify-between gap-2 border transition-colors cursor-pointer ${
                  stock.ticker === selectedTicker
                    ? 'bg-cyan-950/70 border-cyan-600/70 text-cyan-200'
                    : 'bg-[#101726] border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
                onClick={() => {
                  onSelectStock(stock.ticker);
                  setShowWatchlistSidebar(false);
                }}
              >
                <div>
                  <div className="font-bold flex items-center gap-1">
                    <span>{stock.ticker}</span>
                    <span className="text-[10px] text-slate-500 font-normal">({stock.exchange})</span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    ₹{stock.price.toFixed(1)}{' '}
                    <span
                      className={stock.change >= 0 ? 'text-emerald-400' : 'text-rose-400'}
                    >
                      ({stock.change >= 0 ? '+' : ''}
                      {stock.changePercent.toFixed(1)}%)
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleWatchlist(stock.ticker);
                    }}
                    className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                    title="Remove from Watchlist"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}

            {watchlistStocks.length === 0 && (
              <div className="text-center py-4 text-slate-500 text-[11px]">
                No tickers in your watchlist. Star any stock from the header to add it!
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Custom Stock Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-[#101726] border border-slate-800 rounded-xl max-w-md w-full p-5 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-1">Add Asset to Institutional Desk</h3>
            <p className="text-xs text-slate-400 mb-4">
              Specify symbol, current market price, and 5-year valuation baseline to initialize volume & SIP tracking.
            </p>

            <form onSubmit={handleCreateCustom} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-mono text-[11px] mb-1">
                    Ticker Symbol (e.g. RELIANCE)
                  </label>
                  <input
                    type="text"
                    required
                    value={customTicker}
                    onChange={(e) => setCustomTicker(e.target.value.toUpperCase())}
                    placeholder="TICKER"
                    className="w-full px-3 py-2 rounded bg-[#090d16] border border-slate-700 text-white font-mono uppercase focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-mono text-[11px] mb-1">
                    Company Name
                  </label>
                  <input
                    type="text"
                    required
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="e.g. Reliance Industries"
                    className="w-full px-3 py-2 rounded bg-[#090d16] border border-slate-700 text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 font-mono text-[11px] mb-1">
                    Price (₹)
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    required
                    value={customPrice}
                    onChange={(e) => setCustomPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded bg-[#090d16] border border-slate-700 text-white font-mono focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-mono text-[11px] mb-1">
                    Current P/E
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={customPe}
                    onChange={(e) => setCustomPe(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded bg-[#090d16] border border-slate-700 text-white font-mono focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-mono text-[11px] mb-1">
                    5Y Median P/E
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={customMedianPe}
                    onChange={(e) => setCustomMedianPe(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded bg-[#090d16] border border-slate-700 text-white font-mono focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 rounded text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 text-black font-semibold text-xs"
                >
                  Initialize Asset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
