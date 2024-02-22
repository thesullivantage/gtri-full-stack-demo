
import React, { useState } from 'react';

import { Button, Col, Container, Form, Row } from "react-bootstrap";


// New
function SearchBar({query, handleSubmit, handleInputChange}) {
    
    return (
        <div className='search-bar'>
            <form onSubmit={handleSubmit}>
                <input type="text" value={query} onChange={handleInputChange} />
                <button type="submit">Search</button>
            </form>
        </div>
    );
}

export default SearchBar;
