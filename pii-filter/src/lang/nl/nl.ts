import { Language } from '../../language-interface';
import { Parsing } from '../../parsing';

import { Classifiers } from './classifiers';

import ds_severity_mapping from './dataset/ds_severity.json';

export class NL implements Language
{
    public punctuation_map:     Map<string, number> =   new Map<string, number>();
    public max_assoc_distance:  number =                30;
    public punctuation:         RegExp =                new RegExp(/(\.|\,|\:|\!|\?|\;|\ )/g);
    public dictionary:          Parsing.Classifier =    new Classifiers.Dictionary();
    public severity_mappings:   Array<{classifiers: Array<Parsing.Classifier>, severity: number}>;
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
        ]
    )
    {
        // distance multipliers
        this.punctuation_map.set('.', 0.25);
        this.punctuation_map.set('!', 0.25);
        this.punctuation_map.set('?', 0.25);
        this.punctuation_map.set(',', 0.6);
        this.punctuation_map.set(';', 0.6);
        this.punctuation_map.set(':', 0.8);
        this.punctuation_map.set(' ', 0.9);

        for (let classifier of this.classifiers)
            classifier.init(this);

        // ---- severity mapping
        this.severity_mappings = new Array<{classifiers: Array<Parsing.Classifier>, severity: number}>();
        for (let mapping of ds_severity_mapping)
        {
            let classifier_array = new Array<Parsing.Classifier>();
            for (let pii of mapping.pii)
            {
                let found = false;
                for (let classifier of this.classifiers)
                {
                    if (pii === classifier.name)
                    {
                        classifier_array.push(classifier);
                        found = true;
                        break;
                    }
                }
                // TODO: remove
                if (!found)
                    console.log(`Could not find classifier ${pii} for severity mapping.`)
            }
            this.severity_mappings.push({classifiers: classifier_array, severity: mapping.severity});
        }
    }
};