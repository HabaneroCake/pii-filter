import { Language } from '../../common/language-interface';
import { Parsing } from '../../common/parsing';

import { Classifiers } from './classifiers';
import { POS_Tagger } from './pos-tagger';


import ds_severity_mapping from './dataset/ds_severity.json';

export class NL implements Language
{
    public pos_tagger:          POS_Tagger =            new POS_Tagger();
    public punctuation_map:     Map<string, number> =   new Map<string, number>();
    public punctuation:         RegExp;
    public max_assoc_distance:  number =                5;
    public dictionary:          Parsing.Classifier =    new Classifiers.Dictionary();
    public severity_mappings:   Array<{classifiers: Map<Parsing.Classifier, number>, severity: number}>;
    public thresholds:          Parsing.Thresholds =    new Parsing.Thresholds(
        new Parsing.Thresholds.Group(0.2, 0.0),
        new Parsing.Thresholds.Group(0.0, 0.0),
    );         
    /**
     * 
     * @param classifiers a list of classifiers, if not specified, all will be used
     */
    constructor(
        public classifiers: Array<Parsing.Classifier> = [
            new Classifiers.FirstName(),
            new Classifiers.FamilyName(),
            new Classifiers.PetName(),
            new Classifiers.MedicineName(),
            new Classifiers.EmailAddress(),
            new Classifiers.PhoneNumber(),
            new Classifiers.Date(),
        ]
    )
    {
        // distance multipliers
        this.punctuation_map.set('.', 0.25);
        this.punctuation_map.set('!', 0.25);
        this.punctuation_map.set('?', 0.25);
        this.punctuation_map.set(';', 0.75);
        this.punctuation_map.set(' ', 0.9);
        this.punctuation_map.set(',', 1.0);
        this.punctuation_map.set(':', 1.0);
        this.punctuation_map.set('=', 1.0);
        this.punctuation_map.set('-', 1.0);
        this.punctuation_map.set('_', 1.0);
        this.punctuation_map.set('/', 1.0);
        this.punctuation_map.set('\\', 1.0);
        this.punctuation_map.set('(', 1.0);
        this.punctuation_map.set(')', 1.0);
        this.punctuation_map.set('[', 1.0);
        this.punctuation_map.set(']', 1.0);
        this.punctuation_map.set('\n', 0.0);

        let r_str: string =     '';
        let first: boolean =    true;
        for (let punc of this.punctuation_map.keys())
        {
            r_str += (first ? '' : '|') + '\\' + punc;
            first = false;
        }
        this.punctuation = new RegExp(`(${r_str})`, 'g');
        
        for (let classifier of this.classifiers)
            classifier.init(this);

        // ---- severity mapping
        this.severity_mappings = new Array<{classifiers: Map<Parsing.Classifier, number>, severity: number}>();
        for (let mapping of ds_severity_mapping)
        {
            let classifier_map = new Map<Parsing.Classifier, number>();
            for (let pii of mapping.pii)
            {
                // let found = false;
                for (let classifier of this.classifiers)
                {
                    if (pii === classifier.name)
                    {
                        if (!classifier_map.has(classifier))
                            classifier_map.set(classifier, 0);
                        
                        classifier_map.set(classifier, classifier_map.get(classifier) + 1);
                        // found = true;
                        break;
                    }
                }
            }
            this.severity_mappings.push({classifiers: classifier_map, severity: mapping.severity});
        }
    }
};