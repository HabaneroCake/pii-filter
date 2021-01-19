import { ITokenizer } from '../interfaces/parsing/tokens';
import { ILanguage } from '../interfaces/language';
import { Token } from './token';
import { POS } from './pos';

export class Tokenizer implements ITokenizer
{
    public tokens:      Array<Token> =  new Array<Token>();
    /**
     * creates a linked list of tokens from input text
     * @param text input text
     * @param language_model the input language model
     */
    constructor(
        text: string,
        language_model: ILanguage
    )
    {
        let string_tokens_raw =                         text.split(language_model.punctuation);
        let string_tokens =                             new Array<string>();

        for (let str of string_tokens_raw)
            if (str.length > 0)
                string_tokens.push(str);


        let tagged_tokens: Array<[string, POS.Tag]> =   language_model.pos_tagger.tag(
            string_tokens,
            language_model
        );

        // TODO: eventually add character offset index?
        let index: number = 0;
        let l_tok: Token =  null;
        for (let [token, pos_tag] of tagged_tokens)
        {
            if (token.length == 0)
                continue;

            let c_tok = new Token(token, pos_tag, index);

            if (l_tok != null)
                l_tok.next = c_tok;

            c_tok.previous = l_tok;
            this.tokens.push(c_tok);

            l_tok = c_tok;
            index++;
        }
    }
};