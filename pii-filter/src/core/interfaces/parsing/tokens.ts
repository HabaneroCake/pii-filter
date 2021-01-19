import { IClassificationScore, IAssociations, IConfidences } from './classification';
import { ITag } from './tagging';

export interface IToken
{
    previous:    IToken;
    next:        IToken;

    symbol:      string,
    tag:         ITag,
    index:       number

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
    stem(token: string): string;
};