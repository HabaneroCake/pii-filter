import * as readline from 'readline';
import { PIIFilter, Languages } from '../pii-filter';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let exit: boolean = false;
let pii_filter = new PIIFilter(new Languages.NL());

function ask_classify()
{
    rl.question('> ', (answer) => {
        if (answer.length == 0 || answer.toLowerCase() == 'exit')
            exit = true;
        
        pii_filter.classify(answer);

        if (!exit)
            ask_classify();
    });
}

ask_classify();