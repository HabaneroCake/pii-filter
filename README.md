# ![PII](https://raw.githubusercontent.com/prolody/piif_web_ext/master/assets/logos/a/PIIlogo.png) Filter

This project aims to build a personally identifiable information (PII) filter for all Dutch users of the
internet. Although we hope to support multiple languages in the future. Feel free to contribute to this project through
pull requests and/or issues. The current shape of this project is: a library, an api-request sanitizer, and a
[web-extension](https://github.com/prolody/piif_web_ext) for browsers.

## The current state

The internet can be an unforgiving place, and the amount of personally identifiable data left behind on it has not 
decreased much over the years. This could have to do in part with the massive increase in availability and usability. 
Unfortunately, many users still don't understand the dangers that sporadic use of PII can bring along with it. There are
countless sad stories of doxing, scamming, harassment, and other unprogressive behavior linked to the unsafe guarding 
of one's personal details. We hope to provide people with a filter which can serve as a first line of defense against 
the spreading of unnecessary personal information on the internet, while informing the user of the severity of the 
information which was entered, hopefully raising their awareness on the topic.

We have encountered severely compromising PII in places such as blogs, forums, reviews on e-commerce sites, and images
posted to social media. While this filter currently only works on textual input, we are interested in continuing
development into the domain of machine vision, detecting where and what PII needs to be blurred or erased.

This project is under development.

## PII

The following information has been collected for NER:

- `brand_name` (very basic and ad hoc for filtering brand names from medicine names)
- `first_name`
- `family_name`
- `pet_name`
- `medicine_name`

Other PII that can be detected based on patterns:

- `phone_number`
- `email_address`
- `date`

More information can be found in [dataset/README.md](dataset/README.md).

## Future work

- detecting PII in images and providing coordinates which can be used for blurring or erasing PII
- detecting PII in other languages
- using POS-tagging (part-of-speech) to create smarter PII tagging
- web-extension: track which types of PII have been made public across a domain and provide a smarter severity indicator

