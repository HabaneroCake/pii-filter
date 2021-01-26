import { exit } from 'process';
import * as readline from 'readline';
import * as pii_filter from '../pii-filter';
import * as col from './lazy-colors';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const pf = pii_filter.make_filter('nl');

function ask_classify()
{
    rl.question('> ', (answer) => {
        if (answer.length == 0 || answer.toLowerCase() == 'exit')
            exit(0);
        console.log('');
        let res = pf.classify(answer);
        let str_res = res.render_replaced(
            (pii: pii_filter.PII): string =>
        {
            return `${col.BgRed}${col.FgWhite}${pii.value}${col.Reset}`;
        });
        console.log(str_res);
        console.log('');
        let str_placeholders = res.render_replaced(
            (pii: pii_filter.PII): string =>
        {
            return `${col.BgGreen}${col.FgBlack}{${pii.type}}${col.Reset}`;
        });
        console.log(str_placeholders);
        console.log('');
        // pii_filter.classify(answer).render_placeholders()

        // console.log(`=> ${}`);

        ask_classify();
    });
}

ask_classify();