import { Parsing } from './parsing';
import { Language } from './language-interface';

export class PIIFilter
{
    //------------------------------------------------------------------------------------------------------------------
    /**
     * 
     * @param language_model the language model
     * @param verbosity verbosity level
     */
    constructor(
        private language_model: Language,
        private verbosity: number = 2
    )
    {

    }

    public classify(text: string)
    {
        const num_passes: number = 2;
        let tokenizer = new Parsing.Tokenizer(text, this.language_model);

        // 0: dictionary pass
        {
            if (this.verbosity > 0) console.log('dictionary pass');
            let index = 0;
            while (index < tokenizer.tokens.length)
            {
                let token = tokenizer.tokens[index];
                let [tokens_dict, score_dict] = this.language_model.dictionary.classify_confidence(token, 0);
                
                // add score to results
                score_dict.group_root_start =   tokens_dict[0];
                score_dict.group_root_end =     tokens_dict[tokens_dict.length-1];
                // add score to matched tokens
                for (let r_token of tokens_dict)
                {
                    r_token.confidence_dictionary = score_dict;
                    index = r_token.index;
                }
                
                index++;
            }
        }

        // 1: associative pass
        if (this.verbosity > 0) console.log('associative pass');
        for (let classifier of this.language_model.classifiers)
        {
            let index = 0;
            while (index < tokenizer.tokens.length)
            {
                let token = tokenizer.tokens[index];
                let [tokens_assoc, score_assoc] = classifier.classify_associative(token);
                if (score_assoc.valid)
                {
                    // add score to results
                    score_assoc.group_root_start = tokens_assoc[0];
                    score_assoc.group_root_end =   tokens_assoc[tokens_assoc.length-1];
                    // add score to matched tokens
                    for (let r_token of tokens_assoc)
                    {
                        r_token.confidences_associative.set(classifier, score_assoc);
                        index = r_token.index;
                    }
                }
                index++;
            }
        }

        for (let pass_index = 0; pass_index < num_passes; ++pass_index)
        {
            if (this.verbosity > 0) console.log(`pass index ${pass_index}`);
            // 2: add pass container
            for (let token of tokenizer.tokens)
                token.confidences_classification.push(new Parsing.Confidences());
            // 3: classification pass
            for (let classifier of this.language_model.classifiers)
            {
                let index = 0;
                while (index < tokenizer.tokens.length)
                {
                    let token = tokenizer.tokens[index];
                    let [tokens_conf, score_conf] = classifier.classify_confidence(token, pass_index);
                    if (score_conf.valid)
                    {
                        // add score to results
                        score_conf.group_root_start =   tokens_conf[0];
                        score_conf.group_root_end =     tokens_conf[tokens_conf.length-1];
                        // add score to matched tokens
                        for (let r_token of tokens_conf)
                        {
                            r_token.confidences_classification[pass_index].add(score_conf);
                            index = r_token.index;
                        }
                    }
                    index++;
                }
            }
        }
        for (let token of tokenizer.tokens)
        {
            console.log(`[${token.index}] Token: \"${token.symbol}\"`);
            if (token.confidence_dictionary)
                console.log(`- dict score: ${token.confidence_dictionary.score}, root: [${token.confidence_dictionary.group_root_start.index}, ${token.confidence_dictionary.group_root_end.index}]`);
            for (let assoc of token.confidences_associative.values())
            {
                console.log(`  assoc: ${assoc.classifier.name}, score: ${assoc.score}, root: [${assoc.group_root_start.index}, ${assoc.group_root_end.index}]`);
            }
            for (let conf of token.confidences_classification[token.confidences_classification.length-1].all)
            {
                console.log(`   ++conf: ${conf.classifier.name}, score: ${conf.score}, root: [${conf.group_root_start.index}, ${conf.group_root_end.index}]`);
            }
        }
        // console.log(tokenizer.tokens);
    }
};