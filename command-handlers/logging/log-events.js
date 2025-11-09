const fs = require("fs");
const path = require("path");

// Path to logging folder
const logPath = path.resolve(__dirname, "../../data/logging");

// Log an event
function logEvent(guildId, fileName, content) {
    return; // againt discords rules
    try {
        // Guild Folder
        const guildFolder = path.join(logPath, guildId);
        if (!fs.existsSync(guildFolder)) {fs.mkdirSync(guildFolder, { recursive: true });}

        // File
        const filePath = path.join(guildFolder, fileName);
        if (!fs.existsSync(filePath))fs.writeFileSync(filePath, "");

        // Append
        fs.appendFileSync(filePath, content + "\n", "utf8");
    } catch(err) {
        console.error(`logging error: ${err}`);
    }
}

module.exports = {logEvent};