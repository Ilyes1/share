const express = require('express');
const http = require('http');
const path = require('path');
const socketIo = require('socket.io');
const screenshot = require('screenshot-desktop');
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

  let captureInterval;

  socket.on('screen', () => {
    if (!captureInterval) {
      captureInterval = setInterval(() => {
        screenshot({ filename: 'name.png' })
          .then((img) => {
            const imageBuffer = fs.readFileSync(img);
            const base64Image = imageBuffer.toString('base64');
  
            socket.broadcast.emit('image', { data: base64Image }); // Use 'emit' for a direct response to the requester
          })
          .catch((err) => {
            // Handle errors
            console.error('Error capturing screenshot:', err);
          });
      }, 100); // Capture more frequently (every 100 milliseconds in this example)
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
    clearInterval(captureInterval);
  });
});

server.listen(process.env.PORT || 5000);