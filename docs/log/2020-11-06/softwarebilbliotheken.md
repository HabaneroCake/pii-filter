# Softwarebibliotheken

Omdat alle vormen van het product uiteindelijk te maken hebben met patroonherkenning en computationele taalkunde binnen een JavaScript omgeving, zal er gebruik gemaakt worden van bibliotheken die veel voorbewerking en analyse toepassen op tekstinvoer.

Mogelijk bruikbare softwarepakketten (Node) voor het Nederlands:
- [NLP.js](https://github.com/axa-group/nlp.js)
    - NLP.js is staat om de volgende dingen te herkennen:
        - e-mail adressen
        - IP adressen
        - hashtags
        - telefoonnummers
        - urls
        - nummers
        - datums
    - [React voorbeeld](https://github.com/axa-group/nlp.js/blob/master/docs/v4/webandreact.md)
    
- [Natural](https://github.com/NaturalNode/natural)
    - geen NER?
    - wel stemming

Named entity recognition (niet-JS / moet in backend of via softwarepakket):
- [GATE (Java)](https://gate.ac.uk/)
- [OpenNLP (Java)](http://opennlp.apache.org/)
- [CoreNLP (Java)](https://nlp.stanford.edu/software/CRF-NER.shtml)
- [spaCy (Python)](https://github.com/explosion/spaCy)
- [frog (C++)](https://languagemachines.github.io/frog/)

Er is veel data nodig voor matching / NER. Mogelijk dat we willen focussen op een selectie van PII elementen om die heel goed te laten werken.

Verder onderzoek naar NER is nog nodig. Welke patronen willen we kunnen herkennen, welke situaties, welke complexiteiten, deze uitschetsen.
