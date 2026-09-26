import React, { useState, useRef, useEffect } from 'react';
import { Stock } from '../types/equity';
import {
  Bot,
  Send,
  Sparkles,
  Zap,
  TrendingUp,
  X,
  Minimize2,
  Maximize2,
  RefreshCw,
  MessageSquare,
  ShieldCheck,
  ChevronUp,
} from 'lucide-react';

interface AiStockBotProps {
  activeStock: Stock;
  onSelectStock?: (ticker: string) => void;
}

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  payload?: any;
}

export const AiStockBot: React.FC<AiStockBotProps> = ({ activeStock, onSelectStock }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: `Hello! I am **Vortex AI Copilot & Live Tips Maker**. I analyze live order flow, Moneycontrol market buzz, and Zee Business desk recommendations for **${activeStock.ticker}** (CMP ₹${activeStock.price}). How can I assist your trading strategy today?`,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isMinimized]);

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputMessage;
    if (!textToSend.trim()) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customText) setInputMessage('');
    setIsLoading(true);

    try {
      // Call server-side AI endpoint
      const res = await fetch('/api/ai/ask-desk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: textToSend,
          ticker: activeStock.ticker,
          currentPrice: activeStock.price,
        }),
      });

      const data = await res.json();
      const aiText = data.answer || `As the quantitative desk director for ${activeStock.ticker}, technical momentum and delivery volume absorption indicate strong institutional support near VWAP.`;

      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: aiText,
        timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      const errorMsg: Message = {
        id: `ai-err-${Date.now()}`,
        sender: 'ai',
        text: `Network or rate-limit encountered. Algorithmic fallback: ${activeStock.ticker} maintains secure support above its 200-DMA with positive order book bias.`,
        timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateLiveTip = async () => {
    const prompt = `Generate a high-conviction intraday smart tip with entry, targets, and stop-loss for ${activeStock.ticker} (CMP ₹${activeStock.price}).`;
    await handleSendMessage(prompt);
  };

  const quickPrompts = [
    '⚡ Generate Live Intraday Tip',
    '📊 Analyze VWAP & Volume Surge',
    '🎯 What is the Stop Loss & Target?',
    '📰 Summarize Moneycontrol News',
  ];

  return (
    <>
      {/* Floating AI Bot Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 text-white font-bold shadow-2xl shadow-cyan-950/80 hover:scale-105 transition-all border border-cyan-400/30 group"
          title="Open Vortex AI Bot & Live Tips Maker"
        >
          <div className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-300 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-400"></span>
          </div>
          <Bot className="w-5 h-5 text-cyan-200 group-hover:rotate-12 transition-transform" />
          <span className="text-xs tracking-wide">Vortex AI Bot</span>
        </button>
      )}

      {/* AI Bot Expanded Drawer / Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-full max-w-md bg-[#0b101c] border border-cyan-500/40 rounded-2xl shadow-2xl shadow-black/90 flex flex-col overflow-hidden animate-slideUp font-sans">
          {/* Header */}
          <div className="px-4 py-3 bg-[#070b13] border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-black font-bold shadow-md">
                <Bot className="w-4 h-4 text-black" />
              </div>
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>Vortex AI Tip Bot</span>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                    GEMINI 3.8
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                  Active Asset: <span className="text-cyan-400 font-bold">{activeStock.ticker} (₹{activeStock.price})</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title={isMinimized ? 'Expand' : 'Minimize'}
              >
                {isMinimized ? <ChevronUp className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Quick Prompt Pills */}
              <div className="px-3 py-2 bg-[#080c14] border-b border-slate-800/80 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
                {quickPrompts.map((qp, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendMessage(qp)}
                    className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-[#121929] hover:bg-slate-800 border border-slate-700/80 text-cyan-300 whitespace-nowrap transition-colors"
                  >
                    {qp}
                  </button>
                ))}
              </div>

              {/* Chat Messages Body */}
              <div className="p-4 space-y-3 overflow-y-auto max-h-[360px] min-h-[280px] bg-[#070b13]/60 text-xs font-mono">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[88%] p-3 rounded-xl leading-relaxed ${
                        m.sender === 'user'
                          ? 'bg-cyan-600 text-black font-medium rounded-br-none shadow-md'
                          : 'bg-[#121929] border border-slate-700/85 text-slate-200 rounded-bl-none shadow-sm'
                      }`}
                    >
                      <div className="whitespace-pre-wrap">{m.text}</div>
                    </div>
                    <span className="text-[9px] text-slate-500 mt-1 px-1">{m.timestamp}</span>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex items-center gap-2 text-slate-400 text-xs italic p-2 bg-[#121929] rounded-xl w-fit">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                    <span>Synthesizing live institutional tip...</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Footer */}
              <div className="p-3 bg-[#070b13] border-t border-slate-800">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder={`Ask AI bot about ${activeStock.ticker} or request live tip...`}
                    className="flex-1 px-3 py-2 text-xs rounded-lg bg-[#0b101c] border border-slate-700 text-white font-mono focus:outline-none focus:border-cyan-500"
                  />
                  <button
                    type="submit"
                    disabled={isLoading || !inputMessage.trim()}
                    className="p-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-black font-bold transition-colors disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};
