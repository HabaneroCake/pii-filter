import { Token, Tokenizer } from '../interfaces/parsing/tokens';
import { Language } from '../interfaces/language';
import { POSInfo } from '../interfaces/parsing/tagging';
import { CoreToken } from './token';

/**
 * @inheritdoc Tokenizer
 * @private
 */
export class CoreTokenizer implements Tokenizer
{
    /** @inheritdoc */
    public tokens:      Array<Token> =  new Array<Token>();
    /**
     * Creates a linked list of tokens from input text.
     * @param text input text
     * @param language_model the input language model
     */
    constructor(
        text: string,
        language_model: Language
    )
    {
        let string_tokens_raw =                         text.split(language_model.punctuation);
        let string_tokens =                             new Array<string>();

        for (let str of string_tokens_raw)
            if (str.length > 0)
                string_tokens.push(str);

        let tagged_tokens: Array<[string, POSInfo]> =   language_model.pos_tagger.tag(
            string_tokens,
            language_model
        );

        let index: number = 0;
        let c_index: number = 0;
        let l_tok: CoreToken =  null;
        for (let [token, pos_tag] of tagged_tokens)
        {
            if (token.length == 0)
                continue;

            let stem = language_model.stemmer.stem(token, pos_tag);
            let c_tok = new CoreToken(
                token,
                stem,
                pos_tag,
                index,
                c_index,
                c_index + token.length
            );

            if (l_tok != null)
                l_tok.next = c_tok;

            c_tok.previous = l_tok;
            this.tokens.push(c_tok);

            index++;
            c_index += token.length;
            l_tok = c_tok;
        }
    }
};