const dateString = '2024-02-23T06:00:00-05:00';
const date = new Date(dateString);
const now = new Date();
const options = { month: '2-digit', day: '2-digit' };
const formattedDate = date.toLocaleDateString('en-US', options);

console.log(formattedDate);