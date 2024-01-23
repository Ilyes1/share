const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const screenshot = require('desktop-screenshot');
const schedule = require('node-schedule');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static('public'));

let screenshotJob;

io.on('connection', (socket) => {
    console.log('User connected');

    socket.on('start-share', () => {
        // Schedule to take screenshots every second
        screenshotJob = schedule.scheduleJob('* * * * * *', async () => {
            const screenshotData = await takeScreenshot();
            io.emit('screenshot', screenshotData);
        });
    });

    socket.on('stop-share', () => {
        // Stop taking screenshots when requested
        if (screenshotJob) {
            screenshotJob.cancel();
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
        // Stop taking screenshots when a user disconnects
        if (screenshotJob) {
            screenshotJob.cancel();
        }
    });
});

async function takeScreenshot() {
    return new Promise((resolve, reject) => {
        screenshot("screenshot.png", function(error, complete) {
            if (error) {
                console.error('Error taking screenshot:', error);
                reject(error);
            } else {
                // Read the screenshot file and emit it as base64 data
                const fs = require('fs');
                const screenshotData = fs.readFileSync("screenshot.png", { encoding: 'base64' });
                resolve(screenshotData);
            }
        });
    });
}

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
