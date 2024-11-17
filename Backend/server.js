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

// Configuración de conexión de Socket.IO
io.on('connection', (socket) => {
    console.log('Un jugador se conectó:', socket.id);

    // Cuando un jugador se une a una sala
    socket.on('joinRoom', (roomId, playerName) => {
        const room = rooms[roomId] || [];
        
        const newPlayer = { 
            id: socket.id, 
            name: playerName, 
            position: { x: 0, y: 1, z: 0 } // Posición inicial
        };
    
        if (room.length < 6) {
            room.push(newPlayer);
            rooms[roomId] = room;
    
            socket.join(roomId);
            console.log(`${playerName} se unió a la sala ${roomId}`);
    
            // Emitir al nuevo jugador a todos los demás
            socket.to(roomId).emit('newPlayer', newPlayer);
    
            // Enviar el estado actual de la sala al jugador nuevo
            socket.emit('playersList', room);
        } else {
            socket.emit('message', 'La sala está llena. Intenta con otra.');
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
                // Eliminar al jugador de la sala
                const playerName = room[index].name;
                room.splice(index, 1);

                // Actualizar la sala en la lista
                rooms[roomId] = room;

                // Notificar a los demás jugadores de la sala
                io.to(roomId).emit('message', `${playerName} se ha desconectado`);

                // Enviar la nueva lista de jugadores
                io.to(roomId).emit('playersList', room);
            }
        }
    });

    socket.on('updatePlayerPosition', (position) => {
        const roomId = Object.keys(socket.rooms).find((room) => room !== socket.id);
        if (roomId) {
            socket.to(roomId).emit('playerPositionUpdated', { id: socket.id, position });
        }
    });
    
});


// Inicia el servidor escuchando en todas las interfaces de red (0.0.0.0)
const port = process.env.PORT;
server.listen(port, '0.0.0.0', () => {
    console.log(`Servidor corriendo en http://0.0.0.0:${port}`);
});

