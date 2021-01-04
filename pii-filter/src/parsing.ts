export namespace Parsing
{
    export abstract class Classifier
    {
        public abstract init(dataset: object);
        public abstract classify(Token): ClassificationScore;
        public abstract name: string;
    };
    export class ClassificationScore
    {
        // in case of multi word matching
        public group_root:  Token =     null;
        constructor(
            public score:       number,
            public classifier:  Parsing.Classifier
        ) {}

        public valid(): boolean {return this.score > 0 && this.classifier != null;}
    };
    export class Confidences
    {
        private confidences: Array<ClassificationScore> = new Array<ClassificationScore>();
        public add(score: number, classifier: Parsing.Classifier)
        {
            this.confidences.push(new ClassificationScore(score, classifier));
            // sort descending
            this.confidences = this.confidences.sort((i1, i2) => i2.score - i1.score);
        }
        public max(): ClassificationScore
        {
            if (this.confidences.length)
                return this.confidences[0];
            return new ClassificationScore(0, null);
        }
        public all(): ReadonlyArray<ClassificationScore>
        {
            return this.confidences;
        }
    };
    export class Token
    {
        // stores passes
        public previous:    Token;
        public next:        Token;
        public confidences: Array<Confidences> =    new Array<Confidences>();
        constructor(
            public symbol:      string,
            public index:       number
        ) {}
    };
    export class Tokenizer
    {
        public tokens:                      Array<Token> =  new Array<Token>();
        private static punctuation_regexp:  RegExp =        new RegExp(/(\.|\,|\:|\!|\?|\;|\ )/g);

        /**
         * 
         * @param text creates a linked list of tokens from input text
         */
        constructor(text: string)
        {
            let string_tokens = text.split(Tokenizer.punctuation_regexp);
            let index: number = 0;
            let l_tok: Token =  null; 
            for (let token of string_tokens)
            {
                if (token.length == 0)
                    continue;

                let c_tok = new Token(token, index);
                l_tok.next = c_tok;
                c_tok.previous = l_tok;
                this.tokens.push(c_tok);

                l_tok = c_tok;
                index++;
            }
        }
    };
};