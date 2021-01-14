import Brill_POS_Tagger from './libs/Brill_POS_Tagger/lib/Brill_POS_Tagger';
import Lexicon from './libs/Brill_POS_Tagger/lib/Lexicon';
import RuleSet from './libs/Brill_POS_Tagger/lib/RuleSet';
import { POS } from '../../common/pos';

export class POS_Tagger implements POS.Tagger
{
    private tagger: Brill_POS_Tagger = new Brill_POS_Tagger(
        new Lexicon(
            'DU',
            'n',
            'N'
        ),
        new RuleSet('DU')
    );
    public tag(tokens: Array<string>): Array<[string, POS.Tag]>
    {
        let res:                    Array<[string, POS.Tag]> =              new Array<[string, POS.Tag]>();
        let intermediate_tokens:    Array<{token: string, tag: string}> =   this.tagger.tag(tokens).taggedWords;

        for (let intermediate_token of intermediate_tokens)
        {
            res.push([intermediate_token.token, POS.from_brill_pos_tag(intermediate_token.tag)]);
        }

        return res;
    }
};
