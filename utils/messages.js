function formatMessage (userName, text) {
    return{
        userName,
        text,
        time:new Date().toLocaleTimeString('default', {
            hour: '2-digit',
            minute: '2-digit'
        })
    };
};
module.exports = formatMessage;