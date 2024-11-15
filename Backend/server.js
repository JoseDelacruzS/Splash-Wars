const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);

// Configura la carpeta 'Frontend' como pública
app.use(express.static(path.join(__dirname, '../Frontend')));

// Ruta para el archivo 'index.html' en la raíz
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../Frontend/index.html'));
});

// Configuración de Socket.IO (debe ir antes de usar io)
const io = new Server(server, {
    cors: {
        origin: "https://splash-wars-game-a9d5d91bfbd6.herokuapp.com",  // Reemplaza con tu dominio de producción
    }
});

// Configuración de conexión de Socket.IO
io.on('connection', (socket) => {
    console.log('Un jugador se conectó:', socket.id);

    socket.emit('message', '¡Bienvenido al juego!');

    socket.on('playerJoined', (data) => {
        console.log(`Jugador conectado: ${data.playerName}`);
    });

    socket.on('disconnect', () => {
        console.log('Un jugador se desconectó:', socket.id);
    });
});

// Inicia el servidor escuchando en todas las interfaces de red (0.0.0.0)
const port = process.env.PORT || 3000;
server.listen(port, '0.0.0.0', () => {
    console.log(`Servidor corriendo en http://0.0.0.0:${port}`);
});

