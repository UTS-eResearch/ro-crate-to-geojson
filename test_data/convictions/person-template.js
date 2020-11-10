
function render(di, config, libPath, places) {
libPath = libPath || "";
path = require("path");
const {displayPlaces, displayDisplayableValue, displayDisplayableProp, displayDisplayableItem} = require(path.join(libPath, 'lib/display'));

// TODO some template selection in here...

// Get some GEO STUFF sorted

const person = di.graph.getItem(di.itemID);

const pdf = di.displayableReverseProps["about"];

return `
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">

<!-- Bootstrap CSS -->
<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css" integrity="sha384-Gn5384xqQ1aoWXA+058RXPxPg6fy4IWvTNh0E263XmFcJlSAwiGgFAW/dAiS6JXm" crossorigin="anonymous">

<script type="application/ld+json"> 
  ${JSON.stringify(di.graph.json_ld, null, 2)}
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

<h1>🏃 ${displayDisplayableProp(di.displayableProps["name"], false)} (${displayDisplayableProp(di.displayableProps["birthDate"], false)}, ${di.displayableProps["birthPlace"].displayableValues[0].text}) </h1>

<div id='mapdiv' style='height: 420px;'></div>

${displayPlaces(places, config)}

${displayDisplayableItem(di)}




<a href="./ro-crate-metadata.jsonld">⬇️🏷️ Download all the metadata for <span class='name'>${displayDisplayableProp(di.displayableProps.name, false)}</span> in JSON-LD format</a>


</body>
</html>
`}

module.exports = render;