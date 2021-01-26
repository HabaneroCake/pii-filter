import { IToken } from '../interfaces/parsing/tokens';
import { Classification } from './classification';
export function classification_group_string(classification: Classification)
{
    let text:   string = '';
    let token:  IToken = classification.group_root_start;
    
    do {
        text += token.symbol;
        if (token.index == classification.group_root_end.index)
            break;
        token = token.next;
    } while(token != null)

    return text;
}