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

import * as Languages from './lang/languages';
export { Languages };

/**
 * A class for filtering out or parsing personal information in strings.
 */
export class PIIFilter implements IMain
{
    /**
     * Constructs a new PIIFilter.
     * @param language_model the language model, found under *Languages*
     */
    constructor(public language_model: ILanguage) {}
    /**
     * Classifies PII in a string, based on the language model which was passed at construction.
     * @param text 
     */
    public classify(
        text: string
    ): Result
    {
        //! TODO
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
        let n_classifications:  Map<string, number> =                   new Map<string, number>();
        let tokens:             Array<[IClassificationScore, IToken]> = new Array<[IClassificationScore, IToken]>();
        iterate_tokens(
            (index: number, token: IToken): number => 
            {
                let classification = token.confidences_classification[token.confidences_classification.length-1].max();
                if (this.language_model.thresholds.validate(classification) &&
                    classification.group_root_start == token)
                {
                    // check if any overlapping classifications exist with a higher confidence
                    // check for classifications which start before the end of this group and end after the group_end
                    // check for contained classifications and possibly deal with it through a disambiguation func?

                    let classifier_name: string = classification.classifier.name;
                    if (!n_classifications.has(classifier_name))
                        n_classifications.set(classifier_name, 0);
                    n_classifications.set(classifier_name,
                        n_classifications.get(classifier_name) + 1);
                    
                    severity_sum_pii += classification.severity;
                    severity_max_pii = Math.max(severity_max_pii, classification.severity);
                    
                    index = classification.group_root_end.index;
                }
                else
                    classification = make_classification_score(0, 0, null);

                tokens.push([classification, token]);
                return index;
            }
        );

        return new Result(
            Math.min(severity_sum_pii, 1.0),
            tokens
        );
    }

    /**
     * Replaces or removes personal information contained in a string
     * @param text the input text
     * @param placeholders wether to replace the personal information with placeholders, such as {first_name}
     */
    public sanitize_str(
        text: string,
        placeholders: boolean
    ): string
    {
        let result = this.classify(text);
        return placeholders ? 
            result.render_placeholders() : 
            result.render_removed();
    }

    /**
     * Replaces or removes personal information contained in an object
     * @param obj the object to iterate over
     * @param placeholders wether to replace the personal information with placeholders, such as {first_name}
     * @param recursive wether this object should be sanitized recursively
     * @param skip objects which should be skipped
     */
    public sanitize_object(
        obj: object,
        placeholders: boolean,
        recursive: boolean = false,
        skip?: Array<object>
    ): object
    {
        let obj_result: object = {};
        for (let key in obj)
            if (typeof obj[key] == 'string' && skip.indexOf(obj[key]) == -1)
                obj_result[key] = this.sanitize_str(
                    obj[key],
                    placeholders
                );
            else if (typeof obj[key] == 'object' && recursive)
                obj_result[key] = this.sanitize_object(obj[key], placeholders, recursive, skip);
        return obj_result;
    }
};

/**
 * A class which contains the PII classification result.
 */
export class PII implements IClassificationResult
{
    /**
     * Constructs a new PII object.
     * @param value the text which is classified as PII
     * @param type  the type of PII, this matches the name of the classifier
     * @param confidence the confidence level between 0 and 1 that this string is this PII type
     * @param severity the severity of this PII being used within this context
     * @param start_pos the starting position in characters of this PII match
     * @param end_pos the ending position in characters of this PII match
     */
    constructor(
        public readonly value:      string,
        public readonly type:       string,
        public readonly confidence: number,
        public readonly severity:   number,
        public readonly start_pos:  number,
        public readonly end_pos:    number
    ) {}
};

/**
 * The result of a PIIFilter classify call.
 */
export class Result implements IResult
{
    // wether PII was found
    public readonly found_pii:  boolean;
    // The list of PII classifications in the order that they occurred in the source text.
    public readonly pii:        ReadonlyArray<PII>;
    
    /**
     * Constructs a new result object
     * @param severity the overall severity level of the source text, from 0 to 1
     * @param tokens the tokens which were used in classification
     */
    constructor(
        public readonly severity:   number,
        protected       tokens:     Array<[IClassificationScore, IToken, IClassificationResult?]>
    )
    {
        let pii: Array<PII> =   new Array<PII>();
        for (let i: number = 0; i < this.tokens.length; ++i)
        {
            let [classification, token,] = this.tokens[i];
            if (classification.valid())
            {
                let single_pii: PII = new PII(
                    Parsing.classification_group_string(classification),
                    classification.classifier.name,
                    classification.score,
                    classification.severity,
                    classification.group_root_start.c_index_start,
                    classification.group_root_end.c_index_end,
                );
                pii.push(single_pii);
                this.tokens[i] = [classification, token, single_pii];
            }
        }
        this.pii =          pii;
        this.found_pii =    (this.pii.length > 0);
    }

    /**
     * Renders the original text while replacing found PII with text returned from the specified callback.
     * @param fn a callback which is called for each classification, from which the text to replace it with is returned.
     */
    public render_replaced(fn: (classification: PII) => string): string
    {
        let result: string = '';

        for (let [, token, pii] of this.tokens)
        {
            if (pii != null)
                result += fn(pii);
            else
                result += token.symbol;
        }

        return result;
    }
    /**
     * Renders the original text with placeholders such as {first_name} instead of the PII which was classified.
     */
    public render_placeholders(): string
    {
        return this.render_replaced((pii: PII): string =>
        {
            return `{${pii.type}}`;
        });
    }
    /**
     * Renders the original text without the PII which was classified.
     */
    public render_removed(): string
    {
        return this.render_replaced((pii: PII): string =>
        {
            return '';
        });
    }
};