import { Stock, SipParameters, SipProjection } from '../types/equity';

/**
 * Exports the Investment Calculator SIP breakdown, horizons, and Monte Carlo estimates to a clean CSV file.
 */
export function exportSipForecastCsv(stock: Stock, params: SipParameters, projection: SipProjection) {
  const lines: string[] = [];

  // Metadata Header
  lines.push(`"VORTEX INSTITUTIONAL EQUITY DESK - SYSTEMATIC INVESTMENT FORECAST"`);
  lines.push(`"Asset","${stock.name} (${stock.ticker})"`);
  lines.push(`"Exchange","${stock.exchange}"`);
  lines.push(`"Current Market Price (CMP)","₹${stock.price}"`);
  lines.push(`"Periodic Deposit Amount","₹${params.periodicDeposit}"`);
  lines.push(`"Frequency","${params.frequency}"`);
  lines.push(`"Horizon (Years)","${params.holdingPeriodYears}"`);
  lines.push(`"Annual Step-Up","${params.annualStepUpPercent}%"`);
  lines.push(`"Expected Base CAGR","${params.expectedCagr}%"`);
  lines.push(`"Reinvest Dividends (DRIP)","${params.reinvestDividends ? 'YES' : 'NO'}"`);
  lines.push(`"Inflation Adjusted","${params.adjustForInflation ? `YES (${params.inflationRate}%)` : 'NO'}"`);
  lines.push(`"Total Net Worth Baseline","₹${params.totalNetWorth}"`);
  lines.push(``);

  // Summary Metrics
  lines.push(`"SUMMARY FORECAST METRICS"`);
  lines.push(`"Total Invested Capital (INR)","₹${projection.totalInvested}"`);
  lines.push(`"Projected Future Wealth (INR)","₹${projection.futureValue}"`);
  lines.push(`"Net Capital Gained (INR)","₹${projection.wealthGained}"`);
  lines.push(`"Final Portfolio Weightage","${projection.finalWeightagePercent}%"`);
  lines.push(`"Estimated Shares Accumulated","${projection.sharesAccumulated}"`);
  lines.push(``);

  // Yearly SIP Breakdown Table
  lines.push(`"YEAR-BY-YEAR SYSTEMATIC ACCUMULATION BREAKDOWN"`);
  lines.push(`"Year","Total Invested (INR)","Future Value (INR)","Accumulated Shares","Portfolio Weightage (%)"`);
  projection.yearlyBreakdown.forEach((row) => {
    lines.push(`${row.year},${row.invested},${row.futureValue},${row.shares},${row.weightage}`);
  });
  lines.push(``);

  // Multi-Scenario Matrix
  lines.push(`"MULTI-HORIZON SCENARIO MATRIX (BEAR vs BASE vs BULL)"`);
  lines.push(`"Holding Horizon (Years)","Bear Case Value (INR)","Base Case Value (INR)","Bull Case Value (INR)"`);
  projection.scenarios.forEach((sc) => {
    lines.push(`${sc.periodYears},${sc.bearCase},${sc.baseCase},${sc.bullCase}`);
  });
  lines.push(``);

  // Monte Carlo Probability Distribution
  lines.push(`"1000-PATH MONTE CARLO PROBABILITY QUANTILES"`);
  lines.push(`"10th Percentile (Conservative)","₹${projection.monteCarlo.percentile10}"`);
  lines.push(`"50th Percentile (Median Expected)","₹${projection.monteCarlo.percentile50}"`);
  lines.push(`"90th Percentile (Optimistic Breakout)","₹${projection.monteCarlo.percentile90}"`);

  const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent(lines.join('\n'));
  const link = document.createElement('a');
  link.setAttribute('href', csvContent);
  link.setAttribute('download', `${stock.ticker}_SIP_Investment_Forecast_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Exports simulated intraday trades, volume candles, order book, and block deal flow to a CSV file.
 */
export function exportTradeHistoryCsv(stock: Stock) {
  const lines: string[] = [];

  lines.push(`"VORTEX CAPITAL MARKETS - INSTITUTIONAL TRADE & VOLUME PROFILE AUDIT"`);
  lines.push(`"Ticker","${stock.ticker}"`);
  lines.push(`"Security Name","${stock.name}"`);
  lines.push(`"Sector","${stock.sector}"`);
  lines.push(`"Exchange","${stock.exchange}"`);
  lines.push(`"Timestamp","${new Date().toISOString()}"`);
  lines.push(`"Current Price","₹${stock.price}"`);
  lines.push(`"Total Traded Volume","${stock.volume}"`);
  lines.push(`"20-Day Avg Volume","${stock.avgVolume20d}"`);
  lines.push(`"Volume Surge Ratio","${(stock.volume / stock.avgVolume20d).toFixed(2)}x"`);
  lines.push(`"Delivery Percentage","${stock.deliveryPercent}%"`);
  lines.push(`"Session VWAP","₹${stock.vwap}"`);
  lines.push(``);

  // Block Deals Section
  lines.push(`"INSTITUTIONAL BLOCK DEALS & BULK FLOW (₹50+ CR)"`);
  lines.push(`"Deal ID","Execution Time","Client / Institution","Side","Price (INR)","Quantity","Trade Value (INR Cr)"`);
  stock.recentBlockDeals.forEach((deal) => {
    lines.push(`"${deal.id}","${deal.time}","${deal.client}","${deal.type}",${deal.price},${deal.quantity},${deal.valueCr}`);
  });
  lines.push(``);

  // Volume Profile (Price Histogram)
  lines.push(`"INTRADAY VOLUME-AT-PRICE CLUSTERS (POC)"`);
  lines.push(`"Price Node (INR)","Traded Volume","Point Of Control (POC)"`);
  stock.volumeProfile.forEach((vp) => {
    lines.push(`${vp.price},${vp.volume},"${vp.isPoc ? 'YES (POC)' : 'NO'}"`);
  });
  lines.push(``);

  // Intraday Candlestick & VWAP Trace
  lines.push(`"INTRADAY CANDLESTICK TIMEFRAME EXECUTION DATA"`);
  lines.push(`"Timestamp","Open","High","Low","Close","Traded Volume","Interval VWAP"`);
  stock.candles.forEach((c) => {
    lines.push(`"${c.time}",${c.open},${c.high},${c.low},${c.close},${c.volume},${c.vwap}`);
  });
  lines.push(``);

  // Level-2 Depth Snapshot
  lines.push(`"LEVEL-2 ORDER BOOK SNAPSHOT"`);
  lines.push(`"Bid Price","Bid Quantity","Bid Orders","Ask Price","Ask Quantity","Ask Orders"`);
  const maxRows = Math.max(stock.orderBook.bids.length, stock.orderBook.asks.length);
  for (let i = 0; i < maxRows; i++) {
    const b = stock.orderBook.bids[i] || { price: 0, quantity: 0, orders: 0 };
    const a = stock.orderBook.asks[i] || { price: 0, quantity: 0, orders: 0 };
    lines.push(`${b.price},${b.quantity},${b.orders},${a.price},${a.quantity},${a.orders}`);
  }

  const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent(lines.join('\n'));
  const link = document.createElement('a');
  link.setAttribute('href', csvContent);
  link.setAttribute('download', `${stock.ticker}_Trade_Volume_Audit_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
