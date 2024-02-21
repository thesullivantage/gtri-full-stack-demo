const weatherData = [
    {"time":"2024-02-21T02:51:00+00:00","icon":"https://api.weather.gov/icons/land/night/bkn?size=medium","temp":"23.9°C","precip_last_hour":"0 mm"},
    {"time":"2024-02-21T08:51:00+00:00","icon":"https://api.weather.gov/icons/land/day/bkn?size=medium","temp":"25.0°C","precip_last_hour":"0 mm"},
    {"time":"2024-02-21T14:51:00+00:00","icon":"https://api.weather.gov/icons/land/day/bkn?size=medium","temp":"26.3°C","precip_last_hour":"0 mm"},
    {"time":"2024-02-21T20:51:00+00:00","icon":"https://api.weather.gov/icons/land/night/bkn?size=medium","temp":"23.4°C","precip_last_hour":"0 mm"},
];

// Helper function to convert date string to Date object

// Function to find the low and high temperatures and min/max precipitation for a given day
const findDaySummary = (dateString, data) => {
    const date =  Date(dateString);
    // what we actually want is a new object that groups object elements in data by day
    const dayData = data.filter(({ dat }) =>  Date(dateString).toDateString() === dat.date.toDateString());
    // no parseFloat function YET
    const temperatures = dayData.map(({ dat }) => parseFloat(dat.temp));
    // this has no accompanying hour; 
    const lowTemp = Math.min(...temperatures);
    const highTemp = Math.max(...temperatures);
    // no parseFloat function YET; needs to split off temp
    const precipitations = dayData.map(({ dat }) => parseFloat(dat.precip_last_hour));
    // this has no accompanying hour
    const minPrecip = Math.min(...precipitations);
    const maxPrecip = Math.max(...precipitations);

    return { date: date.toDateString(), lowTemp, highTemp, minPrecip, maxPrecip };
};

// Example usage
const daySummary = findDaySummary("2024-02-21", weatherData);
console.log(daySummary);
