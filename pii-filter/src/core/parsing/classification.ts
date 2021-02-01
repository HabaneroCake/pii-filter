import { 
    Classifier,
    Classification,
    ClassificationScore,
    AssociativeScore,
    AssociationScore 
} from '../interfaces/parsing/classification';

import { Language } from '../interfaces/language';
import { Token } from '../../core/interfaces/parsing/tokens';
import { Associations, Confidences, Thresholds, ThresholdSetting } from '../interfaces/parsing/classification';

/** 
 * @inheritdoc Classifier
 * @private
 */
export abstract class CoreClassifier implements Classifier
{
    /** @inheritdoc */
    language_model: Language;
    /** @inheritdoc */
    associative_references: Array<[Classifier, CoreAssociativeScore]> = 
                                            new Array<[Classifier, CoreAssociativeScore]>();
    /** @inheritdoc */
    public init(language_model: Language)
    {
        this.language_model = language_model;
    }
    /** @inheritdoc */
    public abstract classify_associative(token: Token): [Array<Token>, AssociationScore];
    /** @inheritdoc */
    public abstract classify_confidence(token: Token): [Array<Token>, ClassificationScore];
    /** @inheritdoc */
    public abstract name: string;
};

/**
 * @inheritdoc Classification
 * @private
 */
export class CoreClassification implements Classification
{
    public group_root_start:    Token = null;
    public group_root_end:      Token = null;
    /**
     * Creates a new CoreClassification.
     * @param classifier the classifier which was used
     */
    constructor(
        public classifier:  Classifier
    ) {}
    /** @inheritdoc Classification.valid */
    public valid(): boolean { return this.classifier != null; }
};

/**
 * @inheritdoc ClassificationScore
 * @private
 */
export class CoreClassificationScore extends CoreClassification implements ClassificationScore
{
    /**
     * Creates a new CoreClassificationScore.
     * @param score the confidence score
     * @param severity the severity score
     * @param classifier the classifier which was used
     */
    constructor(
        public score:       number,
        public severity:    number,
        classifier:         Classifier
    ) { super(classifier); }
};

/**
 * @inheritdoc AssociativeScore
 * @private
 */
export class CoreAssociativeScore implements AssociativeScore
{
    /**
     * Creates a new CoreAssociativeScore.
     * @param left_max the maximum distance from the left that a classification may use this association
     * @param right_max the maximum distance from the right that a classification may use this association
     * @param score the amount of confidence it adds
     * @param severity the amount of severity it adds 
     */
    constructor(
        public left_max:    number,
        public right_max:   number,
        public score:       number,
        public severity:    number
    ){}
};

/**
 * @inheritdoc AssociationScore
 * @private
 */
export class CoreAssociationScore extends CoreClassificationScore implements AssociationScore
{
    /**
     * Creates a new CoreAssociationScore.
     * @param associative_score the associative score
     * @param score the amount of confidence it adds
     * @param severity the amount of severity it adds 
     * @param classifier the classifier which provided this match
     */
    constructor(
        public associative_score:   AssociativeScore, // global
        score:                      number, // can be adjusted
        severity:                   number, // can be adjusted
        classifier:                 Classifier
    ) { super(score, severity, classifier); }
    /** @inheritdoc */
    public valid_from_left(distance_from_left: number, n_phrase_endings: number): boolean
    {
        return this.valid() && (this.associative_score.left_max == -1 && n_phrase_endings == 0) || 
                (this.associative_score.left_max > 0 && distance_from_left <= this.associative_score.left_max);
    }
    /** @inheritdoc */
    public valid_from_right(distance_from_right: number, n_phrase_endings: number): boolean
    {
        return this.valid() && (this.associative_score.right_max == -1 && n_phrase_endings == 0) || 
                (this.associative_score.right_max > 0 && distance_from_right <= this.associative_score.right_max);
    }
};

/**
 * @inheritdoc Associations
 * @private
 */
export class CoreAssociations implements Associations
{
    /** the raw associations */
    protected assoc_map: Map<Classifier, Array<AssociationScore>> = new Map<Classifier, Array<AssociationScore>>();
    /** @inheritdoc */
    public add(classifier: Classifier, association_score: AssociationScore)
    {
        if (!this.assoc_map.has(classifier))
            this.assoc_map.set(classifier, new Array<AssociationScore>());
        
        let arr = this.assoc_map.get(classifier);
        
        if (arr.indexOf(association_score) > -1)
            throw new Error('association score has already been added');

        // only if bounds conform to existing bounds
        if (arr.length == 0 || 
            association_score.group_root_start.index == arr[0].group_root_start.index &&
            association_score.group_root_end.index ==   arr[0].group_root_end.index)
        {
            arr.push(association_score);

            // sort in descending order
            this.assoc_map.set(classifier, arr.sort((i1, i2) => i2.score - i1.score));
        }
    }
    /** @inheritdoc */
    public has(classifier: Classifier): boolean { return this.assoc_map.has(classifier); }
    /** @inheritdoc */
    public get(classifier: Classifier): Array<AssociationScore>
    {
        return this.assoc_map.get(classifier);
    }
    /** @inheritdoc */
    public max(classifier: Classifier): AssociationScore
    {
        if (this.has(classifier))
            return this.assoc_map.get(classifier)[0];
        return new CoreAssociationScore(null, 0, 0, null);
    }
    /** @inheritdoc */
    public values(): IterableIterator<Array<AssociationScore>>
    {
        return this.assoc_map.values();
    }
};

/**
 * @inheritdoc Confidences
 * @private
 */
export class CoreConfidences implements Confidences
{
    /** the raw confidences */
    private confidences: Array<ClassificationScore> = new Array<ClassificationScore>();
    /** @inheritdoc */
    public add(classification_score: ClassificationScore)
    {
        let confidence_with_same_classifier: ClassificationScore = null;
        for (let conf of this.confidences)
        {
            if (conf.classifier == classification_score.classifier)
            {
                confidence_with_same_classifier = conf;
                break;
            }
        }
        if (confidence_with_same_classifier != null)
        {
            confidence_with_same_classifier.score =             classification_score.score;
            confidence_with_same_classifier.group_root_start =  classification_score.group_root_start;
            confidence_with_same_classifier.group_root_end =    classification_score.group_root_end;
        }
        else
            this.confidences.push(classification_score);
        // sort descending
        this.confidences = this.confidences.sort((i1, i2) => 
        {
            // let len_diff: number = (i2.group_root_end.index-i2.group_root_start.index) - 
            //                         (i1.group_root_end.index-i1.group_root_start.index);
            // return (len_diff == 0) ? (i2.score - i1.score) : len_diff;
            return (i2.score - i1.score);
        });
    }
    /** @inheritdoc */
    public max(): ClassificationScore
    {
        if (this.confidences.length)
            return this.confidences[0];
        return new CoreClassificationScore(0, 0, null);
    }
    /** @inheritdoc */
    public all(): ReadonlyArray<ClassificationScore>
    {
        return this.confidences;
    }
};

/**
 * @inheritdoc Thresholds
 * @private
 */
export class CoreThresholds implements Thresholds
{
    /**
     * Creates a new CoreThresholds.
     * @param well_formedness_threshold the threshold for text to be 'well-formed'
     * @param well_formed the settings for 'well-formed' text
     * @param ill_formed the settings for 'ill-formed' text
     */
    constructor(
        public well_formedness_threshold:   number,
        public well_formed:                 ThresholdSetting,
        public ill_formed:                  ThresholdSetting
    ) {};

    /** @inheritdoc */
    public validate(classification: ClassificationScore, well_formed?: boolean): boolean
    {
        if (classification.valid())
        {
            let classification_exceeds_dict_match:  boolean = (
                classification.group_root_start != null && 
                classification.group_root_end != null) &&
                    (classification.group_root_start.confidence_dictionary == null ||
                    (classification.score > classification.group_root_start.confidence_dictionary.score ||
                        classification.group_root_end.index >
                        classification.group_root_start.confidence_dictionary.group_root_end.index));
                        
            let tag_groups_match:       boolean = (classification.group_root_start.tag.group ==
                                                    classification.group_root_end.tag.group);
            let tag_group_well_formed:  boolean = (classification.group_root_start.tag.group.well_formed >
                                                    this.well_formedness_threshold);
            
            // not enough information to go by
            let too_few_tags:           boolean = classification.group_root_start.tag.group.n_tags < 3;

            let active_config: ThresholdSetting = (
                well_formed == null ?
                    ((tag_groups_match && (tag_group_well_formed || too_few_tags)) ?  
                        this.well_formed : this.ill_formed) :
                    (well_formed ?  
                        this.well_formed : this.ill_formed)
            );

            return ((active_config.compare_against_dict_score && classification_exceeds_dict_match) || 
                    !active_config.compare_against_dict_score) &&
                    classification.score > active_config.min_classification_score &&
                    classification.severity > active_config.min_severity_score;
        }
        return false;
    }
};

/**
 * @private
 */
export namespace CoreThresholds
{
    /**
     * @inheritdoc ThresholdSetting
     * @private
     */
    export class Group implements ThresholdSetting
    {
        /**
         * Creates a new CoreThresholds.Group.
         * @param min_classification_score the minimum confidence score a classifier must have before being accepted
         * @param min_severity_score the minimum severity score a classifier must have before being accepted
         * @param compare_against_dict_score if confidence score must exceed the dictionary score before being accepted
         */
        constructor(
            public min_classification_score: number =       0,
            public min_severity_score: number =             0,
            public compare_against_dict_score: boolean =    false
        ) {};
    }
};