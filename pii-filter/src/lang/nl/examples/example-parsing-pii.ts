import * as pf from '../../../pii-filter';

const pii_filter =      pf.make_pii_classifier(pf.languages.nl.make_lm());
const raw_str =         'Hallo Johan, mijn e-mail is test@test.com '
                        + 'en mijn nummer is 0612345678, tot dan.';
const results =         pii_filter.classify(raw_str);

// overall severity: 1
console.log(`overall severity: ${results.severity}`);

// {
//     value: 'Johan',
//     type: 'first_name',
//     confidence: 0.755,
//     severity: 0.4539742200500001,
//     start_pos: 6,
//     end_pos: 11
// }
// {
//     value: 'test@test.com',
//     type: 'email_address',
//     confidence: 1,
//     severity: 0.2,
//     start_pos: 28,
//     end_pos: 41
// }
// {
//     value: '0612345678',
//     type: 'phone_number',
//     confidence: 0.8512500000000001,
//     severity: 0.35,
//     start_pos: 60,
//     end_pos: 70
// }  

for (let pii of results.pii)
    console.dir(pii);