import { 
    IClassifier,
    IClassification,
    IClassificationScore,
    IAssociativeScore,
    IAssociationScore 
} from '../interfaces/parsing/classification';

import { ILanguage } from '../interfaces/language';
import { IToken } from '../../core/interfaces/parsing/tokens';
import { IAssociations, IConfidences, IThresholds, IThresholdSetting } from '../interfaces/parsing/classification';

export abstract class Classifier implements IClassifier
{
    public associative_references: Array<[IClassifier, AssociativeScore]> = 
                                            new Array<[IClassifier, AssociativeScore]>();

    public language_model: ILanguage;
    public init(language_model: ILanguage)
    {
        this.language_model = language_model;
        this.bind_language_model(this.language_model);
    }
    
    public abstract bind_language_model(language_model: ILanguage): void;
    public abstract classify_associative(token: IToken): [Array<IToken>, IAssociationScore];
    public abstract classify_confidence(token: IToken): [Array<IToken>, IClassificationScore];
    public abstract name: string;
};

export class Classification implements IClassification
{
    // in case of multi word matching
    public group_root_start:    IToken = null;
    public group_root_end:      IToken = null;
    /**
     * 
     * @param classifier the classifier which was used
     */
    constructor(
        public classifier:  IClassifier
    ) {}

    public valid(): boolean { return this.classifier != null; }
};

export class ClassificationScore extends Classification implements IClassificationScore
{
    constructor(
        public score:       number,
        public severity:    number,
        classifier:         IClassifier
    ) { super(classifier); }
};

export class AssociativeScore implements IAssociativeScore
{
    constructor(
        public left_max:    number,
        public right_max:   number,
        public score:       number,
        public severity:    number
    ){}
};

export class AssociationScore extends ClassificationScore implements IAssociationScore
{
    constructor(
        public associative_score:   IAssociativeScore, // global
        score:                      number, // can be adjusted
        severity:                   number, // can be adjusted
        classifier:                 IClassifier
    ) { super(score, severity, classifier); }

    public valid_from_left(distance_from_left: number, n_phrase_endings: number): boolean
    {
        return this.valid() && (this.associative_score.left_max == -1 && n_phrase_endings == 0) || 
                (this.associative_score.left_max > 0 && distance_from_left <= this.associative_score.left_max);
    }
    public valid_from_right(distance_from_right: number, n_phrase_endings: number): boolean
    {
        return this.valid() && (this.associative_score.right_max == -1 && n_phrase_endings == 0) || 
                (this.associative_score.right_max > 0 && distance_from_right <= this.associative_score.right_max);
    }
};

export class Associations implements IAssociations
{
    protected assoc_map: Map<IClassifier, Array<IAssociationScore>> = new Map<IClassifier, Array<IAssociationScore>>();
    public add(classifier: IClassifier, association_score: IAssociationScore)
    {
        if (!this.assoc_map.has(classifier))
            this.assoc_map.set(classifier, new Array<IAssociationScore>());
        
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
    public has(classifier: IClassifier): boolean { return this.assoc_map.has(classifier); }
    public get(classifier: IClassifier): Array<IAssociationScore>
    {
        return this.assoc_map.get(classifier);
    }
    public max(classifier: IClassifier): IAssociationScore
    {
        if (this.has(classifier))
            return this.assoc_map.get(classifier)[0];
        return new AssociationScore(null, 0, 0, null);
    }
    public values(): IterableIterator<Array<IAssociationScore>>
    {
        return this.assoc_map.values();
    }
};

export class Confidences implements IConfidences
{
    private confidences: Array<IClassificationScore> = new Array<IClassificationScore>();
    public add(classification_score: IClassificationScore)
    {
        let confidence_with_same_classifier: IClassificationScore = null;
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
    public max(): IClassificationScore
    {
        if (this.confidences.length)
            return this.confidences[0];
        return new ClassificationScore(0, 0, null);
    }
    public all(): ReadonlyArray<IClassificationScore>
    {
        return this.confidences;
    }
};

export class Thresholds implements IThresholds
{
    constructor(
        public well_formedness_threshold:   number,
        public well_formed:                 IThresholdSetting,
        public ill_formed:                  IThresholdSetting
    ) {};

    public validate(classification: IClassificationScore, well_formed?: boolean): boolean
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

            let active_config: IThresholdSetting = (
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

export namespace Thresholds
{
    export class Group implements IThresholdSetting
    {
        constructor(
            public min_classification_score: number =       0,
            public min_severity_score: number =             0,
            public compare_against_dict_score: boolean =    false
        ) {};
    }
};