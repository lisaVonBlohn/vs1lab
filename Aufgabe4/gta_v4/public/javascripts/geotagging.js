// File origin: VS1LAB A2

/* eslint-disable no-unused-vars */

console.log("The geoTagging script is going to start...");

let mapManagerInstance = null;

function setMap(longitude, latitude) {
    if (mapManagerInstance == null) {
        mapManagerInstance = new MapManager();
    }

    const mapElement = document.querySelector('#map');

    // Verhindern, dass die Karte mehrfach initialisiert wird
    if (mapElement._leaflet_id) {
        console.warn("Map container is already initialized.");
        return; // Keine erneute Initialisierung
    }

    mapManagerInstance.initMap(latitude, longitude);

    const tagdata = JSON.parse(mapElement.getAttribute('data-tags') || '[]');
    mapManagerInstance.updateMarkers(latitude, longitude, tagdata);

    const mapimg = document.querySelector('#mapView');
    const mapSpan = mapElement.querySelector('span');
    if (mapimg) mapElement.removeChild(mapimg);
    if (mapSpan) mapElement.removeChild(mapSpan);
}


function updateLocation() {
    const tagLatitudeField = document.querySelector('#inputLatitude'); 
    const tagLongitudeField = document.querySelector('#inpLongitude'); 
    const discoveryLatitudeField = document.querySelector('#inputHiddenLatitude'); 
    const discoveryLongitudeField = document.querySelector('#inputHiddenLongitude');
    
    if (tagLatitudeField?.value && tagLongitudeField?.value) {
        console.log("Coordinates already available, skipping API call");
        setMap(tagLongitudeField.value, tagLatitudeField.value);
        return;
    }

    LocationHelper.findLocation((locationHelper) => {
        if (tagLatitudeField && tagLongitudeField) {
            tagLatitudeField.value = locationHelper.latitude;
            tagLongitudeField.value = locationHelper.longitude;
        }

        if (discoveryLatitudeField && discoveryLongitudeField) {
            discoveryLatitudeField.value = locationHelper.latitude;
            discoveryLongitudeField.value = locationHelper.longitude;
        }

        setMap(locationHelper.longitude, locationHelper.latitude);
    });
}

document.addEventListener("DOMContentLoaded", () => {
    updateLocation();
    console.log("The geoTagging script is running...");

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
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(geoTagData)
        });

        if (response.ok) {
            const nearbyGeoTagsResponse = await fetch(`/api/geotags?inputLatitude=${latitude}&inputLongitude=${longitude}`, {
                method: 'GET',
                headers: { 'Accept': 'application/json' }
            });
            
            if (nearbyGeoTagsResponse.ok) {
                const nearbyGeoTags = await nearbyGeoTagsResponse.json();
                console.log(nearbyGeoTags);
                const currPage = nearbyGeoTags.currentPage;
                const totPages = nearbyGeoTags.totalPages;
                updateDiscoveryWidget(nearbyGeoTags.data, { currPage,totPages});
            } else {
                console.error('Failed to fetch nearby GeoTags:', nearbyGeoTagsResponse.statusText);
            }
        } else {
            console.error('Failed to add GeoTag:', response.statusText);
        }
    } catch (error) {
        console.error('Error during POST request:', error);
    }
}

async function handleDiscoveryFormSubmit() {
    const inputSearchTerm = document.querySelector('#inputSearchTerm').value;
    const inputLatitude = document.querySelector('#inputHiddenLatitude').value;
    const inputLongitude = document.querySelector('#inputHiddenLongitude').value;

    const queryParams = new URLSearchParams({ inputSearchTerm, inputLatitude, inputLongitude });

    try {
        const response = await fetch(`/api/geotags?${queryParams.toString()}`, {
            method: 'GET',
            headers: { 'Accept': 'application/json' }
        });

        if (response.ok) {
            const results = await response.json();
            console.log('Filtered GeoTags:', results);
            const currPage = results.currentPage;
            const totPages = results.totalPages;
            updateDiscoveryWidget(results.data, { currPage,totPages});
        } else {
            console.error('Failed to fetch GeoTags:', response.statusText);
        }
    } catch (error) {
        console.error('Error during GET request:', error);
    }
}

function updateDiscoveryWidget(geoTags = [], pagination = { currPage: 1, totPages: 1 }) {
    const resultsList = document.querySelector('#discoveryResults');
    const paginationContainer = document.querySelector('#paginationControls');
    const mapElement = document.querySelector('#map');

    // Anzeige der GeoTags
    if (resultsList) {
        resultsList.innerHTML = geoTags.length === 0 
            ? '<li>No GeoTags available for this page.</li>' // Falls keine GeoTags vorhanden sind
            : geoTags.map(tag => `
             <li>${tag.name} (${tag.latitude}, ${tag.longitude}) ${tag.hashtag}</li>
            `).join('');
    }

    // Anzeige der Paginierung
    if (paginationContainer) {
        const { currPage, totPages } = pagination;

        paginationContainer.innerHTML = `
            <button 
                ${currPage === 1 ? 'disabled' : ''} 
                onclick="${currPage > 1 ? `fetchPage(${currPage - 1})` : ''}">
                Prev
            </button>
            ${Array.from({ length: totPages }, (_, i) => `
                <button 
                    ${i + 1 === currPage ? 'class="active"' : ''} 
                    onclick="fetchPage(${i + 1})">
                    ${i + 1}
                </button>
            `).join('')}
            <button 
                ${currPage === totPages ? 'disabled' : ''} 
                onclick="${currPage < totPages ? `fetchPage(${currPage + 1})` : ''}">
                Next
            </button>
        `;
    }

    // Karte aktualisieren
    if (mapElement) {
        if (mapManagerInstance == null) {
            mapManagerInstance = new MapManager();
        }
        const latitude = document.querySelector('#inputHiddenLatitude').value;
        const longitude = document.querySelector('#inputHiddenLongitude').value;

        // Verhindern einer erneuten Initialisierung der Karte
        if (!mapElement._leaflet_id) {
            mapManagerInstance.initMap(latitude, longitude);
        }

        mapManagerInstance.updateMarkers(latitude, longitude, geoTags);
    }
}


async function fetchPage(page) {
    const inputLatitude = document.querySelector('#inputHiddenLatitude').value;
    const inputLongitude = document.querySelector('#inputHiddenLongitude').value;

    if (!inputLatitude || !inputLongitude) {
        console.error("Latitude and Longitude are required.");
        return;
    }

    const inputSearchTerm = document.querySelector('#inputSearchTerm').value || "";

    const queryParams = new URLSearchParams({
        inputSearchTerm,
        inputLatitude,
        inputLongitude,
        page,
        limit: 7,
    });

    console.log("Fetching page with params:", queryParams.toString());

    try {
        const response = await fetch(`/api/geotags?${queryParams.toString()}`, {
            method: 'GET',
            headers: { 'Accept': 'application/json' },
        });
        if (response.ok) {
            const { data, currentPage, totalPages } = await response.json();
            updateDiscoveryWidget(data, { currPage: Number(currentPage), totPages: Number(totalPages) });
        } else {
            console.error('Failed to fetch GeoTags:', response.statusText);
        }
    } catch (error) {
        console.error('Error during GET request:', error);
    }
}
