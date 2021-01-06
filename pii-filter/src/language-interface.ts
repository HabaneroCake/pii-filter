import { Parsing } from './parsing';

export interface Language
{
    // distance multipliers, note that anything below/equal 0.5 defines a full stop such as a '.'
    punctuation_map:    Map<string, number>;
    punctuation:        RegExp;
    dictionary:         Parsing.Classifier;
    classifiers:        Array<Parsing.Classifier>;
    severity_mappings:  Array<{classifiers: Array<Parsing.Classifier>, severity: number}>;
    // todo: distance function?
};