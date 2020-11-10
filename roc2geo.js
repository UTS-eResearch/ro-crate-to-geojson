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
  .option("-r, --output-path [rep]", "Directory into which to write output crate", null)
  .action((d) => {crateDir = d})


program.parse(process.argv);
const outPath = program.outputPath ?  program.outputPath : `${crateDir.replace(/\/$/,"")}_geo`;

async function makeRepo(outPath) {
    await fs.mkdirp(outPath);
  }


  

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
    // load the crate
    const crate = new ROCrate(JSON.parse(await fs.readFile(path.join(crateDir, "ro-crate-metadata.json"))));
    crate.index();
    crate.addBackLinks();
    // Need to have context loaded
    const types = indexByType(crate, config);
    const geoCrate = new ROCrate();
    geoCrate.index();
    geoRoot = geoCrate.getRootDataset();
    geoRoot.name = "";
    geoRoot.hasFile = [];
    const fileEntity = {
        "@id": "file-list.txt",
        "name": "List of geoJSON files",
        "description": "One path per line, relative to the root of this RO-Crate"
    }
    var fileList = "";
    geoCrate.addItem(fileEntity);
    geoRoot.hasFile.push({"@id": fileEntity["@id"]});
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
                const placeDir = path.join(outPath, "GeoJSON", type, dir);
                await fs.mkdirp(placeDir);
                const jsonFile = GeoJSON.parse(places, {Point: ['latitude', 'longitude']})
                const jsonString = JSON.stringify(jsonFile, null, 2)
                const placesFile = path.join(placeDir, item["@id"].replace(/#/,"").replace(/\W/g,"_")+".geo.json");
                await fs.writeFile(placesFile, jsonString);
                geoCrate.addItem({
                    "@id": placesFile,
                    "@type": "File",
                    "name": `GeoJSON for ${item["@id"]}`,
                    "encodingFormat": "geoJSON-TODO"
                });
                fileList += `${placesFile}\n`;
                geoRoot.hasFile.push({"@id": placesFile});
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


