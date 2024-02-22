// non-exported helper
function parseTimezoneOffset(data_object, offsetSeconds) {
    const date = new Date(data_object.time);
    // UTC offset calculated in milliseconds 
    const offsetMilliseconds = offsetSeconds * 1000;
    // apply offset
    const dateWithOffset = new Date(date.getTime() + offsetMilliseconds);
    // re-create date string; can also use Date builtins
    const date_str_offset = dateWithOffset.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit' })
    return {
        time: dateWithOffset, 
        day: date_str_offset
    };
};

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

function ParseWeatherDat(weather_data, station, timezone_info) {
    // Extract full timestamp, day, icon, temperature, and precipitation for the last hour
    const weather_data_formatted = weather_data.features.map(dat => {
        return {
            // full timestamp from weather observation query
            time: dat.properties.timestamp,
            // extract local date from full timestamp; can also use Date builtins
            day: new Date(dat.properties.timestamp).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit' }),
            temp: dat.properties.temperature.value,
            temp_unit: `${dat.properties.temperature.unitCode.split(':')[1].replace('deg', '°')}`,
            // ternary: replace with 0 if null: observed that 
            precip_last_hour: dat.properties.precipitationLastHour.value != null ? dat.properties.precipitationLastHour.value : 0,
            precip_unit: `${dat.properties.precipitationLastHour.unitCode.split(':')[1]}`
        };
    })

    // account for timezone difference 
    const weather_data_formatted_timezone = weather_data_formatted.map(obj =>{
        // calculate and apply timezone difference via helper (defined above)
        const offset_dat = parseTimezoneOffset(obj, timezone_info.offset_seconds_UTC);
        // re-assign existing time fields to adjusted ones
        obj['time'] = offset_dat['time'];
        obj['day'] = offset_dat['day'];
        console.log('new obj: ', JSON.stringify(obj, null, '\t'));
        return obj;
    })

    // group weather data by day
    const groupedDataDay = {};
    weather_data_formatted_timezone.forEach(obj => {
        if (!groupedDataDay[obj.day]) {
            groupedDataDay[obj.day] = [];
        };
        groupedDataDay[obj.day].push(obj);
    });

    // aggregate data by lows and highs 
    let aggregated_day_data = {};
    // instantiate  initial global parameters (all days)
    aggregated_day_data['temp_unit'] = '';
    aggregated_day_data['precip_unit'] = '';
    aggregated_day_data['station'] = station;
    
    Object.entries(groupedDataDay).forEach(([key, value]) => {
        // set each day's low and high limits for precipitation and temperature for a min/max pointer aggregation (per value) approach
        let max_temp = Number.MIN_SAFE_INTEGER;
        let min_temp = Number.MAX_SAFE_INTEGER;
        let max_precip = Number.MIN_SAFE_INTEGER;
        let min_precip = Number.MAX_SAFE_INTEGER;
        value.forEach(ind_dat => {
            // set our temperature and precipitation units a single time in the global response object
            if (aggregated_day_data['precip_unit'] == '') {
                aggregated_day_data['precip_unit'] = ind_dat.precip_unit;
            }
            if (aggregated_day_data['temp_unit'] == '') {
                aggregated_day_data['temp_unit'] = ind_dat.temp_unit;
            }
            const curr_temp = ind_dat.temp;
            const curr_precip = ind_dat.precip_last_hour;

            // safeguard against null readings (I assume sensor being out of comission for these readings)
            if (curr_temp !== null) {
                // ternary logic: update min and max temperature for the day
                max_temp = max_temp > curr_temp ? max_temp : curr_temp;
                min_temp = min_temp < curr_temp ? min_temp : curr_temp;
            }
            // safeguard against null readings (including measured 0 for precipitation, it seems)
            if (curr_precip !== null) {
                // ternary logic: update min and max precipitation levels for the day
                max_precip = max_precip > curr_precip ? max_precip : curr_precip;
                min_precip = min_precip < curr_precip ? min_precip : curr_precip;
            }
        })
        aggregated_day_data[key] = {
            // store data; key is date
            max_precip: max_precip,
            min_precip: min_precip,
            min_temp: min_temp,
            max_temp: max_temp
        }
    })
    return aggregated_day_data;
}

module.exports = { ParseWeatherDat, DmsToDecimal };
