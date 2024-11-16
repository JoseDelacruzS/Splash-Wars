const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const helmet = require('helmet');

const app = express();
const server = http.createServer(app);

app.use(helmet()); // Seguridad HTTP
app.use(express.static(path.join(__dirname, '../Frontend')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../Frontend/index.html'));
});

const io = new Server(server, {
    cors: {
        origin: "*", // Cambiar a dominios específicos en producción
    }
});

const rooms = {};
const playerPositions = {};

io.on('connection', (socket) => {
    console.log('Un jugador se conectó:', socket.id);

    socket.on('joinRoom', (roomId, playerName) => {
        if (!roomId) {
            socket.emit('message', 'Sala inválida.');
            return;
        }

        const room = rooms[roomId] || [];
        if (room.length < 6) {
            room.push({ id: socket.id, name: playerName });
            rooms[roomId] = room;
            socket.join(roomId);

            console.log(`${playerName} se unió a la sala ${roomId}`);
            io.to(roomId).emit('message', `${playerName} se ha unido al juego`);
            io.to(roomId).emit('playersList', room);

            const initialPosition = { x: Math.random() * 20 - 10, y: 1, z: Math.random() * 20 - 10 };
            playerPositions[socket.id] = initialPosition;
            io.to(roomId).emit('playerJoined', { id: socket.id, position: initialPosition });
        } else {
            socket.emit('message', 'La sala está llena. Intenta con otra.');
        }
    });

    socket.on('disconnect', () => {
        console.log('Un jugador se desconectó:', socket.id);
        for (const roomId in rooms) {
            const room = rooms[roomId];
            const index = room.findIndex(player => player.id === socket.id);
            if (index !== -1) {
                const playerName = room[index].name;
                room.splice(index, 1);
                rooms[roomId] = room;

                io.to(roomId).emit('message', `${playerName} se ha desconectado`);
                io.to(roomId).emit('playersList', room);
            }
        }
        delete playerPositions[socket.id];
    });

    socket.on('updatePosition', (position) => {
        if (playerPositions[socket.id]) {
            playerPositions[socket.id] = position;
            const roomId = Object.keys(socket.rooms).find(room => room !== socket.id);
            if (roomId) {
                socket.to(roomId).emit('updatePlayerPosition', { id: socket.id, position });
            }
        }
    });
});

const port = process.env.PORT || 3000;
server.listen(port, '0.0.0.0', () => {
    console.log(`Servidor corriendo en http://0.0.0.0:${port}`);
});

