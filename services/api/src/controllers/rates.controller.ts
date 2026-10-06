import { Request, Response } from 'express';
import corridors, { Corridor } from '../data/rates';
import { getMidMarketRate } from '../services/fxRates.service';
import { success, error } from '../utils/response';

export interface QuotedRate {
  rate: number;
  source: 'live' | 'fallback';
}

/**
 * Applies this corridor's markup on top of a real mid-market rate — this is
 * how every remittance company (WorldRemit, Wise, Remitly, etc.) actually
 * makes money on the FX leg: quote worse than mid-market, keep the spread,
 * on top of the separate flat fee. Falls back to the corridor's static
 * fallbackRate (still with markup applied) if the live provider is down,
 * so a third-party outage degrades gracefully instead of breaking quotes
 * and transfers entirely.
 */
export const getQuotedRate = async (corridor: Corridor): Promise<QuotedRate> => {
  let midMarketRate: number;
  let source: 'live' | 'fallback';

  try {
    midMarketRate = await getMidMarketRate(corridor.from, corridor.to);
    source = 'live';
  } catch (err) {
    console.warn(
      `[rates] Live rate unavailable for ${corridor.from}->${corridor.to}, using fallback rate:`,
      err
    );
    midMarketRate = corridor.fallbackRate;
    source = 'fallback';
  }

  const rate = parseFloat((midMarketRate * (1 - corridor.markupPercent / 100)).toFixed(4));
  return { rate, source };
};

// GET /v1/rates?from=GBP&to=KES
const getRate = async (req: Request, res: Response) => {
  const { from, to } = req.query as { from?: string; to?: string };

  if (!from || !to) {
    return error(res, 'from and to query params are required', 400, 'VALIDATION_ERROR');
  }

  const corridor = corridors.find(
    c => c.from.toUpperCase() === from.toUpperCase() && c.to.toUpperCase() === to.toUpperCase()
  );

  if (!corridor) {
    return error(res, `No rate available for ${from} → ${to}`, 422, 'CORRIDOR_NOT_FOUND');
  }

  const quoted = await getQuotedRate(corridor);

  return success(res, {
    from: corridor.from,
    to: corridor.to,
    rate: quoted.rate,
    fee: corridor.fee,
    estimatedDelivery: corridor.estimatedDelivery,
    updatedAt: new Date().toISOString(),
    rateSource: quoted.source,
  });
};

// GET /v1/rates/corridors
// Note: no `rate` field here — corridors only describe which pairs are
// supported plus their fee/delivery time. Fetching a live rate for every
// corridor on every list call would mean N external API calls per request;
// callers should hit GET /v1/rates?from=..&to=.. for a specific pair's
// live rate instead.
const listCorridors = (req: Request, res: Response) => {
  const items = corridors.map(({ from, to, fee, estimatedDelivery }) => ({
    from,
    to,
    fee,
    estimatedDelivery,
  }));
  return success(res, { items });
};

export { getRate, listCorridors };
