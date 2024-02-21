const express = require('express');
const app = express();
const {ParseWeatherDat, DmsToDecimal, ConvertDate, GetUnixTime } = require('./Utils/BackEnd');
require('dotenv').config() // get environment variables

async function query_week(city, state, key) {
    // uses forward geolocation to find latitude and longitude of City, ST
    const geoloc_response = await fetch(`https://api.opencagedata.com/geocode/v1/json?q=${city},+${state}&key=${key}`);

    const geoloc_data = await geoloc_response.json();
    // format latitude, longitude for api.weather.gov call
    const latitude = DmsToDecimal(geoloc_data.results[0].annotations.DMS.lat);
    const longitude = DmsToDecimal(geoloc_data.results[0].annotations.DMS.lng);
    // query api.weather.gov for metadata about City, ST location
    const prelim_weather_response = await fetch(`https://api.weather.gov/points/${latitude},${longitude}`);
    // convert location metadata response to JSON
    const prelim_weather_data = await prelim_weather_response.json();

    // console.log(JSON.stringify(prelim_weather_data, null, '\t'))
    console.log(prelim_weather_data.properties.observationStations)
    const stations_response = await fetch(prelim_weather_data.properties.observationStations)
    const stations_data = await stations_response.json();
    // select first observation station for location and get all observations (for the past week)
    const weather_observation_response = await fetch(`${stations_data.observationStations[0]}/observations`)
    console.log(stations_data.observationStations[0])

    // convert to JSON
    const weather_data = await weather_observation_response.json();
    // aggregate weather data
    aggregated_day_data = ParseWeatherDat(weather_data)

    return aggregated_day_data}

app.get('/weather/:city/:state', async function (req, res, next) {
    console.log('hit')
    // city and state extracted from params
    const city = req.params.city
    const state = req.params.state
    try {
        const weather_formatted = await query_week(city, state, process.env.OPENCAGE_GEOCODE_KEY)
        res.send(weather_formatted);
    } catch (err) {
        // Express 5.x < should pass error to next middleware automatically
        // but caught and sent to next middleware for more backwards compatability.  
        // i.e. if Heroku uses 4.x
        next(err)
    }
});

// generic error handling middleware function: accepts 4 arguments in express starting with err(or)
app.use(function (err, req, res, next) {
    // set result status to what is returned by error or 500 if cannot be resolved here
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

// export express application if need to use in other scripts
// module.exports = app;
