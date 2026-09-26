import React, { useState, useEffect } from 'react';
import { INITIAL_STOCKS } from './data/mockEquities';
import { Stock, AiResearchReport } from './types/equity';
import { exportTradeHistoryCsv } from './utils/csvExport';
import { Header } from './components/Header';
import { StockSelector } from './components/StockSelector';
import { InteractiveChart } from './components/InteractiveChart';
import { VolumeAnalytics } from './components/VolumeAnalytics';
import { MacroDashboard } from './components/MacroDashboard';
import { AiResearchDesk } from './components/AiResearchDesk';
import { InvestmentCalculator } from './components/InvestmentCalculator';
import { AlgorithmicSignals } from './components/AlgorithmicSignals';
import { ResearchMemoModal } from './components/ResearchMemoModal';
import { ListedStocksDirectory } from './components/ListedStocksDirectory';
import { QuickToolbar } from './components/QuickToolbar';
import { QuickStartGuideModal } from './components/QuickStartGuideModal';
import { ServerConnectionModal } from './components/ServerConnectionModal';
import { ZerodhaBrokerConnector } from './components/ZerodhaBrokerConnector';
import { DragDownMatrix } from './components/DragDownMatrix';
import { StockHubView, SubModuleView } from './components/StockHubView';
import { RealtimeIntradayTips } from './components/RealtimeIntradayTips';
import { WebsiteUserHero } from './components/WebsiteUserHero';
import { AiStockBot } from './components/AiStockBot';
import { SmartRealtimeChartAnalyzer } from './components/SmartRealtimeChartAnalyzer';
import { VolatilityHeatmap } from './components/VolatilityHeatmap';
import { SectorWatchAlerts } from './components/SectorWatchAlerts';
import { DividendHistoryView } from './components/DividendHistoryView';
import { PaperTradingLogView, PaperTrade } from './components/PaperTradingLogView';
import {
  Layers,
  Globe,
  Calculator,
  Sparkles,
  Compass,
  BarChart3,
  TrendingUp,
  Database,
  Zap,
  Target,
  History,
} from 'lucide-react';

export default function App() {
  const [stocks, setStocks] = useState<Stock[]>(INITIAL_STOCKS);
  const [selectedTicker, setSelectedTicker] = useState<string>('RELIANCE');
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'INTRADAY_TIPS' | 'SMART_CHART_ANALYZER' | 'MATRIX_SPREADSHEET' | 'STOCKS_REGISTRY' | 'MACRO' | 'SIP_CALCULATOR' | 'AI_DESK' | 'VOLUME_FLOW' | 'TRADE_HISTORY'>('OVERVIEW');
  const [stockSubView, setStockSubView] = useState<SubModuleView>('INTRADAY_TIPS');
  const [isSimulating, setIsSimulating] = useState<boolean>(true);
  const [showMemoModal, setShowMemoModal] = useState<boolean>(false);
  const [showGuideModal, setShowGuideModal] = useState<boolean>(false);
  const [showServerStatusModal, setShowServerStatusModal] = useState<boolean>(false);
  const [showZerodhaModal, setShowZerodhaModal] = useState<boolean>(false);
  const [cachedReport, setCachedReport] = useState<AiResearchReport | null>(null);
  const [paperTrades, setPaperTrades] = useState<PaperTrade[]>([
    {
      id: 'trade-init-1',
      ticker: 'RELIANCE',
      name: 'Reliance Industries Ltd.',
      type: 'BUY',
      entryPrice: 2450.5,
      exitPrice: 2510.0,
      quantity: 100,
      entryTimestamp: '10:15 AM',
      exitTimestamp: '11:45 AM',
      status: 'CLOSED',
      pnl: 5950.0,
      pnlPercent: 2.43,
    },
  ]);

  const activeStock = stocks.find((s) => s.ticker === selectedTicker) || stocks[0];

  const handleAddPaperTrade = (trade: PaperTrade) => {
    setPaperTrades((prev) => [trade, ...prev]);
  };

  const handleClosePaperTrade = (tradeId: string, exitPrice: number) => {
    setPaperTrades((prev) =>
      prev.map((t) => {
        if (t.id === tradeId) {
          const pnl =
            t.type === 'BUY'
              ? (exitPrice - t.entryPrice) * t.quantity
              : (t.entryPrice - exitPrice) * t.quantity;
          const pnlPercent = (pnl / (t.entryPrice * t.quantity)) * 100;
          return {
            ...t,
            status: 'CLOSED' as const,
            exitPrice,
            exitTimestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            pnl: Number(pnl.toFixed(2)),
            pnlPercent: Number(pnlPercent.toFixed(2)),
          };
        }
        return t;
      })
    );
  };

  // Real-Time Simulated Market Feed (Ticks & Trade Volumes)
  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      setStocks((prevStocks) =>
        prevStocks.map((stock) => {
          // Slight price jitter (±0.08%)
          const jitterPercent = (Math.random() - 0.49) * 0.0016;
          const newPrice = Math.max(stock.low52w, Number((stock.price * (1 + jitterPercent)).toFixed(2)));
          const priceDiff = newPrice - stock.prevClose;
          const changePercent = (priceDiff / stock.prevClose) * 100;

          // Increment volume on trades
          const addedVol = Math.floor(Math.random() * 850) + 150;
          const updatedVol = stock.volume + addedVol;

          // Occasionally update order book top bid/ask
          const updatedOrderBook = { ...stock.orderBook };
          if (Math.random() > 0.6) {
            updatedOrderBook.bids[0].price = Number((newPrice - 0.5).toFixed(1));
            updatedOrderBook.asks[0].price = Number((newPrice + 0.5).toFixed(1));
          }

          return {
            ...stock,
            price: newPrice,
            change: Number(priceDiff.toFixed(2)),
            changePercent: Number(changePercent.toFixed(2)),
            high: Math.max(stock.high, newPrice),
            low: Math.min(stock.low, newPrice),
            volume: updatedVol,
            orderBook: updatedOrderBook,
          };
        })
      );
    }, 2800);

    return () => clearInterval(interval);
  }, [isSimulating]);

  const handleAddCustomStock = (custom: Stock) => {
    setStocks((prev) => {
      const exists = prev.some((s) => s.ticker === custom.ticker);
      if (exists) {
        return prev.map((s) => (s.ticker === custom.ticker ? custom : s));
      }
      return [custom, ...prev];
    });
  };

  const navTabs = [
    { id: 'OVERVIEW', label: 'Institutional Desk', icon: BarChart3 },
    { id: 'INTRADAY_TIPS', label: '⚡ Real-Time Intraday Tips (AI Entry/Exit)', icon: Zap },
    { id: 'SMART_CHART_ANALYZER', label: '🎯 Smart Real-Time Chart & Entry/Exit', icon: Target },
    { id: 'TRADE_HISTORY', label: '📈 Paper Trading Log & Trade History', icon: History },
    { id: 'MATRIX_SPREADSHEET', label: '📊 Drag-Down Matrix & Ticker Search', icon: Layers },
    { id: 'STOCKS_REGISTRY', label: 'All Listed Stocks & API Key Gateway', icon: Database },
    { id: 'MACRO', label: 'Macro Matrix (Rates · Commodities · FX · Crypto)', icon: Globe },
    { id: 'SIP_CALCULATOR', label: 'Flexible SIP & Weightage Forecast', icon: Calculator },
    { id: 'AI_DESK', label: 'AI News Synthesizer (Moneycontrol · Zee)', icon: Sparkles },
    { id: 'VOLUME_FLOW', label: 'Real-Time Volume & Block Deal Radar', icon: Layers },
  ] as const;

  return (
    <div className="min-h-screen bg-[#080c14] text-slate-100 flex flex-col font-sans">
      {/* Institutional Terminal Header */}
      <Header
        onExportMemo={() => setShowMemoModal(true)}
        onExportTradeCsv={() => exportTradeHistoryCsv(activeStock)}
        onOpenGuide={() => setShowGuideModal(true)}
        onOpenServerStatus={() => setShowServerStatusModal(true)}
        isSimulating={isSimulating}
        onToggleSimulation={() => setIsSimulating(!isSimulating)}
      />

      {/* Stock Selection & Quick Metrics Banner */}
      <StockSelector
        stocks={stocks}
        selectedTicker={selectedTicker}
        onSelectStock={setSelectedTicker}
        onAddCustomStock={handleAddCustomStock}
        onOpenRegistry={() => setActiveTab('STOCKS_REGISTRY')}
      />

      {/* Interactive Quick Toolbar */}
      <div className="px-4 py-2 bg-[#090d16] border-b border-slate-800/60">
        <QuickToolbar
          stock={activeStock}
          isSimulating={isSimulating}
          onToggleSimulation={() => setIsSimulating(!isSimulating)}
          onOpenGuide={() => setShowGuideModal(true)}
          onOpenRegistry={() => setActiveTab('STOCKS_REGISTRY')}
          onExportCsv={() => exportTradeHistoryCsv(activeStock)}
          onOpenIntradayTips={() => {
            setActiveTab('OVERVIEW');
            setStockSubView('INTRADAY_TIPS');
          }}
        />
      </div>

      {/* Primary Navigation Tabs */}
      <nav className="border-b border-slate-800/80 bg-[#0a0e1a] px-4">
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-1">
          {navTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold rounded-md whitespace-nowrap transition-all border ${
                  isActive
                    ? 'bg-cyan-950/60 border-cyan-500/50 text-cyan-300 shadow-sm'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Main Workspace Body */}
      <main className="flex-1 p-4 lg:p-6 space-y-6 max-w-7xl mx-auto w-full">
        {/* Tab 1: Unified Institutional Desk Overview */}
        {activeTab === 'OVERVIEW' && (
          <div className="space-y-6">
            {/* Website Friendly Hero & Value Proposition */}
            <WebsiteUserHero
              stock={activeStock}
              onExploreIntraday={() => setStockSubView('INTRADAY_TIPS')}
              onExploreAiNews={() => setStockSubView('AI_SIGNALS')}
              onExploreSip={() => setStockSubView('SIP_VALUATION')}
              onExploreMacro={() => setActiveTab('MACRO')}
              onOpenGuide={() => setShowGuideModal(true)}
            />

            {/* Systematic Single-Stock Hub & 4-Pillar Analysis Navigator */}
            <StockHubView
              stock={activeStock}
              activeSubView={stockSubView}
              onChangeSubView={setStockSubView}
              onOpenReportMemo={() => setShowMemoModal(true)}
              onNavigateTab={(tab) => setActiveTab(tab)}
            />

            {/* Volatility Heatmap Component */}
            <VolatilityHeatmap
              stocks={stocks}
              selectedTicker={selectedTicker}
              onSelectStock={setSelectedTicker}
            />

            {/* Sector Watch & Intraday Swing Alert Notification System */}
            <SectorWatchAlerts
              stocks={stocks}
              activeStock={activeStock}
              onSelectStock={setSelectedTicker}
            />

            {/* Systematic Module 0: Real-Time Intraday Tips */}
            {stockSubView === 'INTRADAY_TIPS' && (
              <div className="space-y-6">
                <RealtimeIntradayTips stock={activeStock} />
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  <div className="lg:col-span-8">
                    <InteractiveChart stock={activeStock} />
                  </div>
                  <div className="lg:col-span-4">
                    <AlgorithmicSignals stock={activeStock} />
                  </div>
                </div>
              </div>
            )}

            {/* Systematic Module 1: Price & Technicals */}
            {stockSubView === 'CHART_TECHNICALS' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-8">
                  <InteractiveChart stock={activeStock} />
                </div>
                <div className="lg:col-span-4">
                  <AlgorithmicSignals stock={activeStock} />
                </div>
              </div>
            )}

            {/* Systematic Module 2: Volume Flow, Order Book & Block Deals */}
            {stockSubView === 'VOLUME_FLOW' && (
              <div className="space-y-6">
                <VolumeAnalytics stock={activeStock} />
                <div className="bg-[#0b101c] border border-slate-800 rounded-xl p-4">
                  <InteractiveChart stock={activeStock} />
                </div>
              </div>
            )}

            {/* Systematic Module 3: AI Intelligence, Moneycontrol & Zee News */}
            {stockSubView === 'AI_SIGNALS' && (
              <div className="space-y-6">
                <AiResearchDesk stock={activeStock} />
                <AlgorithmicSignals stock={activeStock} />
              </div>
            )}

            {/* Systematic Module 4: SIP Wealth Planning & 5Y Median Valuation */}
            {stockSubView === 'SIP_VALUATION' && (
              <div className="space-y-6">
                <InvestmentCalculator stock={activeStock} />
                <AlgorithmicSignals stock={activeStock} />
              </div>
            )}

            {/* Systematic Module 5: Dividend Yield & 5Y Payout History */}
            {stockSubView === 'DIVIDEND_HISTORY' && (
              <div className="space-y-6">
                <DividendHistoryView stock={activeStock} />
                <AlgorithmicSignals stock={activeStock} />
              </div>
            )}
          </div>
        )}

        {/* Tab: Smart Real-Time Chart Analysis & Entry/Exit Engine */}
        {activeTab === 'SMART_CHART_ANALYZER' && (
          <div className="space-y-6">
            <SmartRealtimeChartAnalyzer
              currentStock={activeStock}
              onSelectStock={(ticker) => {
                setSelectedTicker(ticker);
                setActiveTab('OVERVIEW');
              }}
              onDispatchPaperTrade={handleAddPaperTrade}
            />
          </div>
        )}

        {/* Tab: Paper Trading Log & Trade History */}
        {activeTab === 'TRADE_HISTORY' && (
          <div className="space-y-6">
            <PaperTradingLogView
              stocks={stocks}
              trades={paperTrades}
              onAddTrade={handleAddPaperTrade}
              onCloseTrade={handleClosePaperTrade}
              onClearTrades={() => setPaperTrades([])}
            />
          </div>
        )}
        {activeTab === 'MATRIX_SPREADSHEET' && (
          <div className="space-y-6">
            <DragDownMatrix
              onSelectStock={(ticker) => {
                setSelectedTicker(ticker);
                setActiveTab('OVERVIEW');
              }}
              onAddStockToTerminal={handleAddCustomStock}
            />
          </div>
        )}

        {/* Tab: Dedicated Real-Time Intraday Tips Workspace */}
        {activeTab === 'INTRADAY_TIPS' && (
          <div className="space-y-6">
            <RealtimeIntradayTips stock={activeStock} />
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-8">
                <InteractiveChart stock={activeStock} />
              </div>
              <div className="lg:col-span-4">
                <AlgorithmicSignals stock={activeStock} />
              </div>
            </div>
            <VolumeAnalytics stock={activeStock} />
          </div>
        )}

        {/* Tab 2: Full NSE & BSE Listed Securities Registry with API Key Gateway */}
        {activeTab === 'STOCKS_REGISTRY' && (
          <div className="space-y-6">
            <ListedStocksDirectory
              onSelectStock={(ticker) => {
                setSelectedTicker(ticker);
                setActiveTab('OVERVIEW');
              }}
              onAddStockToTerminal={handleAddCustomStock}
            />
          </div>
        )}

        {/* Tab 3: Macroeconomic Matrix Dashboard */}
        {activeTab === 'MACRO' && (
          <div className="space-y-6">
            <MacroDashboard />
          </div>
        )}

        {/* Tab 3: Flexible Investment Calculator & Portfolio Weightage Engine */}
        {activeTab === 'SIP_CALCULATOR' && (
          <div className="space-y-6">
            <InvestmentCalculator stock={activeStock} />
            <AlgorithmicSignals stock={activeStock} />
          </div>
        )}

        {/* Tab 4: AI Research Desk Deep Dive */}
        {activeTab === 'AI_DESK' && (
          <div className="space-y-6">
            <AiResearchDesk stock={activeStock} />
          </div>
        )}

        {/* Tab 5: Real-Time Volume & Block Deal Flow Radar */}
        {activeTab === 'VOLUME_FLOW' && (
          <div className="space-y-6">
            <VolumeAnalytics stock={activeStock} />
            <InteractiveChart stock={activeStock} />
          </div>
        )}
      </main>

      {/* Printable Institutional Research Memo Modal */}
      {showMemoModal && (
        <ResearchMemoModal
          stock={activeStock}
          report={cachedReport}
          onClose={() => setShowMemoModal(false)}
        />
      )}

      {/* Quick Start User Guide & Desk Walkthrough Modal */}
      {showGuideModal && (
        <QuickStartGuideModal
          onClose={() => setShowGuideModal(false)}
          onNavigateTab={(tab) => setActiveTab(tab)}
        />
      )}

      {/* Server & AI Connection Diagnostic Modal */}
      <ServerConnectionModal
        isOpen={showServerStatusModal}
        onClose={() => setShowServerStatusModal(false)}
        isSimulating={isSimulating}
      />

      {/* Floating AI Stock Bot & Live Tips Maker Copilot */}
      <AiStockBot activeStock={activeStock} onSelectStock={setSelectedTicker} />

      {/* Friendly Website Footer */}
      <footer className="border-t border-slate-800/80 bg-[#070b13] px-4 py-6 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-7 w-7 rounded-md bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-black text-sm">
              V
            </div>
            <div>
              <div className="font-bold text-white text-sm">Vortex Smart Investor Terminal</div>
              <div className="text-[11px] text-slate-500">
                Institutional Equity Research · Real-Time Intraday Tips · Macro Cross-Asset Synthesizer
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-medium text-slate-400">
            <button
              onClick={() => {
                setActiveTab('OVERVIEW');
                setStockSubView('INTRADAY_TIPS');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hover:text-cyan-300 transition-colors"
            >
              Intraday Tips
            </button>
            <span>·</span>
            <button
              onClick={() => {
                setActiveTab('MACRO');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hover:text-cyan-300 transition-colors"
            >
              Macro Gauge
            </button>
            <span>·</span>
            <button
              onClick={() => {
                setActiveTab('SIP_CALCULATOR');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hover:text-cyan-300 transition-colors"
            >
              SIP Planner
            </button>
            <span>·</span>
            <button
              onClick={() => setShowGuideModal(true)}
              className="hover:text-cyan-300 transition-colors flex items-center gap-1"
            >
              <span>User Guide</span>
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-4 pt-3 border-t border-slate-800/50 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500">
          <span>© 2026 Vortex Capital Markets. Verified NSE & BSE feeds with Gemini 3.8 Flash AI synthesis.</span>
          <span className="mt-1 sm:mt-0">Market investments are subject to market risks. Read all scheme related documents carefully.</span>
        </div>
      </footer>
    </div>
  );
}
