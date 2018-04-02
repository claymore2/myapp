const winston = require('winston');
const tsFormat = () => (new Date()).toLocaleTimeString();

// Set Logger
const logger = new (winston.Logger)({
    transports: [
        new (winston.transports.Console)({
            timestamp: tsFormat,
            colorize: true
        })
    ]
});

module.exports = logger;