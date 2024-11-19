const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const playerController = require('./playerController'); // Importar el controlador de jugadores

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
            // Inicializa el jugador a través del controlador
            playerController.initPlayer(socket, playerName);

            room.push({ id: playerId, name: playerName });
            rooms[roomId] = room;

            // Unir al jugador a la sala
            socket.join(roomId);
            console.log(`${playerName} se unió a la sala ${roomId}`);

            // Notificar a todos los jugadores en la sala
            io.to(roomId).emit('message', `${playerName} se ha unido al juego`);
            io.to(roomId).emit('playersList', room.map(player => playerController.formatPlayerData(player.id)));

            // Notificar a otros jugadores sobre el nuevo jugador
            socket.broadcast.to(roomId).emit('newPlayer', playerController.formatPlayerData(playerId));
        } else {
            socket.emit('message', 'La sala está llena. Intenta con otra.');
        }
    });

    // Actualizar posición del jugador
    socket.on('updatePosition', (position) => {
        playerController.updatePosition(socket, position);
    });

    // Actualizar animación del jugador
    socket.on('updatePlayerAnimation', (playerId, animationState) => {
        // Emitir la animación al cliente correspondiente
        socket.to(playerId).emit('playerAnimationUpdated', animationState);
    });

    // Manejar daño recibido
    socket.on('receiveDamage', (damage) => {
        playerController.receiveDamage(socket, damage);
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
                room.splice(index, 1);
                rooms[roomId] = room;

                // Notificar a los demás jugadores
                io.to(roomId).emit('message', `${playerName} se ha desconectado`);
                io.to(roomId).emit('playersList', room.map(player => playerController.formatPlayerData(player.id)));
            }
        }

        // Eliminar al jugador
        playerController.removePlayer(socket);
    });
});

const port = process.env.PORT || 3000;
server.listen(port, '0.0.0.0', () => {
    console.log(`Servidor corriendo en http://0.0.0.0:${port}`);
});
