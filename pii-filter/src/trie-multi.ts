/**
 * simple trie structure (with array storage)
 */
export class TrieMulti<T>
{
    private nodes: TrieMulti.Branch<T> = new TrieMulti.Branch<T>();
    
    public static make<T>(words: Array<string>, value: T): TrieMulti<T>
    {
        let self = new TrieMulti<T>();
        for (let word of words)
            self.insert(word, value);
        return self;
    }

    public add_list(words: Array<string>, value: T)
    {
        for (let word of words)
            this.insert(word, value);
    }

    public insert(word: string, value: T): void
    {
        let node = this.nodes;
        for (let i=0; i<word.length; ++i)
            node = node.get_or_create(word[i]);
        node.make_end();
        node.end.push(value);
    }

    public matched_node(word: string): TrieMulti.Branch<T>
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

    public matches(word: string, partial: boolean=false): boolean
    {
        let node = this.matched_node(word);
        return (node != null) && ((node.end != null) || partial);
    }

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

export namespace TrieMulti
{
    export class Branch<T>
    {
        private nodes:  Map<string, Branch<T>> =   new Map<string, Branch<T>>();
        private _end:   Array<T>;
    
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

        public make_end()
        {
            if (this._end == null)
                this._end = new Array<T>();
        }
    
        public get end(): Array<T>              { return this._end; }
        public set end(end: Array<T>)           { this._end = end; }
    
        public has(key: string): boolean        { return this.nodes.has(key); }
        public get(key: string): Branch<T>      { return this.nodes.get(key); }
        
        public get size(): number               { return this.nodes.size; }
    
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