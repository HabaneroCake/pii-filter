import { IStemmer } from './parsing/tokens';
import { ITagger } from './parsing/tagging';
import { IClassifier, IThresholds } from './parsing/classification';

export interface ILanguage
{
    stemmer:                IStemmer;
    // parts of speech tagger
    pos_tagger:             ITagger;
    // distance multipliers, note that anything below/equal 0.5 defines a full stop such as a '.'
    punctuation_map:        Map<string, number>;
    // maximum number of tokens (steps) to traverse looking for associative markers
    max_assoc_distance:     number;
    // punctuation to split string by
    punctuation:            RegExp;
    // base dictionary for the language
    dictionary:             IClassifier;
    // list of classifiers which will be used
    classifiers:            Array<IClassifier>;
    // a mapping of occurrences of classifications and their scores
    severity_mappings:      Array<{classifiers: Map<IClassifier, number>, severity: number}>;
    // base thresholds for classification
    thresholds:             IThresholds;
};