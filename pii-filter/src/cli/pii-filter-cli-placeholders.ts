import { exit } from 'process';
import * as readline from 'readline';
import * as col from './lazy-colors';

import {PIIFilter, Languages, PII} from '../pii-filter';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const pii_filter = new PIIFilter(new Languages.NL());

function ask_classify()
{
    rl.question('> ', (answer) => {
        if (answer.length == 0 || answer.toLowerCase() == 'exit')
            exit(0);
        console.log('');
        let res = pii_filter.classify(answer);
        let str_res = res.render_replaced(
            (pii: PII): string =>
        {
            return `${col.BgRed}${col.FgWhite}${pii.value}${col.Reset}`;
        });
        console.log(str_res);
        console.log('');
        let str_placeholders = res.render_replaced(
            (pii: PII): string =>
        {
            return `${col.BgGreen}${col.FgBlack}{${pii.type}}${col.Reset}`;
        });
        console.log(str_placeholders);
        console.log('');
        ask_classify();
    });
}

ask_classify();