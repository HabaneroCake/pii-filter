import { exit } from 'process';
import * as readline from 'readline';
import { IClassificationScore } from '../core/interfaces/parsing/classification';
import { ITokenizer } from '../core/interfaces/parsing/tokens';
import { PIIFilter, NL } from '../pii-filter';
import { BgGreen, BgRed, FgBlack, FgWhite, Reset } from './lazy-colors';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let pii_filter = new PIIFilter(new NL());

function ask_classify()
{
    rl.question('> ', (answer) => {
        if (answer.length == 0 || answer.toLowerCase() == 'exit')
            exit(0);
        console.log('');
        let result = pii_filter.classify(answer);
        
        let str_res = result.render_replaced(
            (classification: IClassificationScore, text: string): string =>
        {
            let str: string = text;
            // this func needs the full text instead?
            if (classification.valid())
            {
                // classification.severity
                str = `${BgRed}${FgWhite}${str}${Reset}`;
            }

            return str;
        });
        console.log(str_res);
        console.log('');
        let str_placeholders = result.render_replaced(
            (classification: IClassificationScore, text: string): string =>
        {
            let str: string = text;
            // this func needs the full text instead?
            if (classification.valid())
            {
                // classification.severity
                str = `${BgGreen}${FgBlack}{${classification.classifier.name}}${Reset}`;
            }

            return str;
        });
        console.log(str_placeholders);
        console.log('');
        // pii_filter.classify(answer).render_placeholders()

        // console.log(`=> ${}`);

        ask_classify();
    });
}

ask_classify();