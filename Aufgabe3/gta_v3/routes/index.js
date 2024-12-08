// File origin: VS1LAB A3

/*
 * This script defines the main router of the GeoTag server.
 * It's a template for exercise VS1lab/Aufgabe3
 * Complete all TODOs in the code documentation.
 */

/**
 * Define module dependencies.
 */

const express = require('express');
const router = express.Router();

/**
 * The module "geotag" exports a class GeoTagStore. 
 * It represents geotags.
 * 
 * TODO: implement the module in the file "../models/geotag.js"
 */
// eslint-disable-next-line no-unused-vars
const GeoTag = require('../models/geotag');

/**
 * The module "geotag-store" exports a class GeoTagStore. 
 * It provides an in-memory store for geotag objects.
 * 
 * TODO: implement the module in the file "../models/geotag-store.js"
 */
// eslint-disable-next-line no-unused-vars
const InMemoryGeoTagStore = require('../models/geotag-store');

const geoTagStore = new InMemoryGeoTagStore();
/**
 * Route '/' for HTTP 'GET' requests.
 * (http://expressjs.com/de/4x/api.html#app.get.method)
 *
 * Requests cary no parameters
 *
 * As response, the ejs-template is rendered without geotag objects.
 */

// TODO: extend the following route example if necessary
router.get('/', (req, res) => {
  console.log('GET request to /');
  const allGTags = geoTagStore.getallGeoTags();
  console.log(allGTags);
  res.render('index', { taglist: allGTags, lat : "", long : "" });
});
/**
 * Route '/tagging' for HTTP 'POST' requests.
 * (http://expressjs.com/de/4x/api.html#app.post.method)
 *
 * Requests cary the fields of the tagging form in the body.
 * (http://expressjs.com/de/4x/api.html#req.body)
 *
 * Based on the form data, a new geotag is created and stored.
 *
 * As response, the ejs-template is rendered with geotag objects.
 * All result objects are located in the proximity of the new geotag.
 * To this end, "GeoTagStore" provides a method to search geotags 
 * by radius around a given location.
 */

router.post('/tagging', (req, res) => {
  const { inputLatitude, inputLongitude, inputName, inputHashtag } = req.body;

  // Validate the input data
  if (!inputLatitude || !inputLongitude || !inputName || !inputHashtag) {
      return res.status(400).send('Missing required fields.');
  }

  // Create a new GeoTag and add it to the store
  const newGeoTag = new GeoTag(parseFloat(inputLatitude), parseFloat(inputLongitude), inputName, inputHashtag);
  geoTagStore.addGeoTag(newGeoTag);

  // Find nearby GeoTags
  const radius = 100; // Default radius in kilometers
  const nearbyGeoTags = geoTagStore.getNearbyGeoTags(parseFloat(inputLatitude), parseFloat(inputLongitude), radius);

  res.render('index', { taglist: nearbyGeoTags, lat : inputLatitude, long : inputLongitude});
});
/**
 * Route '/discovery' for HTTP 'POST' requests.
 * (http://expressjs.com/de/4x/api.html#app.post.method)
 *
 * Requests cary the fields of the discovery form in the body.
 * This includes coordinates and an optional search term.
 * (http://expressjs.com/de/4x/api.html#req.body)
 *
 * As response, the ejs-template is rendered with geotag objects.
 * All result objects are located in the proximity of the given coordinates.
 * If a search term is given, the results are further filtered to contain 
 * the term as a part of their names or hashtags. 
 * To this end, "GeoTagStore" provides methods to search geotags 
 * by radius and keyword.
 */

router.post('/discovery', (req, res) => {
  const {inputSearchTerm, inputHiddenLongitude, inputHiddenLatitude} = req.body;

  // Validate the input data
  if (!inputSearchTerm) {
      return res.status(400).send('Missing required fields.');
  }

  // Find nearby GeoTags
  const radius = 100; // Default radius in kilometers
  const nearbyGeoTags = geoTagStore.getNearbyGeoTags(parseFloat(inputHiddenLatitude), parseFloat(inputHiddenLongitude), radius);

  // Render the EJS template with the new GeoTag and nearby tags
  res.render('index', {
      taglist: nearbyGeoTags, lat : inputHiddenLatitude , long : inputHiddenLongitude // List of GeoTags in the proximity
  });
});

module.exports = router;
