# ![PII](https://raw.githubusercontent.com/prolody/pii-filter-web-ext/master/assets/logos/a/PIIlogo.png) Filter
![CI](https://github.com/prolody/pii-filter/workflows/CI/badge.svg)
[![npm version](https://badge.fury.io/js/pii-filter.svg)](https://badge.fury.io/js/pii-filter)
![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)

A library for detecting, parsing, and removing personally identifiable information from strings and objects.

[![PII replaced with placeholders](https://raw.githubusercontent.com/prolody/pii-filter/master/res/highlight_placeholders.png)](./pii-filter)

---
This repository contains the [datasets](./dataset) and the [npm module for `pii-filter`](./pii-filter).

A showcase example of this library is the pii-filter [web-extension](https://github.com/prolody/pii-filter-web-ext) for 
browsers.

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

More information can be found in [dataset/README.md](dataset/README.md).

## Future work
- adding support for english and other languages
- detecting more PII
    - bank numbers and credit card numbers
    - passport / id numbers
    - social security numbers
- detecting PII in images
    - providing coordinates which can be used for blurring or erasing PII

