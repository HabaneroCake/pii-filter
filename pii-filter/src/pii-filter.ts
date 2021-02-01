// Copyright Prolody. All rights reserved. Licensed under the MIT license.

/**
 * A library for detecting, parsing, and removing personally identifiable information from strings and objects.
 * 
 * @remarks `pii-filter` declares:
 * 
 * - {@link PIIClassifier}
 * - {@link PIIClassifierResult}
 * - {@link PIIClassification}
 * 
 * A {@link PIIClassifier} is created through {@link make_pii_classifier} with a language model declared in 
 * {@link languages}. Note that construction of a {@link PIIClassifier} can take a little while because of the resources
 * which need to be loaded, therefore it is best to keep an instance alive instead of recreating it for each 
 * classification.
 * 
 * ### Languages
 * 
 * @remarks `pii-filter` currently supports the following languages:
 * - Dutch, found in {@link languages.nl}
 * 
 * ### Examples
 * Examples can be found under `./lang/{iso-code}/examples/`.
 * @packageDocumentation
 */

// public API

export {
    PIIClassifierResult,
    PIIClassification,
    PIIClassifier
} from './core/interfaces/main';

export * as languages from './lang/languages';

export { make_pii_classifier } from './core/pii-filter';