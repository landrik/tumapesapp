// Live mid-market exchange rates, sourced from ExchangeRate-API's free,
// keyless "open access" endpoint (https://www.exchangerate-api.com/docs/free).
// Per their terms, this free tier requires attribution — see the backend
// README's Notes section.
//
// This is the REAL interbank rate, not what a customer would actually be
// quoted by a money-transfer service — real providers apply a markup on
// top of this plus a flat fee (the corridor's `fee` field already models
// the fee; a markup is not currently applied here, since that's a business
// decision rather than a technical one — see the README note on this).

const FX_API_BASE = 'https://open.er-api.com/v6/latest';

// The provider updates once every 24h, so refetching more often than that
// buys nothing but risk of rate-limiting. An hour is a reasonable compromise
// between "reasonably fresh" and "don't hammer a free public API."
const CACHE_TTL_MS = 60 * 60 * 1000;

interface OpenErApiResponse {
  result: string;
  base_code: string;
  time_last_update_utc: string;
  rates: Record<string, number>;
}

interface CacheEntry {
  rates: Record<string, number>;
  fetchedAt: number;
}

const cache = new Map<string, CacheEntry>();

const fetchLiveRates = async (base: string): Promise<Record<string, number>> => {
  const cached = cache.get(base);
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
    return cached.rates;
  }

  const response = await fetch(`${FX_API_BASE}/${base}`);
  if (!response.ok) {
    throw new Error(`FX rate provider returned HTTP ${response.status}`);
  }

  const data = (await response.json()) as OpenErApiResponse;
  if (data.result !== 'success' || !data.rates) {
    throw new Error('FX rate provider returned an unsuccessful response');
  }

  cache.set(base, { rates: data.rates, fetchedAt: Date.now() });
  return data.rates;
};

/**
 * Returns the live mid-market rate for converting 1 unit of `from` into `to`.
 * Throws if the provider is unreachable AND there's no cached data (even
 * stale) to fall back on.
 */
export const getMidMarketRate = async (from: string, to: string): Promise<number> => {
  const fromUpper = from.toUpperCase();
  const toUpper = to.toUpperCase();

  if (fromUpper === toUpper) return 1;

  try {
    const rates = await fetchLiveRates(fromUpper);
    const rate = rates[toUpper];
    if (typeof rate !== 'number') {
      throw new Error(`FX provider has no rate for ${fromUpper} -> ${toUpper}`);
    }
    return rate;
  } catch (err) {
    // Fall back to a stale cache entry rather than failing the whole quote
    // outright — an hour-old rate beats no rate at all if the provider is
    // briefly down.
    const stale = cache.get(fromUpper);
    if (stale && typeof stale.rates[toUpper] === 'number') {
      console.warn(
        `FX live fetch failed for ${fromUpper}->${toUpper}, using stale cached rate:`,
        err
      );
      return stale.rates[toUpper];
    }
    throw err;
  }
};
