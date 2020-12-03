# <a name="title">Dataset</a>
This folder contains raw datasets and processing scripts for each PII feature. Datasets are either:

- scraped from an open web interface
- acquired through an API request / database copy
- found in various open source repositories

The final dataset is processed and aggregated by [generate_dataset.py](generate_dataset.py). The result is stored in
[build/dataset.json](build/dataset.json)

## <a name="features">Features</a>
Features are implemented as Python modules, this allows features to depend on other features (e.g. when filtering out
brand-names from medicine names), this can be useful when preprocessing of one or more dataset(s) is necessary, but only
storage of the original dataset is desirable. Each module has a `NAME` variable which will be used as the feature name,
as well as a `get_wordlists()` function, which returns the word lists for the feature as a dictionary of dictionaries.
The `main` word list contains text, which if matched, could indicate the presence of the feature. Other word lists can
be added to provide more certainty or contextual hints which might indicate presence or absence of the feature.

A dictionary is also provided.

## <a name="structure">Structure</a>

### <a name="structure_folder">Folder</a>
- `generate_dataset.py` - aggregates all features / datasets and creates the main `dataset.json` file
- feature_sets - folder containing all "feature modules"
    - `__init__.py` - topmost module, contains all "feature modules" in a list
    - `feature_name/` - folder containing feature module and raw datasets
        - `__init__.py` - "feature module", containing feature dataset loading and preprocessing
        - `raw/` - raw datasets (such as a scraped database / scripts for scraping, or selected files from a repository)

### <a name="structure_dataset">`dataset.json`</a>
```
{
    "name": "pii_dataset_nl",
    "version": 0, 
    "wordlists": {
        "medicine_names": {
            "main": [
               "aafact",
               "abacavir",
               "abacavir accord",
               "abacavir hexal",
                ...
            ],
            ...
        },
        ...
    }
}
```

## <a name="datasets_raw">Included datasets, repositories, and their Licenses:</a>
The names, URLs, and licenses of the various open source repositories contained in this folder are listed below. The
selected contents of these repositories have been included as a copy, instead of as submodules. This removes the direct 
dependency on the remote, which might change or be removed. Some datasets contained in these repositories have been 
mined from open databases or by scraping a web interface. If you are an owner of one of the datasets which is listed 
below and have an objection to it's use in this software, feel free to open an issue.

Lists of names are generally [not
copyrightable](https://www.justia.com/intellectual-property/copyright/lists-directories-and-databases/), however, since
work might have gone in to either compiling or scraping this information, the licenses for these repositories are also 
stated and linked for further reference.


|   Repository / Dataset   |	License   |
|--------------------------|--------------|
|[NL-dictionary-file](https://github.com/Speedbuilder/NL-dictionary-file) | [MIT License](https://github.com/Speedbuilder/NL-dictionary-file/blob/master/LICENSE)|
|[voornamen](https://github.com/reithose/voornamen) | [MIT License](https://github.com/reithose/voornamen/blob/master/LICENSE) |
|[DutchFirstNames](https://github.com/Josha91/DutchFirstNames) | [MIT License](https://github.com/Josha91/DutchFirstNames/blob/master/LICENSE) |
|[family-names-in-the-netherlands](https://github.com/digitalheir/family-names-in-the-netherlands/) | [MIT License](https://github.com/digitalheir/family-names-in-the-netherlands/blob/master/LICENSE.txt)|
|[DutchNameGenerator](https://github.com/MagicMau/DutchNameGenerator) | [MIT License](https://github.com/MagicMau/DutchNameGenerator/blob/master/LICENSE) |
|[name-dataset](https://github.com/philipperemy/name-dataset)| [Apache License 2.0](https://github.com/philipperemy/name-dataset/blob/master/LICENSE) |
|[drugstandards](https://github.com/mlbernauer/drugstandards) | [MIT License](https://github.com/mlbernauer/drugstandards/blob/master/LICENSE.txt) |
|[RXNORM](https://www.nlm.nih.gov/research/umls/rxnorm/docs/rxnormfiles.html)| [-](https://www.nlm.nih.gov/copyright.html) |
|[GMIB](https://www.geneesmiddeleninformatiebank.nl/)| [-](https://www.geneesmiddeleninformatiebank.nl/nl/) |
|[GIPdatabank](https://www.gipdatabank.nl/)| [-](https://www.gipdatabank.nl/servicepagina/open-data) |