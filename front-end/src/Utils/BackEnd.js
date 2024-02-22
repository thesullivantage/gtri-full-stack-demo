export function DmsToDecimal (dms) {
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

export function ConvertDate(dateStr) {
    /* converts date string returned by weather.gov forecast to */
    const date = new Date(dateStr);
    const options = { month: '2-digit', day: '2-digit' };
    return date.toLocaleDateString('en-US', options);
    
}

export function GetUnixTime() {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000)); // Subtract 7 days in milliseconds

    const nowUnix = Math.floor(now.getTime() / 1000); // Convert to seconds
    const oneWeekAgoUnix = Math.floor(oneWeekAgo.getTime() / 1000); // Convert to seconds

    return { present: nowUnix, weekAgo: oneWeekAgoUnix };
};