import { Parsing } from './parsing';

export interface Language
{
    // distance multipliers, note that anything below/equal 0.5 defines a full stop such as a '.'
    punctuation_map:    Map<string, number>;
    // maximum number of tokens (steps) to traverse looking for associative markers
    max_assoc_distance: number;
    // punctuation to split string by
    punctuation:        RegExp;
    // base dictionary for the language
    // TODO replace with actual dict object?
    dictionary:         Parsing.Classifier;
    // list of classifiers which will be used
    classifiers:        Array<Parsing.Classifier>;
    // a mapping of classifiers and their scores
    // TODO for all text? or per paragraph? how will this weigh
    severity_mappings:  Array<{classifiers: Array<Parsing.Classifier>, severity: number}>;
};