import type { RateResult } from '../types';
import type { CountryCode } from '../types';
import { fetchUSRate } from './us';
import { fetchCARate } from './ca';
import { fetchUKRate } from './uk';
import { fetchAURate } from './au';
import { fetchECBRate } from './ecb';
import { getManualRate } from './manual';

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
