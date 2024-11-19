const players = {};  // Almacenar jugadores

// Función para formatear los datos del jugador
const formatPlayerData = (id) => ({
    id,
    name: players[id]?.name || "Unknown",
    position: players[id]?.position || { x: 0, y: 0, z: 0 },
    health: players[id]?.health || 100,
});

// Inicializar un nuevo jugador
const initPlayer = (socket, playerName) => {
    players[socket.id] = {
        id: socket.id,
        name: playerName,
        position: { x: 0, y: 1, z: 0 },
        health: 100,
    };

    // Enviar al jugador los datos iniciales
    socket.emit('playerInitialized', formatPlayerData(socket.id));
    console.log(`Jugador inicializado: ${socket.id}`);

    // Emitir evento a todos los demás jugadores para que agreguen al nuevo jugador
    socket.broadcast.emit('newPlayer', formatPlayerData(socket.id));
};

// Actualizar posición del jugador
const updatePosition = (socket, position) => {
    if (players[socket.id]) {
        players[socket.id].position = position;
        const roomId = Object.keys(rooms).find(roomId =>
            rooms[roomId].some(player => player.id === socket.id)
        );
        if (roomId) {
            socket.broadcast.to(roomId).emit('playerPositionUpdated', formatPlayerData(socket.id));
        }
    }
};

// Manejar daño recibido por el jugador
const receiveDamage = (socket, damage) => {
    if (players[socket.id]) {
        players[socket.id].health -= damage;
        if (players[socket.id].health <= 0) {
            playerKilled(socket);
        } else {
            socket.emit('healthUpdated', players[socket.id].health);
        }
    }
};

// Eliminar jugador al desconectarse
const removePlayer = (socket) => {
    delete players[socket.id];
    console.log(`Jugador eliminado: ${socket.id}`);
};

// Manejo de bajas
const playerKilled = (socket) => {
    const player = players[socket.id];
    if (player) {
        player.health = 0;
        socket.emit('playerKilled');
        console.log(`Jugador ${player.id} ha sido eliminado`);
    }
};

module.exports = {
    initPlayer,
    updatePosition,
    receiveDamage,
    removePlayer,
    playerKilled,
    formatPlayerData,
};
