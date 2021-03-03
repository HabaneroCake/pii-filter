import {
    Language,
    AssociativeScore,
    AssociationScore,
    ClassificationScore,
    Classifier, 
    Confidences,
    Tokenizer,
    Token
} from './interfaces';

import {
    PIIClassifierResult,
    PIIClassification,
    PIIClassifier
} from './interfaces/main'

//! TODO
import * as Parsing from './parsing';

/**
 * Make a new personally identifiable information filter.
 * @public
 * @param language_model the language model to use, found under {@link languages}.
 */
export function make_pii_classifier(language_model: Language): PIIClassifier
{
    return new PIIFilter(language_model);
}

/**
 * A filter for finding and parsing personally identifiable information in strings.
 * @private
 */
class PIIFilter implements PIIClassifier
{
    /**
     * Constructs a new personally identifiable information filter based on a language model.
     * @param language_model the language model
     */
    constructor(private language_model: Language) {}
    
    /** @inheritdoc */
    public classify(
        text: string,
        well_formed?: boolean
    ): PIIClassifierResult
    {
        //! TODO
        // - Factory functions
        // - these should be passed in somewhere
        let make_tokenizer = (text: string, language_model: Language): Tokenizer => 
        { return new Parsing.CoreTokenizer(text, language_model); }
        let make_confidences = (): Confidences => { return new Parsing.CoreConfidences();} 
        let make_association_score = (associative_score: AssociativeScore,
                                      score: number, severity: number,
                                      classifier: Classifier): AssociationScore =>
        {
            return new Parsing.CoreAssociationScore(
                associative_score,
                score,
                severity,
                classifier
            );
        }
        let make_classification_score = (score: number, severity: number, classifier: Classifier): 
            ClassificationScore => { return new Parsing.CoreClassificationScore(score, severity, classifier); }
        // ---

        let iterate_tokens = (fn: (index: number, token: Token) => number) =>
        {
            let index = 0;
            while (index < tokenizer.tokens.length)
            {
                index = fn(index, tokenizer.tokens[index]);
                index++;
            }
        };
        let iterate_classifiers_and_tokens = (
            fn: (classifier: Classifier, index: number, token: Token) => number
        ) =>
        {
            for (let classifier of this.language_model.classifiers)
            {
                iterate_tokens(
                    (index: number, token: Token): number => 
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
                (classifier: Classifier, index: number, token: Token): number => 
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
                (index: number, token: Token): number => 
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

                            let r_token:   Token =  max.group_root_start;
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
        let tokenizer: Tokenizer = make_tokenizer(text, this.language_model);

        // dictionary pass
        iterate_tokens(
            (index: number, token: Token): number => 
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
            (classifier: Classifier, index: number, token: Token): number => 
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
        let tokens:             Array<[ClassificationScore, Token]> = new Array<[ClassificationScore, Token]>();
        iterate_tokens(
            (index: number, token: Token): number => 
            {
                let classification = token.confidences_classification[token.confidences_classification.length-1].max();
                if (this.language_model.thresholds.validate(classification, well_formed) &&
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

        return new PIIFilterClassificationResult(
            Math.min(severity_sum_pii, 1.0),
            tokens
        );
    }

    /** @inheritdoc */
    public sanitize_str(
        text: string,
        placeholders: boolean,
        well_formed?: boolean
    ): string
    {
        let result = this.classify(text, well_formed);
        return placeholders ? 
            result.render_placeholders() : 
            result.render_removed();
    }

    /** @inheritdoc */
    public sanitize_obj(
        obj: object,
        placeholders: boolean,
        recursive: boolean = false,
        skip: Array<object> = [],
        well_formed?: boolean
    ): object
    {
        let obj_result: object = {};
        for (let key in obj)
            if (typeof obj[key] == 'string' && skip.indexOf(obj[key]) == -1)
                obj_result[key] = this.sanitize_str(
                    obj[key],
                    placeholders,
                    well_formed
                );
            else if (typeof obj[key] == 'object' && recursive)
                obj_result[key] = this.sanitize_obj(obj[key], placeholders, recursive, skip);
            else
                obj_result[key] = obj[key];
        return obj_result;
    }
};

/**
 * The result of a PIIFilter classify call.
 * @private
 */
class PIIFilterClassificationResult implements PIIClassifierResult
{
    // wether PII was found
    public readonly found_pii:  boolean;
    // The list of PII classifications in the order that they occurred in the source text.
    public readonly pii:        ReadonlyArray<PIIClassification>;
    
    /**
     * Constructs a new result object
     * @param severity the overall severity level of the source text, from 0 to 1
     * @param tokens the tokens which were used in classification
     */
    constructor(
        public readonly severity:   number,
        protected       tokens:     Array<[ClassificationScore, Token, PIIClassification?]>
    )
    {
        let pii: Array<PIIClassification> =   new Array<PIIClassification>();
        for (let i: number = 0; i < this.tokens.length; ++i)
        {
            let [classification, token,] = this.tokens[i];
            if (classification.valid())
            {
                let single_pii: PIIClassification = {
                    value:      Parsing.classification_group_string(classification),
                    type:       classification.classifier.name,
                    confidence: classification.score,
                    severity:   classification.severity,
                    start_pos:  classification.group_root_start.c_index_start,
                    end_pos:    classification.group_root_end.c_index_end
                };
                pii.push(single_pii);
                this.tokens[i] = [classification, token, single_pii];
            }
        }
        this.pii =          pii;
        this.found_pii =    (this.pii.length > 0);
    }

    /** @inheritdoc */
    public render_replaced(fn: (classification: PIIClassification) => string): string
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

    /** @inheritdoc */
    public render_placeholders(): string
    {
        return this.render_replaced((pii: PIIClassification): string =>
        {
            return `{${pii.type}}`;
        });
    }
    
    /** @inheritdoc */
    public render_removed(): string
    {
        return this.render_replaced((pii: PIIClassification): string =>
        {
            return '';
        });
    }
};