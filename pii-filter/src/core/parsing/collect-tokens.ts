import { IToken } from "../interfaces/parsing/tokens";

export function collect_tokens(
    start_token: IToken,
    validate_token: (token: IToken, deferred_matches: Array<IToken>) => collect_tokens.Control
): [boolean, [IToken, IToken, Array<IToken>]]
{
    let is_match:           boolean =       false;
    let end_token:          IToken =        start_token;
    let final_deferred:     Array<IToken> = new Array<IToken>();
    let final_matches:      Array<IToken> = new Array<IToken>();
    // temporary values
    let deferred_matches:   Array<IToken> = new Array<IToken>();
    let t_it:               IToken =        start_token;

    while (t_it != null)
    {
        let result: collect_tokens.Control = validate_token(t_it, deferred_matches);
        if (result == collect_tokens.Control.MATCH ||
            result == collect_tokens.Control.MATCH_AND_CONTINUE ||
            result == collect_tokens.Control.VALID)
        {
            for (let t of deferred_matches)
                final_deferred.push(t);
            final_deferred.push(t_it);

            if (result == collect_tokens.Control.MATCH ||
                result == collect_tokens.Control.MATCH_AND_CONTINUE)
            {
                end_token = t_it;
                
                is_match = true;
                for (let t of final_deferred)
                    final_matches.push(t);

                if (result == collect_tokens.Control.MATCH_AND_CONTINUE)
                    final_deferred = new Array<IToken>();
                else if (result == collect_tokens.Control.MATCH)
                    break;
            }
            deferred_matches = new Array<IToken>();
        }
        else if (result == collect_tokens.Control.DEFER_VALID)
        {
            deferred_matches.push(t_it);
        }
        else if (collect_tokens.Control.INVALID)
        {
            break;
        }
        t_it = t_it.next;
    }
    // TODO: is final_deferred useful information?
    return [
        is_match,
        [
            start_token,
            end_token,
            final_matches
        ]
    ];
}
export namespace collect_tokens
{
    export enum Control
    {
        MATCH,
        MATCH_AND_CONTINUE,
        VALID,
        DEFER_VALID,
        INVALID
    };
};