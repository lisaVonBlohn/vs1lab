// File origin: VS1LAB A3

/**
 * This script is a template for exercise VS1lab/Aufgabe3
 * Complete all TODOs in the code documentation.
 */

/** * 
 * A class representing geotags.
 * GeoTag objects should contain at least all fields of the tagging form.
 */
class GeoTag 
{

    constructor(latitude, longitude, name, hashtag)
    {
        this.id = this.nextId++,
        this.latitude = latitude;
        this.longitude = longitude;
        this.name = name;
        this.hashtag = hashtag;   
    }

    getLatitude() 
    {
        return this.latitude;
    }
    

    getId() 
    {
        return this.id;
    }
    
    setLatitude(latitude) 
    {
        this.latitude = latitude;
    }

    getLongitude() 
    {
        return this.longitude;
    }

	setLongitude(longitude) 
    {
        this.longitude = longitude;
    }

    getName() 
    {
        return this.name;
    }   

	setName(name) 
    {
        this.name = name;
    }

    getHashtag() 
    {
        return this.hashtag;
    }

    setHashtag(hashtag) 
    {
        this.hashtag = hashtag;
    }

}

module.exports = GeoTag;
