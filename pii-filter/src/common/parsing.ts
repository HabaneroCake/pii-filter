import { Language } from './language-interface';
import { Trie } from './trie';

export namespace Parsing
{
    export class Thresholds
    {
        constructor(
            public well_formed: Thresholds.Group,
            public ill_formed: Thresholds.Group
        ) {};

        public validate(classification: ClassificationScore, well_formed: boolean = true): boolean
        {
            let classification_exceeds_dict_match: boolean = 
                (classification.valid() &&
                classification.group_root_start != null && 
                classification.group_root_end != null) &&
                    (classification.group_root_start.confidence_dictionary == null ||
                    (classification.score > classification.group_root_start.confidence_dictionary.score ||
                        classification.group_root_end.index >
                        classification.group_root_start.confidence_dictionary.group_root_end.index));

            let active_config: Thresholds.Group = well_formed? this.well_formed : this.ill_formed;

            return classification_exceeds_dict_match &&
                    classification.score > active_config.min_classification_score &&
                    classification.severity > active_config.min_severity_score;
        }
    };
    export namespace Thresholds
    {
        export class Group
        {
            constructor(
                public min_classification_score: number =   0,
                public min_severity_score: number =         0
            ) {};
        }
    };

    export abstract class Classifier
    {
        public associative_references: Array<[Parsing.Classifier, AssociativeScore]> = 
                                                new Array<[Parsing.Classifier, AssociativeScore]>();

        protected language_model: Language;
        public init(language_model: Language)
        {
            this.language_model = language_model;
            this.bind_language_model(this.language_model);
        }
        
        public abstract bind_language_model(language_model: Language): void;
        public abstract classify_associative(token: Token): [Array<Token>, AssociationScore];
        public abstract classify_confidence(token: Token): [Array<Token>, ClassificationScore];
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

        public valid(): boolean { return this.classifier != null; }
    };
    export class ClassificationScore extends Classification
    {
        constructor(
            public score:       number,
            public severity:    number,
            classifier:         Parsing.Classifier
        ) { super(classifier); }
    };
    class AssociativeScore
    {
        constructor(
            public left_max:    number,
            public right_max:   number,
            public score:       number,
            public severity:    number
        ){}
    };
    export class AssociationScore extends ClassificationScore
    {
        constructor(
            public associative_score:   AssociativeScore, // global
            score:                      number, // can be adjusted
            severity:                   number, // can be adjusted
            classifier:                 Parsing.Classifier
        ) { super(score, severity, classifier); }

        public valid_from_left(distance_from_left: number, n_phrase_endings: number): boolean
        {
            return (this.associative_score.left_max == -1 && n_phrase_endings == 0) || 
                    (this.associative_score.left_max > 0 && distance_from_left <= this.associative_score.left_max);
        }
        public valid_from_right(distance_from_right: number, n_phrase_endings: number): boolean
        {
            return (this.associative_score.right_max == -1 && n_phrase_endings == 0) || 
                    (this.associative_score.right_max > 0 && distance_from_right <= this.associative_score.right_max);
        }
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
            return new ClassificationScore(0, 0, null);
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
                symbol =        last_symbol + wildcard;
                matched_node =  trie.matched_node(symbol);
            }
            // check for match
            if (matched_node != null)
            {
                matches.push(token_iter);
                // store last full match
                if (matched_node.end)
                {
                    end_token = token_iter;
                    end_value = matched_node.end;
                }
                // check for extended match
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

        // full match was found
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
            if (start_token.index == end_token.index)
                break;
            if (!punctuation_map.has(start_token.symbol))
                n_tokens++;
            start_token = start_token.next;
        }

        return n_tokens;
    }
    /**
     * sums the associative / severity scores for a classifier, taking into account punctuation distance
     * @param left_it left iterator token for the midpoint
     * @param right_it right iterator token for the midpoint
     * @param classifier classifier to match
     * @param language_model language_model to use
     * @param max_steps number of steps to stop after
     */
    export function calc_assoc_severity_sum(
        left_it: Token,
        right_it: Token,
        classifier: Parsing.Classifier,
        language_model: Language,
        max_steps: number
    ): [number, number]
    {
        // TODO should this have a not recognizer?
        class DistanceIterator 
        {
            public associative_sum: number =    0.0;
            public severity_sum:    number =    0.0;
            public distance:        number =    0;
            public phrase_ends:     number =    0;
            public scalar:          number =    1.0;

            constructor(
                public it: Token,
                public language_model: Language,
                public iterate: (iterator: Token) => Token,
                public group_root_getter: (score: AssociationScore) => Token,
                public check_valid: (score: AssociationScore, self: DistanceIterator) => boolean
                
            )
            {
                if (this.it != null)
                {
                    // move iterator past current associative marker if it exists
                    if (this.it.confidences_associative.has(classifier) && this.it.next)
                    {
                        let score:          AssociationScore =  this.it.confidences_associative.get(classifier);
                        let group_root:     Token =             this.group_root_getter(score);
                        
                        let [l_it, r_it] = (this.it.index < group_root.index) ? 
                                        [this.it, group_root] : [group_root, this.it];

                        this.distance += count_str_tokens(
                            l_it,
                            r_it,
                            this.language_model.punctuation_map
                        );
                        this.it = this.iterate(this.group_root_getter(score));
                    }
                    else
                        this.it = this.iterate(this.it);
                }
            }

            public next(): boolean
            {
                if (this.it)
                {
                    if (this.language_model.punctuation_map.has(this.it.symbol))
                    {
                        if (this.it.symbol == '.')
                            this.phrase_ends++;
                            
                        this.scalar *= this.language_model.punctuation_map.get(this.it.symbol);
                    }
                    else
                        this.distance += 1;

                    // NOTE: some symbols split up text into more than 1 token
                    // TODO: tokens are only counted as distance once a ' ' is encountered as well


                    if (this.it.confidences_associative.has(classifier))
                    {
                        let assoc = this.it.confidences_associative.get(classifier);
                        if (this.check_valid(assoc, this))
                        {
                            this.associative_sum +=  assoc.score *       this.scalar;
                            this.severity_sum +=     assoc.severity *    this.scalar;
                            
                            this.distance += count_str_tokens(
                                assoc.group_root_start,
                                assoc.group_root_end,
                                this.language_model.punctuation_map
                            )
                            this.it = this.group_root_getter(assoc);
                        }
                    }
                    this.it = this.iterate(this.it);

                    return true;
                }

                return false;
            }
        };

        let left_distance_iterator =    new DistanceIterator(
            left_it,
            language_model,
            (it: Token): Token => { return it.previous; },
            (score: AssociationScore): Token => { return score.group_root_start; },
            (score: AssociationScore, self: DistanceIterator) => { 
                return score.valid_from_right(self.distance, self.phrase_ends);
            }
        );
        let right_distance_iterator =   new DistanceIterator(
            right_it,
            language_model,
            (it: Token): Token => { return it.next; },
            (score: AssociationScore): Token => { return score.group_root_end; },
            (score: AssociationScore, self: DistanceIterator) => { 
                return score.valid_from_left(self.distance, self.phrase_ends);
            }
        );
        
        for (let step = 0; step < max_steps; ++step)
        {
            if (!left_distance_iterator.next() && !right_distance_iterator.next())
                break;
        }
        return [
            left_distance_iterator.associative_sum + right_distance_iterator.associative_sum,
            left_distance_iterator.severity_sum + right_distance_iterator.severity_sum];
    }

    export abstract class SimpleAssociativeClassifier extends Parsing.Classifier
    {
        protected association_trie: Trie<AssociativeScore> =    new Trie();
        constructor(protected dataset: object)
        {
            super();

            // add association multipliers to trie
            if ('association_multipliers' in this.dataset && this.dataset['association_multipliers'].length > 0)
            {
                for (const [word, [left_max, right_max, score, severity]] of this.dataset['association_multipliers'] as
                        Array<[string, [number, number, number, number]]>)
                    this.association_trie.insert(word, new AssociativeScore(left_max, right_max, score, severity));
            }
        }
        public bind_language_model(language_model: Language): void
        {
            if ('pii_association_multipliers' in this.dataset && this.dataset['pii_association_multipliers'].length > 0)
            {
                for (const [name, [left_max, right_max, score, severity]] 
                        of this.dataset['pii_association_multipliers'] as
                            Array<[string, [number, number, number, number]]>)
                {
                    for (let classifier of language_model.classifiers)
                    {
                        if (classifier.name == name)
                        {
                            classifier.associative_references.push([
                                this,
                                new AssociativeScore(left_max, right_max, score, severity)
                            ]);
                            break;
                        }
                    }
                }
            }
        }
        public classify_associative(token: Parsing.Token): [Array<Token>, AssociationScore]
        {
            let [matches, value] = tokens_trie_lookup<AssociativeScore>(token, this.association_trie);
            if (value)
            {
                return [matches, new AssociationScore(
                    value, value.score, value.severity, this
                )];
            }
            else
                return [matches, new AssociationScore(
                    null, 0.0, 0.0, this
                )];
        }
    }

    export abstract class SimpleTextClassifier extends SimpleAssociativeClassifier
    {
        protected main_trie:        Trie<boolean> =             new Trie();
        // assoc pii 3
        // then classify again

        constructor(
            protected dataset: object,
            protected classification_score_base: number,
            protected severity_score_base: number,
        )
        {
            super(dataset);
            // add main word list to trie
            if ('main' in this.dataset && this.dataset['main'].length > 0)
                this.main_trie.add_list(this.dataset['main'], true)
        }
        public classify_confidence(token: Parsing.Token): [Array<Token>, ClassificationScore]
        {
            let [matches, value] = tokens_trie_lookup<boolean>(token, this.main_trie);

            if (value)
            {
                // check for associative multipliers
                let left_it:    Token = matches[0];
                let right_it:   Token = matches[matches.length-1];

                let [assoc_sum, severity_sum] = calc_assoc_severity_sum(
                    left_it,
                    right_it,
                    this,
                    this.language_model,
                    20
                );

                return [matches, new ClassificationScore(
                    Math.min(this.classification_score_base + assoc_sum, 1.0), 
                    Math.min(this.severity_score_base + severity_sum, 1.0), 
                    this
                )];
            }
            else
                return [matches, new ClassificationScore(
                    0.0, 0.0, this
                )];
        }
        public abstract name: string;
    };

    export abstract class SimpleDictionary extends Parsing.Classifier
    {
        protected main_trie:        Trie<number> =      new Trie();

        constructor(
            protected dataset: object,
            general_word_score: number,
            popular_word_score: number
        )
        {
            super();
            // add main word list to trie
            if ('main' in this.dataset && this.dataset['main'].length > 0)
                this.main_trie.add_list(this.dataset['main'], general_word_score)
            // add popular word list to trie (overwrites previous score if it exists)
            if ('pop' in this.dataset && this.dataset['pop'].length > 0)
                this.main_trie.add_list(this.dataset['pop'], popular_word_score)
        }
        public classify_associative(token: Parsing.Token): [Array<Token>, AssociationScore]
        {
            return [new Array<Token>(), new AssociationScore(
                null, 0.0, 0.0, this
            )];
        }
        public bind_language_model(language_model: Language): void {}
        public classify_confidence(token: Parsing.Token): [Array<Token>, ClassificationScore]
        {
            let [matches, value] = tokens_trie_lookup<number>(token, this.main_trie);

            if (value)
            {
                return [matches, new ClassificationScore(
                    value, 0.0, this
                )];
            }
            else
                return [matches, new ClassificationScore(
                    0.0, 0.0, this
                )];
        }
        public abstract name: string;
    };

    export abstract class SimpleNameClassifier extends Parsing.SimpleTextClassifier
    {
        constructor(
            dataset: object,
            classification_score_base: number,
            protected uppercase_classification_score_base: number,
            severity_score_base: number,
        ) 
        { 
            super(
                dataset,
                classification_score_base,
                severity_score_base
            );
        }
        public classify_confidence(token: Parsing.Token): 
            [Array<Parsing.Token>, Parsing.ClassificationScore]
        {
            let [tokens, score] = super.classify_confidence(token);
            if (tokens.length > 0)
            {
                // // adjust score if in dictionary
                // if (tokens[0].confidence_dictionary)
                //     score.score *= 0.5;
                // adjust score to capitalization
                let any_uppercase: boolean = false;
                for (let r_token of tokens)
                {
                    let first_letter = r_token.symbol[0];
                    let first_uppercase: boolean = (first_letter == first_letter.toUpperCase() &&
                                                    !this.language_model.punctuation_map.has(first_letter));
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
                        // TODO: check for POS
                        score.score += 0.0;
                    }
                    else
                        score.score += this.uppercase_classification_score_base;
                }
            }
            score.score = Math.min(score.score, 1.0);
            return [tokens, score];
        }
        public abstract name: string;
    };
};