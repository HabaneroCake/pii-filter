import { Parsing } from './parsing';
import { POS } from './pos'

export interface Language
{
    // parts of speech tagger
    pos_tagger:             POS.Tagger;
    // distance multipliers, note that anything below/equal 0.5 defines a full stop such as a '.'
    punctuation_map:        Map<string, number>;
    // maximum number of tokens (steps) to traverse looking for associative markers
    max_assoc_distance:     number;
    // punctuation to split string by
    punctuation:            RegExp;
    // base dictionary for the language
    dictionary:             Parsing.Classifier;
    // list of classifiers which will be used
    classifiers:            Array<Parsing.Classifier>;
    // a mapping of occurrences of classifications and their scores
    severity_mappings:      Array<{classifiers: Map<Parsing.Classifier, number>, severity: number}>;
    // base thresholds for classification
    thresholds:             Parsing.Thresholds;
};