/**
 * shipping-rates.ts
 * ConnectHub Backend — EasyPost / ShipStation Live Shipping Rate Service
 *
 * Route (mounted in server.ts): POST /v1/marketplace/shipping/rates
 *
 * Strategy:
 *  1. Try EasyPost first (primary) — returns real carrier rates
 *  2. Fall back to ShipStation if EasyPost is not configured
 *  3. Fall back to the flat-rate zone table if neither API key is set
 *     (same logic that was previously in marketplace-backend-service.js)
 *
 * Environment variables required:
 *   EASYPOST_API_KEY     (test key starts with "EZTKtest_", live starts with "EZTK...")
 *   SHIPSTATION_API_KEY  (base64 of "key:secret")  ← optional secondary
 */

import { Router, Request, Response, NextFunction } from 'express';
import https from 'https';

const router = Router();

// ─── EasyPost helper ────────────────────────────────────────────────────────
function easyPostRequest(path: string, body: object): Promise<any> {
  return new Promise((resolve, reject) => {
    const key = process.env.EASYPOST_API_KEY || '';
    const payload = JSON.stringify(body);
    const auth = Buffer.from(`${key}:`).toString('base64');
    const options = {
      hostname: 'api.easypost.com',
      path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${auth}`,
        'Content-Length': Buffer.byteLength(payload),
      },
    };
    const req = https.request(options, res => {
      let data = '';
      res.on('data', c => { data += c; });
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch { reject(new Error('EasyPost parse error: ' + data)); }
      });
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

// ─── ShipStation helper (fallback) ──────────────────────────────────────────
function shipStationRequest(path: string, body: object): Promise<any> {
  return new Promise((resolve, reject) => {
    const key = process.env.SHIPSTATION_API_KEY || '';
    const payload = JSON.stringify(body);
    const options = {
      hostname: 'ssapi.shipstation.com',
      path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${key}`,
        'Content-Length': Buffer.byteLength(payload),
      },
    };
    const req = https.request(options, res => {
      let data = '';
      res.on('data', c => { data += c; });
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch { reject(new Error('ShipStation parse error: ' + data)); }
      });
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

// ─── Flat-rate fallback (no API key needed) ──────────────────────────────────
interface FlatRateResult {
  standard: number;
  express: number;
  zone: string;
  freeShipping: boolean;
  estimatedDaysStandard: number;
  estimatedDaysExpress: number;
  source: 'flat_rate';
}

function flatRateFallback(fromZip: string, toZip: string, weightLbs: number, priceUSD: number): FlatRateResult {
  const REGIONS: Record<string, string> = {
    '0': 'Northeast', '1': 'Northeast', '2': 'Southeast',
    '3': 'Southeast', '4': 'Midwest',   '5': 'Midwest',
    '6': 'South',     '7': 'South',     '8': 'West',
    '9': 'West',
  };
  const from = REGIONS[fromZip?.[0] ?? '0'] ?? 'Unknown';
  const to   = REGIONS[toZip?.[0]  ?? '0'] ?? 'Unknown';

  const ZONE_RATES: Record<string, { std: number; exp: number; days: number }> = {
    'Northeast-Northeast': { std: 4.99, exp: 12.99, days: 2 },
    'Southeast-Southeast': { std: 4.99, exp: 12.99, days: 2 },
    'Midwest-Midwest':     { std: 5.49, exp: 13.99, days: 2 },
    'South-South':         { std: 5.49, exp: 13.99, days: 2 },
    'West-West':           { std: 5.99, exp: 14.99, days: 2 },
    'Northeast-Southeast': { std: 7.99, exp: 18.99, days: 3 },
    'Northeast-Midwest':   { std: 8.99, exp: 19.99, days: 3 },
    'Northeast-South':     { std: 9.99, exp: 21.99, days: 4 },
    'Northeast-West':      { std: 12.99, exp: 24.99, days: 5 },
    'Southeast-Midwest':   { std: 8.99, exp: 19.99, days: 3 },
    'Southeast-South':     { std: 7.99, exp: 18.99, days: 3 },
    'Southeast-West':      { std: 13.99, exp: 25.99, days: 5 },
    'Midwest-South':       { std: 8.99, exp: 19.99, days: 3 },
    'Midwest-West':        { std: 10.99, exp: 22.99, days: 4 },
    'South-West':          { std: 11.99, exp: 23.99, days: 4 },
  };

  const key1 = `${from}-${to}`;
  const key2 = `${to}-${from}`;
  const rates = ZONE_RATES[key1] ?? ZONE_RATES[key2] ?? { std: 9.99, exp: 19.99, days: 4 };
  const weightSurcharge = weightLbs > 5 ? (weightLbs - 5) * 0.5 : 0;
  const freeShipping = priceUSD >= 200;

  return {
    standard: freeShipping ? 0 : parseFloat((rates.std + weightSurcharge).toFixed(2)),
    express:  parseFloat((rates.exp + weightSurcharge).toFixed(2)),
    zone: key1,
    freeShipping,
    estimatedDaysStandard: rates.days,
    estimatedDaysExpress: 2,
    source: 'flat_rate',
  };
}

// ─── POST /v1/marketplace/shipping/rates ─────────────────────────────────────
// Body: { fromZip, toZip, weightLbs, lengthIn, widthIn, heightIn, priceUSD }
router.post('/rates', async (req: Request, res: Response, next: NextFunction) => {
  const { fromZip, toZip, weightLbs = 1, lengthIn = 12, widthIn = 12, heightIn = 6, priceUSD = 0 } = req.body;

  if (!fromZip || !toZip) {
    return res.status(400).json({ error: 'fromZip and toZip are required' });
  }

  const easyPostKey    = process.env.EASYPOST_API_KEY    || '';
  const shipStationKey = process.env.SHIPSTATION_API_KEY || '';

  // ── Strategy 1: EasyPost ──────────────────────────────────────────────────
  if (easyPostKey) {
    try {
      const shipment = await easyPostRequest('/v2/shipments', {
        shipment: {
          to_address:   { zip: toZip,   country: 'US' },
          from_address: { zip: fromZip, country: 'US' },
          parcel: {
            weight: weightLbs * 16, // EasyPost uses ounces
            length: lengthIn,
            width:  widthIn,
            height: heightIn,
          },
        },
      });

      if (shipment.rates?.length) {
        const standardRate = shipment.rates.find((r: any) =>
          r.service?.toLowerCase().includes('ground') ||
          r.service?.toLowerCase().includes('first')
        ) || shipment.rates[0];

        const expressRate = shipment.rates.find((r: any) =>
          r.service?.toLowerCase().includes('express') ||
          r.service?.toLowerCase().includes('priority')
        ) || shipment.rates[shipment.rates.length - 1];

        const freeShipping = priceUSD >= 200;

        return res.json({
          standard: freeShipping ? 0 : parseFloat(standardRate.rate),
          express:  parseFloat(expressRate.rate),
          standardService: standardRate.service,
          expressService:  expressRate.service,
          standardCarrier: standardRate.carrier,
          expressCarrier:  expressRate.carrier,
          estimatedDaysStandard: standardRate.est_delivery_days ?? 5,
          estimatedDaysExpress:  expressRate.est_delivery_days  ?? 2,
          freeShipping,
          source: 'easypost',
          shipmentId: shipment.id,
          allRates: shipment.rates.slice(0, 5).map((r: any) => ({
            carrier: r.carrier,
            service: r.service,
            rate: parseFloat(r.rate),
            deliveryDays: r.est_delivery_days,
          })),
        });
      }
    } catch (epErr) {
      console.warn('[shipping] EasyPost error, trying ShipStation:', epErr);
    }
  }

  // ── Strategy 2: ShipStation ───────────────────────────────────────────────
  if (shipStationKey) {
    try {
      const ssResult = await shipStationRequest('/shipments/getrates', {
        carrierCode: 'stamps_com',
        fromPostalCode: fromZip,
        toPostalCode:   toZip,
        toCountry: 'US',
        weight: { value: weightLbs, units: 'pounds' },
        dimensions: { units: 'inches', length: lengthIn, width: widthIn, height: heightIn },
      });

      if (Array.isArray(ssResult) && ssResult.length > 0) {
        const sorted = ssResult.sort((a: any, b: any) => a.shipmentCost - b.shipmentCost);
        const freeShipping = priceUSD >= 200;
        return res.json({
          standard: freeShipping ? 0 : parseFloat(sorted[0].shipmentCost),
          express:  parseFloat(sorted[sorted.length - 1].shipmentCost),
          standardService: sorted[0].serviceName,
          expressService: sorted[sorted.length - 1].serviceName,
          freeShipping,
          source: 'shipstation',
          allRates: sorted.slice(0, 5).map((r: any) => ({
            service: r.serviceName,
            carrier: r.carrierCode,
            rate: parseFloat(r.shipmentCost),
          })),
        });
      }
    } catch (ssErr) {
      console.warn('[shipping] ShipStation error, using flat-rate fallback:', ssErr);
    }
  }

  // ── Strategy 3: Flat-rate fallback ────────────────────────────────────────
  const fallback = flatRateFallback(fromZip, toZip, weightLbs, priceUSD);
  return res.json(fallback);
});

// ─── POST /v1/marketplace/shipping/purchase ───────────────────────────────────
// Purchase a label via EasyPost (requires shipmentId from /rates response)
router.post('/purchase', async (req: Request, res: Response, next: NextFunction) => {
  const { shipmentId, rateId } = req.body;
  if (!shipmentId || !rateId) {
    return res.status(400).json({ error: 'shipmentId and rateId are required' });
  }
  if (!process.env.EASYPOST_API_KEY) {
    return res.status(503).json({ error: 'Label purchasing not configured — EASYPOST_API_KEY missing' });
  }

  try {
    const result = await easyPostRequest(`/v2/shipments/${shipmentId}/buy`, { rate: { id: rateId } });
    return res.json({
      trackingCode:  result.tracking_code,
      trackingUrl:   result.tracker?.public_url,
      labelUrl:      result.postage_label?.label_url,
      carrier:       result.selected_rate?.carrier,
      service:       result.selected_rate?.service,
      cost:          result.selected_rate?.rate,
      status:        result.status,
    });
  } catch (err) {
    next(err);
  }
});

export { router as shippingRouter, flatRateFallback };
export default router;
