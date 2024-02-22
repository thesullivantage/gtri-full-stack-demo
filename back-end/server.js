const express = require('express');
const app = express();
const cors = require('cors');
const { ParseWeatherDat, DmsToDecimal, ConvertDate, GetUnixTime } = require('./Utils/BackEnd');
require('dotenv').config(); // get environment variables (in development)

// Only use cross-origin resource sharing in development between two localhost domains (ports)
app.use(cors());

async function query_week(city, state, key) {

    // Query OpenCage to forward geolocate latitude and longitude from City, ST
    // limit to US locations with country code
    const geoloc_response = await fetch(`https://api.opencagedata.com/geocode/v1/json?q=${city},+${state}&key=${key}&countrycode=us`);
    const geoloc_data = await geoloc_response.json();

    // handle 404 not found for forward geolocation on OpenCage (no results returned)
    if (geoloc_data.results.length === 0) {
        throw {
            status: 404,
            message: `Error 404: geolocation not found for location`
        };

    // handle other errors within body of OpenCage response
    } else if (geoloc_data.status.code !== 200) {
        throw {
            status: geoloc_data.status.code,
            message: geoloc_data.status.message
        };
    };

    // get local timezone info; pass to data processing function (ParseWeatherDat) below 
    const timezone_info =  {
        name: geoloc_data.results[0].annotations.timezone.name,
        offset_seconds_UTC: geoloc_data.results[0].annotations.timezone.offset_sec, 
    };

    // Re-format latitude, longitude from Cartesian form to decimal for api.weather.gov call
    const latitude = DmsToDecimal(geoloc_data.results[0].annotations.DMS.lat);
    const longitude = DmsToDecimal(geoloc_data.results[0].annotations.DMS.lng);

    // query api.weather.gov for metadata about latitude, longitude location; to first see what observation stations are returned
    const prelim_weather_response = await fetch(`https://api.weather.gov/points/${latitude},${longitude}`);
    const prelim_weather_data = await prelim_weather_response.json();

    // handle non-network error responses
    if (prelim_weather_data.status >= 400 || prelim_weather_data.status < 600) {
        throw {
            status: prelim_weather_data.status,
            message: `Error ${prelim_weather_data.status} querying weather.gov metadata for latitude, longitude pair: ${prelim_weather_data.detail}`
        };
    };

    // query stations for a location; observationStations endpoint returned from last call
    const stations_response = await fetch(prelim_weather_data.properties.observationStations);
    const stations_data = await stations_response.json();

    // handle non-network error responses
    if (stations_data.status >= 400 || stations_data.status < 600) {
        throw {
            status: stations_data.status,
            message: `Error ${stations_data.status} fetching weather stations for weather.gov grid location:\n${stations_data.statusText}`
        };
    }
    // select first observation station for location and get all observations for the past week 
    // 1 week: max length of data returned in real-time
    const weather_observation_response = await fetch(`${stations_data.observationStations[0]}/observations`)
    const weather_observation_data = await weather_observation_response.json();

    // store (single) station we're reading from
    const station = stations_data.observationStations[0].split('/').at(-1)

    // for this endpoint, if we have a status key, then endpoint error returned
    // otherwise, response.ok/response.status not present
    if (weather_observation_data.status !== undefined) {
        // handle other errors with endpoint
        if (weather_observation_data.status >= 400 || weather_observation_data.status < 600) {
            throw {
                status: weather_observation_data.status,
                message: `Error ${weather_observation_data.status} for querying observations from weather.gov: ${weather_observation_data.detail}`
            };
        // empty result set doesn't return error response; handle here with 404
        } else {
            if (weather_observation_data.features.length === 0) {
                throw {
                    status: 404,
                    message: `Error 404: Observations not found for ${stations_data.observationStations[0]}. Check that this is a valid station and correct.`
                }
            }
        }
    }
    
    // process and aggregate weather data
    aggregated_day_data = ParseWeatherDat(weather_observation_data, station, timezone_info)
    return aggregated_day_data
}

// single (GET) endpoint: get formatted weather data from a single weather station for City, ST in the US
app.get('/weather/:city/:state', async function (req, res, next) {
    // city and state extracted from route
    const city = req.params.city
    const state = req.params.state
    try {
        // OpenCage API key stored in environment variable
        const weather_formatted = await query_week(city, state, process.env.OPENCAGE_GEOCODE_KEY)
        res.send(weather_formatted);
    } catch (err) {
        // output error to console
        console.log('error: ', JSON.stringify(err, null, '\t'))
        // Express 5.x < should pass error to next middleware automatically
        // but caught and sent to next middleware for more backwards compatability.  
        // i.e. if Heroku uses 4.x
        next(err)
    }
});

// generic error handling middleware function: accepts 4 arguments in express starting with err(or)
app.use((err, req, res, next) => {
    // set result status to what is returned by error or 500 if cannot be resolved here; more detailed handling in API querying middleware, above
    console.log(err)
    res.status(err.status || 500);
    // send error as response
    res.send({ error: err.message });
});

// Run server on some port
const port = 8080
app.listen(port, () => {
    console.log(`Weather demo server listening on port ${port}`)
})

module.exports = app;
