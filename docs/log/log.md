# Log

### `2020-11-06`
----
### Samenvatting:

### Werkzaamheden:
- opzet project en ervaring opdoen met typescript + project vormgeving
- onderzoek
    - doelgroep
    - vorm
    - softwarebibliotheken
    - data sets
- data set acquisitie
    - omschrijving:
        - Onder andere om een goed beeld te krijgen van hoe haalbaar de herkenning van bepaalde persoonlijke informatie kan zijn binnen dit project, wordt voor ieder type persoonlijk identificeerbare informatie Nederlandse data sets verzameld. 
        - Deze data sets kunnen vervolgens gebruikt worden om direct informatie te herkennen, maar ook in het verlengde van de projectdoelen modellen te trainen om ook te kunnen reageren op nog niet herkende persoonlijke informatie.
    - data sets:
        - woordenboeken
        - namen
        - medicijnnamen
- verdere uiteenzetting in de volgende documenten onder [`2020-11-06/`](2020-11-06):
    - [`doelgroep_en_vorm.md`](2020-11-06/doelgroep_en_vorm.md)
        - uiteenzetting van de beoogde doelgroep, en de vorm van het product wat hiet het beste op aan sluit
    - [`haalbare_pii.md`](2020-11-06/haalbare_pii.md)
        - lijst van PII die als haalbaar wordt beoogd
    - [`softwarebilbliotheken.md`](2020-11-06/softwarebilbliotheken.md)
        - softwarebibliotheken die mogelijk waardevolle functionaliteit kunnen bieden binnen dit project
    - [`data_sets.md`](2020-11-06/data_sets.md)
        - lijst van datasets die bruikbaar kunnen zijn
- Om een recente data set te bemachten van Nederlandse geneesmiddelen is er een scrape-script gescreven.
    - Om deze data set goed te laten werken is er nog het een en ander nodig aan voorbewerking of regelsets, dit komt doordat er vaak (voor het PII filter) overbodige informatie in de medicijnnamen zit, waardoor herkenning ervan lastiger wordt. De volgende opties bieden een oplossing:
        - Een drempelwaarde (per medicijnnaam) van een aantal woorden, die moeten voorkomen voordat er wordt herkend dat het om een medicijnnaam gaat.
        - Het voorbewerken van de dataset zodat er geen / weinig bedrijfsnamen,  en doses voorkomen in de medicijnnaam, zoals bijvoorbeeld `Albert Heijn Paracetamol tabletten 500mg` -> `Paracetamol`.
            - daarnaast zou dit interessant kunnen zijn om ook doses / extra info te herkennen voor de PII filter
            - dit zou kunnen op de volgende manier:
                - doses herkennen en verwijderen (filter op patroon `<cijfer><maat> [g, mg, ug, l, ml, ul, ...]`)