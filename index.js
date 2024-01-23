const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const screenshot = require('desktop-screenshot');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static('public'));

let screenshotPath = 'screenshot.png';
let screenshotInterval;

io.on('connection', (socket) => {
    console.log('User connected');

    socket.on('start-share', () => {
        // Send a screenshot every 50 milliseconds
        // screenshotInterval = setInterval(async () => {
        //     const screenshotData = await takeScreenshot();
        //     io.emit('screenshot', screenshotData);
        // }, 2000);
        io.emit('screenshot', 'screenshotData');
    });

    socket.on('stop-share', () => {
        // Stop sending screenshots when requested
        if (screenshotInterval) {
            clearInterval(screenshotInterval);
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
        // Stop sending screenshots when a user disconnects
        if (screenshotInterval) {
            clearInterval(screenshotInterval);
        }
    });
});

async function takeScreenshot() {
    return new Promise((resolve, reject) => {
        screenshot(screenshotPath, function (error, complete) {
            if (error) {
                console.error('Error taking screenshot:', error);
                reject(error);
            } else {
                // Read the screenshot file and emit it as base64 data
                const screenshotData = fs.readFileSync(screenshotPath, { encoding: 'base64' });
                resolve(screenshotData);
            }
        });
    });
}

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
