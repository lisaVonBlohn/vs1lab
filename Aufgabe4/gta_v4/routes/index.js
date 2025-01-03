// File origin: VS1LAB A3, A4

/**
 * This script defines the main router of the GeoTag server.
 * It's a template for exercise VS1lab/Aufgabe3
 * Complete all TODOs in the code documentation.
 */

/**
 * Define module dependencies.
 */

const express = require('express');
const router = express.Router();
// Middleware für JSON-Verarbeitung sicherstellen
router.use(express.json());

/**
 * The module "geotag" exports a class GeoTagStore. 
 * It represents geotags.
 */
// eslint-disable-next-line no-unused-vars
const GeoTag = require('../models/geotag');

/**
 * The module "geotag-store" exports a class GeoTagStore. 
 * It provides an in-memory store for geotag objects.
 */
// eslint-disable-next-line no-unused-vars
const InMemoryGeoTagStore = require('../models/geotag-store');

const geoTagStore = new InMemoryGeoTagStore();

// App routes (A3)

/**
 * Route '/' for HTTP 'GET' requests.
 * (http://expressjs.com/de/4x/api.html#app.get.method)
 *
 * Requests cary no parameters
 *
 * As response, the ejs-template is rendered without geotag objects.
 */

router.get('/', (req, res) => {
  res.render('index', {taglist : undefined, lat: "", long: "" });
});

// API routes (A4)

/**
 * Route '/api/geotags' for HTTP 'GET' requests.
 * (http://expressjs.com/de/4x/api.html#app.get.method)
 *
 * Requests contain the fields of the Discovery form as query.
 * (http://expressjs.com/de/4x/api.html#req.query)
 *
 * As a response, an array with Geo Tag objects is rendered as JSON.
 * If 'searchterm' is present, it will be filtered by search term.
 * If 'latitude' and 'longitude' are available, it will be further filtered based on radius.
 */
// GET /api/geotags - Liste aller GeoTags oder Suche mit Parametern
router.get('/api/geotags', (req, res) => {
    const { inputSearchTerm, inputLatitude, inputLongitude } = req.query;
    let results;
    const radius = 10;
    if (inputSearchTerm || (latitude && inputLongitude)) {
        results = geoTagStore.searchGeoTags({ inputSearchTerm, radius, inputLatitude, inputLongitude });
    } else {
        results = geoTagStore.getAllGeoTags();
    }
    res.json(results);
});
// Aufgabe 3
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
  const radius = 10; // Default radius in kilometers
  const nearbyGeoTags = geoTagStore.getNearbyGeoTags(parseFloat(inputLatitude), parseFloat(inputLongitude), radius);

  res.render('index', { taglist: nearbyGeoTags, lat : inputLatitude, long : inputLongitude});
});

/**
 * Route '/api/geotags' for HTTP 'POST' requests.
 * (http://expressjs.com/de/4x/api.html#app.post.method)
 *
 * Requests contain a GeoTag as JSON in the body.
 * (http://expressjs.com/de/4x/api.html#req.body)
 *
 * The URL of the new resource is returned in the header as a response.
 * The new resource is rendered as JSON in the response.
 */

router.post('/api/geotags', (req, res) => 
  {
    const { name, latitude, longitude, tag } = req.body;

    if (!name || latitude == null || longitude == null) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const newGeoTag = new GeoTag(parseFloat(latitude), parseFloat(longitude), name, tag);
    geoTagStore.addGeoTag(newGeoTag);

      // HTTP 201 (Created) und URL der neuen Ressource im Location-Header setzen
      res.status(201)
          .location(`/api/geotags/${newGeoTag.id}`)
          .json(newGeoTag); // Den neuen GeoTag im Response-Body zurückgeben
});
/**
 * Route '/api/geotags/:id' for HTTP 'GET' requests.
 * (http://expressjs.com/de/4x/api.html#app.get.method)
 *
 * Requests contain the ID of a tag in the path.
 * (http://expressjs.com/de/4x/api.html#req.params)
 *
 * The requested tag is rendered as JSON in the response.
 */
// GET /api/geotags/:id - Einzelnen GeoTag abrufen
router.get('/api/geotags/:id', (req, res) => {
  const geoTag = geoTagStore.getGeotagById(req.params.id);
  if (!geoTag) {
      return res.status(404).json({ error: 'GeoTag not found' });
  }
  res.json(geoTag);
});


router.post('/discovery', (req, res) => {
  const {inputSearchTerm, inputHiddenLongitude, inputHiddenLatitude} = req.body;

  // Find nearby GeoTags
  const radius = 10; // Default radius in kilometers
  const nearbyGeoTags = geoTagStore.searchNearbyGeoTags(parseFloat(inputHiddenLatitude), parseFloat(inputHiddenLongitude), radius, inputSearchTerm);

  // Render the EJS template with the new GeoTag and nearby tags
  res.render('index', {
      taglist: nearbyGeoTags, lat : inputHiddenLatitude , long : inputHiddenLongitude // List of GeoTags in the proximity
  });
});
/**
 * Route '/api/geotags/:id' for HTTP 'PUT' requests.
 * (http://expressjs.com/de/4x/api.html#app.put.method)
 *
 * Requests contain the ID of a tag in the path.
 * (http://expressjs.com/de/4x/api.html#req.params)
 * 
 * Requests contain a GeoTag as JSON in the body.
 * (http://expressjs.com/de/4x/api.html#req.query)
 *
 * Changes the tag with the corresponding ID to the sent value.
 * The updated resource is rendered as JSON in the response. 
 */
// PUT /api/geotags/:id - GeoTag aktualisieren
router.put('/api/geotags/:id', (req, res) => {
  const { inputName, inputLatitude, inputLongitude, inputHashtag } = req.body;
  if (!inputName || inputLatitude == null || inputLongitude == null) {
      return res.status(400).json({ error: 'Invalid input: name, latitude, and longitude are required' });
  }
  const gtToUpdate = new GeoTag(parseFloat(inputLatitude), parseFloat(inputLongitude), inputName, inputHashtag);
  const updatedGeoTag = geoTagStore.updateGeoTag(req.params.id, gtToUpdate);
  if (!updatedGeoTag) {
      return res.status(404).json({ error: 'GeoTag not found' });
  }
  res.json(updatedGeoTag);
});

/**
 * Route '/api/geotags/:id' for HTTP 'DELETE' requests.
 * (http://expressjs.com/de/4x/api.html#app.delete.method)
 *
 * Requests contain the ID of a tag in the path.
 * (http://expressjs.com/de/4x/api.html#req.params)
 *
 * Deletes the tag with the corresponding ID.
 * The deleted resource is rendered as JSON in the response.
 */
// DELETE /api/geotags/:id - GeoTag löschen
router.delete('/api/geotags/:id', (req, res) => {
  const success = geoTagStore.removeGeoTag(req.params.id);
  if (!success) {
      return res.status(404).json({ error: 'GeoTag not found' });
  }
  res.status(204).send(); // Kein Inhalt zurückgeben
});
module.exports = router;
