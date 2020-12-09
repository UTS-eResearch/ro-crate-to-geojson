
function findGeo(crate, item) {

  const offence = item;
  // Find out where a person was convicted by looking for Actions which have a location, which has a geo property
  crate.addBackLinks();
  const convictions = crate.resolve(offence, [{"@reverse": true, "property": "offence"}])
  const places = []; // Gonna feed this to the map

  for (let c of convictions) {
    const convictionPlace = crate.resolve(c, [{"property": "location"}])
    const convictionGeo = crate.resolve(convictionPlace, [{"property": "geo"}]);
    if (convictionGeo) {
      const convictionGeoData = {
        "id": c["@id"],
        url: c["@id"], // Will take you to this page
        name: c.name,
        geo: {"latitude": Number(convictionGeo[0].latitude), "longitude": Number(convictionGeo[0].longitude)},
        description: c.name,
        startDate: c.startTime,
        endDate: c.startTime
      }
      places.push(convictionGeoData);
    }
}


const lib = "http://localhost:8081";

return `
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">

<!-- Bootstrap CSS -->
<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css" integrity="sha384-Gn5384xqQ1aoWXA+058RXPxPg6fy4IWvTNh0E263XmFcJlSAwiGgFAW/dAiS6JXm" crossorigin="anonymous">

<script type="application/ld+json"> 
  ${JSON.stringify(crate.json_ld, null, 2)}
</script>

<title>
${di.displayableProps.name}
</title>



<meta charset='utf-8'/>

<style> 


dl {
  padding: 0;
  margin: 0
}
dt {
  /* adjust the width; make sure the total of both is 100% */
  background: #green;
  padding: 0;
  margin: 0
}
dd {
  /* adjust the width; make sure the total of both is 100% */
  background: #dd0
  padding: 0;
  margin: 20
}
details {
  border-left-style: solid;
  border-left-color: red;
  margin: 20;
  padding: 10;
}

summary {
  font-weight: bold;
  font-size: larger;

}

</style>

<script src="https://code.jquery.com/jquery-3.5.1.min.js" integrity="sha256-9/aliU8dGd2tb6OSsuzixeV4y/faTqgFtohetphbbj0=" crossorigin="anonymous"></script>

<link rel='stylesheet' href='${lib}/css/leaflet.css'/>
<script src='${lib}/js/leaflet.js'></script>

<script src='${lib}/js/BenSliderControl.js'></script>
<link rel='stylesheet' href='${lib}/css/jquery-ui.css'/>
<script src='${lib}/js/jquery-ui.js'></script>
<link rel='stylesheet' href='${lib}/css/benmap.css'/>

<link rel='stylesheet' href='${lib}/css/MarkerCluster.css'/>
<link rel='stylesheet' href='${lib}/css/MarkerCluster.Default.css'/>
<script src='${lib}/js/leaflet.markercluster.js'></script>



</head>


<body>


<nav class="navbar">

    <ul class="nav navbar-nav" >
        <li ><a href="${di.getHomeLink()}"><span class="glyphicon glyphicon-home dataset_name">HOME</span></a></li>
    </ul>

  </nav>
<div class="container">
<div class="jumbotron">

<h3 class="item_name">${displayDisplayableProp(di.displayableProps["@type"], false)}: ${displayDisplayableProp(di.displayableProps.name, false)}</h3>
</div>

<div id='mapdiv' style='height: 420px;'></div>
<script src='${lib}/js/mapmaker.js'></script><!-- Handles a lot of the marker stuff -->
<script>mapinit(${JSON.stringify(places)})</script>




${displayDisplayableItem(di)}


<a href="./ro-crate-metadata.jsonld">⬇️🏷️ Download all the metadata for <span class='name'>${displayDisplayableProp(di.displayableProps.name, false)}</span> in JSON-LD format</a>


</body>
</html>
`}

module.exports = render;