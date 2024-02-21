export function IsValidLocationFormat(location) {
    // Regular expression to match the format "City [Optionalsecondword], ST" where ST is a 2-letter state code
    // const regex = /^[A-Z][a-z]+,\s[A-Z]{2}$/;
    const regex = /^[A-Z][a-zA-Z\s]+,\s[A-Z]{2}$/;
    return regex.test(location);
};
