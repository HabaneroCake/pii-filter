# ![PII](https://raw.githubusercontent.com/prolody/piif_web_ext/master/assets/logos/a/PIIlogo.png) Filter Node Module
![CI](https://github.com/prolody/piif/workflows/CI/badge.svg)
[![npm version](https://badge.fury.io/js/pii-filter.svg)](https://badge.fury.io/js/pii-filter)
![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)

A library for detecting, parsing, and removing personally identifiable information from strings and objects.

![PII replaced with placeholders](https://raw.githubusercontent.com/prolody/piif/master/res/highlight_placeholders.png)

## Scenarios
We hope that this software can be useful in some of the following scenarios:
- privacy, security, fraud-detection, and data-auditing
- anonymizing data for research, marketing and machine learning
- accessibility and online guidance
- word tagging and word spotting
- designing chatbots

## Languages
`pii-filter` currently supports the following languages and PII:
- Dutch
    - First Names
    - Family Names
    - Pet Names
    - Medicine Names
    - Phone Numbers
    - Email Addresses
    - Dates

## Installing
You can add the pii-filter npm package to your project by running:
> `npm install --save-dev pii-filter`

## Documentation
[The docs can be read here](https://prolody.github.io/piif/modules/pii_filter.html).

## Examples
Sanitizing strings:
```TypeScript
import * as pf from 'pii-filter';

const pii_filter =      pf.make_pii_classifier(pf.languages.nl.make_lm());
const raw_str =         'Hallo Johan, mijn 06 is 0612345678, tot morgen.';
const sanitized_str =   pii_filter.sanitize_str(raw_str, true);

console.log(sanitized_str);

// output:
'Hallo {first_name}, mijn 06 is {phone_number}, tot morgen.'
```
Sanitizing objects:
```TypeScript
import * as pf from 'pii-filter';

const pii_filter =      pf.make_pii_classifier(pf.languages.nl.make_lm());
const obj = 
{
    message: 'Wilma de Vries, 20 november 1964',
    detail: 'Werking Paracetamol bij gebruik medicatie'
};
const sanitized_obj =   pii_filter.sanitize_obj(obj, true, false);

console.dir(sanitized_obj);

// output:
{
    message: '{first_name} {family_name}, {date}',
    detail: 'Werking {medicine_name} bij gebruik medicatie'
}
```
Parsing PII:
```TypeScript
import * as pf from 'pii-filter';

const pii_filter =      pf.make_pii_classifier(pf.languages.nl.make_lm());
const raw_str =         'Hallo Johan, mijn e-mail is test@test.com '
                        + 'en mijn nummer is 0612345678, tot dan.';
const results =         pii_filter.classify(raw_str);

for (let pii of results.pii)
    console.dir(pii);

// output:
{
    value: 'Johan',
    type: 'first_name',
    confidence: 0.755,
    severity: 0.4539742200500001,
    start_pos: 6,
    end_pos: 11
}
{
    value: 'test@test.com',
    type: 'email_address',
    confidence: 1,
    severity: 0.2,
    start_pos: 28,
    end_pos: 41
}
{
    value: '0612345678',
    type: 'phone_number',
    confidence: 0.8512500000000001,
    severity: 0.35,
    start_pos: 60,
    end_pos: 70
}  
```

## Main repository
For more information and access to used the datasets check out the [main repository](https://github.com/prolody/piif).