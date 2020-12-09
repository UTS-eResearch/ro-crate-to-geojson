
function findGeo(item, crate) {
    const place = item;
    // Find out where a person was convicted by looking for Actions which have a location, which has a geo property
    const geo = crate.resolve(place, [{"property": "geo"}])
    const places = [];
    const thisPlace = crate.getItem(item["@id"]);
    if (geo) {
        places.push({
            "id": thisPlace["@id"],
            url: thisPlace["@id"], // Will take you to this page
            name: thisPlace.name,
            "latitude": Number(geo[0].latitude),
            "longitude": Number(geo[0].longitude),
            description: thisPlace.name,
            startDate: thisPlace.startTime,
            endDate: thisPlace.endTime
            })  
  
    }
    return places;
  }
  
  module.exports = findGeo;