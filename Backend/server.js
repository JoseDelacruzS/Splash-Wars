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

// Mantener un registro del estado de los jugadores
const players = {};

io.on('connection', (socket) => {
    console.log('Jugador conectado:', socket.id);

    // Registrar jugador
    players[socket.id] = {
        id: socket.id,
        name: '', // Asignar el nombre más adelante
        position: { x: 0, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
    };

    // Unirse a una sala
    socket.on('joinRoom', (roomId, playerName) => {
        players[socket.id].name = playerName;

        socket.join(roomId);
        console.log(`${playerName} se unió a la sala ${roomId}`);

        // Enviar a todos los jugadores en la sala la lista de jugadores actualizada
        io.to(roomId).emit('playersList', Object.values(players));
    });

    // Actualizar posición del jugador
    socket.on('updatePlayerState', (state) => {
        if (players[socket.id]) {
            players[socket.id].position = state.position;
            players[socket.id].rotation = state.rotation;
        }

        // Enviar actualización a los demás jugadores en la misma sala
        const roomId = Object.keys(socket.rooms).find((room) => room !== socket.id);
        if (roomId) {
            socket.to(roomId).emit('updatePlayers', players);
        }
    });

    // Manejar desconexión
    socket.on('disconnect', () => {
        console.log('Jugador desconectado:', socket.id);
        delete players[socket.id];

        // Enviar la lista actualizada a los demás
        io.emit('playersList', Object.values(players));
    });
});



// Inicia el servidor escuchando en todas las interfaces de red (0.0.0.0)
const port = process.env.PORT;
server.listen(port, '0.0.0.0', () => {
    console.log(`Servidor corriendo en http://0.0.0.0:${port}`);
});

