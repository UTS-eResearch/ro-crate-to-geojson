
function findGeo(crate, item) {     
    const person = item;
    // Find out where a person was convicted by looking for Actions which have a location, which has a geo property
    crate.addBackLinks();
    const convictions = crate.resolve(person, [{"property": "conviction"}]);
    const places = []; // Gonna feed this to the map
    if (convictions){
        for (let c of convictions) {
            const convictionPlace = crate.resolve(c, [{"property": "location"}])
            const convictionGeo = crate.resolve(convictionPlace, [{"property": "geo"}]);

            if (convictionGeo) {
                // This is the format that Ben  McDonnell cooked up to work with Leaflet maps
                // Not sure if this a leaflet thing or custom
                    const convictionGeoData = {
                    "id": c["@id"],
                    "url": c["@id"],
                    name: c.name,
                    "latitude": Number(convictionGeo[0].latitude), 
                    "longitude": Number(convictionGeo[0].longitude),
                    description: c.name,
                    startDate: c.startTime,
                    endDate: c.endTime
                }
                
                places.push(convictionGeoData);
        }
    }
    
    }
    return places;
}



module.exports = findGeo;