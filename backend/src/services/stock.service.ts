import axios from 'axios';
import { getRedisClient } from '../config/redis';
import { config } from '../config';
import { logger } from '../config/logger';

const FINNHUB_BASE = 'https://finnhub.io/api/v1';
const CACHE_TTL_MARKET = 60; // 60 seconds during market hours
const CACHE_TTL_AFTERHOURS = 3600; // 1 hour after market hours

function isMarketHours(): boolean {
  const now = new Date();
  const utcHour = now.getUTCHours();
  const utcDay = now.getUTCDay(); // 0 = Sunday, 6 = Saturday
  // NYSE: 9:30 AM - 4:00 PM ET (UTC-5) = 14:30-21:00 UTC
  return utcDay >= 1 && utcDay <= 5 && utcHour >= 14 && utcHour < 21;
}

export async function getStockQuote(symbol: string): Promise<{
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  open: number;
  previousClose: number;
  timestamp: number;
}> {
  const upperSymbol = symbol.toUpperCase();
  const cacheKey = `stock_price:${upperSymbol}`;

  try {
    const redis = getRedisClient();
    if (redis) {
      const cached = await redis.get(cacheKey);
      if (cached) {
        logger.debug({ symbol: upperSymbol }, 'Stock price from cache');
        return JSON.parse(cached);
      }
    }
  } catch {
    // Redis unavailable, continue to API
  }

  try {
    if (!config.finnhub.apiKey || config.finnhub.apiKey === 'your-finnhub-api-key') {
      throw Object.assign(new Error('No API key configured'), { isMissingKey: true });
    }

    const response = await axios.get(`${FINNHUB_BASE}/quote`, {
      params: { symbol: upperSymbol },
      headers: { 'X-Finnhub-Token': config.finnhub.apiKey },
      timeout: 5000,
    });

    const data = response.data;
    if (!data || data.c === 0) {
      throw Object.assign(
        new Error(`Symbol ${upperSymbol} not found or unavailable`),
        { statusCode: 404, code: 'STOCK_NOT_FOUND' }
      );
    }

    const quote = {
      symbol: upperSymbol,
      price: data.c,          // current price
      change: data.d,         // change
      changePercent: data.dp, // change percent
      high: data.h,
      low: data.l,
      open: data.o,
      previousClose: data.pc,
      timestamp: data.t,
    };

    // Cache result
    try {
      const redis = getRedisClient();
      if (redis) {
        const ttl = isMarketHours() ? CACHE_TTL_MARKET : CACHE_TTL_AFTERHOURS;
        await redis.setEx(cacheKey, ttl, JSON.stringify(quote));
      }
    } catch { /* ignore cache errors */ }

    logger.debug({ symbol: upperSymbol, price: quote.price }, 'Stock price fetched from Finnhub');
    return quote;

  } catch (error: any) {
    if (error.isMissingKey) {
      logger.debug({ symbol: upperSymbol }, 'Finnhub API key is missing. Skipping real-time price fetch.');
    } else {
      logger.error({ symbol: upperSymbol, error: error.message }, 'Failed to fetch stock price');
    }
    
    throw Object.assign(
      new Error(`Failed to fetch price for ${upperSymbol}: ${error.message}`),
      { statusCode: 502, code: 'STOCK_FETCH_FAILED' }
    );
  }
}

export async function getMultipleQuotes(symbols: string[]) {
  const results = await Promise.allSettled(symbols.map((s) => getStockQuote(s)));
  return results.map((r, i) => ({
    symbol: symbols[i].toUpperCase(),
    ...(r.status === 'fulfilled' ? { data: r.value, error: null } : { data: null, error: r.reason?.message }),
  }));
}

export async function searchStocks(query: string) {
  try {
    const response = await axios.get(`${FINNHUB_BASE}/search`, {
      params: { q: query },
      headers: { 'X-Finnhub-Token': config.finnhub.apiKey },
      timeout: 5000,
    });
    return (response.data.result || []).slice(0, 10);
  } catch (error: any) {
    logger.error({ query, error: error.message }, 'Stock search failed');
    return [];
  }
}

export async function getStockHistory(symbol: string, timeframe: '1D' | '1W' | '1M' | '1Y') {
  const upperSymbol = symbol.toUpperCase();
  let range = '1mo';
  let interval = '1d';

  switch (timeframe) {
    case '1D':
      range = '1d';
      interval = '15m';
      break;
    case '1W':
      range = '5d';
      interval = '60m';
      break;
    case '1M':
      range = '1mo';
      interval = '1d';
      break;
    case '1Y':
      range = '1y';
      interval = '1wk';
      break;
  }

  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${upperSymbol}?range=${range}&interval=${interval}`;
    const response = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 5000 });

    const result = response.data?.chart?.result?.[0];
    if (!result || !result.timestamp || !result.indicators.quote[0].close) return [];

    const timestamps = result.timestamp as number[];
    const prices = result.indicators.quote[0].close as (number | null)[];

    const history = [];
    for (let i = 0; i < timestamps.length; i++) {
        const p = prices[i];
        if (p !== null && p !== undefined) {
             history.push({ timestamp: timestamps[i] * 1000, price: p });
        }
    }
    return history;
  } catch (error: any) {
    logger.error({ symbol: upperSymbol, error: error.message }, 'Failed to fetch stock history from Yahoo Finance');
    return [];
  }
}

