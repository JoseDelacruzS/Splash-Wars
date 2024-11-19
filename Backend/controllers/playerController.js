const players = {}; // Objeto para almacenar jugadores conectados

const playerController = {};

// Formatea los datos del jugador para enviarlos a los clientes
playerController.formatPlayerData = (id) => ({
    id,
    name: players[id]?.name || "Unknown",
    position: players[id]?.position || { x: 0, y: 0, z: 0 },
    rotation: players[id]?.rotation || { x: 0, y: 0, z: 0 }, // Añade rotación
    health: players[id]?.health || 100,
});

// Inicializa un nuevo jugador
playerController.initPlayer = (socket, name) => {
    players[socket.id] = {
        id: socket.id,
        name: name || "Unknown",
        position: { x: 0, y: 1, z: 0 }, // Posición inicial
        health: 100, // Salud inicial
    };

    console.log(`Jugador inicializado: ${socket.id}`);
    return playerController.formatPlayerData(socket.id);
};

// Actualiza la posición del jugador
playerController.updatePosition = (socket, data, io, rooms) => {
    const { position, rotation } = data; // Asegúrate de enviar rotación
    if (players[socket.id]) {
        players[socket.id].position = position;
        players[socket.id].rotation = rotation;

        const roomId = Object.keys(rooms).find((roomId) =>
            rooms[roomId].some((player) => player.id === socket.id)
        );

        if (roomId) {
            io.to(roomId).emit("playerPositionUpdated", playerController.formatPlayerData(socket.id));
        }
    }
};

// Maneja la desconexión de un jugador
playerController.removePlayer = (socket, io, rooms) => {
    for (const roomId in rooms) {
        const room = rooms[roomId];
        const index = room.findIndex((player) => player.id === socket.id);

        if (index !== -1) {
            const playerName = room[index].name;

            // Elimina al jugador de la sala y del registro global
            room.splice(index, 1);
            delete players[socket.id];

            io.to(roomId).emit("message", `${playerName} se ha desconectado`);
            io.to(roomId).emit("playersList", room.map((player) => playerController.formatPlayerData(player.id)));
        }
    }
};

// Devuelve todos los jugadores en una sala
playerController.getPlayersInRoom = (roomId, rooms) => {
    return rooms[roomId]?.map((player) => playerController.formatPlayerData(player.id)) || [];
};

module.exports = playerController;
