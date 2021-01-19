import { IStemmer } from '../../core/interfaces/parsing/tokens';
import { ITag } from '../../core/interfaces/parsing/tagging';
// import { PorterStemmerNl } from 'natural';

export class Stemmer implements IStemmer
{
    stem(token: string, tag: ITag): string 
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
        // else if (tag.tag_rest.indexOf('mv') > -1)
        // {
        //     let en_regex: RegExp = /(en)\b/;
        //     if (en_regex.test(token))
        //     {
        //         token = token.replace(en_regex, '');
        //     }
        // }
        // NOTE: this stemmer is quite crude
        // return PorterStemmerNl.stem(token);
        return token;
    }
};