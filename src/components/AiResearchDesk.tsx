import React, { useState, useEffect } from 'react';
import { Stock, AiResearchReport } from '../types/equity';
import { Sparkles, TrendingUp, ShieldAlert, Target, RefreshCw, Send, CheckCircle2, AlertTriangle, Radio } from 'lucide-react';
import { SentimentTrendLine } from './SentimentTrendLine';

interface AiResearchDeskProps {
  stock: Stock;
}

export const AiResearchDesk: React.FC<AiResearchDeskProps> = ({ stock }) => {
  const [report, setReport] = useState<AiResearchReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [customQuestion, setCustomQuestion] = useState('');
  const [analystAnswers, setAnalystAnswers] = useState<
    { question: string; answer: string; time: string }[]
  >([]);
  const [asking, setAsking] = useState(false);

  const fetchAiReport = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ai/research-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticker: stock.ticker,
          companyName: stock.name,
          currentPrice: stock.price,
          pe: stock.pe,
          medianPe: stock.medianPe5y,
          marketCap: `₹${(stock.marketCap / 1000).toFixed(0)}k Cr`,
          volume: `${(stock.volume / 1000000).toFixed(2)}M`,
          avgVolume: `${(stock.avgVolume20d / 1000000).toFixed(2)}M`,
          rsi: stock.rsi14,
          dma200: stock.dma200,
          macroContext: {
            crude: '78.45',
            usdinr: '83.92',
            repoRate: '6.50',
            us10y: '4.14',
          },
        }),
      });

      const data = await res.json();
      if (data.report) {
        setReport(data.report);
      }
    } catch (err) {
      console.error('Failed to fetch AI report:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAiReport();
  }, [stock.ticker]);

  const handleAskQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customQuestion.trim() || asking) return;

    const q = customQuestion.trim();
    setCustomQuestion('');
    setAsking(true);

    try {
      const res = await fetch('/api/ai/ask-desk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticker: stock.ticker,
          currentPrice: stock.price,
          question: q,
        }),
      });
      const data = await res.json();
      const now = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
      setAnalystAnswers((prev) => [
        { question: q, answer: data.answer || 'Analysis completed.', time: now },
        ...prev,
      ]);
    } catch (err) {
      console.error('Ask desk error:', err);
    } finally {
      setAsking(false);
    }
  };

  return (
    <div className="bg-[#0b101c] border border-slate-800/80 rounded-xl p-4.5 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800/60 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded bg-emerald-950/80 border border-emerald-800/50 text-emerald-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
              AI Institutional Equity Desk · News & Vol Synthesizer
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-400 border border-slate-700">
                Gemini 3.8 Flash
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Synthesizing Moneycontrol Buzz, Zee Business Traders Diary, F&O flows & exchange filings
            </p>
          </div>
        </div>

        <button
          onClick={fetchAiReport}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-[#121929] hover:bg-slate-800 border border-slate-700 text-slate-200 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${loading ? 'animate-spin' : ''}`} />
          <span>{loading ? 'Synthesizing Feeds...' : 'Regenerate Analysis'}</span>
        </button>
      </div>

      {loading && !report ? (
        <div className="py-12 flex flex-col items-center justify-center space-y-3">
          <RefreshCw className="w-8 h-8 text-cyan-500 animate-spin" />
          <div className="text-xs text-slate-300 font-medium">
            Aggregating Moneycontrol market sentiment, Zee Business panel debates & block flow...
          </div>
          <div className="text-[11px] text-slate-500 font-mono">
            Evaluating {stock.ticker} (CMP ₹{stock.price}) vs 5Y Median P/E & Volume Profile
          </div>
        </div>
      ) : report ? (
        <div className="space-y-4">
          {/* Top Verdict Ribbon */}
          <div className="bg-[#090d16] border border-slate-800/90 rounded-lg p-3.5 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div>
                <div className="text-[10px] text-slate-500 font-mono">INSTITUTIONAL RATING</div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span
                    className={`text-sm font-extrabold px-3 py-1 rounded font-mono border ${
                      report.rating.includes('BUY') || report.rating.includes('ACCUMULATE')
                        ? 'bg-emerald-950/70 border-emerald-600/60 text-emerald-400'
                        : report.rating.includes('TRIM') || report.rating.includes('SELL')
                        ? 'bg-rose-950/70 border-rose-600/60 text-rose-400'
                        : 'bg-amber-950/70 border-amber-600/60 text-amber-300'
                    }`}
                  >
                    {report.rating}
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    Confidence: <span className="font-bold text-white">{report.confidenceScore}%</span>
                  </span>
                </div>
              </div>

              <div className="h-8 w-px bg-slate-800 hidden sm:block" />

              <div>
                <div className="text-[10px] text-slate-500 font-mono">RECOMMENDED HORIZON</div>
                <div className="text-xs font-semibold text-slate-200 mt-1">{report.timeHorizon}</div>
              </div>
            </div>

            {/* Tactical Levels Box */}
            <div className="flex items-center gap-4 flex-wrap bg-[#101726] border border-slate-800/80 px-3.5 py-2 rounded-lg text-xs font-mono">
              <div>
                <span className="text-[10px] text-slate-500 block">ENTRY ZONE</span>
                <span className="font-bold text-cyan-400">{report.tacticalLevels.entryZone}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">TARGET 1</span>
                <span className="font-bold text-emerald-400">₹{report.tacticalLevels.target1}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">TARGET 2</span>
                <span className="font-bold text-emerald-300">₹{report.tacticalLevels.target2}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">STOP LOSS</span>
                <span className="font-bold text-rose-400">₹{report.tacticalLevels.stopLoss}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">R:R RATIO</span>
                <span className="font-bold text-amber-300">{report.tacticalLevels.riskRewardRatio}</span>
              </div>
            </div>
          </div>

          {/* 7-Day News Sentiment Trend Line & Momentum Indicator */}
          <SentimentTrendLine stock={stock} report={report} />

          {/* Two-Column Synthesis: Media Desk Feeds vs Flow & Macro */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Moneycontrol & Zee Business Synthesis Box */}
            <div className="bg-[#090d16] border border-slate-800/80 rounded-lg p-3.5 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 text-rose-400" />
                  <span>Financial Media Desk Synthesis</span>
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  Moneycontrol & Zee Business Feeds
                </span>
              </div>

              {/* Moneycontrol Takeaway */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-cyan-300">Moneycontrol Market Sentiment:</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    {report.mediaSynthesis.moneycontrolSentiment}
                  </span>
                </div>
                <ul className="space-y-1 text-xs text-slate-300 pl-1">
                  {report.mediaSynthesis.moneycontrolKeyTakeaways.map((takeaway, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-[11px]">
                      <span className="text-cyan-400 mt-0.5">·</span>
                      <span>{takeaway}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Zee Business Takeaway */}
              <div className="border-t border-slate-800/60 pt-2.5 space-y-1.5">
                <div className="text-[11px] font-bold text-amber-300">
                  Zee Business Panel & Traders Diary:
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  {report.mediaSynthesis.zeeBusinessPanelVerdict}
                </p>
                <div className="p-2 rounded bg-amber-950/20 border border-amber-800/30 text-[11px] text-amber-200/90 font-mono">
                  <span className="font-bold text-amber-400">Traders Diary Call: </span>
                  {report.mediaSynthesis.zeeBusinessTradersPick}
                </div>
              </div>
            </div>

            {/* Volume Flow & Macro Cross-Currents Box */}
            <div className="bg-[#090d16] border border-slate-800/80 rounded-lg p-3.5 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Volume Dynamics & Macro Drivers</span>
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  Institutional Flow Radar
                </span>
              </div>

              {/* Volume Flow Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="p-2 rounded bg-[#0e1422] border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">VOLUME SURGE RATIO</span>
                  <span className="text-slate-200 font-bold">{report.volumeFlowAnalysis.volumeSurgeRatio}</span>
                </div>
                <div className="p-2 rounded bg-[#0e1422] border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">DELIVERY ABSORPTION</span>
                  <span className="text-emerald-400 font-bold">{report.volumeFlowAnalysis.deliveryPercentageEst}</span>
                </div>
              </div>

              <div className="text-[11px] text-slate-300 leading-relaxed font-sans">
                <span className="font-semibold text-slate-200">Flow Action: </span>
                {report.volumeFlowAnalysis.institutionalActivity}. {report.volumeFlowAnalysis.vwapContext}
              </div>

              {/* Macro Cross Currents */}
              <div className="border-t border-slate-800/60 pt-2 space-y-1.5 text-[11px]">
                <div className="text-slate-300">
                  <span className="font-semibold text-cyan-400">Crude Transmission: </span>
                  {report.macroeconomicCrossCurrents.crudeImpact}
                </div>
                <div className="text-slate-300">
                  <span className="font-semibold text-cyan-400">FX & Rates Transmission: </span>
                  {report.macroeconomicCrossCurrents.currencyInterestRateImpact}
                </div>
              </div>
            </div>
          </div>

          {/* Catalysts & Risks */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-[#090d16] border border-slate-800/80 rounded-lg p-3">
              <div className="text-xs font-semibold text-emerald-400 mb-1.5 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Primary Upside Catalysts</span>
              </div>
              <ul className="space-y-1 text-[11px] text-slate-300">
                {report.keyCatalysts.map((cat, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-emerald-400 mt-0.5">✓</span>
                    <span>{cat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-[#090d16] border border-slate-800/80 rounded-lg p-3">
              <div className="text-xs font-semibold text-rose-400 mb-1.5 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Downside Invalidation Risks</span>
              </div>
              <ul className="space-y-1 text-[11px] text-slate-300">
                {report.downsideRisks.map((risk, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-rose-400 mt-0.5">!</span>
                    <span>{risk}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Executive Summary Memo */}
          <div className="bg-[#0e1628] border border-cyan-800/40 rounded-lg p-3.5 text-xs text-slate-200 leading-relaxed">
            <div className="text-[10px] font-mono text-cyan-400 uppercase font-semibold mb-1">
              CHIEF STRATEGIST EXECUTIVE MEMO
            </div>
            {report.executiveSummary}
          </div>

          {/* Interactive Q&A Analyst Desk */}
          <div className="bg-[#090d16] border border-slate-800 rounded-lg p-3.5 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-200">Interactive Analyst Query Desk</span>
              <span className="text-[11px] text-slate-500 font-mono">
                Direct inquiry to institutional research team
              </span>
            </div>

            {/* Suggested Institutional Queries */}
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 text-[11px]">
              <span className="text-slate-500 font-medium whitespace-nowrap">Suggested prompts:</span>
              {[
                `What is the stop loss strategy if Brent crude reaches $85?`,
                `How does the current delivery percentage compare to the 20-DMA?`,
                `Summarize Zee Business Traders Diary view for tomorrow's open`,
                `Explain valuation multiple vs 5-year historical median`,
              ].map((prompt, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setCustomQuestion(prompt)}
                  className="px-2.5 py-1 rounded bg-[#101726] hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-cyan-300 whitespace-nowrap transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>

            <form onSubmit={handleAskQuestion} className="flex items-center gap-2">
              <input
                type="text"
                value={customQuestion}
                onChange={(e) => setCustomQuestion(e.target.value)}
                placeholder={`Ask institutional desk about ${stock.ticker} (e.g. "What is the stop loss strategy if crude reaches $85?")...`}
                className="flex-1 px-3 py-2 text-xs rounded-md bg-[#05080f] border border-slate-700 text-slate-200 focus:outline-none focus:border-cyan-500"
              />
              <button
                type="submit"
                disabled={asking || !customQuestion.trim()}
                className="px-3 py-2 rounded-md bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-black font-semibold text-xs flex items-center gap-1.5 whitespace-nowrap transition-colors"
              >
                {asking ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                <span>Inquire</span>
              </button>
            </form>

            {/* Answer History */}
            {analystAnswers.length > 0 && (
              <div className="space-y-2.5 pt-2 border-t border-slate-800/60 max-h-60 overflow-y-auto pr-1">
                {analystAnswers.map((item, idx) => (
                  <div key={idx} className="bg-[#0b101c] border border-slate-800/80 rounded p-2.5 space-y-1 text-xs">
                    <div className="flex items-center justify-between text-slate-400 font-mono text-[10px]">
                      <span className="font-semibold text-cyan-300">Q: {item.question}</span>
                      <span>{item.time}</span>
                    </div>
                    <p className="text-slate-300 text-[11px] leading-relaxed whitespace-pre-line">
                      {item.answer}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
};
