# Back End Development Strategy for querying data

- Geocode: https://api.opencagedata.com/geocode/v1/json?q=${city},+${state}&key=${key}`);
    - return lat, long

- Query weather metadata with lat, long
    - `https://api.weather.gov/points/${latitude},${longitude}`
    - extract observationStations query 

- Query observationStations: select first in list
    - to get stationId

- Once we have station ID
- https://api.weather.gov/stations/{station_name_0}/observations?limit=1
    - Or https://api.weather.gov/stations/{station_name_0}/observations/latest
    
    - Approach 1 - Conserve Memory:
        - to see where the minute count is (:00:00 - s:ms). .. it seems the stations record on each hour.. hopefully one queried did not reset within the last week
            - RESEARCH THIS 
        - from here we can subtract 24 hours ago in ms, or some other Date(...) manipulation, to get 7 other timestamps and iterate through those for info
    
    - Approach 2: 
        - Because returned items from api.weather.gov limited to 24*7 elements (past 7 days), will query the whole thing.
        - Will do this in case the time offset was reset for any reason at any given station. Behavior of the API seems consistent.

- for t in timestamps:
    - https://api.weather.gov/stations/KPHX/observations?limit=1

### Response
- Because of kB-scale size of all observations, return all mapped data to front end.  
- Allow (hypothetical) versatility in designing further UI components
- And our return size is reduced by "mapping size down" (reducing to only temperature) the data.