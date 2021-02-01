import { Token } from '../interfaces/parsing/tokens';
import { CoreClassification } from './classification';

/**
 * Converts a classification group into a string.
 * @private
 * @param classification the classification to convert
 */
export function classification_group_string(classification: CoreClassification)
{
    let text:   string = '';
    let token:  Token = classification.group_root_start;
    
    do {
        text += token.symbol;
        if (token.index == classification.group_root_end.index)
            break;
        token = token.next;
    } while(token != null)

    return text;
}