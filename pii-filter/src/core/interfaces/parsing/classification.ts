import { Language } from '../language';
import { Token } from './tokens';

/**
 * Interface for token grouping and classification.
 * @private
 */
export interface Classifier
{
    /** The language model which is used. */
    language_model: Language;
    /** Associative weighting for the vicinity of other classifiers. */
    associative_references: Array<[Classifier, AssociativeScore]>;
    /**
     * Called with the language model after it has been constructed.
     * @param language_model The language model that this classifier is part of.
     */
    init(language_model: Language);
    /**
     * Called with the current token, this method returns a token group, including this (and possibly surrounding)
     * tokens, if they are classified as being associatively related to this classifier, along with their weightings.
     * The last token which is part of the token group determines where the classification process picks up.
     * @param token the current token being parsed
     */
    classify_associative(token: Token): [Array<Token>, AssociationScore];
    /**
     * Called with the current token, this method returns a token group, including this (and possibly surrounding)
     * tokens, if they are classified by this classifier, along with their weightings. The last token which is part of
     * the token group determines where the classification process picks up.
     * @param token the current token being parsed
     */
    classify_confidence(token: Token): [Array<Token>, ClassificationScore];
    /** The name of the classifier, this will be used to name the classification type. */
    name: string;
};

/**
 * Raw classification of a token group.
 * @private
 */
export interface Classification
{
    /** The starting token for the classification group. */
    group_root_start:       Token;
    /** The ending token for the classification group. */
    group_root_end:         Token;
    /** The classifier which provided this match. */
    classifier:             Classifier;
    /**
     * Whether this classification is valid (classifier is non null and tokens are valid).
     */
    valid(): boolean;
};

/**
 * Scored classification of a token group.
 * @private
 */
export interface ClassificationScore extends Classification
{
    /** The confidence score of this classification. */
    score:                  number;
    /** The severity score of this classification. */
    severity:               number;
};

/**
 * Scored associative classification.
 * @private
 */
export interface AssociativeScore
{
    /** The maximum distance from the left that a classification may use this association. */
    left_max:               number;
    /** The maximum distance from the right that a classification may use this association. */
    right_max:              number;
    /** The confidence boost it gives. */
    score:                  number;
    /** The severity score it gives.  */
    severity:               number;
};

/**
 * Scored associative classification of a token group. 
 * @private
 */
export interface AssociationScore extends ClassificationScore
{
    /** The associative score which this token group holds. */
    associative_score:      AssociativeScore;
    /**
     * Check if a token is in range of this association.
     * @param distance_from_left The distance from this association to the token.
     * @param n_phrase_endings The number of phrase endings which are between the token and the association.
     */
    valid_from_left(distance_from_left: number, n_phrase_endings: number): boolean;
    /**
     * Check if a token is in range of this association.
     * @param distance_from_right The distance from this association to the token.
     * @param n_phrase_endings The number of phrase endings which are between the token and the association.
     */
    valid_from_right(distance_from_right: number, n_phrase_endings: number): boolean;
};

/**
 * Provides contextual associations to classifiers.
 * @private
 */
export interface Associations
{
    /**
     * Add an association.
     * @param classifier The classifier which classified this as an association.
     * @param association_score The association score which this token holds.
     */
    add(classifier: Classifier, association_score: AssociationScore): void;
    /**
     * Check if a certain association exists for a classifier.
     * @param classifier the classifier
     */
    has(classifier: Classifier): boolean;
    /**
     * Gets an association for a specific classifier.
     * @param classifier the classifier
     */
    get(classifier: Classifier): Array<AssociationScore>;
    /**
     * Get the highest AssociationScore for a certain classifier.
     * @param classifier the classifier
     */
    max(classifier: Classifier): AssociationScore;
    /**
     * Gets all associations, grouped by the classifier type.
     */
    values(): IterableIterator<Array<AssociationScore>>;
};

/**
 * The classification confidences of classifiers.
 * @private
 */
export interface Confidences
{
    /**
     * Adds a new classifications score.
     * @param classification_score the classification score
     */
    add(classification_score: ClassificationScore);
    /**
     * Gets the highest scoring classification score.
     */
    max(): ClassificationScore;
    /**
     * Gets all classifications.
     */
    all(): ReadonlyArray<ClassificationScore>;
};

/**
 * Settings for classification states.
 * @private
 */
export interface ThresholdSetting
{
    /** The minimum confidence score a classifier must have before being accepted. */
    min_classification_score:   number;
    /** The minimum severity score a classifier must have before being accepted. */
    min_severity_score:         number;
    /** Whether a confidence score must exceed the dictionary score before being accepted. */
    compare_against_dict_score: boolean;
};

/**
 * Settings for several classification states.
 * @private
 */
export interface Thresholds
{
    /** The 'well-formedness' score a phrase must have in order to be processed with more strict rules. */
    well_formedness_threshold:   number;
    /** The threshold settings for 'well-formed' text. */
    well_formed:                 ThresholdSetting;
    /** The threshold settings for 'ill-formed' text. */
    ill_formed:                  ThresholdSetting;

    /**
     * Validates a classification and checks if it meets the requirements in order to be accepted.
     * @param classification the classification
     * @param well_formed overrides the internal classification of well-formed or ill-formed text
     */
    validate(classification: ClassificationScore, well_formed?: boolean): boolean;
};