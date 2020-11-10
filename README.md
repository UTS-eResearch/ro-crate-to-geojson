# ro-crate-to-geojson

A simple utility to extract geographical information from RO-Crates and output an RO-Crate containing GeJSON files for further analysis - eg in the TLCMap analytical tools.


## Usage example

```
node roc2geo.js test_data/convictions/input_crate/ -c test_data/convictions/convictions.config.json
```

Where:

-  test_data/convictions/input_crate/ is an RO-Crate that has GeoCoordinates items in it.
-  -c points to a config file which for each type of item of interest (in this case Person and Offence)


The configuration file:
```json
{
    "types": {
        "Person" : {
                "findPlaces": "person-geo.js",
                },
        "Offence" : {
            "findPlaces": "offence-geo.js",
        }     
    }
}

```

This config file points to custom code  to extract place data from the RO-Crate - eg in `person-geo.js`  - see that file as an example.





