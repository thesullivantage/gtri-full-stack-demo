# GTRI SWE Weather Full-Stack Demo

## Getting Started

### General
- Recommended: Install Git bash and Git CLI.
- Ensure that Node.js is installed.

### Running Steps
1. Clone repository.

2. `front-end`
  - run `npm install`
  - run `npm start`

3. `back-end`
  - Obtain OpenCage API key, then store in `back-end/.env` as `OPENCAGE_GEOCODE_KEY`.
  - Ensure that `localhost:8080` is not in use.
  - run `npm install` in `back-end`.
  - run `node server.js` in `back-end`.

4. Navigate to `localhost:3000` to query weather data.
