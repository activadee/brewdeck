import type { BrewdeckBridge } from '../shared/contracts';

declare global {
  interface Window {
    brewdeck?: BrewdeckBridge;
  }
}

export {};
