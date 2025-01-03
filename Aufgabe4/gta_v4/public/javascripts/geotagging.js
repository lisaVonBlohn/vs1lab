// File origin: VS1LAB A2

/* eslint-disable no-unused-vars */

// This script is executed when the browser loads index.html.

// "console.log" writes to the browser's console. 
// The console window must be opened explicitly in the browser.
// Try to find this output in the browser...
console.log("The geoTagging script is going to start...");


/**
 * TODO: 'updateLocation'
 * A function to retrieve the current location and update the page.
 * It is called once the page has been fully loaded.
 */
function updateLocation() {

    const tagLatitudeField = document.querySelector('#inputLatitude'); 
    const tagLongitudeField = document.querySelector('#inpLongitude'); 
    const discoveryLatitudeField = document.querySelector('#inputHiddenLatitude'); 
    const discoveryLongitudeField = document.querySelector('#inputHiddenLongitude');
    if(tagLatitudeField?.value && tagLongitudeField?.value){
        console.log("Koordinaten bereits vorhanden, keine API benötigt");
        var mapManager = new MapManager();

        //sets up map
        mapManager.initMap(tagLatitudeField.value, tagLongitudeField.value);

        //sets marker
        mapManager.updateMarkers(tagLatitudeField.value, tagLongitudeField.value);

        //removes mapImg and Span "result map"
        const mapElement = document.querySelector('#map');
        const tagdata = JSON.parse(mapElement.getAttribute('data-tags')|| '[]');
        mapManager.updateMarkers(tagLatitudeField.value, tagLongitudeField.value, tagdata);
        const mapimg = document.querySelector('#mapView');
        const mapSpan = mapElement.querySelector('span');
        if(mapimg) mapElement.removeChild(mapimg);
        if (mapSpan) mapElement.removeChild(mapSpan);
        return;
    }
 
    LocationHelper.findLocation((locationHelper) => {
        // Update the latitude and longitude fields of the forms with the current coordinates 
    
        //checks if DOM-Elements exist and if so values will be updated
        if (tagLatitudeField && tagLongitudeField) {
            tagLatitudeField.value = locationHelper.latitude;
            tagLongitudeField.value = locationHelper.longitude;
        }

        if (discoveryLatitudeField && discoveryLongitudeField) {
            discoveryLatitudeField.value = locationHelper.latitude;
            discoveryLongitudeField.value = locationHelper.longitude;
        }

        var mapManager = new MapManager();

        //sets up map
        mapManager.initMap(locationHelper.latitude, locationHelper.longitude);

        //sets marker
        mapManager.updateMarkers(locationHelper.latitude, locationHelper.longitude);

        //removes mapImg and Span "result map"
        const mapElement = document.querySelector('#map');
        const tagdata = JSON.parse(mapElement.getAttribute('data-tags')|| '[]');
        mapManager.updateMarkers(locationHelper.latitude, locationHelper.longitude, tagdata);
        const mapimg = document.querySelector('#mapView');
        const mapSpan = mapElement.querySelector('span');
        if(mapimg) mapElement.removeChild(mapimg);
        if (mapSpan) mapElement.removeChild(mapSpan);

    }); 
    
}


// Wait for the page to fully load its DOM content, then call updateLocation
document.addEventListener("DOMContentLoaded", () => {
    updateLocation();
});

document.addEventListener("DOMContentLoaded", () => {
    console.log("The geoTagging script is running...");

    // Event listeners for both forms
    const tagForm = document.querySelector('#tag-form');
    const discoveryForm = document.querySelector('#discoveryFilterForm');

    if (tagForm) {
        tagForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            await handleTaggingFormSubmit();
        });
    }

    if (discoveryForm) {
        discoveryForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            await handleDiscoveryFormSubmit();
        });
    }
});

/**
 * Handle submission of the tagging form.
 * Sends form data via HTTP POST using Fetch API.
 */
async function handleTaggingFormSubmit() {
    const latitude = document.querySelector('#inputLatitude').value;
    const longitude = document.querySelector('#inpLongitude').value;
    const name = document.querySelector('input[name="inputName"]').value;
    const hashtag = document.querySelector('input[name="inputHashtag"]').value;

    if (!latitude || !longitude || !name || !hashtag) {
        alert('Please fill out all fields.');
        return;
    }

    const geoTagData = {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        name,
        tag: hashtag
    };

    try {
        const response = await fetch('/api/geotags', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(geoTagData)
        });

        if (response.ok) {
            const result = await response.json();
            console.log('GeoTag added:', result);
            updateDiscoveryWidget();
        } else {
            console.error('Failed to add GeoTag:', response.statusText);
        }
    } catch (error) {
        console.error('Error during POST request:', error);
    }
}

/**
 * Handle submission of the discovery form.
 * Fetches filtered GeoTags via HTTP GET using Fetch API.
 */
async function handleDiscoveryFormSubmit() {
    const searchTerm = document.querySelector('input[name="inputSearchTerm"]').value || '';
    const latitude = document.querySelector('#inputHiddenLatitude').value;
    const longitude = document.querySelector('#inputHiddenLongitude').value;

    const queryParams = new URLSearchParams({
        search: searchTerm,
        latitude,
        longitude
    });

    try {
        const response = await fetch(`/api/geotags?${queryParams.toString()}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });

        if (response.ok) {
            const results = await response.json();
            console.log('Filtered GeoTags:', results);
            updateDiscoveryWidget(results);
        } else {
            console.error('Failed to fetch GeoTags:', response.statusText);
        }
    } catch (error) {
        console.error('Error during GET request:', error);
    }
}

/**
 * Updates the discovery widget with new GeoTags.
 * @param {Array} geoTags - Array of GeoTag objects.
 */
function updateDiscoveryWidget(geoTags = []) {
    const resultsList = document.querySelector('#discoveryResults');
    const mapElement = document.querySelector('#map');

    // Update results list
    if (resultsList) {
        resultsList.innerHTML = geoTags.map(tag => `
            <li>${tag.name} (${tag.latitude}, ${tag.longitude}) ${tag.tag}</li>
        `).join('');
    }

    // Update map (nur initialisieren, wenn sie noch nicht existiert)
    if (mapElement) {
        const mapManager = new MapManager();
        const latitude = document.querySelector('#inputHiddenLatitude').value;
        const longitude = document.querySelector('#inputHiddenLongitude').value;

        // Verhindere eine erneute Initialisierung der Karte
        if (!mapManager.map) {
            mapManager.initMap(latitude, longitude);
        }
        
        mapManager.updateMarkers(latitude, longitude, geoTags);
    }
}


