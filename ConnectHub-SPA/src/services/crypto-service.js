/**
 * CoinGecko Crypto Price Service
 * LynkApp — Free, no API key required
 *
 * API: https://api.coingecko.com/api/v3
 * Cost: FREE (public endpoints, no key needed)
 * Rate limit: ~30 calls/min on public API
 *
 * Features:
 *  - Live prices for top coins (BTC, ETH, SOL, BNB, DOGE, ADA, etc.)
 *  - 24h price change % with trending indicators
 *  - Market cap + volume data
 *  - Sparkline 7-day chart data
 *  - Global crypto market stats
 *  - Trending coins (most searched last 24h)
 *  - Price lookup by any coin ID
 *  - Multi-currency support (USD, EUR, GBP, JPY, etc.)
 *  - LynkApp section integrations: Trending, Feed, Marketplace, Media Hub
 */

const COINGECKO_BASE = 'https://api.coingecko.com/api/v3';

// ─── Cache ───────────────────────────────────────────────────────────────────
const _cache = new Map();
const CACHE_TTL = 60_000; // 60 seconds

function _getCached(key) {
  const entry = _cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.ts > CACHE_TTL) { _cache.delete(key); return null; }
  return entry.data;
}
function _setCache(key, data) {
  _cache.set(key, { data, ts: Date.now() });
}

// ─── Core fetch ──────────────────────────────────────────────────────────────
async function _fetch(endpoint, params = {}) {
  const url = new URL(`${COINGECKO_BASE}${endpoint}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const cacheKey = url.toString();

  const cached = _getCached(cacheKey);
  if (cached) return cached;

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`CoinGecko ${res.status}: ${res.statusText}`);
  const data = await res.json();
  _setCache(cacheKey, data);
  return data;
}

// ─── Default coins tracked ───────────────────────────────────────────────────
export const DEFAULT_COINS = [
  'bitcoin', 'ethereum', 'solana', 'binancecoin', 'ripple',
  'cardano', 'dogecoin', 'avalanche-2', 'polkadot', 'chainlink',
  'litecoin', 'tron', 'uniswap', 'wrapped-bitcoin', 'shiba-inu'
];

export const COIN_SYMBOLS = {
  bitcoin: 'BTC', ethereum: 'ETH', solana: 'SOL', binancecoin: 'BNB',
  ripple: 'XRP', cardano: 'ADA', dogecoin: 'DOGE', 'avalanche-2': 'AVAX',
  polkadot: 'DOT', chainlink: 'LINK', litecoin: 'LTC', tron: 'TRX',
  uniswap: 'UNI', 'wrapped-bitcoin': 'WBTC', 'shiba-inu': 'SHIB'
};

export const COIN_COLORS = {
  bitcoin: '#f7931a', ethereum: '#627eea', solana: '#9945ff',
  binancecoin: '#f3ba2f', ripple: '#0085c0', cardano: '#0033ad',
  dogecoin: '#c2a633', 'avalanche-2': '#e84142', polkadot: '#e6007a',
  chainlink: '#2a5ada', litecoin: '#345d9d', tron: '#eb0029',
  uniswap: '#ff007a', 'wrapped-bitcoin': '#f7931a', 'shiba-inu': '#ffa409'
};

// ─── 1. Get prices for multiple coins ────────────────────────────────────────
/**
 * Fetch live prices + 24h stats for a list of coins
 * @param {string[]} coinIds - CoinGecko coin IDs
 * @param {string} currency - 'usd', 'eur', 'gbp', etc.
 * @returns {Object} { bitcoin: { usd, usd_24h_change, usd_market_cap, ... }, ... }
 */
export async function getPrices(coinIds = DEFAULT_COINS, currency = 'usd') {
  const ids = coinIds.join(',');
  return _fetch('/simple/price', {
    ids,
    vs_currencies: currency,
    include_24hr_change: 'true',
    include_24hr_vol: 'true',
    include_market_cap: 'true',
    include_last_updated_at: 'true'
  });
}

// ─── 2. Get top coins with full market data ───────────────────────────────────
/**
 * Get top N coins by market cap with full market data + sparkline
 * @param {number} limit - number of coins (max 250)
 * @param {string} currency - vs currency
 * @param {boolean} sparkline - include 7-day sparkline data
 */
export async function getTopCoins(limit = 20, currency = 'usd', sparkline = false) {
  const data = await _fetch('/coins/markets', {
    vs_currency: currency,
    order: 'market_cap_desc',
    per_page: limit,
    page: 1,
    sparkline: sparkline ? 'true' : 'false',
    price_change_percentage: '1h,24h,7d'
  });
  return data.map(coin => ({
    id: coin.id,
    symbol: coin.symbol.toUpperCase(),
    name: coin.name,
    image: coin.image,
    price: coin.current_price,
    marketCap: coin.market_cap,
    marketCapRank: coin.market_cap_rank,
    volume24h: coin.total_volume,
    change1h: coin.price_change_percentage_1h_in_currency,
    change24h: coin.price_change_percentage_24h,
    change7d: coin.price_change_percentage_7d_in_currency,
    high24h: coin.high_24h,
    low24h: coin.low_24h,
    ath: coin.ath,
    athDate: coin.ath_date,
    sparkline: coin.sparkline_in_7d?.price || [],
    lastUpdated: coin.last_updated,
    // LynkApp helpers
    priceFormatted: formatPrice(coin.current_price, currency),
    changeFormatted: formatChange(coin.price_change_percentage_24h),
    trending: coin.price_change_percentage_24h > 0 ? 'up' : 'down',
    color: COIN_COLORS[coin.id] || '#a78bfa'
  }));
}

// ─── 3. Get single coin detail ────────────────────────────────────────────────
/**
 * Get detailed info for a single coin
 * @param {string} coinId - e.g. 'bitcoin'
 */
export async function getCoinDetail(coinId) {
  const data = await _fetch(`/coins/${coinId}`, {
    localization: 'false',
    tickers: 'false',
    market_data: 'true',
    community_data: 'false',
    developer_data: 'false',
    sparkline: 'true'
  });
  const m = data.market_data;
  return {
    id: data.id,
    symbol: data.symbol.toUpperCase(),
    name: data.name,
    image: data.image?.large,
    description: data.description?.en?.split('. ')[0] + '.',
    links: {
      website: data.links?.homepage?.[0],
      twitter: data.links?.twitter_screen_name,
      reddit: data.links?.subreddit_url
    },
    price: m.current_price?.usd,
    marketCap: m.market_cap?.usd,
    marketCapRank: data.market_cap_rank,
    volume24h: m.total_volume?.usd,
    change24h: m.price_change_percentage_24h,
    change7d: m.price_change_percentage_7d,
    change30d: m.price_change_percentage_30d,
    ath: m.ath?.usd,
    atl: m.atl?.usd,
    supply: {
      circulating: m.circulating_supply,
      total: m.total_supply,
      max: m.max_supply
    },
    sparkline: m.sparkline_7d?.price || [],
    priceFormatted: formatPrice(m.current_price?.usd),
    changeFormatted: formatChange(m.price_change_percentage_24h),
    trending: m.price_change_percentage_24h > 0 ? 'up' : 'down',
    color: COIN_COLORS[data.id] || '#a78bfa'
  };
}

// ─── 4. Get trending coins ────────────────────────────────────────────────────
/**
 * Get trending coins (most searched in last 24h on CoinGecko)
 * Returns top 7 trending coins
 */
export async function getTrendingCoins() {
  const data = await _fetch('/search/trending');
  return data.coins.map(({ item }) => ({
    id: item.id,
    symbol: item.symbol,
    name: item.name,
    image: item.large,
    marketCapRank: item.market_cap_rank,
    score: item.score,
    priceBtc: item.price_btc,
    sparkline: item.sparkline,
    // helper
    priceFormatted: item.data?.price || 'N/A',
    change24h: item.data?.price_change_percentage_24h?.usd || 0,
    changeFormatted: formatChange(item.data?.price_change_percentage_24h?.usd || 0)
  }));
}

// ─── 5. Global market stats ───────────────────────────────────────────────────
/**
 * Get global crypto market statistics
 */
export async function getGlobalMarket() {
  const { data } = await _fetch('/global');
  return {
    activeCryptos: data.active_cryptocurrencies,
    totalMarketCap: data.total_market_cap?.usd,
    totalVolume24h: data.total_volume?.usd,
    btcDominance: data.market_cap_percentage?.btc,
    ethDominance: data.market_cap_percentage?.eth,
    marketCapChange24h: data.market_cap_change_percentage_24h_usd,
    // formatted
    totalMarketCapFormatted: formatLargeNumber(data.total_market_cap?.usd),
    totalVolumeFormatted: formatLargeNumber(data.total_volume?.usd),
    btcDominanceFormatted: `${data.market_cap_percentage?.btc?.toFixed(1)}%`,
    ethDominanceFormatted: `${data.market_cap_percentage?.eth?.toFixed(1)}%`,
    changeFormatted: formatChange(data.market_cap_change_percentage_24h_usd),
    trending: data.market_cap_change_percentage_24h_usd > 0 ? 'up' : 'down'
  };
}

// ─── 6. Price chart history ───────────────────────────────────────────────────
/**
 * Get OHLC chart data for a coin
 * @param {string} coinId - coin id
 * @param {number} days - 1, 7, 14, 30, 90, 180, 365, 'max'
 * @param {string} currency - vs currency
 */
export async function getPriceHistory(coinId, days = 7, currency = 'usd') {
  const data = await _fetch(`/coins/${coinId}/market_chart`, {
    vs_currency: currency,
    days: days.toString(),
    interval: days <= 1 ? 'hourly' : 'daily'
  });
  return {
    prices: data.prices.map(([ts, price]) => ({ ts, price, date: new Date(ts) })),
    volumes: data.total_volumes.map(([ts, vol]) => ({ ts, vol, date: new Date(ts) })),
    marketCaps: data.market_caps.map(([ts, cap]) => ({ ts, cap, date: new Date(ts) }))
  };
}

// ─── 7. Search coins ──────────────────────────────────────────────────────────
/**
 * Search CoinGecko for coins/tokens by name or symbol
 * @param {string} query - search term
 */
export async function searchCoins(query) {
  const data = await _fetch('/search', { query });
  return data.coins.slice(0, 10).map(c => ({
    id: c.id,
    symbol: c.symbol,
    name: c.name,
    image: c.large,
    marketCapRank: c.market_cap_rank
  }));
}

// ─── 8. Exchange rates ────────────────────────────────────────────────────────
/**
 * Get BTC exchange rates against 40+ currencies + crypto
 */
export async function getExchangeRates() {
  const { rates } = await _fetch('/exchange_rates');
  return Object.entries(rates).map(([key, val]) => ({
    id: key,
    name: val.name,
    unit: val.unit,
    value: val.value,
    type: val.type // 'fiat', 'commodity', or 'crypto'
  }));
}

// ─── 9. LynkApp Section Integrations ─────────────────────────────────────────

/**
 * Build a crypto ticker strip for the Trending section
 * Returns array of { symbol, price, change24h, trending, color }
 */
export async function buildTrendingTicker(limit = 10, currency = 'usd') {
  const coins = await getTopCoins(limit, currency);
  return coins.map(c => ({
    symbol: c.symbol,
    name: c.name,
    price: c.priceFormatted,
    change: c.changeFormatted,
    trending: c.trending,
    color: c.color,
    image: c.image,
    id: c.id
  }));
}

/**
 * Build crypto price cards for the Media Hub / Finance section
 * Returns top 6 coins with full card data
 */
export async function buildCryptoPriceCards(limit = 6, currency = 'usd') {
  const coins = await getTopCoins(limit, currency, true);
  return coins.map(c => ({
    id: c.id,
    symbol: c.symbol,
    name: c.name,
    image: c.image,
    price: c.priceFormatted,
    marketCap: formatLargeNumber(c.marketCap),
    volume: formatLargeNumber(c.volume24h),
    change1h: formatChange(c.change1h),
    change24h: c.changeFormatted,
    change7d: formatChange(c.change7d),
    trending: c.trending,
    color: c.color,
    sparkline: c.sparkline,
    high: formatPrice(c.high24h, currency),
    low: formatPrice(c.low24h, currency),
    ath: formatPrice(c.ath, currency)
  }));
}

/**
 * Build a mini crypto widget for feed posts / stories
 * Shows BTC + ETH + top gainer/loser
 */
export async function buildFeedCryptoWidget(currency = 'usd') {
  const [topCoins, trending, global] = await Promise.all([
    getTopCoins(20, currency),
    getTrendingCoins(),
    getGlobalMarket()
  ]);
  const topGainer = [...topCoins].sort((a, b) => b.change24h - a.change24h)[0];
  const topLoser = [...topCoins].sort((a, b) => a.change24h - b.change24h)[0];
  const btc = topCoins.find(c => c.id === 'bitcoin');
  const eth = topCoins.find(c => c.id === 'ethereum');
  return {
    global,
    btc: btc ? { price: btc.priceFormatted, change: btc.changeFormatted, trending: btc.trending } : null,
    eth: eth ? { price: eth.priceFormatted, change: eth.changeFormatted, trending: eth.trending } : null,
    topGainer: topGainer ? { symbol: topGainer.symbol, change: topGainer.changeFormatted, price: topGainer.priceFormatted } : null,
    topLoser: topLoser ? { symbol: topLoser.symbol, change: topLoser.changeFormatted, price: topLoser.priceFormatted } : null,
    trendingCoins: trending.slice(0, 3).map(t => ({ name: t.name, symbol: t.symbol, image: t.image }))
  };
}

/**
 * Build a marketplace crypto payment info panel
 * Shows accepted crypto prices + conversion rates
 */
export async function buildMarketplaceCryptoPanel(usdAmount = 100) {
  const prices = await getPrices(['bitcoin', 'ethereum', 'solana', 'litecoin', 'dogecoin']);
  return ['bitcoin', 'ethereum', 'solana', 'litecoin', 'dogecoin'].map(id => {
    const price = prices[id]?.usd || 0;
    const change = prices[id]?.usd_24h_change || 0;
    const cryptoAmount = price > 0 ? (usdAmount / price) : 0;
    return {
      id,
      symbol: COIN_SYMBOLS[id] || id.toUpperCase(),
      price: formatPrice(price),
      change: formatChange(change),
      trending: change > 0 ? 'up' : 'down',
      color: COIN_COLORS[id] || '#a78bfa',
      // how much crypto = $usdAmount
      equivalent: cryptoAmount < 0.001
        ? `${(cryptoAmount * 1e6).toFixed(2)} μ${COIN_SYMBOLS[id]}`
        : `${cryptoAmount.toFixed(6)} ${COIN_SYMBOLS[id]}`
    };
  });
}

// ─── Formatters ───────────────────────────────────────────────────────────────

/**
 * Format a price with currency symbol and smart decimal places
 */
export function formatPrice(price, currency = 'usd') {
  if (price == null || isNaN(price)) return 'N/A';
  const symbols = { usd: '$', eur: '€', gbp: '£', jpy: '¥', btc: '₿' };
  const sym = symbols[currency] || currency.toUpperCase() + ' ';
  if (price >= 1000) return `${sym}${price.toLocaleString('en-US', { maximumFractionDigits: 2 })}`;
  if (price >= 1) return `${sym}${price.toFixed(4)}`;
  if (price >= 0.01) return `${sym}${price.toFixed(6)}`;
  return `${sym}${price.toFixed(8)}`;
}

/**
 * Format a 24h change percentage with + / - and color class
 */
export function formatChange(change) {
  if (change == null || isNaN(change)) return { text: '0.00%', positive: true };
  const positive = change >= 0;
  return {
    text: `${positive ? '+' : ''}${change.toFixed(2)}%`,
    positive,
    color: positive ? '#22c55e' : '#ef4444',
    emoji: positive ? '▲' : '▼'
  };
}

/**
 * Format large numbers: 1.23T, 456B, 78M, etc.
 */
export function formatLargeNumber(num, currency = 'usd') {
  if (num == null || isNaN(num)) return 'N/A';
  const sym = currency === 'usd' ? '$' : '';
  if (num >= 1e12) return `${sym}${(num / 1e12).toFixed(2)}T`;
  if (num >= 1e9) return `${sym}${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `${sym}${(num / 1e6).toFixed(2)}M`;
  if (num >= 1e3) return `${sym}${(num / 1e3).toFixed(2)}K`;
  return `${sym}${num.toFixed(2)}`;
}

/**
 * Render a mini sparkline SVG path string from price array
 * @param {number[]} prices - array of prices
 * @param {number} width - SVG width
 * @param {number} height - SVG height
 * @returns {string} SVG path d attribute
 */
export function buildSparklinePath(prices, width = 100, height = 30) {
  if (!prices || prices.length < 2) return '';
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = max - min || 1;
  const points = prices.map((p, i) => {
    const x = (i / (prices.length - 1)) * width;
    const y = height - ((p - min) / range) * height;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  return `M${points.join(' L')}`;
}

/**
 * Get the CSS color class for a trend direction
 */
export function trendColor(change) {
  return change >= 0 ? '#22c55e' : '#ef4444';
}

/**
 * Build a simple HTML price badge for inline use
 * e.g. "BTC $67,234.56 ▲ +2.34%"
 */
export function buildPriceBadge(symbol, price, change24h, color = '#a78bfa') {
  const ch = formatChange(change24h);
  return `<span style="
    display:inline-flex;align-items:center;gap:6px;
    background:#1a1a2e;border:1px solid ${color}40;
    border-radius:20px;padding:4px 12px;font-size:13px;
  ">
    <span style="color:${color};font-weight:700">${symbol}</span>
    <span style="color:#f1f5f9">${formatPrice(price)}</span>
    <span style="color:${ch.color}">${ch.emoji} ${ch.text}</span>
  </span>`;
}

// ─── Named export for full test suite ────────────────────────────────────────
export default {
  getPrices,
  getTopCoins,
  getCoinDetail,
  getTrendingCoins,
  getGlobalMarket,
  getPriceHistory,
  searchCoins,
  getExchangeRates,
  buildTrendingTicker,
  buildCryptoPriceCards,
  buildFeedCryptoWidget,
  buildMarketplaceCryptoPanel,
  formatPrice,
  formatChange,
  formatLargeNumber,
  buildSparklinePath,
  trendColor,
  buildPriceBadge,
  DEFAULT_COINS,
  COIN_SYMBOLS,
  COIN_COLORS
};
