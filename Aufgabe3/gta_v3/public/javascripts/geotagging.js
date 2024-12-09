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