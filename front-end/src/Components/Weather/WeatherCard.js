import React from 'react';
import { Card } from 'react-bootstrap';

/* Individual grid component for each day's weather. */

const WeatherCard = ({ date, tHigh, tLow, minPrecip, maxPrecip }) => {
    return (
        <Card className="weather-card">
            <Card.Body>
                <Card.Title>{date}</Card.Title>
                <Card.Text>Low Temperature: {tLow}</Card.Text>
                <Card.Text>High Temperature: {tHigh}</Card.Text>
                {(maxPrecip == minPrecip == 0) ? <Card.Text>Max Preciptation: {maxPrecip}</Card.Text> : ''}
            </Card.Body>
        </Card>
    );
};

export default WeatherCard;