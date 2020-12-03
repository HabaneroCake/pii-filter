# Doelgroep en Vorm
### Browser plug-in vs softwarebibliotheek

Omdat onze doelgroep kwetsbare gebruikers van het internet bevat, is het belangrijk om de installatie en het gebruik van deze software hiervoor toegankelijk te houden. We defineren de doelgroep van gebruikers als volgt:
- Nederlandse internetgebruikers
- Iedereen die zich bewuster wilt zijn van het delen van persoonlijk identificeerbare informatie
- 65 en 75-plussers, die internet vanwege privacy - en veiligheids - overwegingen niet veel durven te gebruiken of hier niet genoeg rekening mee houden. <sup>[[1]](https://www.cbs.nl/nl-nl/nieuws/2019/01/zes-procent-nooit-op-internet), [[2]](https://www.cbs.nl/nl-nl/nieuws/2016/43/ouderen-beschermen-persoonsgegevens-minder-vaak)</sup>

Een browser-extensie zou de meest effectieve integratie van deze software zijn. Hierdoor kan de software op iedere site en tekstinvoerlocatie meedenken over welke contextregels en limitaties er moeten gelden voor de attendering over invoer van persoonlijke informatie.

We kunnen echter niet verwachten dat iedere persoon in deze doelgroep een ondersteunde browser gebruikt, of hiervoor een andere browser wilt gaan gebruiken. Daarnaast kan het voor sommige gebruikers van het internet een lastige taak zijn om een browser-extensie te installeren.

Een andere optie, die oorspronkelijk in onze aanvraag omschreven stond, heeft de vorm van een softwarebibliotheek voor webontwikkelaars. Hiermee spitsen we onze doelgroep in eerste instantie op de webontwikkelaars van de websites waar deze tekstinvoer plaats vindt. Om het voor hen aantrekkelijk te maken om deze software te integreren zouden we kunnen uitlichten dat met deze software minder onnodige persoonsgegevens opgeslagen worden, ook omdat hier steeds strengere regels voor gelden. Voor hen is het ook voordelig dat ze hiermee hun website ook iets gebruiksvriendelijker hebben gemaakt.

Om hier verder (architecturele) keuzes over te maken vindt er onderzoek plaats naar de mogelijkheden en verschillen tussen de verschillende browserextensies.


Op het moment van schrijven is de verhouding van gebruik van browsers in Nederlands als volgt: <sup>[[3]](https://gs.statcounter.com/browser-market-share/all/netherlands
)</sup>

| Browser           |	%   |
|-------------------|-------|
|Chrome             |55.77  |
|Safari             |23.7   |
|Samsung Internet   |5.39   |
|Firefox	        |4.97   |
|Edge	            |4.39   |
|Internet Explorer	|1.5    |

----
Helaas is het nog altijd zo dat er een klein aantal gebruikers internet explorer blijft gebruiken. Het is belangrijk om hier rekening mee te houden, aangezien dit per definitie kwetsbare gebruikers zijn, omdat deze browser al lang niet meer onderhouden wordt en hoort bij verouderde windows versies.

Daarnaast lijken de browsers die standaard bij een besturingssysteem worden geleverd ook vaak de overhand te houden in het marktaandeel.<sup>[[4]](https://gs.statcounter.com/browser-version-market-share)</sup> Dit wijst op een grote groep gebruikers die het waarschijnlijk te lastig vinden om een nieuwe browser te installeren, of daar geen moeite willen nemen.

Web-ext staat het toe om browser extensies te schrijven voor meerdere browsers tegelijk, volgens een standaard.<sup>[[5]](https://github.com/mozilla/web-ext)</sup> Om een browser extensie te publiceren vraagt Google een bijdrage van 5 euro. Microsoft vraagt voor het publiceren van een extensie mogelijk ook een bijdrage voor Edge. Naast het ontwikkelen van web-ext, heeft mozilla ook nog een aantal hulpvolle informatiebronnen op een rijtje gezet.<sup>[[6]](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Build_a_cross_browser_extension)</sup>