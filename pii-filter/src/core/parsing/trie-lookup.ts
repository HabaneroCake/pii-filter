import { Token } from './token';
import { Trie } from '../structures/trie';

/**
 * Attempts to (full-)match as many tokens to a trie as possible
 * @param token a token (linked to its neighbors), with a string symbol
 * @param trie a trie to look the token symbol up in
 */
export function tokens_trie_lookup<T>(token: Token, trie: Trie<T>): [Array<Token>, T]
{
    const wildcard:     string =                '*';
    let token_iter:     Token =                 token;
    let matched_node:   Trie.Branch<T> =        null;
    let matches:        Array<Token> =          new Array<Token>();
    let last_symbol:    string =                null;
    let symbol:         string =                token.symbol.toLowerCase();
    let end_token:      Token =                 null;
    let end_value:      T =                     null;
    let final_matches:  Array<Token> =          new Array<Token>();

    if (token.symbol == wildcard)
        return [final_matches, end_value];

    // TODO: partial matches, currently only does full matches
    do {
        matched_node =          trie.matched_node(symbol);
        // check for wildcard
        if (matched_node == null && last_symbol != null)
        {
            symbol =        last_symbol + wildcard;
            matched_node =  trie.matched_node(symbol);
        }
        // check for match
        if (matched_node != null)
        {
            matches.push(token_iter);
            // store last full match
            if (matched_node.end)
            {
                end_token = token_iter;
                end_value = matched_node.end;
            }
            // check for extended match
            if (token_iter.next != null)
            {
                last_symbol =       symbol;
                token_iter =        token_iter.next;
                symbol +=           token_iter.symbol.toLowerCase();
            }
            else
                break;
        }
    } while(matched_node != null)

    // full match was found
    if (end_token)
    {
        for (let match of matches)
        {
            final_matches.push(match);
            if (end_token == match)
                break;
        }
    }
    return [final_matches, end_value];
}