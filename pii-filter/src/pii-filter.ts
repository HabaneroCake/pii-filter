import { Parsing } from './core/parsing';
import { ILanguage } from './core/interfaces/language';

import {
    IAssociativeScore,
    IAssociationScore,
    IClassificationScore,
    IClassifier, 
    IConfidences
} from './core/interfaces/parsing/classification';

import { 
    IResult,
    IClassificationResult,
    IMain
} from './core/interfaces/main';

import {
    ITokenizer,
    IToken
} from './core/interfaces/parsing/tokens';

// Languages
export { NL } from './lang/nl/nl';

export class PIIFilter implements IMain
{
    //------------------------------------------------------------------------------------------------------------------
    /**
     * 
     * @param language_model the language model
     * @param verbosity verbosity level
     */
    constructor(public language_model: ILanguage) {}
    public classify(text: string): IResult
    {
        // Factory functions (TODO: put somewhere logical)
        // TODO these could be passed in somewhere
        let make_tokenizer = (text: string, language_model: ILanguage): ITokenizer => 
        { return new Parsing.Tokenizer(text, language_model); }
        let make_confidences = (): IConfidences => { return new Parsing.Confidences();} 
        let make_association_score = (associative_score: IAssociativeScore,
                                      score: number, severity: number,
                                      classifier: IClassifier): IAssociationScore =>
        {
            return new Parsing.AssociationScore(
                associative_score,
                score,
                severity,
                classifier
            );
        }
        let make_classification_score = (score: number, severity: number, classifier: IClassifier): 
            IClassificationScore => { return new Parsing.ClassificationScore(score, severity, classifier); }
        // ---

        let iterate_tokens = (fn: (index: number, token: IToken) => number) =>
        {
            let index = 0;
            while (index < tokenizer.tokens.length)
            {
                index = fn(index, tokenizer.tokens[index]);
                index++;
            }
        };
        let iterate_classifiers_and_tokens = (
            fn: (classifier: IClassifier, index: number, token: IToken) => number
        ) =>
        {
            for (let classifier of this.language_model.classifiers)
            {
                iterate_tokens(
                    (index: number, token: IToken): number => 
                    {
                        return fn(classifier, index, token);
                    }
                )
            }
        };
        let run_classification = () => {
            // add pass container
            for (let token of tokenizer.tokens)
                token.confidences_classification.push(make_confidences());
            // classification pass
            iterate_classifiers_and_tokens(
                (classifier: IClassifier, index: number, token: IToken): number => 
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
                            r_token.confidences_classification[
                                r_token.confidences_classification.length-1].add(score_conf);
                            index = r_token.index;
                        }
                    }
                    return index;
                }
            )
        };
        // associative pass (PII)
        let run_associative_pass_pii = () => {
            iterate_tokens(
                (index: number, token: IToken): number => 
                {
                    let max = token.confidences_classification[token.confidences_classification.length-1].max();
                    if (this.language_model.thresholds.validate(max))
                    {
                        for (let [classifier, associative_score] of max.classifier.associative_references)
                        {
                            let association_score = make_association_score(
                                associative_score,
                                associative_score.score,
                                associative_score.severity,
                                classifier
                            );

                            association_score.group_root_start =    max.group_root_start;
                            association_score.group_root_end =      max.group_root_end;

                            let r_token:   IToken =  max.group_root_start;
                            do
                            {
                                r_token.confidences_associative.add(classifier, association_score);                            
                                r_token = r_token.next;
                            }
                            while (r_token != null && r_token.index < max.group_root_end.index)
                        }
                        index = max.group_root_end.index;
                    }
                    return index;
                }
            );
        }
        // =============================================================================================================
        // Start of function control flow
        let tokenizer: ITokenizer = make_tokenizer(text, this.language_model);

        // dictionary pass
        iterate_tokens(
            (index: number, token: IToken): number => 
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
            (classifier: IClassifier, index: number, token: IToken): number => 
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
                        r_token.confidences_associative.add(classifier, score_assoc);
                        index = r_token.index;
                    }
                }
                return index;
            }
        );

        // initial pass
        run_classification();
        // assoc
        run_associative_pass_pii();
        // cross-classification pass
        run_classification();

        // get all (highest scoring) pii tokens
        let severity_max_pii:   number =                                0.0;
        let severity_sum_pii:   number =                                0.0;
        let total_n_pii:        number =                                0;
        let n_classifications:  Map<IClassifier, number> =              new Map<IClassifier, number>();
        let tokens:             Array<[IClassificationScore, IToken]> = new Array<[IClassificationScore, IToken]>();
        iterate_tokens(
            (index: number, token: IToken): number => 
            {
                let classification = token.confidences_classification[token.confidences_classification.length-1].max();
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
                    classification = make_classification_score(0, 0, null);

                tokens.push([classification, token]);
                return index;
            }
        );

        return new PIIFilter.Result(
            total_n_pii,
            n_classifications,
            Math.min(severity_sum_pii, 1.0),
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
    export class PII implements IClassificationResult
    {
        constructor(
            public classification: IClassificationScore,
            public text: string
        ) {}
    };
    export class Result implements IResult
    {
        constructor(
            public total_num_pii:       number,
            public num_pii:             Map<IClassifier, number>,
            public severity_mapping:    number,
            public tokens:              Array<[IClassificationScore, IToken]>
        ) {}

        public render_replaced(fn: (classification: IClassificationScore, token: IToken) => string, 
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
            return this.render_replaced((classification: IClassificationScore, token: IToken): string =>
            {
                return `{${classification.classifier.name}}`;
            }, confidence_threshold, severity_threshold);
        }

        public render_removed(confidence_threshold?: number, severity_threshold?: number): string
        {
            return this.render_replaced((classification: IClassificationScore, token: IToken): string =>
            {
                return '';
            }, confidence_threshold, severity_threshold);
        }

        public pii(confidence_threshold?: number, severity_threshold?: number): Array<IClassificationResult>
        {
            let result: Array<IClassificationResult> = new Array<IClassificationResult>();

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
                console.log(`-- WellFormedNess[${token.tag.group.well_formed}]`);
                if (token.confidence_dictionary)
                    console.log(
                        `- dict score: ${token.confidence_dictionary.score}, ` +
                        `root: [${token.confidence_dictionary.group_root_start.index}, ` + 
                        `${token.confidence_dictionary.group_root_end.index}]`
                    );
                for (let assoc_arr of token.confidences_associative.values())
                {
                    for (let assoc of assoc_arr)
                    {
                        console.log(
                            `  assoc: ${assoc.classifier.name}, ` +
                            `score: ${assoc.score}, root: [${assoc.group_root_start.index}, ` + 
                            `${assoc.group_root_end.index}]`
                        );
                    }
                }
                for (let conf of token.confidences_classification[token.confidences_classification.length-1].all())
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