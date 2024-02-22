# Back End Demo Notes - Express (Node.js) Server

### Overview of Express Middleware (Routing)
- Use Express.js application interface running on Node.js
- One get route to handle our single call. City and state passed as parameters in URL.
- One piece of error-handling middleware to handle errors.
    - Errors up to this point should return a specific code (per querying logic engineered from test calls (cases) in Postman and browser).
    - Otherwise: return generic 500 error.

### Overview of Queries (Controller)
- Geocode: https://api.opencagedata.com/geocode/v1/json?q=${city},+${state}&key=${key}`);
    - Returns latitude, longitude pair.
    - In addition to timezone information for location to give us offset (in seconds) from UTC time.
- Query weather metadata with lat, long:
    - Return a number of fields. The one of interest is a list of observationStations by location.
- Query observationStations: 
    - Returns a list of weather observation locations.
    - Select the first from the list returned.
- Query weather observations for selected observationStation

### Overview of Data Transformations (Controller)
- Using Ecma-script dependent logic.
    - Further development could include
- `ParseWeatherDat` included in `Utils/BackEnd.js`.

- First: map function distills full set of observations per timestamp (hour) into temperature and precipitation highs and lows, along with units for each.
    - This, along with full timestamp of observation and month/day as the day attribute.

- Second: map function accounts for second difference between UTC and time zone of location and adjusts (adds or subtracts second difference).
    - Time difference calculated per location .
    - Further development could account for fringe locations in which location of the observation location differs from the location queried from City, ST.  

- Third: forEach function groups observations (1 per hour) by day in the following format:
    - Object[day] = Array(observation Objects)

- Fourth: global params (units and station abbreviation) are grouped into the top level of a JSON object
    - forEach function loops through each day (after conversion to day by Object.entries())
        - max, min values are set arbitrarily low and high for temperature and precipitation
        - forEach function (all observations per day)
            - check min, max values up to current observation (iteration) and update
        - max, min values stored per day
    - global params and min, max values per day are returned in this object. 
    - Hence, reducing $7 \cdot 24 observations$ to 7 for the purpose of scalability.