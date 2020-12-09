#!/usr/bin/env node

const program = require('commander');
const fs = require('fs-extra');
const path = require('path');
const {ROCrate, Preview, HtmlFile} = require("ro-crate");
const _ = require("lodash");
const GeoJSON = require("geojson");
//const Preview = require("./lib/ro-crate-preview");
//const HtmlFile = require("./lib/ro-crate-preview-file");

program
  .version("0.1.0")
  .description(
    "Extracts geo information from an RO-Crate"
  )
  .arguments("<d>")
  .option("-c, --config [conf]", "configuration file")
  .option("-d, --config-dir [confDir]", "Configuration directory - to be included in crate")
  .option("-r, --output-path [rep]", "Directory into which to write output crate", null)
  .action((d) => {crateDir = d})


program.parse(process.argv);

const outPath = program.outputPath ?  program.outputPath : `${crateDir.replace(/\/$/,"")}_geo`;







const prov = [
{
    "@id": "#dataset-creation",
    "@type": "CreateAction",
    "name": "Dataset Creation",
    "description": "This dataset was created using ro-crate-to-geojson",
    "endTime": new Date().toISOString(),
    "instrument": {
      "@id": "https://github.com/UTS-eResearch/ro-crate-to-geojson/"
    },
    "object": {
      "@id": "./"
    },
    "result": {
      "@id": "pics/sepia_fence.jpg"
    }
},

{
    "@id": "https://github.com/UTS-eResearch/ro-crate-to-geojson/",
    "@type": "SoftwareApplication",
    "url": "https://github.com/UTS-eResearch/ro-crate-to-geojson/",
    "name": "ro-crate-to-geojson",
    "version": "TODO: Need to work out the best way to do this"
},

{
    "@id": "http://schema.org/resultOf",
    "@type": "rdf:Property",
    "rdfs:label": "resultOf",
    "inverseOf": {"@id": "http://schema.org/result"},
    "rdf:comment": "Inverse of the result property on Action. This entity is the result of the action it references."
  }
]


  

function indexByType(crate, config) {
    const types = {}
    for (let item of crate.getGraph()) {
        if (!(item["@id"] === "./" || item["@id"].match(/^ro-crate-metadata.json$/))){
            for (t of crate.utils.asArray(item["@type"])) {
                if (config.types[t]) {
                    if (!types[t]) {
                        types[t] = [item];
                    } else {
                        types[t].push(item);
                    }
                }
            }
        }
    }
    return types;
}


async function main() {
    const config = JSON.parse(await fs.readFile(program.config));
    const configDir = program.configDir;
    // load the crate
    const crate = new ROCrate(JSON.parse(await fs.readFile(path.join(crateDir, "ro-crate-metadata.json"))));
    crate.index();
    const root = crate.getRootDataset();

    crate.addBackLinks();
    // Need to have context loaded
    const types = indexByType(crate, config);
    const geoCrate = new ROCrate();
    geoCrate.index();
    geoRoot = geoCrate.getRootDataset();
    geoRoot.name = `GEOJson exctacted from the RO-crate: ${root.name}`;
    geoRoot.hasPart = [];
    const geoJSON =  {
        "@id": "GeoJSON",
        "@type": "Dataset",
        "name": "Directory containing GeoJSON files derived from the source crate",
        "description": "Individual files containing Feature Collections",
        "resultOf": {"@id": "#dataset-creation"},
        "hasPart": []
    }
    geoCrate.addItem(geoJSON);
    geoRoot.hasPart.push({"@id": geoJSON["@id"]});

    if (configDir) {
        if (program.config.startsWith(configDir)) {
            configFileId = path.join(configDir, path.basename(program.config));
        } else {
            console.log("ERROR: config file must be n the config directory");
            return;
        }
        const crateConfigDir = `${outPath}/config`
        await fs.mkdirp(crateConfigDir);
        await fs.copy(configDir, crateConfigDir);
        const configFileItem =  {
            "@id": configFileId,
            "@type": "File",
            "name": "Configuration directory",
            "description": "Main onfiguration files for the ro-crate-to-geojson script",
        }
        const configDirItem =  {
            "@id": crateConfigDir,
            "@type": "Dataset",
            "name": "Configuration directory",
            "description": "Configuration files used to extract GeoJSON from the crate including specific scripts",
            "hasPart": [{"@id": configFileItem["@id"]}]
        }
        geoCrate.addItem(configDirItem);
        geoCrate.addItem(configFileItem);
        geoRoot.hasPart.push({"@id": configDirItem["@id"]});

    }


    for (let p of prov) {
        geoCrate.addItem(p);
    }

    const fileEntity = {
        "@id": "file-list.txt",
        "@type": "File",
        "name": "List of geoJSON files",
        "description": "One path per line, relative to the root of this RO-Crate"
    }

    var fileList = "";
    geoCrate.addItem(fileEntity);
    geoRoot.hasPart.push({"@id": fileEntity["@id"]});
    for (let type of Object.keys(types)) {
        var count = 0;
        for (let item of types[type]) {
            if (config.types[type] && config.types[type].findPlaces){
                findPlaces = require( path.join(process.cwd(), path.dirname(program.config), config.types[type].findPlaces));
                places = findPlaces(crate, item);
            } else {
                places = [];
            }
            if (places.length > 0) {
                var dir = count.toString().match(/\d\d?/g).join("/");
                const placeDir = path.join("GeoJSON", type, dir);
                await fs.mkdirp(placeDir);
                const jsonFile = GeoJSON.parse(places, {Point: ['latitude', 'longitude']})
                const jsonString = JSON.stringify(jsonFile, null, 2)
                console.log(places, jsonString)
                const placesFile = path.join(placeDir, item["@id"].replace(/#/,"").replace(/\W/g,"_")+".geo.json");
                await fs.writeFile(path.join(outPath, placesFile), jsonString);

                geoCrate.addItem({
                    "@id": placesFile,
                    "@type": "File",
                    "name": `GeoJSON for ${item["@id"]}`,
                    "encodingFormat": "application/vnd.geo+json"
                });
                fileList += `${placesFile}\n`;
                geoJSON.hasPart.push({"@id": placesFile});
                count += 1; 
            }
            // TODO - have to make a second DI here cos places uses DI instead of a crate & item - probably should change that
            crate.addItem({"@id": item["@id"], "name": item.name, "@type": type});
        }
    }
    const preview = new Preview(geoCrate);
    const f = new HtmlFile(preview);
    const html = await f.render();
    await fs.writeFile(path.join(outPath, "ro-crate-metadata.json"), JSON.stringify(geoCrate.json_ld, null, 2));
    await fs.writeFile(path.join(outPath, "ro-crate-preview.html"), html);
    await fs.writeFile(path.join(outPath, "file-list.txt"), fileList)
}


main(crateDir);








//console.log(module);


