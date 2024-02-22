# Front End Demo Notes - React Client

### General
- As required, displays summary of weather for a US location for the last week: temperature highs and lows and maximum precipitation.
- Developed with React.js (create-react-app).
- Some margin styling added with CSS.

### Development Notes

#### Package Management
- Seems some dependency vulnerabilities exist from npm. 
- I have read that create-react-app is no longer reccomended for creating applications - this is what I used for this demo, so it may be a large source of this.

#### General - React
- Fairly shallow JSX/UI tree. 
- Root is index.js, and most state management lives in App.js on same directory level
    - Utils/FrontEnd.js handles a type checking helper function (is City, ST entered)?
    - API querying handled within App.js, given the small scope of the project, for conciseness.
        - Can add to Utils/FrontEnd or a more extensive, modularized set of files/directory when scaling and pass state callbacks. 

- Handle as much state from parent-level components relative to children as possible
    - Define API-calling methods at top (API control component) level (App.js).
- For readability/maintainability (espescially given simplicity of this application): explicitly pass props rather than too much spreading.

- Weather Components (`front-end/Components/Weather`)
    - WeatherDisplay: Component to arrange WeatherCards in grid, format weather data for UI, and describe location/station.
    - Individual grid component for each day's weather.


