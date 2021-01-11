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
        const num_passes: number = 2;
        let tokenizer = new Parsing.Tokenizer(text, this.language_model);

        // 0: dictionary pass
        {
            let index = 0;
            while (index < tokenizer.tokens.length)
            {
                let token = tokenizer.tokens[index];
                let [tokens_dict, score_dict] = this.language_model.dictionary.classify_confidence(token, 0);
                
                // add score to results
                score_dict.group_root_start =   tokens_dict[0];
                score_dict.group_root_end =     tokens_dict[tokens_dict.length-1];
                // add score to matched tokens
                for (let r_token of tokens_dict)
                {
                    r_token.confidence_dictionary = score_dict;
                    index = r_token.index;
                }
                
                index++;
            }
        }

        // 1: associative pass
        for (let classifier of this.language_model.classifiers)
        {
            let index = 0;
            while (index < tokenizer.tokens.length)
            {
                let token = tokenizer.tokens[index];
                let [tokens_assoc, score_assoc] = classifier.classify_associative(token);
                if (score_assoc.valid)
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
                index++;
            }
        }

        // multiple passes are necessary for pii assoc variables (nyi)
        for (let pass_index = 0; pass_index < num_passes; ++pass_index)
        {
            // 2: add pass container
            for (let token of tokenizer.tokens)
                token.confidences_classification.push(new Parsing.Confidences());
            // 3: classification pass
            for (let classifier of this.language_model.classifiers)
            {
                let index = 0;
                while (index < tokenizer.tokens.length)
                {
                    let token = tokenizer.tokens[index];
                    let [tokens_conf, score_conf] = classifier.classify_confidence(token, pass_index);
                    if (score_conf.valid)
                    {
                        // add score to results
                        score_conf.group_root_start =   tokens_conf[0];
                        score_conf.group_root_end =     tokens_conf[tokens_conf.length-1];
                        // add score to matched tokens
                        for (let r_token of tokens_conf)
                        {
                            r_token.confidences_classification[pass_index].add(score_conf);
                            index = r_token.index;
                        }
                    }
                    index++;
                }
            }
        }

        // 4: get all (highest scoring) pii tokens
        let total_n_pii:        number =                            0;
        let n_classifications:  Map<Parsing.Classifier, number> =   new Map<Parsing.Classifier, number>();
        let tokens:             Array<[Parsing.ClassificationScore, Parsing.Token]> = 
                                        new Array<[Parsing.ClassificationScore, Parsing.Token]>();
        {
            let index = 0;
            while (index < tokenizer.tokens.length)
            {
                let token = tokenizer.tokens[index];
                let classification = token.confidences_classification[num_passes-1].max;
                if (classification.valid &&
                    (token.confidence_dictionary == null ||
                     classification.score >= token.confidence_dictionary.score ||
                     classification.group_root_end.index > token.confidence_dictionary.group_root_end.index))
                {
                    if (!n_classifications.has(classification.classifier))
                        n_classifications.set(classification.classifier, 0);

                    n_classifications.set(classification.classifier,
                        n_classifications.get(classification.classifier) + 1);
                    
                    total_n_pii++;
                    
                    index = classification.group_root_end.index;
                }
                else if (token.confidence_dictionary != null)
                    classification = new Parsing.ClassificationScore(0, 0, null);

                tokens.push([classification, token]);
                index++;
            }
        }

        // 5: calc severity
        let highest_severity: number = 0.0;
        for (let mapping of this.language_model.severity_mappings)
        {
            let full_match: boolean = true;
            for (let [classifier, num_classifications] of mapping.classifiers)
            {
                if (!n_classifications.has(classifier) || n_classifications.get(classifier) < num_classifications)
                {
                    full_match = false;
                    break;
                }
            }
            if (full_match && highest_severity < mapping.severity)
                highest_severity =  mapping.severity;
        }

        return new PIIFilter.Result(
            total_n_pii,
            n_classifications,
            highest_severity,
            tokens
        );
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

        public render_replaced(fn: Function, confidence_threshold?: number, severity_threshold?: number): string
        {
            let result: string = '';

            for (let [classification, token] of this.tokens)
            {
                let above_confidence =  confidence_threshold ?  classification.score >= confidence_threshold : true;
                let above_severity =    severity_threshold ?    classification.severity >= severity_threshold : true;
                if (classification.valid)
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
                if (classification.valid)
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
            let token = this.tokens[0][1];
            while(token != null)
            {
                console.log(`[${token.index}] Token: \"${token.symbol}\"`);
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