import { Stock, SipParameters, SipProjection, FundamentalSignal } from '../types/equity';

/**
 * Calculates systematic periodic investment forecasts with step-up SIP,
 * portfolio weightage, multi-scenario bands, and Monte Carlo probability distributions.
 */
export function calculateSipProjection(
  stock: Stock,
  params: SipParameters
): SipProjection {
  const {
    periodicDeposit,
    frequency,
    holdingPeriodYears,
    annualStepUpPercent,
    expectedCagr,
    totalNetWorth,
    reinvestDividends,
    adjustForInflation,
    inflationRate,
  } = params;

  // Convert frequency to deposits per year
  const depositsPerYear =
    frequency === 'DAILY' ? 250 : frequency === 'WEEKLY' ? 52 : frequency === 'QUARTERLY' ? 4 : 12;

  // Total rate of return: base CAGR + dividend reinvestment
  const effectiveAnnualRate = expectedCagr + (reinvestDividends ? stock.divYield : 0);
  const periodicRate = Math.pow(1 + effectiveAnnualRate / 100, 1 / depositsPerYear) - 1;

  let currentDeposit = periodicDeposit;
  let totalInvested = 0;
  let accumulatedValue = 0;
  let estimatedShares = 0;
  let currentStockPrice = stock.price;

  const yearlyBreakdown: SipProjection['yearlyBreakdown'] = [];

  for (let year = 1; year <= holdingPeriodYears; year++) {
    for (let period = 1; period <= depositsPerYear; period++) {
      totalInvested += currentDeposit;
      accumulatedValue = (accumulatedValue + currentDeposit) * (1 + periodicRate);

      // Estimate share price appreciation at CAGR for share count accumulation
      const priceAtPeriod = stock.price * Math.pow(1 + effectiveAnnualRate / 100, (year - 1) + period / depositsPerYear);
      estimatedShares += currentDeposit / priceAtPeriod;
    }

    // Apply inflation discount if enabled
    const inflationDiscount = adjustForInflation ? Math.pow(1 + inflationRate / 100, year) : 1;
    const realFutureValue = accumulatedValue / inflationDiscount;

    // Weightage in total net worth (assuming remaining net worth compounds at nominal 8%)
    const projectedNetWorth = totalNetWorth * Math.pow(1.08, year) + realFutureValue;
    const weightage = (realFutureValue / Math.max(projectedNetWorth, 1)) * 100;

    yearlyBreakdown.push({
      year,
      invested: Math.round(totalInvested),
      futureValue: Math.round(realFutureValue),
      shares: Math.round(estimatedShares),
      weightage: Number(weightage.toFixed(2)),
    });

    // Step up deposit at the end of each year
    currentDeposit *= 1 + annualStepUpPercent / 100;
  }

  const finalFutureValue = yearlyBreakdown[yearlyBreakdown.length - 1]?.futureValue || 0;
  const wealthGained = Math.max(0, finalFutureValue - totalInvested);
  const finalWeightagePercent = yearlyBreakdown[yearlyBreakdown.length - 1]?.weightage || 0;

  // Multi-scenario matrix across standard institutional horizons
  const horizonYears = [1, 3, 5, 10, 15, 20].filter((y) => y <= Math.max(holdingPeriodYears, 10));
  const scenarios = horizonYears.map((h) => {
    const bearFuture = calculateSimpleCompounding(periodicDeposit, depositsPerYear, h, annualStepUpPercent, Math.max(4, effectiveAnnualRate - 4.5));
    const baseFuture = calculateSimpleCompounding(periodicDeposit, depositsPerYear, h, annualStepUpPercent, effectiveAnnualRate);
    const bullFuture = calculateSimpleCompounding(periodicDeposit, depositsPerYear, h, annualStepUpPercent, effectiveAnnualRate + 4.5);

    return {
      periodYears: h,
      bearCase: Math.round(bearFuture),
      baseCase: Math.round(baseFuture),
      bullCase: Math.round(bullFuture),
    };
  });

  // Monte Carlo simulation with 1,000 paths
  const monteCarloRuns: number[] = [];
  const volatility = stock.beta * 0.18; // approx annual standard deviation

  for (let sim = 0; sim < 1000; sim++) {
    let simAccum = 0;
    let simDeposit = periodicDeposit;

    for (let y = 1; y <= holdingPeriodYears; y++) {
      // Box-Muller transform for normal distribution
      const u1 = Math.max(1e-6, Math.random());
      const u2 = Math.random();
      const z = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
      const simulatedYearlyReturn = effectiveAnnualRate / 100 + volatility * z;
      const simPeriodicRate = Math.pow(Math.max(0.5, 1 + simulatedYearlyReturn), 1 / depositsPerYear) - 1;

      for (let p = 1; p <= depositsPerYear; p++) {
        simAccum = (simAccum + simDeposit) * (1 + simPeriodicRate);
      }
      simDeposit *= 1 + annualStepUpPercent / 100;
    }
    monteCarloRuns.push(simAccum);
  }

  monteCarloRuns.sort((a, b) => a - b);
  const p10 = monteCarloRuns[Math.floor(monteCarloRuns.length * 0.1)];
  const p50 = monteCarloRuns[Math.floor(monteCarloRuns.length * 0.5)];
  const p90 = monteCarloRuns[Math.floor(monteCarloRuns.length * 0.9)];

  return {
    totalInvested: Math.round(totalInvested),
    futureValue: finalFutureValue,
    wealthGained: Math.round(wealthGained),
    finalWeightagePercent,
    sharesAccumulated: Math.round(estimatedShares),
    yearlyBreakdown,
    scenarios,
    monteCarlo: {
      percentile10: Math.round(p10),
      percentile50: Math.round(p50),
      percentile90: Math.round(p90),
    },
  };
}

function calculateSimpleCompounding(
  deposit: number,
  freq: number,
  years: number,
  stepUp: number,
  cagr: number
): number {
  let currentDep = deposit;
  let accum = 0;
  const pRate = Math.pow(1 + cagr / 100, 1 / freq) - 1;

  for (let y = 1; y <= years; y++) {
    for (let p = 1; p <= freq; p++) {
      accum = (accum + currentDep) * (1 + pRate);
    }
    currentDep *= 1 + stepUp / 100;
  }
  return accum;
}

/**
 * Generates an algorithmic quantitative entry and exit signal based on
 * fundamental valuation metrics (P/E relative to 5Y historical median, EV/EBITDA, ROE)
 * and technical DMA/RSI confluence.
 */
export function generateFundamentalSignal(stock: Stock): FundamentalSignal {
  const { price, pe, medianPe5y, evEbitda, roe, debtToEquity, dma200, dma50, rsi14 } = stock;

  const peDiscountPercent = ((medianPe5y - pe) / medianPe5y) * 100;
  const dma200DistancePercent = ((price - dma200) / dma200) * 100;

  let strength = 70;
  let action: FundamentalSignal['action'] = 'FAIR_VALUE_SIP';
  let title = 'Fair Value Dollar-Cost Averaging';
  let verdict = '';
  let sipMultiplier = 1.0;

  // Valuation Scoring
  if (peDiscountPercent >= 12) {
    strength += 18;
    action = 'STRONG_ACCUMULATE';
    title = 'Deep Value Accumulation Zone';
    verdict = `Current P/E of ${pe}x trades at a notable ${Math.abs(peDiscountPercent).toFixed(1)}% discount to the 5-year historical median of ${medianPe5y}x. Institutional risk-reward is heavily tilted towards long-term compounding.`;
    sipMultiplier = 1.35; // Boost monthly allocation by 35%
  } else if (peDiscountPercent >= 4) {
    strength += 10;
    action = 'VALUE_BUY';
    title = 'Favorable Valuation Entry';
    verdict = `Trading at ${pe}x P/E, comfortably below the 5-year norm. Strong balance sheet with Debt/Equity of ${debtToEquity} and ROE of ${roe}% justifies aggressive dip accumulation.`;
    sipMultiplier = 1.2;
  } else if (peDiscountPercent > -10) {
    action = 'FAIR_VALUE_SIP';
    title = 'Fair Value Consolidation';
    verdict = `Current valuation is in equilibrium with the 5-year median (${medianPe5y}x). Maintain systematic periodic deposits without altering tranche sizing.`;
    sipMultiplier = 1.0;
  } else if (peDiscountPercent > -22) {
    strength -= 10;
    action = 'MOMENTUM_HOLD';
    title = 'Elevated Valuation - Maintain Hold';
    verdict = `Stock trades at an extended multiple of ${pe}x (+${Math.abs(peDiscountPercent).toFixed(1)}% premium over 5Y median). New lumpsum capital is not recommended; continue standard SIP only.`;
    sipMultiplier = 0.85;
  } else {
    strength -= 25;
    action = 'TRIM_PROFIT';
    title = 'Overvaluation Caution - Tranche Profit Taking';
    verdict = `Excessive multiple expansion (${pe}x vs ${medianPe5y}x median). Consider rebalancing or executing algorithmic profit-taking tranches above resistance.`;
    sipMultiplier = 0.6;
  }

  // Confluence checks
  const factors: FundamentalSignal['factors'] = [
    {
      label: 'P/E Relative to 5Y Median',
      status: peDiscountPercent >= 5 ? 'FAVORABLE' : peDiscountPercent >= -10 ? 'NEUTRAL' : 'CAUTION',
      detail: `${pe}x vs ${medianPe5y}x median (${peDiscountPercent >= 0 ? '-' : '+'}${Math.abs(peDiscountPercent).toFixed(1)}% deviation)`,
    },
    {
      label: '200-Day Moving Average',
      status: dma200DistancePercent >= 0 && dma200DistancePercent <= 12 ? 'FAVORABLE' : dma200DistancePercent > 18 ? 'CAUTION' : 'NEUTRAL',
      detail: `Trading ${dma200DistancePercent >= 0 ? '+' : ''}${dma200DistancePercent.toFixed(1)}% from 200-DMA (₹${dma200.toFixed(0)})`,
    },
    {
      label: 'EV/EBITDA Multiple',
      status: evEbitda <= 14 ? 'FAVORABLE' : evEbitda <= 20 ? 'NEUTRAL' : 'CAUTION',
      detail: `${evEbitda}x enterprise valuation multiple`,
    },
    {
      label: 'Capital Efficiency (ROE & D/E)',
      status: roe >= 15 && debtToEquity <= 0.8 ? 'FAVORABLE' : roe >= 10 ? 'NEUTRAL' : 'CAUTION',
      detail: `ROE: ${roe}% | Debt/Equity: ${debtToEquity}`,
    },
    {
      label: '14-Day RSI Confluence',
      status: rsi14 <= 45 ? 'FAVORABLE' : rsi14 <= 65 ? 'NEUTRAL' : 'CAUTION',
      detail: `RSI at ${rsi14} (${rsi14 > 70 ? 'Overbought' : rsi14 < 35 ? 'Oversold Accumulation' : 'Neutral Range'})`,
    },
  ];

  const targetBuyRange: [number, number] = [
    Math.round(Math.min(price * 0.96, dma50 * 0.99)),
    Math.round(price * 1.01),
  ];

  const exitTrimLevel = Math.round(Math.max(price * 1.15, medianPe5y * 1.25 * (price / pe)));

  return {
    action,
    strength: Math.min(96, Math.max(45, strength)),
    title,
    verdict,
    peDiscountPercent,
    dma200DistancePercent,
    sipMultiplier,
    targetBuyRange,
    exitTrimLevel,
    factors,
  };
}
