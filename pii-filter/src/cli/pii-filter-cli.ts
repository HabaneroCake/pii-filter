import * as readline from 'readline';
import { PIIFilter, NL } from '../pii-filter';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let exit: boolean = false;
let pii_filter = new PIIFilter(new NL());

function ask_classify()
{
    rl.question('> ', (answer) => {
        if (answer.length == 0 || answer.toLowerCase() == 'exit')
            exit = true;
        
        pii_filter.classify(answer).print_debug();

        if (!exit)
            ask_classify();
    });
}

ask_classify();