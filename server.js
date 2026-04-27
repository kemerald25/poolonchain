const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  const io = new Server(server, {
    cors: { origin: '*' }
  });

  io.on('connection', (socket) => {
    console.log('[Socket] Client connected:', socket.id);
    
    socket.on('join_match', (matchId) => {
      socket.join(matchId);
      console.log(`[Socket] Client ${socket.id} joined match ${matchId}`);
      io.to(matchId).emit('player_joined', socket.id);
    });

    socket.on('play_shot', (data) => {
      // Validate with server-authoritative physics here in phase 5
      // Broadcast simple event for now
      io.to(data.matchId).emit('shot_played', data);
    });

    socket.on('disconnect', () => {
      console.log('[Socket] Client disconnected:', socket.id);
    });
  });

  const PORT = process.env.PORT || 3000;
  server.listen(PORT, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${PORT} with Socket.io`);
  });
});
