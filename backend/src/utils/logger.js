const fs = require('fs');
const path = require('path');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

// Log levels
const LogLevel = {
    ERROR: 'ERROR',
    WARN: 'WARN',
    INFO: 'INFO',
    DEBUG: 'DEBUG'
};

// Logger class
class Logger {
    constructor() {
        this.errorLogPath = path.join(logsDir, 'error.log');
        this.combinedLogPath = path.join(logsDir, 'combined.log');
    }

    formatMessage(level, message, meta = {}) {
        return JSON.stringify({
            timestamp: new Date().toISOString(),
            level,
            message,
            ...meta
        }) + '\n';
    }

    writeToFile(filePath, content) {
        fs.appendFileSync(filePath, content, 'utf8');
    }

    log(level, message, meta = {}) {
        const formattedMessage = this.formatMessage(level, message, meta);

        // Write to combined log
        this.writeToFile(this.combinedLogPath, formattedMessage);

        // Write to error log if it's an error
        if (level === LogLevel.ERROR) {
            this.writeToFile(this.errorLogPath, formattedMessage);
        }

        // Console output in development
        if (process.env.NODE_ENV !== 'production') {
            const colors = {
                ERROR: '\x1b[31m', // Red
                WARN: '\x1b[33m',  // Yellow
                INFO: '\x1b[36m',  // Cyan
                DEBUG: '\x1b[90m'  // Gray
            };
            const reset = '\x1b[0m';
            console.log(`${colors[level]}[${level}]${reset} ${message}`, meta);
        }
    }

    error(message, meta = {}) {
        this.log(LogLevel.ERROR, message, meta);
    }

    warn(message, meta = {}) {
        this.log(LogLevel.WARN, message, meta);
    }

    info(message, meta = {}) {
        this.log(LogLevel.INFO, message, meta);
    }

    debug(message, meta = {}) {
        this.log(LogLevel.DEBUG, message, meta);
    }
}

// Export singleton instance
module.exports = new Logger();
