const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");
const playerController = require("../Backend/controllers/playerController.js"); // Importa el controlador

const app = express();
const server = http.createServer(app);

// Configura la carpeta 'Frontend' como pública
app.use(express.static(path.join(__dirname, "../Frontend")));

// Ruta para el archivo principal
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../Frontend/index.html"));
});

const io = new Server(server, {
    cors: {
        origin: "*", // Configuración de CORS
    },
});

const rooms = {}; // Gestión de salas

io.on("connection", (socket) => {
    console.log("Un jugador se conectó:", socket.id);

    // Cuando un jugador se une a una sala
    socket.on("joinRoom", (roomId, playerName) => {
        if (!roomId || typeof playerName !== "string" || !playerName.trim()) {
            socket.emit("message", "Datos inválidos para unirse a la sala.");
            return;
        }

        const room = rooms[roomId] || [];
        if (room.length < 6) {
            const playerData = playerController.initPlayer(socket, playerName);

            room.push({ id: socket.id, name: playerName });
            rooms[roomId] = room;

            socket.join(roomId);
            console.log(`${playerName} se unió a la sala ${roomId}`);

            io.to(roomId).emit("message", `${playerName} se ha unido al juego`);
            io.to(roomId).emit("playersList", playerController.getPlayersInRoom(roomId, rooms));
            socket.broadcast.to(roomId).emit("newPlayer", playerData);
        } else {
            socket.emit("message", "La sala está llena. Intenta con otra.");
        }
    });

    // Actualiza la posición del jugador
    socket.on("updatePosition", (position) => {
        playerController.updatePosition(socket, position, io, rooms);
    });

    // Desconexión del jugador
    socket.on("disconnect", () => {
        console.log("Un jugador se desconectó:", socket.id);
        playerController.removePlayer(socket, io, rooms);
    });

    socket.on('updateAnimation', (data) => {
        const { id, animation } = data;
        if (rooms[roomId]) {
            socket.broadcast.to(roomId).emit('playerAnimationUpdated', { id, animation });
        }
    });
    
});

const port = process.env.PORT || 3000;
server.listen(port, "0.0.0.0", () => {
    console.log(`Servidor corriendo en http://0.0.0.0:${port}`);
});
