import * as pf from '../../../pii-filter';

const pii_filter =      pf.make_pii_classifier(pf.languages.nl.make_lm());
const obj =
{
    message: 'Wilma de Vries, 20 november 1964',
    detail: 'Werking Paracetamol bij gebruik medicatie'
};
const sanitized_obj =   pii_filter.sanitize_obj(obj, true, false);

// {
//     message: '{first_name} {family_name}, {date}',
//     detail: 'Werking {medicine_name} bij gebruik medicatie'
// }
console.dir(sanitized_obj);