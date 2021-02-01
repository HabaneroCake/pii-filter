import { exit } from 'process';

import * as readline from 'readline';
import * as col from './lazy-colors';
import * as pf from '../../../pii-filter';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const pii_filter = pf.make_pii_classifier(pf.languages.nl.make_lm());

function ask_classify()
{
    rl.question('> ', (answer) => {
        if (answer.length == 0 || answer.toLowerCase() == 'exit')
            exit(0);
        console.log('');
        let res = pii_filter.classify(answer);
        let str_res = res.render_replaced(
            (pii: pf.PIIClassification): string =>
        {
            return `${col.BgRed}${col.FgWhite}${pii.value}${col.Reset}`;
        });
        console.log(str_res);
        console.log('');
        let str_placeholders = res.render_replaced(
            (pii: pf.PIIClassification): string =>
        {
            return `${col.BgGreen}${col.FgBlack}{${pii.type}}${col.Reset}`;
        });
        console.log(str_placeholders);
        console.log('');
        ask_classify();
    });
}

ask_classify();