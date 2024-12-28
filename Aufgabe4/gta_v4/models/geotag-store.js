// File origin: VS1LAB A3

/**
 * This script is a template for exercise VS1lab/Aufgabe3
 * Complete all TODOs in the code documentation.
 */

/**
 * A class for in-memory-storage of geotags
 * 
 * Use an array to store a multiset of geotags.
 * - The array must not be accessible from outside the store.
 * 
 * Provide a method 'addGeoTag' to add a geotag to the store.
 * 
 * Provide a method 'removeGeoTag' to delete geo-tags from the store by name.
 * 
 * Provide a method 'getNearbyGeoTags' that returns all geotags in the proximity of a location.
 * - The location is given as a parameter.
 * - The proximity is computed by means of a radius around the location.
 * 
 * Provide a method 'searchNearbyGeoTags' that returns all geotags in the proximity of a location that match a keyword.
 * - The proximity constrained is the same as for 'getNearbyGeoTags'.
 * - Keyword matching should include partial matches from name or hashtag fields. 
 */
const GeoTag = require('./geotag'); 
const GeoTagExamples = require('./geotag-examples'); 

class InMemoryGeoTagStore
{

    #storageArr;

    constructor()
    {
        this.#storageArr = [];
        this.populateStore(GeoTagExamples.tagList);

    }

    populateStore(geoTagExamples) {
        geoTagExamples.forEach(([name, latitude, longitude, hashtag]) => {
            const geoTag = new GeoTag(latitude, longitude, name, hashtag);
            this.addGeoTag(geoTag);
        });
    }

    /**
     * @param {GeoTag} gTag 
     * @returns {boolean} 
     */

    addGeoTag(gTag)
    {
        const storageArrLength = this.#storageArr.length;
       
        for (let i = 0; i <= storageArrLength; i++) 
                {
                    if (this.#storageArr[i] === undefined) 
                    {
                        this.#storageArr[i] = gTag; 
                        return; 
                    }
                }
        
    }

    removeGeoTag(gTag) {
        const storageArrLength = this.#storageArr.length;
        const gTagName = gTag.getName();
        // with .filter all of the elements that don't have gtrName will remain
        this.#storageArr = this.#storageArr.filter(tag => tag.getName() !== gTagName);
        return this.#storageArr.length < storageArrLength; // Return true if at least one item was removed
    }
    
    /**
     * Returns all GeoTags within a given radius of a location.
     * @param {number} latitude - Latitude of the location.
     * @param {number} longitude - Longitude of the location.
     * @param {number} radius - Radius in kilometers.
     * @returns {GeoTag[]} - Array of GeoTags within the radius.
     */
 
    getNearbyGeoTags(latitude, longitude, radius) 
    {
        const earthRadiusKm = 6371;

        function haversineDistance(lat1, lon1, lat2, lon2) 
        {
            const toRadians = (degree) => (degree * Math.PI) / 180;
            const dLat = toRadians(lat2 - lat1);
            const dLon = toRadians(lon2 - lon1);
            const lat1Rad = toRadians(lat1);
            const lat2Rad = toRadians(lat2);

            const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(lat1Rad) * Math.cos(lat2Rad) * Math.sin(dLon / 2) ** 2;
            const centrAng = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            
            return earthRadiusKm * centrAng;
        }

        return this.#storageArr.filter(tag => {const distance = haversineDistance(latitude, longitude, tag.getLatitude(), tag.getLongitude());
        return distance <= radius;});
    }

/**
 * Returns all GeoTags within a given radius of a location that match a keyword.
 * @param {number} latitude - Latitude of the location.
 * @param {number} longitude - Longitude of the location.
 * @param {number} radius - Radius in kilometers.
 * @param {string} keyword - Keyword to match in name or hashtag.
 * @returns {GeoTag[]} - Array of GeoTags matching the criteria.
 */
searchNearbyGeoTags(latitude, longitude, radius, keyword) {
    const nearbyTags = this.getNearbyGeoTags(latitude, longitude, radius);

    return nearbyTags.filter(tag => {
        const lowerKeyword = keyword.toLowerCase();
        return (tag.getName().toLowerCase().includes(lowerKeyword) || tag.getHashtag().toLowerCase().includes(lowerKeyword));
    });
}}

module.exports = InMemoryGeoTagStore;
