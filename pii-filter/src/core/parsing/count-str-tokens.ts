import { IToken } from '../interfaces/parsing/tokens';

export function count_str_tokens(
    start_token:        IToken,
    end_token:          IToken,
    punctuation_map:    Map<string, number>
): number
{
    let n_tokens: number = 0;

    while (start_token != null)
    {
        if (start_token.index == end_token.index)
            break;
        if (!punctuation_map.has(start_token.symbol))
            n_tokens++;
        start_token = start_token.next;
    }

    return n_tokens;
}