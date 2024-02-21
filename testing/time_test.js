function GetUnixTime() {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000)); // Subtract 7 days in milliseconds
    return [now, oneWeekAgo]
//     const nowUnix = Math.floor(now.getTime() / 1000); // Convert to seconds
//     const oneWeekAgoUnix = Math.floor(oneWeekAgo.getTime() / 1000); // Convert to seconds

//     return { present: nowUnix, weekAgo: oneWeekAgoUnix };
// };
};

const times = GetUnixTime()
console.log(times[0], times[1])
// console.log(times.weekAgo, ' ', times.present)