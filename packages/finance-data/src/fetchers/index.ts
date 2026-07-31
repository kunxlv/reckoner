import type { RateResult } from '../types.js';
import type { CountryCode } from '../types.js';
import { fetchUSRate } from './us.js';
import { fetchCARate } from './ca.js';
import { fetchUKRate } from './uk.js';
import { fetchAURate } from './au.js';
import { fetchECBRate } from './ecb.js';
import { getManualRate } from './manual.js';

export async function fetchRate(cc: CountryCode): Promise<RateResult> {
  switch (cc) {
    case 'us': return fetchUSRate();
    case 'ca': return fetchCARate();
    case 'uk': return fetchUKRate();
    case 'au': return fetchAURate();
    case 'ie': return fetchECBRate('ie');
    case 'de': return fetchECBRate('de');
    case 'nl': return fetchECBRate('nl');
    case 'fr': return fetchECBRate('fr');
    case 'es': return fetchECBRate('es');
    case 'nz': return getManualRate('nz');
    case 'sg': return getManualRate('sg');
    case 'in': return getManualRate('in');
  }
}

export { fetchUSRate, fetchCARate, fetchUKRate, fetchAURate, fetchECBRate, getManualRate };
