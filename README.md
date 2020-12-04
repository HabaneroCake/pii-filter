# <a name="title">PII Filter - personally identifiable information filter</a>

The PII Filter project aims to build a personally identifiable information (PII) filter for all Dutch users of the
internet. Although we hope to support multiple languages in the future. Feel free to contribute to this project through
pull requests and/or issues. The current shape of this project is: a library, an api-request sanitizer, and a
web-extension for browsers.

## <a name="current_state">The current state</a>

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

## <a name="pii">PII</a>

The following PII features have been collected for NER:

- `brand_names` (very basic and ad hoc for filtering brand names from medicine names)
- `first_names`
- `family_names`
- `medicine_names`

More information can be found in [dataset/README.md](dataset/README.md).


## <a name="future_work">Future work</a>

- detecting PII in images and providing coordinates which can be used for blurring or erasing PII
- detecting PII in other languages
- using POS-tagging (part-of-speech) to create smarter PII tagging
- web-extension: track which types of PII have been made public across a domain and provide a smarter severity indicator

