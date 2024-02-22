import React, { useState } from 'react';
import SearchBar from './Components/SearchBar'
import {  Col, Container, Form, Row } from "react-bootstrap";
import { IsValidLocationFormat } from "./Utils/FrontEnd";
import WeatherDisplay from './Components/Weather/WeatherDisplay';
import 'bootstrap/dist/css/bootstrap.min.css';
import './manager.css';

function App() {

    // set state hooks with initial values and callbacks
    // query state (hook): that in the search bar; updated with what is in form/input
    const [query, setQuery] = useState('');
    // US City and state (hook): so we can clear query each time
    const [usState, setUSState] = useState('');
    const [usCity, setUSCity] = useState('');

    // error state (hook): updated with that returned by erred calls
    const [error, setError] = useState('');
    // loaded state (hook): boolean describing whether data has been loaded 
    const [loaded, setLoaded] = useState(false);
    // valid location  (hook): boolean describing whether location submitted is in valid format 
    const [validLocation, setValidLoc] = useState(null);
    // weather (data) state (hook): array holding weather data returned from a weather API  
    const [weather, setWeather] = useState(null)


    // COMMENT BELOW: 
    async function handleSearchSubmit(event) {
        // Reset Error, Result JSON Dict, and Query state  
        setLoaded(false)
        setError('')
        // Handle incorrect city formatting
        const valid_loc = IsValidLocationFormat(query); // const: block scoped
        event.preventDefault(); // prevent page reloading

        if (valid_loc) {
            // location submitted from query is valid
            setValidLoc(true);

            // get city and state from query; format
            const [city, state] = query.split(",");
            state.trim();

            // set city and state states and empty query (search bar)
            setUSState(state); 
            setUSCity(city);
            setQuery('');
            
            // leaving localhost address here; would normally use a combination of environment variables to query endpoint 
            const port = 8080;
            try {
                // query backend; convert to json format
                const weather_response = await fetch(`http://localhost:${port}/weather/${city}/${state}`);
                const weather_data = await weather_response.json();
                // catch non-network errors in response 
                if (!weather_response.ok) {
                    // log return code only to user
                    throw new Error(`Error fetching data. Status: ${weather_response.status}`);
                }
                // state: weather added to state, loaded = true, error reset to blank string
                setWeather(weather_data);
                setLoaded(true);
                setError('')
            } catch (error) {
                console.log('Error Fetching Data: ', error)
                // error set to error returned: triggers reload of DOM tree to include general error message about fetching data
                setError(error);
            }
        } else {
            // to display specific error message about query format:
            // state: valid location set to false, weather data cleared, error set to blank string for this (non-API call) case
            setValidLoc(false); 
            setWeather(null)
            setError('');
        }
    };

    // input change handler: update query state 
    const handleInputChange = (event) => {
        setQuery(event.target.value);
    };

    // return JSX: conditional rendering of JSX based on state
    return (
        // title and search bar always visible; nested 2 container/rows/columns deep to ensure consistent alignment with WeatherDisplay
        <Container >
            <Row>
                <Col>
                    <Container className='top-container'>
                        <Row>
                            <Col>
                                <h1>Weather Search Demo</h1>
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                <h3>Enter a city in the US of the format: City, ST</h3>
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                <SearchBar query={query} handleSubmit={handleSearchSubmit} handleInputChange={handleInputChange} />
                            </Col>
                        </Row>
                    </Container>
                </Col>
            </Row>
            {/* if not valid location, display message to re-enter location */}
            {(validLocation === false) &&
                <Row>
                    <Col>
                        <Container>
                            <Row>
                                <Col className='message-text'>
                                    <h4>
                                        The United States location you entered was not formatted correctly. Please enter the US location as follows:
                                    </h4>
                                    <p>City, ST</p>
                                </Col>
                            </Row>
                        </Container>
                    </Col>
                </Row>
            }
            {/* if error encountered (non-empty string): display this message*/}
            {
                error !== '' &&
                <Row>
                    <Col>
                        <Container>
                            <Row>
                                <Col className='message-text'>
                                    <h4>
                                        An error was encountered and the data could not be loaded.
                                    </h4>
                                </Col>
                            </Row>
                        </Container>
                    </Col >
                </Row >
            }
            {/* if error string empty and loaded is true, render WeatherDisplay component (see Components/Weather folder */}
            {
                loaded && error === '' &&
                <>
                    <Row>
                        <Col>
                            <WeatherDisplay city={usCity} state={usState} weatherData={weather} />
                        </Col>
                    </Row>
                </>
            }
        </Container >
    );
}

export default App;
