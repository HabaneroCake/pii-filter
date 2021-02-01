import { Language } from '../language';

/**
 * An object shared by members of the same phrase, providing some global information.
 * @private
 */
export interface PhraseGroup
{
    /** The 'well-formedness' score of this phrase. */
    well_formed:    number;
    /** The number of tags which are part of this phrase. */
    n_tags:         number;
};

/**
 * Parts of Speech information for a token.
 * @private
 */
export interface POSInfo
{
    /** Information regarding the phrase that this is part of. */
    group:       PhraseGroup;
    /** The Parts of Speech base tag. */
    tag_base:    string;
    /** Other information provided by the Parts of Speech tagger. */
    tag_rest:    Array<string>;
};

/**
 * A tagger which provides Parts of Speech information to each token.
 * @private
 */
export interface POSTagger
{
    /** The tag which is used to flag an unknown word or invalid tagging. */
    none_str: string;
    /**
     * Provides Parts of Speech information to an array of tokens.
     * @param tokens the tokens
     * @param language_model the language model to use for tagging
     */
    tag(tokens: Array<string>, language_model: Language): Array<[string, POSInfo]>;
};