// Defines which currency corridors this app supports, and the business
// terms for each. The actual exchange RATE shown to users is fetched live
// from src/services/fxRates.service.ts (a real mid-market rate), then this
// corridor's markupPercent is applied on top of it — same as how real
// remittance companies price FX. fallbackRate is only used if the live
// lookup fails (network error, API down, unsupported pair).
export interface Corridor {
  from: string;
  to: string;
  fee: number;
  estimatedDelivery: string;
  markupPercent: number;
  fallbackRate: number;
}

const corridors: Corridor[] = [
  { from: 'GBP', to: 'KES', fee: 2.99, estimatedDelivery: '5 minutes', markupPercent: 1.5, fallbackRate: 168.50 },
  { from: 'GBP', to: 'NGN', fee: 3.49, estimatedDelivery: '30 minutes', markupPercent: 2.0, fallbackRate: 2150.00 },
  { from: 'GBP', to: 'GHS', fee: 2.49, estimatedDelivery: '5 minutes', markupPercent: 1.5, fallbackRate: 18.20 },
  { from: 'GBP', to: 'ZAR', fee: 1.99, estimatedDelivery: '1-2 hours', markupPercent: 1.0, fallbackRate: 24.10 },
  { from: 'GBP', to: 'UGX', fee: 2.99, estimatedDelivery: '5 minutes', markupPercent: 2.0, fallbackRate: 4820.00 },
  { from: 'GBP', to: 'TZS', fee: 2.99, estimatedDelivery: '5 minutes', markupPercent: 2.0, fallbackRate: 3540.00 },
  { from: 'GBP', to: 'PHP', fee: 2.49, estimatedDelivery: '1 hour', markupPercent: 1.5, fallbackRate: 78.30 },
  { from: 'GBP', to: 'INR', fee: 1.49, estimatedDelivery: '30 minutes', markupPercent: 1.0, fallbackRate: 107.50 },
  { from: 'GBP', to: 'PKR', fee: 1.99, estimatedDelivery: '30 minutes', markupPercent: 2.0, fallbackRate: 393.00 },
  { from: 'GBP', to: 'BDT', fee: 1.99, estimatedDelivery: '1-2 hours', markupPercent: 2.0, fallbackRate: 143.20 },
  { from: 'USD', to: 'KES', fee: 2.99, estimatedDelivery: '5 minutes', markupPercent: 1.5, fallbackRate: 128.40 },
  { from: 'USD', to: 'NGN', fee: 3.49, estimatedDelivery: '30 minutes', markupPercent: 2.0, fallbackRate: 1620.00 },
];

export default corridors;
