import type { CountryData, CountryCode } from './types.js';

// Static imports — bundler resolves at build time
import us from './countries/us.json' with { type: 'json' };
import uk from './countries/uk.json' with { type: 'json' };
import ca from './countries/ca.json' with { type: 'json' };
import au from './countries/au.json' with { type: 'json' };
import ie from './countries/ie.json' with { type: 'json' };
import de from './countries/de.json' with { type: 'json' };
import nl from './countries/nl.json' with { type: 'json' };
import nz from './countries/nz.json' with { type: 'json' };
import fr from './countries/fr.json' with { type: 'json' };
import es from './countries/es.json' with { type: 'json' };
import sg from './countries/sg.json' with { type: 'json' };
import _in from './countries/in.json' with { type: 'json' };

const COUNTRIES: Record<CountryCode, CountryData> = {
  us: us as CountryData,
  uk: uk as CountryData,
  ca: ca as CountryData,
  au: au as CountryData,
  ie: ie as CountryData,
  de: de as CountryData,
  nl: nl as CountryData,
  nz: nz as CountryData,
  fr: fr as CountryData,
  es: es as CountryData,
  sg: sg as CountryData,
  in: _in as CountryData,
};

export function getCountry(cc: CountryCode): CountryData {
  return COUNTRIES[cc];
}

export function getAllCountries(): CountryData[] {
  return Object.values(COUNTRIES);
}

export const COUNTRY_CODES: CountryCode[] = ['us', 'uk', 'ca', 'au', 'ie', 'de', 'nl', 'nz', 'fr', 'es', 'sg', 'in'];
