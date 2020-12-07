#!/usr/local/bin/python3

templates = [
    "Hallo {first_name_other}, leuk je te ontmoeten, mijn {pname_self} is {pval_self}.",
    "Hey {first_name_other}, mijn {pname_self} is {pval_self}, voor het geval je dat wilde weten.",
]

# TODO

{
    "templates": [{"text": },
        {
            "text": "{0}, leuk om je weer te spreken, je kunt me trouwens ook bereiken op {1}.",
            "pii_self": [
                { "{1}": "phone_number" }
            ],
            "pii_other": [
                { "{0}": "first_name" }
            ]
        }
    ],
    "values": {
        "first_name": [

        ],
        "last_name": [

        ],
        "phone_number": [

        ],
        "street_names": [

        ],
        "city_names": [

        ]
    }
}

