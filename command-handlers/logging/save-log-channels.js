const fs = require("fs");
const path = require("path");

const logPath = path.resolve(__dirname, "../../data/log-channels/log-channels.json");
const welcomePath = path.resolve(__dirname, "../../data/log-channels/welcome-channels.json");

// Ensure files exist
if (!fs.existsSync(logPath)) fs.writeFileSync(logPath, "{}");
if (!fs.existsSync(welcomePath)) fs.writeFileSync(welcomePath, "{}");

function readData(filePath) {
    try {
        const content = fs.readFileSync(filePath, "utf8");
        return content ? JSON.parse(content) : {};
    } catch (err) {
        console.error("Error reading JSON, resetting file:", err);
        fs.writeFileSync(filePath, "{}");
        return {};
    }
}

function writeData(filePath, data) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

// Set log channel
function setLogChannel(guildId, channelId) {
    const data = readData(logPath);
    if (channelId) data[guildId] = channelId;
    else delete data[guildId];
    writeData(logPath, data);
}

// Get log channel
function getLogChannel(guildId) {
    const data = readData(logPath);
    return data[guildId] || null;
}

// Set welcome channel
function setWelcomeChannel(guildId, channelId) {
    const data = readData(welcomePath);
    if (channelId) data[guildId] = channelId;
    else delete data[guildId];
    writeData(welcomePath, data);
}

// Get welcome channel
function getWelcomeChannel(guildId) {
    const data = readData(welcomePath);
    return data[guildId] || null;
}

// Remove log channel
function removeLogChannel(guildId) {
    const data = readData(logPath);
    if (data[guildId]) {
        delete data[guildId];
        fs.writeFileSync(logPath, JSON.stringify(data, null, 2));
        return true;
    }
    return false;
}

// Remove welcome channel
function removeWelcomeChannel(guildId) {
    const data = readData(welcomePath);
    if (data[guildId]) {
        delete data[guildId];
        fs.writeFileSync(welcomePath, JSON.stringify(data, null, 2));
        return true;
    }
    return false;
}


module.exports = {setLogChannel, getLogChannel, setWelcomeChannel, getWelcomeChannel, removeLogChannel, removeWelcomeChannel};