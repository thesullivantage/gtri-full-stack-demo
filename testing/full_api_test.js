require('dotenv').config();

function dmsToDecimal(dms) {
    const parts = dms.split(/°|'|''| /).filter(Boolean);
    const degrees = parseFloat(parts[0]);
    const minutes = parseFloat(parts[1]);
    const seconds = parseFloat(parts[2]);
    const direction = parts[3];

    let decimal = degrees + (minutes / 60) + (seconds / 3600);

    if (direction === 'S' || direction === 'W') {
        decimal = -decimal;
    }

    return decimal;
};

function convertDate(dateStr) {
    /* converts date string returned by weather.gov forecast to */
    const date = new Date(dateStr);
    const options = { month: '2-digit', day: '2-digit' };
    return date.toLocaleDateString('en-US', options);

}

function getUnixTime() {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000)); // Subtract 7 days in milliseconds

    const nowUnix = Math.floor(now.getTime() / 1000); // Convert to seconds
    const oneWeekAgoUnix = Math.floor(oneWeekAgo.getTime() / 1000); // Convert to seconds

    return { present: nowUnix, weekAgo: oneWeekAgoUnix };
};

const city = 'Atlanta'
const state = 'GA'
const times = getUnixTime()

const weatherDat = []
// Geoloc Call test
fetch(`https://api.opencagedata.com/geocode/v1/json?q=${city},+${state}&key=${process.env.OPENCAGE_GEOCODE_KEY}`)
    .then(response => response.json())
    .then(data => {
        const latitude = dmsToDecimal(data.results[0].annotations.DMS.lat)
        const longitude = dmsToDecimal(data.results[0].annotations.DMS.lng)
        return { latitude, longitude }
        // const { results } = data;
        // if (results && results.length > 0) {
        //     const { geometry: { lat, lng } } = results[0];
        //     console.log(`Latitude: ${lat}, Longitude: ${lng}`);
        //     // Use lat and lng values here
        // } else {
        //     console.error('No results found');
        // }
    }).then(({ latitude, longitude }) => {
        fetch(`https://api.weather.gov/points/${latitude},${longitude}`)
            .then(response => response.json())
            .then(data => {
                // console.log(JSON.stringify(data, null, '\t'))
                fetch(data.properties.forecast)
                    .then(response => response.json())
                    .then(data => {
                        // console.log(JSON.stringify(data, null, '\t'))
                        const periods = data.properties.periods
                        const filtPeriods = periods.filter(obj => !obj.name.includes(" "))
                        // console.log(filtPeriods)
                        const weatherDat = filtPeriods.map(obj => {
                            return {
                                icon: obj.icon,
                                shortForecast: obj.shortForecast,
                                name: obj.name,
                                day: convertDate(obj.startTime),
                                tAvg: `${obj.temperature} °${obj.temperatureUnit}`,
                                precipitationPercent: `${obj.probabilityOfPrecipitation.value == null ? 0 : obj.probabilityOfPrecipitation.value
                                    }%`,
                                windInfo: `${obj.windSpeed} ${obj.windDirection}`
                            };
                        })

                        console.log(JSON.stringify(weatherDat, null, '\t'))
                    })
                // fetch(`https://api.weather.gov/gridpoints/FFC/51,87/stations`)

                // console.log(JSON.stringify(data, null, '\t'))
            })
    })

    // .then( ({latitude, longitude}) => {
    //     console.log(`https://history.openweathermap.org/data/2.5/history/city?lat=${latitude}&lon=${longitude}&type=hour&start=${times.weekAgo}&end=${times.present}&appid=${process.env.OPEN_WEATHERMAP_KEY}`)
    //     fetch(`https://history.openweathermap.org/data/2.5/history/city?lat=${latitude}&lon=${longitude}&type=hour&start=${times.weekAgo}&end=${times.present}&appid=${process.env.OPEN_WEATHERMAP_KEY}`)
    //     // fetch(`https://api.weather.gov/points/${latitude},${longitude}`)
    //     .then(response => response.json())
    //     .then(data => {
    //         console.log(JSON.stringify(data, null, '\t'))
    //     })
    //     .catch(error => {
    //         console.error('Error fetching weather data:', error);
    //     });
    // })
    .catch(error => {
        console.error('Error fetching geolocation:', error);
    });

// const latDMS = "33° 44' 56.37264'' N";
// const lngDMS = "84° 23' 24.95184'' W";

// const latDecimal = dmsToDecimal(latDMS);
// const lngDecimal = dmsToDecimal(lngDMS);

// console.log("Latitude in Decimal Degrees:", latDecimal);
// console.log("Longitude in Decimal Degrees:", lngDecimal);