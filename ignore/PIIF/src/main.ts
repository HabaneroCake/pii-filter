import { sayHello } from "./greet";

var natural = require("natural");
const language = "NL"
const defaultCategory = 'N';//???
const defaultCategoryCapitalized = 'NNP';//??


var tagger = new natural.BrillPOSTagger(
  new natural.Lexicon(
    language,
    defaultCategory,
    defaultCategoryCapitalized
  ),
  new natural.RuleSet(
    language
  )
);
// var sentence = 'Hoe gaat het met jouw twee meter hoge uitzonderlijke bezemsteel?'.split(' ');
// console.log(tagger.tag(sentence));

export function showHello(divName: string, txt: string) {
  const elt = document.getElementById(divName);
  elt.innerText = JSON.stringify(tagger.tag(txt.split(' ')));
}

console.log(tagger.tag("Hallo daar, hoe gaat het met johans uitzonderlijk hoge bezem ?".split(' ')))
console.log(tagger.tag("Hallo daar, hoe gaat het met johan's uitzonderlijk hoge bezem ?".split(' ')))
console.log(tagger.tag("Hallo daar, hoe gaat het met Johans uitzonderlijk hoge bezem ?".split(' ')))
console.log(tagger.tag("Hallo daar, hoe gaat het met Johan's uitzonderlijk hoge bezem ?".split(' ')))

// showHello("greeting", "Hallo daar, hoe gaat het met johans uitzonderlijk hoge bezem ?");