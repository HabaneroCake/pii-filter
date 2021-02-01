# ![PII](https://raw.githubusercontent.com/prolody/piif_web_ext/master/assets/logos/a/PIIlogo.png) Filter
![CI](https://github.com/prolody/piif/workflows/CI/badge.svg)

A library for detecting, parsing, and removing personally identifiable information from strings and objects.

[![PII replaced with placeholders](https://raw.githubusercontent.com/prolody/piif/master/res/highlight_placeholders.png)](./pii-filter)

---
This repository contains the [datasets](./dataset) and the [npm module for `pii-filter`](./pii-filter).

A showcase example of this library is the pii-filter [web-extension](https://github.com/prolody/piif_web_ext) for 
browsers.

## Scenarios
We hope that this software can be useful in at least some of the following scenarios:
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

More information can be found in [dataset/README.md](dataset/README.md).

## Future work
- adding support for english and other languages
- detecting more PII
    - bank numbers
    - passport / id numbers
    - social security numbers
- detecting PII in images
    - providing coordinates which can be used for blurring or erasing PII

