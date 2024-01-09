const express = require('express');
const http = require('http');
const path = require('path');
const socketIo = require('socket.io');
const screenshot = require('screenshot-desktop')
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static(path.join(__dirname, 'public')));

// Handle root route
app.get('/', (req, res) => {
  // Send the index.html file
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('screen', () => {
        setInterval(() => {
            screenshot({filename: 'name.png'}).then((img) => {
                // img: Buffer filled with jpg goodness
                const imageBuffer = fs.readFileSync(img);
                const base64Image = imageBuffer.toString('base64');
        
                socket.emit('image', { data: base64Image });
              }).catch((err) => {
                // ...
              })
        }, 100);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

server.listen(process.env.PORT || 5000)