const pino = require('pino');

const logger = pino({
  // Use ISO timestamp formats instead of epoch numbers for clean parsing
  timestamp: pino.stdTimeFunctions.isoTime,
  // Base properties added automatically to every single log line
  base: {
    env: process.env.NODE_ENV || 'development',
    service: 'leads-backend'
  },
  // Ensure error objects serialize beautifully into json structural fields
  formatters: {
    level: (label) => {
      return { level: label.toUpperCase() };
    }
  }
});

module.exports = logger;