const { parse } = require("dotenv");

function formatDuration(durationMs) {
    const seconds = Math.floor(durationMs / 1000) % 60;
    const minutes = Math.floor(durationMs / (1000 * 60)) % 60;
    const hours = Math.floor(durationMs / (1000 * 60 * 60)) % 24;
    const days = Math.floor(durationMs / (1000 * 60 * 60 * 24));

    let parts = [];
    if (days) parts.push(`${days}d`);
    if (hours) parts.push(`${hours}h`);
    if (minutes) parts.push(`${minutes}m`);
    if (seconds || parts.length === 0) parts.push(`${seconds}s`);

    return parts.join(' ');
}

function parseDuration(durationStr) {
    const regex = /(\d+)([dhms])/g;
    let match;
    let durationMs = 0;

    while ((match = regex.exec(durationStr)) !== null) {
        const value = parseInt(match[1]);
        const unit = match[2];

        switch (unit) {
            case 'd':
                durationMs += value * 24 * 60 * 60 * 1000;
                break;
            case 'h':
                durationMs += value * 60 * 60 * 1000;
                break;
            case 'm':
                durationMs += value * 60 * 1000;
                break;
            case 's':
                durationMs += value * 1000;
                break;
        }
    }

    return durationMs;
}

module.exports = { formatDuration, parseDuration };