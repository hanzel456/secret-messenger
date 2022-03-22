const moment = require('moment')

function formatMessage (userName, text) {
    return{
        userName,
        text,
        time:moment().local().format('h:mm a')

    };
};
module.exports = formatMessage;