/**
 * Custom Lightweight API Logging Middleware
 */

function apiLogger(req, res, next) {
  const start = process.hrtime();
  const { method, originalUrl, ip } = req;

  res.on('finish', () => {
    const diff = process.hrtime(start);
    const durationMs = ((diff[0] * 1e9 + diff[1]) / 1e6).toFixed(2);
    const statusCode = res.statusCode;

    // Standard terminal styling codes
    let statusColor = '\x1b[32m'; // green
    if (statusCode >= 400 && statusCode < 500) {
      statusColor = '\x1b[33m'; // yellow
    } else if (statusCode >= 500) {
      statusColor = '\x1b[31m'; // red
    }

    const resetColor = '\x1b[0m';
    const methodColor = '\x1b[36m'; // cyan
    const grayColor = '\x1b[90m'; // gray

    console.log(
      `${grayColor}[${new Date().toISOString()}]${resetColor} ${methodColor}${method}${resetColor} ${originalUrl} ${statusColor}${statusCode}${resetColor} ${grayColor}-${resetColor} ${durationMs}ms ${grayColor}(IP: ${ip})${resetColor}`
    );
  });

  next();
}

module.exports = apiLogger;
