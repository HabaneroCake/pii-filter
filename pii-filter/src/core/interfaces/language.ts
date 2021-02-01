import { Stemmer } from './parsing/tokens';
import { POSTagger } from './parsing/tagging';
import { Classifier, Thresholds } from './parsing/classification';

/**
 * An interface for a Language.
 * @private
 */
export interface Language
{
    /** a stemmer */
    readonly stemmer:               Stemmer;
    /** a parts of speech tagger */
    readonly pos_tagger:            POSTagger;
    /** distance multipliers, note that anything below/equal 0.5 defines a full stop such as a '.' */
    readonly punctuation_map:       Map<string, number>;
    /** maximum number of tokens (steps) to traverse looking for associative markers */
    readonly max_assoc_distance:    number;
    /** punctuation to split string by */
    readonly punctuation:           RegExp;
    /** base dictionary for the language */
    readonly dictionary:            Classifier;
    /** list of classifiers which will be used */
    readonly classifiers:           Array<Classifier>;
    /** a mapping of occurrences of classifications and their scores */
    readonly severity_mappings:     Array<{classifiers: Map<Classifier, number>, severity: number}>;
    /** base thresholds for classification */
    readonly thresholds:            Thresholds;
};