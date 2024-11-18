const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);

// Configura la carpeta 'Frontend' como pública para archivos estáticos
app.use(express.static(path.join(__dirname, '../Frontend')));

// Ruta para el archivo 'index.html' en la raíz
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../Frontend/index.html'));
});

// Configuración de Socket.IO
const io = new Server(server, {
    cors: {
        origin: "*", // Permite cualquier origen o cambia a un dominio específico si es necesario
    }
});

// Creamos un objeto para gestionar las salas
const rooms = {};

// Creamos un objeto para los jugadores
const players = {};

// Función para formatear los datos del jugador
const formatPlayerData = (id) => ({
    id,
    name: players[id]?.name || "Unknown",
    position: players[id]?.position || { x: 0, y: 0, z: 0 },
    health: players[id]?.health || 100,
});

// Configuración de conexión de Socket.IO
io.on('connection', (socket) => {
    console.log('Un jugador se conectó:', socket.id);

    // Cuando un jugador se une a una sala
    socket.on('joinRoom', (roomId, playerName) => {
        if (!roomId || typeof playerName !== 'string' || !playerName.trim()) {
            socket.emit('message', 'Datos inválidos para unirse a la sala.');
            return;
        }

        const room = rooms[roomId] || [];
        const playerId = socket.id;

        if (room.length < 6) { // Limita el número de jugadores por sala
            // Crea el estado inicial del jugador
            players[playerId] = {
                id: playerId,
                name: playerName,
                position: { x: 0, y: 1, z: 0 },
                health: 100,
            };

            room.push({ id: playerId, name: playerName });
            rooms[roomId] = room;

            // Unir al jugador a la sala
            socket.join(roomId);
            console.log(`${playerName} se unió a la sala ${roomId}`);

            // Notificar a todos los jugadores en la sala
            io.to(roomId).emit('message', `${playerName} se ha unido al juego`);
            io.to(roomId).emit('playersList', room.map(player => formatPlayerData(player.id)));

            // Notificar a otros jugadores sobre el nuevo jugador
            socket.broadcast.to(roomId).emit('newPlayer', formatPlayerData(playerId));
        } else {
            socket.emit('message', 'La sala está llena. Intenta con otra.');
        }

        socket.broadcast.emit('newPlayer', formatPlayerData(socket.id));
    });

    // Actualizar posición del jugador
    socket.on('updatePosition', (position) => {
        if (players[socket.id]) {
            players[socket.id].position = position;
            const roomId = Object.keys(rooms).find(roomId =>
                rooms[roomId].some(player => player.id === socket.id)
            );
            if (roomId) {
                socket.broadcast.to(roomId).emit('playerPositionUpdated', formatPlayerData(socket.id));
            }
        }
    });

    // Cuando un jugador desconecta
    socket.on('disconnect', () => {
        console.log('Un jugador se desconectó:', socket.id);

        // Eliminar al jugador de todas las salas
        for (const roomId in rooms) {
            const room = rooms[roomId];
            const index = room.findIndex(player => player.id === socket.id);

            if (index !== -1) {
                const playerName = room[index].name;

                // Eliminar del objeto de jugadores y de la sala
                delete players[socket.id];
                room.splice(index, 1);
                rooms[roomId] = room;

                // Notificar a los demás jugadores
                io.to(roomId).emit('message', `${playerName} se ha desconectado`);
                io.to(roomId).emit('playersList', room.map(player => formatPlayerData(player.id)));
            }
        }
    });

    // Actualizar animación y rotación de un jugador
    socket.on('updateAnimationAndRotation', ({ id, animation, rotation }) => {
        if (players[id]) {
            // Actualizamos la animación y la rotación en el servidor
            players[id].animation = animation;
            players[id].rotation = rotation;  // Guardamos la rotación

            // Emitir la actualización a los demás jugadores en la sala
            const roomId = Object.keys(rooms).find(roomId =>
                rooms[roomId].some(player => player.id === id)
            );
            if (roomId) {
                socket.broadcast.to(roomId).emit('playerAnimationAndRotationUpdated', { id, animation, rotation });
            }
        }
    });

});

const port = process.env.PORT || 3000;
server.listen(port, '0.0.0.0', () => {
    console.log(`Servidor corriendo en http://0.0.0.0:${port}`);
});
