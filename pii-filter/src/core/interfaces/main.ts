/**
 * A classification of personally identifiable information which is part of {@link PIIClassifierResult.pii}.
 */
export interface PIIClassification
{
    /** the text which was classified */
    readonly value:         string;
    /** the classification type, this matches the name of the classifier */
    readonly type:          string;
    /** the confidence level between 0 and 1 */
    readonly confidence:    number;
    /** the severity of this classification within this context */
    readonly severity:      number;
    /** the starting position in characters of this classification */
    readonly start_pos:     number;
    /** the ending position in characters of this classification */
    readonly end_pos:       number;
};

/**
 * The results of a {@link PIIClassifier.classify} call.
 */
export interface PIIClassifierResult
{
    /** true if any classifications exist */
    readonly found_pii:     boolean;
    /** the total severity level of the source text, from 0 to 1 */
    readonly severity:      number;
    /** a list of classifications in the order that they occurred in the source text */
    readonly pii:           ReadonlyArray<PIIClassification>;
    /**
     * Renders the original text while replacing classified text with a string returned from the specified callback.
     * @param fn a callback which is called for each classification
     */
    render_replaced(fn: (classification: PIIClassification) => string): string;
    /**
     * Renders the original text with named placeholders instead of the text which was classified.
     */
    render_placeholders(): string;
    /**
     * Renders the original text without the text which was classified.
     */
    render_removed(): string;
};

/**
 * A classifier which identifies personally identifiable information in strings and objects.
 */
export interface PIIClassifier
{
    /**
     * Classifies an input string for PII.
     * @param text the input string
     */
    classify(
        text: string
    ): PIIClassifierResult;
    /**
     * Removes/replaces PII in a string.
     * @param text the input string
     * @param placeholders whether to use placeholders
     */
    sanitize_str(
        text: string,
        placeholders: boolean
    ): string;
    /**
     * Removes/replaces PII in an object.
     * @param obj the input object
     * @param placeholders whether to use placeholders
     * @param recursive whether to parse the object recursively
     * @param skip which objects to skip
     */
    sanitize_obj(
        obj: object,
        placeholders: boolean,
        recursive: boolean,
        skip?: Array<object>
    ): object;
};