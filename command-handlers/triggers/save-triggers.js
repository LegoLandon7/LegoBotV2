const fs = require("fs");
const path = require("path");

const filePath = path.resolve(__dirname, "../../data/utility/triggers.json");

// ensure file exists
if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, "{}");

function readData() {
    try {
        const content = fs.readFileSync(filePath, "utf8");
        return content ? JSON.parse(content) : {};
    } catch (err) {
        console.error("Error reading JSON, resetting file:", err);
        fs.writeFileSync(filePath, "{}");
        return {};
    }
}

function writeData(data) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

function addTrigger(guildId, trigger, response) {
    const data = readData();
    if (!data[guildId]) data[guildId] = {};
    data[guildId][trigger] = response;
    writeData(data);
}

function removeTrigger(guildId, trigger) {
    const data = readData();
    if (data[guildId] && data[guildId][trigger]) {
        delete data[guildId][trigger];
        writeData(data);
        return true;
    }
    return false;
}

function getTriggers(guildId) {
    const data = readData();
    return data[guildId] || {};
}

function clearTriggers(guildId) {
    const data = readData();
    if (data[guildId]) {
        delete data[guildId];
        writeData(data);
        return true;
    }
    return false;
}

module.exports = { addTrigger, removeTrigger, getTriggers, clearTriggers };