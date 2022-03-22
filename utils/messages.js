const moment = require ('moment-timezone');
const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

function formatMessage (userName, text) {
    return{
        userName,
        text,
        time: moment().tz(timezone).format('hh:mm a')
    };
};
module.exports = formatMessage;