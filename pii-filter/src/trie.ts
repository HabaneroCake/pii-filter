/**
 * simple trie structure
 */
export class Trie
{
    private nodes: Trie.Branch = new Trie.Branch();
    
    public static make(words: Array<string>): Trie
    {
        let self = new Trie();
        for (let word of words)
            self.insert(word);
        return self;
    }

    public insert(word: string): void
    {
        let node = this.nodes;
        for (let i=0; i<word.length; ++i)
            node = node.get_or_create(word[i]);
        node.end = true;
    }

    public matched_node(word: string): Trie.Branch
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
        return node && (node.end || partial);
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

export namespace Trie
{
    export class Branch
    {
        private nodes:  Map<string, Branch> =   new Map<string, Branch>();
        private _end:   boolean =               false;
    
        public get_or_create(key: string): Branch
        {
            if (this.has(key))
            {
                return this.get(key);
            }
            else
            {
                let new_branch = new Branch();
                this.nodes.set(key, new_branch);
                return new_branch;
            }
        }
    
        public get end(): boolean               { return this._end; }
        public set end(end: boolean)            { this._end = end; }
    
        public has(key: string): boolean        { return this.nodes.has(key); }
        public get(key: string): Branch         { return this.nodes.get(key); }
        
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