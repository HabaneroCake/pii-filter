import { Stemmer } from '../../core/interfaces/parsing/tokens';
import { POSInfo } from '../../core/interfaces/parsing/tagging';

/**
 * @inheritdoc Stemmer
 * @private
 */
export class DutchStemmer implements Stemmer
{
    /** @inheritdoc */
    stem(token: string, tag: POSInfo): string 
    {
        token = token.replace('\'s', '').toLowerCase();
        if (tag.tag_rest.indexOf('verl_dw') > -1)
        {
            let ge_regex: RegExp = /\b(ge)/;
            let d_regex: RegExp = /(d)\b/;
            if (ge_regex.test(token))
            {
                token = token.replace(ge_regex, '');
                if (d_regex.test(token))
                {
                    token = token.replace(d_regex, '');
                }
            }
        }
        // return PorterStemmerNl.stem(token);
        return token;
    }
};