import { Language } from '../language';
import { ClassificationScore, Associations, Confidences } from './classification';
import { POSInfo } from './tagging';

/**
 * A token which is part of a string.
 * @private
 */
export interface Token
{
    /** The previous token. */
    previous:       Token;
    /** The next token. */
    next:           Token;

    /** The original symbol of this token. */
    symbol:         string;
    /** The stem of this token. */
    stem:           string;

    /** The Parts of Speech information for this token. */
    tag:            POSInfo;
    /** The index of this token. */
    index:          number;

    /** The character start index of this token in the original string. */
    c_index_start:  number;
    /** The character end index of this token in the original string. */
    c_index_end:    number;

    /** The classification confidences of this token in the dictionary. */
    confidence_dictionary:       ClassificationScore;
    /** The associative confidences which classifiers have applied to this token. */
    confidences_associative:     Associations;
    /** The classification confidences which classifiers have applied to this token in multiple passes. */
    confidences_classification:  Array<Confidences>;
};

/**
 * A tokenizer, which upon construction, splits a string into tokens and stores the result as public list.
 * @private
 */
export interface Tokenizer
{
    /** The tokens which were created. */
    tokens:      Array<Token>;
};

/**
 * A stemmer for POS tagged tokens.
 * @private
 */
export interface Stemmer
{
    /**
     * Stems a token
     * @param token the token to stem
     * @param tag the Parts of Speech tag for the token
     */
    stem(token: string, tag: POSInfo): string;
};