import Brill_POS_Tagger from './libs/Brill_POS_Tagger/lib/Brill_POS_Tagger';
import Lexicon from './libs/Brill_POS_Tagger/lib/Lexicon';
import RuleSet from './libs/Brill_POS_Tagger/lib/RuleSet';
import { POS } from '../../common/pos';
import { Language } from '../../common/language-interface';

export class POS_Tagger implements POS.Tagger
{
    public none_str:    string =            'x';
    private tagger:     Brill_POS_Tagger =   new Brill_POS_Tagger(
        new Lexicon(
            'DU',
            this.none_str,
            this.none_str.toUpperCase()
        ),
        new RuleSet('DU')
    );
    public tag(
        tokens: Array<string>,
        language_model: Language
    ): Array<[string, POS.Tag]>
    {
        let res:                    Array<[string, POS.Tag]> =              new Array<[string, POS.Tag]>();
        let intermediate_tokens:    Array<{token: string, tag: string}> =   this.tagger.tag(tokens).taggedWords;

        for (let intermediate_token of intermediate_tokens)
        {
            res.push([intermediate_token.token, POS.from_brill_pos_tag(intermediate_token.tag)]);
        }

        // classifies well-formedness
        class TagGroupAnnotator
        {
            public current_group:       POS.Tag.Group;
            private enc_first_lett:     boolean;
            private first_uppercase:    boolean;

            private initialize()
            {
                this.current_group =    new POS.Tag.Group();
                this.enc_first_lett =   false;
                this.first_uppercase =  false;
            }

            public annotate(items: Array<[string, POS.Tag]>): Array<[string, POS.Tag]>
            {
                this.initialize();

                for (let i: number = 0; i < items.length; ++i)
                {
                    let c_group: POS.Tag.Group = this.current_group;

                    let [str, tag] = items[i];
                    if (!this.enc_first_lett && /[a-zA-Z]/.test(str[0]))
                    {
                        this.enc_first_lett = true;
                        this.first_uppercase = /[A-Z]/.test(str[0]);
                    }
                        

                    if (language_model.punctuation_map.has(str) &&
                        language_model.punctuation_map.get(str) < 0.5)
                    {
                        if (str.match(/\r|\n/) ||
                            (i+1 == items.length) ||
                            ((i+1 < items.length && items[i+1][0] == ' ')))
                        {
                            let start_end_ok: boolean = this.first_uppercase && c_group.n_tags > 1;
                            if (start_end_ok)
                                c_group.well_formed += 0.1;

                            this.initialize();

                            // add a small amount to the next phrase
                            if (start_end_ok)
                                this.current_group.well_formed += 0.05;
                        }
                    }
                    
                    switch (tag.tag_base.toLowerCase())
                    {
                        case language_model.pos_tagger.none_str:
                            // ignore
                            break;
                        case 'v':
                            c_group.well_formed += 0.025;
                            break;
                        case 'n':
                            c_group.well_formed += 0.0125;
                            break;
                        case 'prep':
                            c_group.well_formed += 0.0125;
                            break
                        // case 'conj':
                        //     c_group.well_formed += 0.0025;
                        // case 'adj':
                        //     c_group.well_formed += 0.005;
                        //     break;
                        // case 'adv':
                        //     c_group.well_formed += 0.0025;
                        //     break;
                        // case 'prep':
                        //     c_group.well_formed += 0.0025;
                        //     break;
                        case 'adv':
                            c_group.well_formed += 0.0125;
                            break;
                        case 'pron':
                            c_group.well_formed += 0.0125;
                            break;
                        case 'punc':
                            // handled above
                            break;
                        default:
                            break;
                    }

                    // TODO: can add actual rules and parse correct ordering etc.
                    c_group.well_formed = Math.min(
                        c_group.well_formed,
                        1.0
                    );

                    tag.group = c_group;
                    c_group.n_tags++;
                }

                return items;
            }
        };

        return new TagGroupAnnotator().annotate(res);
    }
};
