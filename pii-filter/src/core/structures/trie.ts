/**
 * Simple trie structure.
 * @private
 */
export class Trie<T>
{
    /** the nodes/branches */
    private nodes: Trie.Branch<T> = new Trie.Branch<T>();
    
    /**
     * Makes a Trie from a word-list with a certain value.
     * @param words the words to add
     * @param value the value to set for these words
     */
    public static make<T>(words: Array<string>, value: T): Trie<T>
    {
        let self = new Trie<T>();
        for (let word of words)
            self.insert(word, value);
        return self;
    }

    /**
     * Adds a word-list to this Trie.
     * @param words a word-list
     * @param value the value to set for these words
     */
    public add_list(words: Array<string>, value: T)
    {
        for (let word of words)
            this.insert(word, value);
    }

    /**
     * Inserts a word into this Trie.
     * @param word the word
     * @param value the value for this word
     */
    public insert(word: string, value: T): void
    {
        let node = this.nodes;
        for (let i=0; i<word.length; ++i)
            node = node.get_or_create(word[i]);

        node.end = value;
    }

    /**
     * Get the matched node for this word.
     * @param word the word
     */
    public matched_node(word: string): Trie.Branch<T>
    {
        let node = this.nodes;
        for (let i=0; i<word.length; ++i)
        {
            let char: string = word[i];
            if (node.has(char))
                node = node.get(char);
            else
                return null;
        }
        return node;
    }

    /**
     * Check if word is matched by TrieMulti.
     * @param word the word
     * @param partial if a partial match is also accepted
     */
    public matches(word: string, partial: boolean=false): boolean
    {
        let node = this.matched_node(word);
        return (node != null) && ((node.end != null) || partial);
    }

    /**
     * Get all partial matches for a word.
     * @param word the word
     */
    public partial_matches(word: string): Array<string>
    {
        let results: Array<string> = new Array<string>();
        let node = this.matched_node(word);
        if (node)
        {
            for (let part of node.parts)
                results.push(`${word}${part}`)
        }
        return results;
    }
};

/**
 * @private
 */
export namespace Trie
{
    /**
     * A branch/node for {@link Trie}
     * @private
     */
    export class Branch<T>
    {
        /** the contained nodes */
        private nodes:  Map<string, Branch<T>> =   new Map<string, Branch<T>>();
        /** if this is an end-node this value is non-null */
        private _end:   T;
    
        /**
         * Gets or creates a new branch/node and returns the result.
         * @param key the letter/word to get or create
         */
        public get_or_create(key: string): Branch<T>
        {
            if (this.has(key))
            {
                return this.get(key);
            }
            else
            {
                let new_branch = new Branch<T>();
                this.nodes.set(key, new_branch);
                return new_branch;
            }
        }
    
        /** An ending node. */
        public get end(): T                     { return this._end; }
        /** An ending node. */
        public set end(end: T)                  { this._end = end; }
    
        /**
         * Whether this branch has a key.
         * @param key the key to check for
         */
        public has(key: string): boolean        { return this.nodes.has(key); }
        
        /**
         * Gets a certain branch.
         * @param key the key to get a branch for.
         */
        public get(key: string): Branch<T>      { return this.nodes.get(key); }
        
        /**
         * Gets the number of nodes this branch contains.
         */
        public get size(): number               { return this.nodes.size; }
    
        /**
         * --
         */
        public get parts(): Array<string>
        {
            let results: Array<string> = new Array<string>();
    
            for (let [key, value] of this.nodes)
                if (value.size > 0)
                    for (let part of value.parts)
                        results.push(`${key}${part}`)
                else
                    results.push(`${key}`)
            
            return results;
        }
    };
};