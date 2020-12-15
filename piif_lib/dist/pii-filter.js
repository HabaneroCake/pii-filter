"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PII_Filter = void 0;
const dataset_json_1 = __importDefault(require("./dataset.json"));
const trie_1 = require("./trie");
class PII_Filter {
    static init_tries() {
        let tries = new Map();
        for (const key in dataset_json_1.default['wordlists'])
            tries.set(key, trie_1.Trie.make(dataset_json_1.default['wordlists'][key]['main']));
        let test_word = 'paracetamol';
        for (const [key, trie] of tries) {
            if (trie.matches(test_word))
                console.log(`${key} matches ${test_word}`);
        }
        return tries;
    }
}
exports.PII_Filter = PII_Filter;
PII_Filter.tries = PII_Filter.init_tries();
;
//# sourceMappingURL=pii-filter.js.map