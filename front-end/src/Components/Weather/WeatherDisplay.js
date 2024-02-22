import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import WeatherCard from "./WeatherCard"

/* Component to arrange WeatherCards in grid, format weather data for UI, and describe location/station. */

const WeatherDisplay = ({ city, state, weatherData }) => {

    // destructure global params from weatherData
    const { temp_unit, precip_unit, station, ...dataWithoutUnits } = weatherData;

    // Convert weatherData to an array of objects with keys and values
    const dataArray = Object.entries(dataWithoutUnits).map(([name, data]) => ({ name, ...data }));

    const rows = [];
    const rowSize = 3;
    // Slice data objects (days, to be mapped into WeatherCards) into rows of width-3
    // increment by row-size
    // last row may or may not be filled

    for (let i = 0; i < dataArray.length; i += rowSize) {
        const chunk = dataArray.slice(i, i + rowSize);
        const cols = chunk.map(item => (
            <Col md={4} className='weather-card-col' key={item.name}>
                <WeatherCard
                    className="weather-card"
                    date={item.name} // MM/YY
                    tHigh={`${item.max_temp} ${temp_unit}`} // units already formatted (backend)
                    tLow={`${item.min_temp} ${temp_unit}`}
                    minPrecip={`${item.min_precip} ${precip_unit}`}
                    maxPrecip={`${item.max_precip} ${precip_unit}`}
                />
            </Col>
        ));
        // on this iteration (row) include all row_length cols
        rows.push(<Row key={i}>{cols}</Row>);
    };

    return (
        <Container>
            <Row>
                {/* header describing city, state, and weather station */}
                <Col className='location-name-col'>
                    <h3 className='location-name-head'>{city}, {state}: {station} Station</h3>
                </Col>
            </Row>
            {rows}
        </Container>
    );
};

export default WeatherDisplay;
