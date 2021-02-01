/**
 * Declares all interfaces used for implementing a language model.
 * 
 * @remark This is not part of the public API and should not be depended upon, except when building a language model.
 * 
 * @packageDocumentation
 */

export { 
    Classifier,
    Classification,
    ClassificationScore,
    AssociativeScore,
    AssociationScore,
    Associations,
    Confidences,
    ThresholdSetting,
    Thresholds
} from './interfaces/parsing/classification';

export {
    PhraseGroup,
    POSInfo,
    POSTagger
} from './interfaces/parsing/tagging';

export {
    Token,
    Tokenizer,
    Stemmer
} from './interfaces/parsing/tokens';

export {
    Language
} from './interfaces/language';