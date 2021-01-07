import { Language } from './language-interface';
import { Trie } from './trie';

export namespace Parsing
{
    export abstract class Classifier
    {
        protected language_model: Language;
        public init(language_model: Language)
        {
            this.language_model = language_model;
        }
        public abstract classify_associative(token: Token): [Array<Token>, AssociationScore];
        public abstract classify_confidence(token: Token, pass_index: number): [Array<Token>, ClassificationScore];
        public abstract name: string;
    };
    export class Classification
    {
        // in case of multi word matching
        public group_root_start:    Token =     null;
        public group_root_end:      Token =     null;
        /**
         * 
         * @param classifier the classifier which was used
         */
        constructor(
            public classifier:  Parsing.Classifier
        ) {}

        public get valid(): boolean {return this.classifier != null;}
    };
    export class ClassificationScore extends Classification
    {
        constructor(
            public score:       number,
            classifier:         Parsing.Classifier
        ) { super(classifier); }
    };
    class AssociativeScore
    {
        constructor(
            public left_max:    number,
            public right_max:   number,
            public score:       number
        ){}
    };
    export class AssociationScore extends ClassificationScore
    {
        constructor(
            public associative_score:   AssociativeScore, // global
            score:                      number, // can be adjusted
            classifier:                 Parsing.Classifier
        ) { super(score, classifier); }
    };
    export class Confidences
    {
        private confidences: Array<ClassificationScore> = new Array<ClassificationScore>();
        public add(classification_score: ClassificationScore)
        {
            let confidence_with_same_classifier: ClassificationScore = null;
            for (let conf of this.confidences)
            {
                if (conf.classifier == classification_score.classifier)
                {
                    confidence_with_same_classifier = conf;
                    break;
                }
            }
            if (confidence_with_same_classifier != null)
            {
                confidence_with_same_classifier.score =             classification_score.score;
                confidence_with_same_classifier.group_root_start =  classification_score.group_root_start;
                confidence_with_same_classifier.group_root_end =    classification_score.group_root_end;
            }
            else
                this.confidences.push(classification_score);
            // sort descending
            this.confidences = this.confidences.sort((i1, i2) => i2.score - i1.score);
        }
        public get max(): ClassificationScore
        {
            if (this.confidences.length)
                return this.confidences[0];
            return new ClassificationScore(0, null);
        }
        public get all(): ReadonlyArray<ClassificationScore>
        {
            return this.confidences;
        }
    };
    export class Token
    {
        public previous:    Token;
        public next:        Token;
        // stores passes
        public confidence_dictionary:       ClassificationScore;
        public confidences_associative:     Map<Classifier, AssociationScore> = new Map<Classifier, AssociationScore>();
        public confidences_classification:  Array<Confidences> =                new Array<Confidences>();
        constructor(
            public symbol:      string,
            public index:       number
        ) {}
    };
    export class Tokenizer
    {
        public tokens:                      Array<Token> =  new Array<Token>();
        

        /**
         * creates a linked list of tokens from input text
         * @param text input text
         * @param lang the input language
         */
        constructor(
            text: string,
            lang: Language
        )
        {
            let string_tokens = text.split(lang.punctuation);
            let index: number = 0;
            let l_tok: Token =  null; 
            for (let token of string_tokens)
            {
                if (token.length == 0)
                    continue;

                let c_tok = new Token(token, index);

                if (l_tok != null)
                    l_tok.next = c_tok;

                c_tok.previous = l_tok;
                this.tokens.push(c_tok);

                l_tok = c_tok;
                index++;
            }
        }
    };
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
                symbol = last_symbol + wildcard
                trie.matched_node(symbol);
            }
            if (matched_node != null)
            {
                matches.push(token_iter);
                if (matched_node.end)
                {
                    end_token = token_iter;
                    end_value = matched_node.end;
                }

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

    function count_str_tokens(
        start_token:        Token,
        end_token:          Token,
        punctuation_map:    Map<string, number>
    ): number
    {
        let n_tokens: number = 0;

        while (start_token != null)
        {
            if (!punctuation_map.has(start_token.symbol))
                n_tokens++;
            if (start_token.index == end_token.index)
                break;
            start_token = start_token.next;
        }

        return n_tokens;
    }
    /**
     * sums the associative scores for a classifier, taking into account punctuation distance
     * @param left_it left iterator token for the midpoint
     * @param right_it right iterator token for the midpoint
     * @param classifier classifier to match
     * @param language_model language_model to use
     * @param max_steps number of steps to stop after
     */
    export function calc_assoc_sum(
        left_it: Token,
        right_it: Token,
        classifier: Parsing.Classifier,
        language_model: Language,
        max_steps: number
    )
    {
        // TODO make sure not to add score of token list it is part of / overlaps with
        // TODO should this have a not recognizer?
        let associative_sum:    number =    0.0;
        // TODO: should these only count word tokens such as currently
        let left_distance:      number =    0;
        let right_distance:     number =    0;
        let left_it_scalar:     number =    1.0;
        let right_it_scalar:    number =    1.0;
        // TODO deduplicate
        if (left_it)
        {
            if (left_it.confidences_associative.has(classifier))
            {
                let score: AssociationScore = left_it.confidences_associative.get(classifier);
                left_distance += count_str_tokens(
                    score.group_root_start,
                    left_it,
                    language_model.punctuation_map
                );
                left_it = score.group_root_start.previous;
            }
        }
        if (right_it)
        {
            if (right_it.confidences_associative.has(classifier))
            {
                let score: AssociationScore = right_it.confidences_associative.get(classifier);
                left_distance += count_str_tokens(
                    right_it,
                    score.group_root_end,
                    language_model.punctuation_map
                );
                right_it = score.group_root_end.next;
            }
        }
        for (let step = 0; step < max_steps; ++step)
        {
            if (left_it)
            {
                if (language_model.punctuation_map.has(left_it.symbol))
                    left_it_scalar *= language_model.punctuation_map.get(left_it.symbol);
                else
                    left_distance += 1;
                
                if (left_it.confidences_associative.has(classifier))
                {
                    let assoc = left_it.confidences_associative.get(classifier);
                    if (left_distance <= assoc.associative_score.left_max)
                    {
                        associative_sum += assoc.score * left_it_scalar;
                        left_distance += count_str_tokens(
                            assoc.group_root_start,
                            assoc.group_root_end,
                            language_model.punctuation_map
                        )
                        left_it = assoc.group_root_start;
                    }
                }
                left_it = left_it.previous;
            }
            if (right_it)
            {
                if (language_model.punctuation_map.has(right_it.symbol))
                    right_it_scalar *= language_model.punctuation_map.get(right_it.symbol);
                else
                    right_distance += 1;


                if (right_it.confidences_associative.has(classifier))
                {
                    let assoc = right_it.confidences_associative.get(classifier);
                    if (right_distance <= assoc.associative_score.right_max)
                    {
                        associative_sum += assoc.score * right_it_scalar;
                        right_distance += count_str_tokens(
                            assoc.group_root_start,
                            assoc.group_root_end,
                            language_model.punctuation_map
                        )
                        right_it = assoc.group_root_end;
                    }
                }
                right_it = right_it.next;
            }
            if (!left_it && !right_it)
                break;
        }
        return associative_sum;
    }

    export abstract class SimpleTextClassifier extends Parsing.Classifier
    {
        protected association_trie: Trie<AssociativeScore> =    new Trie();
        protected main_trie:        Trie<boolean> =             new Trie();
        // assoc pii 3
        // then classify again

        constructor(protected dataset: object)
        {
            super();

            // add association multipliers to trie
            if ('association_multipliers' in this.dataset && this.dataset['association_multipliers'].length > 0)
            {
                for (const [word, [left_max, right_max, score]] of this.dataset['association_multipliers'] as
                        Array<[string, [number, number, number]]>)
                    this.association_trie.insert(word, new AssociativeScore(left_max, right_max, score));
            }
            // add main word list to trie
            if ('main' in this.dataset && this.dataset['main'].length > 0)
                this.main_trie.add_list(this.dataset['main'], true)
        }
        public classify_associative(token: Parsing.Token): [Array<Token>, AssociationScore]
        {
            let [matches, value] = tokens_trie_lookup<AssociativeScore>(token, this.association_trie);
            if (value)
            {
                return [matches, new AssociationScore(
                    value, value.score, this
                )];
            }
            else
                return [matches, new AssociationScore(
                    null, 0.0, this
                )];
        }
        public classify_confidence(token: Parsing.Token, pass_index: number): [Array<Token>, ClassificationScore]
        {
            let [matches, value] = tokens_trie_lookup<boolean>(token, this.main_trie);

            if (value)
            {
                let assoc_sum = 0.0;
                if (pass_index > 0)
                {
                    // check for associative multipliers
                    let left_it:    Token = matches[0];
                    let right_it:   Token = matches[matches.length-1];

                    assoc_sum = calc_assoc_sum(
                        left_it,
                        right_it,
                        this,
                        this.language_model,
                        20
                    );
                }
                return [matches, new ClassificationScore(
                    Math.min(0.25 + assoc_sum, 1.0), this
                )];
            }
            else
                return [matches, new ClassificationScore(
                    0.0, this
                )];
        }
        public abstract name: string;
    };

    export abstract class SimpleDictionary extends Parsing.Classifier
    {
        protected main_trie:        Trie<number> =      new Trie();

        constructor(protected dataset: object)
        {
            super();
            // add main word list to trie
            if ('main' in this.dataset && this.dataset['main'].length > 0)
                this.main_trie.add_list(this.dataset['main'], 0.5)
            // add popular word list to trie (overwrites previous score if it exists)
            if ('pop' in this.dataset && this.dataset['pop'].length > 0)
                this.main_trie.add_list(this.dataset['pop'], 0.75)
        }
        public classify_associative(token: Parsing.Token): [Array<Token>, AssociationScore]
        {
            return [new Array<Token>(), new AssociationScore(
                null, 0.0, this
            )];
        }
        public classify_confidence(token: Parsing.Token, pass_index: number): [Array<Token>, ClassificationScore]
        {
            let [matches, value] = tokens_trie_lookup<number>(token, this.main_trie);

            if (value)
            {
                return [matches, new ClassificationScore(
                    value, this
                )];
            }
            else
                return [matches, new ClassificationScore(
                    0.0, this
                )];
        }
        public abstract name: string;
    };

    export abstract class SimpleNameClassifier extends Parsing.SimpleTextClassifier
    {
        constructor(dataset: object) { super(dataset); }
        public classify_confidence(token: Parsing.Token, pass_index: number): 
            [Array<Parsing.Token>, Parsing.ClassificationScore]
        {
            let [tokens, score] = super.classify_confidence(token, pass_index);
            if (tokens.length > 0 && pass_index > 0)
            {
                // // adjust score if in dictionary
                // if (tokens[0].confidence_dictionary)
                //     score.score *= 0.5;
                // adjust score to capitalization
                let any_uppercase: boolean = false;
                for (let r_token of tokens)
                {
                    let first_letter = r_token.symbol[0];
                    let first_uppercase = first_letter == first_letter.toUpperCase();
                    // TODO: could check for rest/most lowercase
                    any_uppercase ||= first_uppercase;
                }
                
                if (any_uppercase)
                {
                    // adjust score to punctuation proximity
                    let left_token = tokens[0];
                    while (left_token.previous != null && left_token.previous.symbol == ' ')
                        left_token = left_token.previous;

                    if (left_token.previous == null ||
                        (this.language_model.punctuation_map.has(left_token.previous.symbol) &&
                        this.language_model.punctuation_map.get(left_token.previous.symbol) <= 0.5))
                    {
                        score.score += 0.125;
                    }
                    else
                        score.score += 0.25;
                }
            }
            score.score = Math.min(score.score, 1.0);
            return [tokens, score];
        }
        public abstract name: string;
    };
};