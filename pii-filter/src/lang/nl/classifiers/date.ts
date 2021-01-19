import { Trie } from '../../../core/structures/trie';
import { Parsing } from '../../../core/parsing';
import ds_date from '../dataset/ds_date.json';

// TODO: clean up and calculate better confidences based on patterns
export class Date extends Parsing.SimpleAssociativeClassifier
{
    protected match_trie:   Trie<Date.SegmentFormats> = new Trie();

    constructor() 
    {
        super(ds_date);
        this.match_trie.add_list(this.dataset['day'], Date.SegmentFormats.day);
        this.match_trie.add_list(this.dataset['month'], Date.SegmentFormats.month);
        this.match_trie.add_list(this.dataset['ordinal'], Date.SegmentFormats.ordinal);
        this.match_trie.add_list(this.dataset['number'], Date.SegmentFormats.number);
        this.match_trie.add_list(this.dataset['unit'], Date.SegmentFormats.unit);
    }
    public classify_confidence(token: Parsing.Token): 
        [Array<Parsing.Token>, Parsing.ClassificationScore]
    {
        const separators:       Array<string> =         ['.', ' ', '/', '\\', '-', '_', ':'];
        const max_n_sep:        number =                5;
        let final_matches:      Array<Parsing.Token> =  new Array<Parsing.Token>();
        let score:              number =                0.0;
        let severity:           number =                0.0;

        function token_part_of_date(token: Parsing.Token,
                                    match_trie: Trie<Date.SegmentFormats>):
            [boolean, Array<Parsing.Token>, Date.SegmentFormats, number]
        {

            let [matches, value] =  Parsing.tokens_trie_lookup<Date.SegmentFormats>(token, match_trie);
            if (value)
            {
                return [true, matches, value, 0];
            }
            else
            {
                let numbers =   token.symbol.replace(/\D+/g, '');
                let rest =      token.symbol.replace(/[^\D+]/g, '');
                let n_sep: number = 0;
                for (let c of rest)
                    if (separators.indexOf(c) > -1)
                        n_sep++;
                if (numbers.length > 0 && numbers.length+n_sep == token.symbol.length)
                    return [true, [token], Date.SegmentFormats.number, n_sep];
            }
            return [false, new Array<Parsing.Token>(), Date.SegmentFormats.invalid, 0];
        }

        let token_ok:           boolean;
        let seg_tokens:         Array<Parsing.Token>;
        let segment_type:       Date.SegmentFormats;
        let n_sep_:             number;
        
        let matches:            Array<[Parsing.Token, Date.SegmentFormats]> = 
                                            new Array<[Parsing.Token, Date.SegmentFormats]>();

        let last_valid_token:   Parsing.Token;
        let last_valid_n_sep:   number =                0;

        let n_sep:              number =                0;
        let n_seg:              number =                0;
        let formats_found:      Map<Date.SegmentFormats, number> = new Map<Date.SegmentFormats, number>();
        do
        {
            [token_ok, seg_tokens, segment_type, n_sep_] = token_part_of_date(token, this.match_trie);
            n_sep += n_sep_;
            if (n_sep >= max_n_sep)
                break;
            if (token_ok)
            {
                for (let tok of seg_tokens)
                {
                    if (!formats_found.has(segment_type))
                        formats_found.set(segment_type, 1);
                    else
                        formats_found.set(segment_type, formats_found.get(segment_type) + 1);

                    matches.push([tok, segment_type]);
                    
                    n_seg +=            1;
                    token =             tok;
                    last_valid_token =  token;
                    last_valid_n_sep =  n_sep;
                }
            }
            else if (n_seg > 0 && separators.indexOf(token.symbol) > -1)
            {
                token_ok = true;
                matches.push([token, Date.SegmentFormats.separator]);

                if (token.symbol != ' ')
                    n_sep += 1;
            }
            token = token.next;
        } while(token != null && token_ok)
        
        if (n_seg != 0 && n_seg >= last_valid_n_sep && last_valid_n_sep < max_n_sep)
        {
            let only_days = formats_found.has(Date.SegmentFormats.day) &&
                                formats_found.get(Date.SegmentFormats.day) == n_seg;

            let only_numbers = formats_found.has(Date.SegmentFormats.number) &&
                                formats_found.get(Date.SegmentFormats.number) == n_seg;

            let only_units = formats_found.has(Date.SegmentFormats.unit) &&
                                formats_found.get(Date.SegmentFormats.unit) == n_seg;
                
            let only_ordinals = formats_found.has(Date.SegmentFormats.ordinal) &&
                                formats_found.get(Date.SegmentFormats.ordinal) == n_seg;

            let only_numbers_and_units = formats_found.has(Date.SegmentFormats.number) &&
                                            formats_found.has(Date.SegmentFormats.unit) &&
                                            formats_found.get(Date.SegmentFormats.number) +
                                            formats_found.get(Date.SegmentFormats.unit) == n_seg;
            if (!only_numbers_and_units &&
                !only_units && 
                !only_days && 
                !only_ordinals &&
                (!only_numbers || (only_numbers && last_valid_n_sep != 0)))
            {
                if (only_numbers)
                {
                    score =     (n_seg-1 >= last_valid_n_sep ? 0.5 : 0.25);
                    severity =  (n_seg-1 >= last_valid_n_sep ? 0.2 : 0.1);
                }
                else
                {
                    score =     0.5;
                    severity =  0.2;
                }
                
                    
                for (let [match, type] of matches)
                {
                    final_matches.push(match);
                    if (last_valid_token == match)
                        break;
                }

                let [assoc_sum, severity_sum] = Parsing.calc_assoc_severity_sum(
                    final_matches[0],
                    final_matches[final_matches.length-1],
                    this,
                    this.language_model,
                    this.language_model.max_assoc_distance
                );
                score +=    assoc_sum;
                severity += severity_sum;
            }
        }

        return [final_matches, new Parsing.ClassificationScore(
            Math.min(score, 1.0), Math.min(severity, 1.0), this
        )];
    }
    public name: string = 'date';
};
export namespace Date {
    export enum SegmentFormats {
        invalid = 0,
        day,
        month,
        number,
        ordinal,
        unit,
        separator,
    };
};