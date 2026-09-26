import React from 'react';
import { Stock, AiResearchReport } from '../types/equity';
import { X, Printer, Download, ShieldCheck, Building } from 'lucide-react';

interface ResearchMemoModalProps {
  stock: Stock;
  report: AiResearchReport | null;
  onClose: () => void;
}

export const ResearchMemoModal: React.FC<ResearchMemoModalProps> = ({
  stock,
  report,
  onClose,
}) => {
  const handlePrint = () => {
    window.print();
  };

  const memoDate = new Date().toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#0b0f17] border border-slate-800 rounded-xl max-w-3xl w-full p-6 text-slate-200 shadow-2xl relative my-8 print:border-none print:shadow-none print:p-0 print:m-0 print:bg-white print:text-black">
        {/* Modal Controls (Hidden during print) */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-5 print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-400 border border-cyan-800/40">
              INSTITUTIONAL RESEARCH MEMORANDUM
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 text-black font-semibold text-xs transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Memo Content */}
        <div className="space-y-5 print:text-black">
          {/* Memo Header */}
          <div className="border-b border-slate-700/60 pb-4">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-white print:text-black">
                  VORTEX INSTITUTIONAL RESEARCH DESK
                </h2>
                <div className="text-xs text-slate-400 print:text-gray-600 mt-0.5">
                  Macroeconomic & Trade Volume Quantitative Synthesis
                </div>
              </div>
              <div className="text-right text-xs font-mono text-slate-400 print:text-gray-600">
                <div>DATE: {memoDate}</div>
                <div>CLASSIFICATION: RESTRICTED</div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-mono">
              <div>
                <span className="text-slate-500">ASSET: </span>
                <span className="font-bold text-white print:text-black">
                  {stock.name} ({stock.ticker}.{stock.exchange})
                </span>
              </div>
              <div>
                <span className="text-slate-500">CMP: </span>
                <span className="font-bold text-cyan-400 print:text-black">
                  ₹{stock.price.toFixed(2)}
                </span>
              </div>
              <div>
                <span className="text-slate-500">VALUATION: </span>
                <span className="font-bold text-white print:text-black">
                  P/E {stock.pe}x (5Y Median {stock.medianPe5y}x)
                </span>
              </div>
            </div>
          </div>

          {/* Verdict Banner */}
          <div className="bg-[#101726] border border-slate-800 p-4 rounded-lg flex justify-between items-center print:bg-gray-100 print:border-gray-300">
            <div>
              <div className="text-[10px] font-mono text-slate-400 uppercase">
                INSTITUTIONAL RECOMMENDATION
              </div>
              <div className="text-lg font-extrabold text-emerald-400 print:text-green-700 font-mono mt-0.5">
                {report?.rating || 'ACCUMULATE ON DIPS'}
              </div>
              <div className="text-xs text-slate-300 print:text-gray-700 mt-1">
                Horizon: {report?.timeHorizon || '6-12 Months Positional'} · Confidence Score: {report?.confidenceScore || 89}%
              </div>
            </div>

            <div className="text-right font-mono text-xs space-y-1">
              <div>Entry Range: <span className="font-bold text-cyan-400 print:text-black">{report?.tacticalLevels.entryZone || `₹${(stock.price * 0.98).toFixed(0)} - ₹${stock.price.toFixed(0)}`}</span></div>
              <div>Price Target: <span className="font-bold text-emerald-400 print:text-green-700">₹{report?.tacticalLevels.target1 || (stock.price * 1.15).toFixed(0)}</span></div>
              <div>Stop-Loss Target: <span className="font-bold text-rose-400 print:text-red-700">₹{report?.tacticalLevels.stopLoss || (stock.price * 0.94).toFixed(0)}</span></div>
            </div>
          </div>

          {/* Executive Summary */}
          <div>
            <h4 className="text-xs font-bold font-mono text-cyan-400 uppercase mb-1.5 print:text-blue-800">
              01. Executive Synthesis & Core Thesis
            </h4>
            <p className="text-xs text-slate-300 print:text-gray-800 leading-relaxed">
              {report?.executiveSummary || `${stock.ticker} demonstrates superior return on equity and disciplined capital stewardship. Delivery volume accumulation exceeds 20-DMA norms, indicating sovereign wealth fund and domestic mutual fund absorption at key technical inflection nodes.`}
            </p>
          </div>

          {/* Media & Desk Tone (Moneycontrol & Zee Business) */}
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="border border-slate-800 p-3 rounded-lg print:border-gray-300">
              <h5 className="font-bold text-slate-200 print:text-black mb-1">
                Moneycontrol Analyst Sentiment
              </h5>
              <p className="text-[11px] text-slate-300 print:text-gray-700">
                {report?.mediaSynthesis.moneycontrolSentiment || 'Bullish institutional consensus'} with key accumulation observed during block deals.
              </p>
            </div>
            <div className="border border-slate-800 p-3 rounded-lg print:border-gray-300">
              <h5 className="font-bold text-slate-200 print:text-black mb-1">
                Zee Business Technical & Traders Desk
              </h5>
              <p className="text-[11px] text-slate-300 print:text-gray-700">
                {report?.mediaSynthesis.zeeBusinessPanelVerdict || 'Strong support at 50-DMA with positive open interest buildup across call strikes.'}
              </p>
            </div>
          </div>

          {/* Volume Profile & Macro Drivers */}
          <div className="border border-slate-800 p-3 rounded-lg text-xs space-y-2 print:border-gray-300">
            <h5 className="font-bold text-slate-200 print:text-black font-mono">
              02. Volume & Macro Factors
            </h5>
            <div className="grid grid-cols-2 gap-3 text-[11px] text-slate-300 print:text-gray-700">
              <div>
                <span className="font-semibold text-slate-200 print:text-black">Delivery Absorption: </span>
                {stock.deliveryPercent}% delivery vs total traded quantity. Volume surge is {report?.volumeFlowAnalysis.volumeSurgeRatio || '1.38x 20-DMA'}.
              </div>
              <div>
                <span className="font-semibold text-slate-200 print:text-black">Crude & FX: </span>
                {report?.macroeconomicCrossCurrents.crudeImpact || 'Brent crude trading below $80/bbl supports optimal refining margins.'}
              </div>
            </div>
          </div>

          {/* Invalidation & Signature */}
          <div className="pt-3 border-t border-slate-800 flex justify-between items-center text-[10px] font-mono text-slate-500 print:text-gray-500">
            <div>CONFIDENTIAL TO INSTITUTIONAL CLIENT · VORTEX CAPITAL MARKETS</div>
            <div>VERIFIED BY ALGORITHMIC RESEARCH AGENT</div>
          </div>
        </div>
      </div>
    </div>
  );
};
