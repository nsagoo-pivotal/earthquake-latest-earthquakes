'use strict';

var LatestEarthquakes = require('latesteqs/LatestEarthquakes');


LatestEarthquakes({
  el: document.querySelector('#latest-earthquakes')
});

LatestEarthquake.listen(process.env.PORT || 4000)