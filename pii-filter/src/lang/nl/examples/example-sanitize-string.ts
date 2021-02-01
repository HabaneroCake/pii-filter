import * as pf from '../../../pii-filter';

const pii_filter =       pf.make_pii_classifier(pf.languages.nl.make_lm());
const raw_str =          'Hallo Johan, mijn 06 is 0612345678, tot morgen.';
const sanitized_str =    pii_filter.sanitize_str(raw_str, true);

console.log(sanitized_str);

///> 'Hallo {first_name}, mijn 06 is {phone_number}, tot morgen.'