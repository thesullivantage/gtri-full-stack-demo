function DmsToDecimal(dms) {
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

function ConvertDate(dateStr) {
    /* converts date string returned by weather.gov forecast to */
    const date = new Date(dateStr);
    const options = { month: '2-digit', day: '2-digit' };
    return date.toLocaleDateString('en-US', options);

}

function GetUnixTime() {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000)); // Subtract 7 days in milliseconds

    const nowUnix = Math.floor(now.getTime() / 1000); // Convert to seconds
    const oneWeekAgoUnix = Math.floor(oneWeekAgo.getTime() / 1000); // Convert to seconds

    return { present: nowUnix, weekAgo: oneWeekAgoUnix };
};

function ParseWeatherDat(weather_data) {
    // Extract full timestamp, day, icon, temperature, and precipitation for the last hour
    const weather_data_formatted = weather_data.features.map(dat => {
        return {
            time: dat.properties.timestamp,
            day: new Date(dat.properties.timestamp).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit' }),
            icon: dat.properties.icon,
            temp: dat.properties.temperature.value,
            temp_unit: `${dat.properties.temperature.unitCode.split(':')[1].replace('deg', '°')}`,
            // ternary: replace with 0 if null 
            precip_last_hour: dat.properties.precipitationLastHour.value != null ? dat.properties.precipitationLastHour.value : 0,
            precip_unit: `${dat.properties.precipitationLastHour.unitCode.split(':')[1]}`
        }
    })
    console.log(weather_data_formatted)

    // group data by day
    const groupedDataDay = {};
    weather_data_formatted.forEach(obj => {
        if (!groupedDataDay[obj.day]) {
            groupedDataDay[obj.day] = [];
        }
        groupedDataDay[obj.day].push(obj);
    });

    // aggregate data by lows and highs 
    let aggregated_day_data = {}
    aggregated_day_data['temp_unit'] = '';
    aggregated_day_data['precip_unit'] = ''; 
    Object.entries(groupedDataDay).forEach(([key, value]) => {
        // set low and high limits easily reset for precipitation and temperature
        let max_precip = 0;
        let min_precip = 0;
        let min_temp = 255;
        let max_temp = -255;
        let temp_unit = '';
        let precip_unit = '';
        value.forEach(ind_dat => {
            console.log(ind_dat)
            // set our temperature and precipitation units a single time in the global response object
            if (aggregated_day_data['precip_unit'] == '') {
                aggregated_day_data['precip_unit'] = ind_dat.precip_unit
            }
            if (aggregated_day_data['temp_unit'] == '') {
                aggregated_day_data['temp_unit'] = ind_dat.temp_unit
            }
            const curr_temp = ind_dat.temp
            const curr_precip = ind_dat.precip_last_hour
            max_temp = max_temp > curr_temp ? max_temp : curr_temp;
            min_temp = min_temp < curr_temp ? min_temp : curr_temp;
            max_precip = max_precip > curr_precip ? max_precip : curr_precip;
            min_precip = min_precip < curr_precip ? min_precip : curr_precip;
        })
        aggregated_day_data[key] = {
            max_precip: max_precip,
            min_precip: min_precip,
            min_temp: min_temp,
            max_temp: max_temp
        }
    })
    return aggregated_day_data;
}

// Weather Parsing Controllers

module.exports = { ParseWeatherDat, DmsToDecimal, GetUnixTime, ConvertDate };
