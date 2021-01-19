import { ILanguage } from '../language';;
import { IToken } from './tokens';

export interface IClassifier
{
    language_model: ILanguage;
    associative_references: Array<[IClassifier, IAssociativeScore]>;
    init(language_model: ILanguage);
    bind_language_model(language_model: ILanguage): void;
    classify_associative(token: IToken): [Array<IToken>, IAssociationScore];
    classify_confidence(token: IToken): [Array<IToken>, IClassificationScore];
    name: string;
};

export interface IClassification
{
    // in case of multi word matching
    group_root_start:       IToken;
    group_root_end:         IToken;
    classifier:             IClassifier;
    valid(): boolean;
};

export interface IClassificationScore extends IClassification
{
    score:                  number;
    severity:               number;
    classifier:             IClassifier;
};

export interface IAssociativeScore
{
    left_max:               number;
    right_max:              number;
    score:                  number;
    severity:               number;
};

export interface IAssociationScore extends IClassificationScore
{
    associative_score:      IAssociativeScore;
    valid_from_left(distance_from_left: number, n_phrase_endings: number): boolean;
    valid_from_right(distance_from_right: number, n_phrase_endings: number): boolean;
};

export interface IAssociations
{
    add(classifier: IClassifier, association_score: IAssociationScore): void;
    has(classifier: IClassifier): boolean;
    get(classifier: IClassifier): Array<IAssociationScore>;
    max(classifier: IClassifier): IAssociationScore;
    values(): IterableIterator<Array<IAssociationScore>>;
};

export interface IConfidences
{
    add(classification_score: IClassificationScore);
    max(): IClassificationScore;
    all(): ReadonlyArray<IClassificationScore>;
};

export interface IThresholdSetting
{
    min_classification_score:   number;
    min_severity_score:         number;
    compare_against_dict_score: boolean;
};

export interface IThresholds
{
    well_formedness_threshold:   number;
    well_formed:                 IThresholdSetting;
    ill_formed:                  IThresholdSetting;

    validate(classification: IClassificationScore, well_formed?: boolean): boolean;
};