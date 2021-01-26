import { IClassificationScore, IAssociations, IConfidences } from './classification';
import { ITag } from './tagging';

export interface IToken
{
    previous:       IToken;
    next:           IToken;

    symbol:         string;
    stem:           string;

    tag:            ITag;
    index:          number;

    c_index_start:  number;
    c_index_end:    number;

    // stores passes
    confidence_dictionary:       IClassificationScore;
    confidences_associative:     IAssociations;
    confidences_classification:  Array<IConfidences>;
};

export interface ITokenizer
{
    tokens:      Array<IToken>;
};

export interface IStemmer
{
    stem(token: string, tag: ITag): string;
};