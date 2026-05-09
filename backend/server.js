require('dotenv').config();
const http = require('http');
const app = require('./app');
const { initSocket } = require('./utils/socket');

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);
const io = initSocket(server);

// Make socket available in request handlers
app.set('io', io);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});