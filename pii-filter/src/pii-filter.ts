import { Parsing } from './common/parsing';
import { Language } from './common/language-interface';

// Languages
export { NL } from './lang/nl/nl';

export class PIIFilter
{
    //------------------------------------------------------------------------------------------------------------------
    /**
     * 
     * @param language_model the language model
     * @param verbosity verbosity level
     */
    constructor(
        private language_model: Language
    )
    {

    }

    public classify(text: string) : PIIFilter.Result
    {
        let tokenizer = new Parsing.Tokenizer(text, this.language_model);

        let iterate_tokens = (fn: (index: number, token: Parsing.Token) => number) =>
        {
            let index = 0;
            while (index < tokenizer.tokens.length)
            {
                index = fn(index, tokenizer.tokens[index]);
                index++;
            }
        };
        let iterate_classifiers_and_tokens = (
            fn: (classifier: Parsing.Classifier, index: number, token: Parsing.Token) => number
        ) =>
        {
            for (let classifier of this.language_model.classifiers)
            {
                iterate_tokens(
                    (index: number, token: Parsing.Token): number => 
                    {
                        return fn(classifier, index, token);
                    }
                )
            }
        };
        let run_classification = () => {
            // add pass container
            for (let token of tokenizer.tokens)
                token.confidences_classification.push(new Parsing.Confidences());
            // classification pass
            iterate_classifiers_and_tokens(
                (classifier: Parsing.Classifier, index: number, token: Parsing.Token): number => 
                {
                    let [tokens_conf, score_conf] = classifier.classify_confidence(token);
                    if (score_conf.valid())
                    {
                        // add score to results
                        score_conf.group_root_start =   tokens_conf[0];
                        score_conf.group_root_end =     tokens_conf[tokens_conf.length-1];
                        // add score to matched tokens
                        for (let r_token of tokens_conf)
                        {
                            r_token.confidences_classification[r_token.confidences_classification.length-1].add(score_conf);
                            index = r_token.index;
                        }
                    }
                    return index;
                }
            )
        };

        // dictionary pass
        iterate_tokens(
            (index: number, token: Parsing.Token): number => 
            {
                let [tokens_dict, score_dict] = this.language_model.dictionary.classify_confidence(token);
                
                // add score to results
                score_dict.group_root_start =   tokens_dict[0];
                score_dict.group_root_end =     tokens_dict[tokens_dict.length-1];
                // add score to matched tokens
                for (let r_token of tokens_dict)
                {
                    r_token.confidence_dictionary = score_dict;
                    index = r_token.index;
                }
                return index;
            }
        );

        // associative pass
        iterate_classifiers_and_tokens(
            (classifier: Parsing.Classifier, index: number, token: Parsing.Token): number => 
            {
                let [tokens_assoc, score_assoc] = classifier.classify_associative(token);
                if (score_assoc.valid())
                {
                    // add score to results
                    score_assoc.group_root_start = tokens_assoc[0];
                    score_assoc.group_root_end =   tokens_assoc[tokens_assoc.length-1];
                    // add score to matched tokens
                    for (let r_token of tokens_assoc)
                    {
                        r_token.confidences_associative.set(classifier, score_assoc);
                        index = r_token.index;
                    }
                }
                return index;
            }
        );

        // initial classification pass
        run_classification();

        // associative pass (PII)
        iterate_tokens(
            (index: number, token: Parsing.Token): number => 
            {
                let max = token.confidences_classification[token.confidences_classification.length-1].max;
                if (this.language_model.thresholds.validate(max))
                {
                    for (let [classifier, associative_score] of max.classifier.associative_references)
                    {
                        let overlap:    boolean =               false;
                        let r_tokens:   Array<Parsing.Token> =  new Array<Parsing.Token>();
                        let t_token:    Parsing.Token =         token;
                        
                        do
                        {
                            if (t_token.confidences_associative.has(classifier))
                            {
                                overlap = true;
                                break;
                            }
                            r_tokens.push(t_token);
                            t_token = t_token.next;
                        } while (t_token != null && t_token.index < max.group_root_end.index);

                        // could: if has and score is higher than token.confidences_associative score remove
                        if (!overlap)
                        {
                            let association_score: Parsing.AssociationScore = new Parsing.AssociationScore(
                                associative_score,
                                associative_score.score,
                                associative_score.severity,
                                classifier
                            );
                            
                            association_score.group_root_start =    max.group_root_start;
                            association_score.group_root_end =      max.group_root_end;

                            for (let r_token of r_tokens)
                                r_token.confidences_associative.set(classifier, association_score);
                        }
                    }

                    index = max.group_root_end.index;
                }
                return index;
            }
        );

        // secondary classification pass
        run_classification();

        // get all (highest scoring) pii tokens
        let severity_max_pii:   number =                            0.0;
        let severity_sum_pii:   number =                            0.0;
        let total_n_pii:        number =                            0;
        let n_classifications:  Map<Parsing.Classifier, number> =   new Map<Parsing.Classifier, number>();
        let tokens:             Array<[Parsing.ClassificationScore, Parsing.Token]> = 
                                        new Array<[Parsing.ClassificationScore, Parsing.Token]>();
        iterate_tokens(
            (index: number, token: Parsing.Token): number => 
            {
                let classification = token.confidences_classification[token.confidences_classification.length-1].max;
                if (this.language_model.thresholds.validate(classification))
                {
                    if (!n_classifications.has(classification.classifier))
                        n_classifications.set(classification.classifier, 0);
                    n_classifications.set(classification.classifier,
                        n_classifications.get(classification.classifier) + 1);
                    
                    severity_sum_pii += classification.severity;
                    severity_max_pii = Math.max(severity_max_pii, classification.severity);
                    total_n_pii++;
                    
                    index = classification.group_root_end.index;
                }
                else
                    classification = new Parsing.ClassificationScore(0, 0, null);

                tokens.push([classification, token]);
                return index;
            }
        );

        // calc severity
        // TODO: rework
        let highest_severity: number = 0.0;
        for (let mapping of this.language_model.severity_mappings)
        {
            let full_match: boolean = true;
            let n_classifications_match: number = 0;
            for (let [classifier, num_classifications] of mapping.classifiers)
            {
                if (!n_classifications.has(classifier))
                {
                    full_match = false;
                    break;
                }
                else
                    n_classifications_match += Math.min(num_classifications / n_classifications.get(classifier), 1.5);
            }
            let classification_ratio: number = n_classifications_match / mapping.classifiers.size;
            if (full_match && highest_severity < mapping.severity && classification_ratio >= 1.0)
                highest_severity = mapping.severity * classification_ratio;
        }

        // TODO: clean this up and/or use different mapping system
        // let severity_factor_pii = total_n_pii > 1 ? severity_sum_pii / total_n_pii : severity_sum_pii;

        return new PIIFilter.Result(
            total_n_pii,
            n_classifications,
            Math.min((0.4 * highest_severity + 0.3 * severity_max_pii + 0.3 * severity_sum_pii), 1.0),
            tokens
        );
    }

    public sanitize_str(
        text: string,
        placeholders: boolean,
        confidence_threshold?: number,
        severity_threshold?: number
    ): string
    {
        let result = this.classify(text);
        return placeholders ? 
            result.render_placeholders(confidence_threshold, severity_threshold) : 
            result.render_removed(confidence_threshold, severity_threshold);
    }

    public sanitize_object(
        obj: object,
        placeholders: boolean,
        confidence_threshold?: number,
        severity_threshold?: number
    ): object
    {
        let obj_result: object = {};
        for (let key in obj)
            if (typeof obj[key] == 'string')
                obj_result[key] = this.sanitize_str(
                    obj[key],
                    placeholders,
                    confidence_threshold,
                    severity_threshold
                );
        return obj_result;
    }
};

export namespace PIIFilter
{
    export class PII
    {
        constructor(
            public classification: Parsing.ClassificationScore,
            public text: string
        ) {}
    };
    export class Result
    {
        constructor(
            public total_num_pii:       number,
            public num_pii:             Map<Parsing.Classifier, number>,
            public severity_mapping:    number,
            public tokens:              Array<[Parsing.ClassificationScore, Parsing.Token]>
        ) {}

        public render_replaced(fn: (classification: Parsing.ClassificationScore, token: Parsing.Token) => string, 
                                confidence_threshold?: number, severity_threshold?: number): string
        {
            let result: string = '';

            for (let [classification, token] of this.tokens)
            {
                let above_confidence =  confidence_threshold ?  classification.score >= confidence_threshold : true;
                let above_severity =    severity_threshold ?    classification.severity >= severity_threshold : true;
                if (classification.valid())
                {
                    if (above_confidence && above_severity)
                        result += fn(classification, token);
                    else
                    {
                        do {
                            result += token.symbol;
                            if (token.index == classification.group_root_end.index)
                                break;
                            token = token.next;
                        } while(token != null)
                    }
                }
                else
                    result += token.symbol;
            }

            return result;
        }

        public render_placeholders(confidence_threshold?: number, severity_threshold?: number): string
        {
            return this.render_replaced((classification: Parsing.ClassificationScore, token: Parsing.Token): string =>
            {
                return `{${classification.classifier.name}}`;
            }, confidence_threshold, severity_threshold);
        }

        public render_removed(confidence_threshold?: number, severity_threshold?: number): string
        {
            return this.render_replaced((classification: Parsing.ClassificationScore, token: Parsing.Token): string =>
            {
                return '';
            }, confidence_threshold, severity_threshold);
        }

        public pii(confidence_threshold?: number, severity_threshold?: number): 
            Array<PII>
        {
            let result: Array<PII> = new Array<PII>();

            for (let [classification, token] of this.tokens)
            {
                let above_confidence =  confidence_threshold ?  classification.score >= confidence_threshold : true;
                let above_severity =    severity_threshold ?    classification.severity >= severity_threshold : true;
                if (classification.valid())
                {
                    if (above_confidence && above_severity)
                    {
                        let text: string = '';
                        do {
                            text += token.symbol;
                            if (token.index == classification.group_root_end.index)
                                break;
                            token = token.next;
                        } while(token != null)

                        result.push(new PII(classification, text));
                    }
                }
            }
            
            return result;
        }

        public print_debug()
        {
            if(this.tokens.length == 0)
                return;
                
            let token = this.tokens[0][1];
            while(token != null)
            {
                console.log(`[${token.index}] Token: \"${token.symbol}\"`);
                console.log(`-- POS[${token.tag.tag_base}], ${JSON.stringify(token.tag.tag_rest)}`);
                if (token.confidence_dictionary)
                    console.log(
                        `- dict score: ${token.confidence_dictionary.score}, ` +
                        `root: [${token.confidence_dictionary.group_root_start.index}, ` + 
                        `${token.confidence_dictionary.group_root_end.index}]`
                    );
                for (let assoc of token.confidences_associative.values())
                {
                    console.log(
                        `  assoc: ${assoc.classifier.name}, ` +
                        `score: ${assoc.score}, root: [${assoc.group_root_start.index}, ` + 
                        `${assoc.group_root_end.index}]`
                    );
                }
                for (let conf of token.confidences_classification[token.confidences_classification.length-1].all)
                {
                    console.log(
                        `   ++conf: ${conf.classifier.name}, score: ${conf.score}, severity: ${conf.severity}, ` + 
                        `root: [${conf.group_root_start.index}, ${conf.group_root_end.index}]`
                    );
                }
                token = token.next;
            }

            console.log(`Overall severity: ${this.severity_mapping}`);
            for (let [classifier, num] of this.num_pii)
                console.log(`PII[${classifier.name}]: ${num}`);
        }
    };
};