import { Token } from "../interfaces/parsing/tokens";

/**
 * Iterates over tokens and collects tokens based on {@link collect_tokens.Control} returns.
 * @private
 * @param start_token the token to start with
 * @param validate_token the function which is called for each token to validate the token and decide control-flow
 */
export function collect_tokens(
    start_token: Token,
    validate_token: (token: Token, deferred_matches: Array<Token>) => collect_tokens.Control
): [boolean, [Token, Token, Array<Token>]]
{
    let is_match:           boolean =       false;
    let end_token:          Token =        start_token;
    let final_deferred:     Array<Token> = new Array<Token>();
    let final_matches:      Array<Token> = new Array<Token>();
    // temporary values
    let deferred_matches:   Array<Token> = new Array<Token>();
    let t_it:               Token =        start_token;

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
                    final_deferred = new Array<Token>();
                else if (result == collect_tokens.Control.MATCH)
                    break;
            }
            deferred_matches = new Array<Token>();
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
    return [
        is_match,
        [
            start_token,
            end_token,
            final_matches
        ]
    ];
}
/**
 * @private
 */
export namespace collect_tokens
{
    /**
     * The control-flow states.
     * @private
     */
    export enum Control
    {
        MATCH,
        MATCH_AND_CONTINUE,
        VALID,
        DEFER_VALID,
        INVALID
    };
};