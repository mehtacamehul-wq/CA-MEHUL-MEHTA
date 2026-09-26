export interface Stock {
  ticker: string;
  name: string;
  sector: string;
  exchange: 'NSE' | 'BSE';
  price: number;
  change: number;
  changePercent: number;
  prevClose: number;
  open: number;
  high: number;
  low: number;
  high52w: number;
  low52w: number;
  volume: number;
  avgVolume20d: number;
  deliveryPercent: number;
  vwap: number;
  marketCap: number; // in INR Crores
  pe: number;
  medianPe5y: number;
  pb: number;
  evEbitda: number;
  roe: number;
  roce: number;
  debtToEquity: number;
  fcfYield: number;
  divYield: number;
  rsi14: number;
  dma50: number;
  dma200: number;
  beta: number;
  sharesOutstanding: number; // in Crores
  currency: string;
  orderBook: {
    bids: { price: number; quantity: number; orders: number }[];
    asks: { price: number; quantity: number; orders: number }[];
    totalBidQty: number;
    totalAskQty: number;
  };
  volumeProfile: {
    price: number;
    volume: number;
    isPoc?: boolean; // Point of control
  }[];
  recentBlockDeals: {
    id: string;
    time: string;
    price: number;
    quantity: number;
    valueCr: number;
    type: 'BUY' | 'SELL';
    client: string;
  }[];
  candles: {
    time: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
    vwap: number;
  }[];
}

export interface MacroItem {
  id: string;
  name: string;
  category: 'RATES' | 'COMMODITIES' | 'CURRENCIES' | 'CRYPTO';
  symbol: string;
  value: number;
  unit: string;
  change: number;
  changePercent: number;
  high24h: number;
  low24h: number;
  sparkline: number[];
  relevance: string;
  impactOnEquities: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
}

export interface SectorSensitivity {
  sector: string;
  crudeImpact: { text: string; score: number }; // -2 to +2
  interestRateImpact: { text: string; score: number };
  currencyImpact: { text: string; score: number };
  keyStocks: string[];
}

export interface AiResearchReport {
  ticker: string;
  companyName: string;
  rating: 'STRONG BUY' | 'ACCUMULATE' | 'NEUTRAL/HOLD' | 'TRIM/REDUCE' | 'SELL';
  confidenceScore: number;
  timeHorizon: string;
  tacticalLevels: {
    entryZone: string;
    target1: number;
    target2: number;
    target3: number;
    stopLoss: number;
    riskRewardRatio: string;
  };
  algorithmicSignal: {
    action: string;
    valuationVerdict: string;
    dmaDeviation: string;
  };
  mediaSynthesis: {
    moneycontrolSentiment: string;
    moneycontrolKeyTakeaways: string[];
    zeeBusinessPanelVerdict: string;
    zeeBusinessTradersPick: string;
  };
  volumeFlowAnalysis: {
    volumeSurgeRatio: string;
    institutionalActivity: string;
    deliveryPercentageEst: string;
    vwapContext: string;
  };
  macroeconomicCrossCurrents: {
    crudeImpact: string;
    currencyInterestRateImpact: string;
  };
  keyCatalysts: string[];
  downsideRisks: string[];
  executiveSummary: string;
}

export interface SipParameters {
  periodicDeposit: number; // in INR
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY';
  holdingPeriodYears: number; // 1, 3, 5, 10, 15, 20
  annualStepUpPercent: number; // e.g. 10%
  expectedCagr: number; // e.g. 15%
  totalNetWorth: number; // e.g. ₹50,00,000 to determine weightage
  reinvestDividends: boolean;
  adjustForInflation: boolean;
  inflationRate: number; // e.g. 6%
}

export interface SipProjection {
  totalInvested: number;
  futureValue: number;
  wealthGained: number;
  finalWeightagePercent: number;
  sharesAccumulated: number;
  yearlyBreakdown: {
    year: number;
    invested: number;
    futureValue: number;
    shares: number;
    weightage: number;
  }[];
  scenarios: {
    periodYears: number;
    bearCase: number; // -4% CAGR
    baseCase: number;
    bullCase: number; // +4% CAGR
  }[];
  monteCarlo: {
    percentile10: number; // conservative
    percentile50: number; // median
    percentile90: number; // optimistic
  };
}

export interface FundamentalSignal {
  action: 'STRONG_ACCUMULATE' | 'VALUE_BUY' | 'FAIR_VALUE_SIP' | 'MOMENTUM_HOLD' | 'TRIM_PROFIT';
  strength: number; // 0 to 100
  title: string;
  verdict: string;
  peDiscountPercent: number;
  dma200DistancePercent: number;
  sipMultiplier: number; // e.g. 1.25x or 0.8x
  targetBuyRange: [number, number];
  exitTrimLevel: number;
  factors: {
    label: string;
    status: 'FAVORABLE' | 'NEUTRAL' | 'CAUTION';
    detail: string;
  }[];
}

export interface IntradayTip {
  id: string;
  ticker: string;
  companyName: string;
  timestamp: string;
  signalType: 'SMART_BUY' | 'SMART_SELL' | 'SCALP_LONG' | 'SCALP_SHORT' | 'ACCUMULATE_DIP';
  sentimentVerdict: 'EXTREME_BULLISH' | 'BULLISH' | 'NEUTRAL' | 'CAUTIOUS' | 'BEARISH';
  confidenceScore: number; // 60 to 99%
  timeFrame: string; // e.g. '15M - Intraday', '1H - Swing', 'Market Close'
  
  // Tactical levels
  currentPrice: number;
  entryRange: [number, number]; // [minEntry, maxEntry]
  target1: number;
  target2: number;
  target3: number;
  stopLoss: number;
  riskReward: string; // e.g. '1:2.8'
  
  // Market Condition Drivers
  marketCondition: {
    volumeSurgeRatio: number;
    deliveryStrength: string;
    orderBookImbalance: 'BUY_PRESSURE' | 'SELL_PRESSURE' | 'BALANCED';
    pocLocation: string; // e.g. 'Above POC (₹2930)', 'At POC'
    sentimentSources: {
      moneycontrol: string;
      zeeBusiness: string;
      fiiDiiFlow: string;
    };
  };

  // Smart Investor Reasoning
  smartInvestorLogic: {
    entryReason: string;
    exitStrategy: string;
    invalidationTrigger: string;
    trailingStopLossGuideline: string;
  };

  status: 'ACTIVE' | 'TARGET_1_HIT' | 'TARGET_2_HIT' | 'STOP_LOSS_HIT' | 'EXPIRED';
}
