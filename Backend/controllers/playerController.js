const players = {}; // Objeto para almacenar jugadores conectados

const playerController = {};

// Función para formatear los datos del jugador
const formatPlayerData = (id) => ({
    id,
    name: players[id]?.name || "Unknown",
    position: players[id]?.position || { x: 0, y: 0, z: 0 },
    health: players[id]?.health || 100,
});

// Inicializar un nuevo jugador
playerController.initPlayer = (socket, playerName) => {
    players[socket.id] = {
        id: socket.id,
        name: playerName,
        position: { x: 0, y: 1, z: 0 },
        health: 100,
    };

    // Enviar al jugador los datos iniciales
    socket.emit('playerInitialized', formatPlayerData(socket.id));

    // Emitir evento a todos los demás jugadores para que agreguen al nuevo jugador
    socket.broadcast.emit('newPlayer', formatPlayerData(socket.id));

    // Notificar a todos los jugadores en la sala sobre la lista actualizada
    socket.broadcast.emit('playersList', Object.keys(players).map(id => formatPlayerData(id)));
};

// Actualizar la posición del jugador
playerController.updatePosition = (socket, position) => {
    if (players[socket.id]) {
        players[socket.id].position = position;
        socket.broadcast.emit('playerPositionUpdated', formatPlayerData(socket.id));
    }
};

// Manejo de daño recibido por el jugador
playerController.receiveDamage = (socket, damage) => {
    if (players[socket.id]) {
        players[socket.id].health -= damage;
        if (players[socket.id].health <= 0) {
            playerController.playerKilled(socket, players[socket.id].id);
        } else {
            socket.emit('healthUpdated', players[socket.id].health);
        }
    }
};

// Cuando un jugador se desconecta
playerController.playerDisconnected = (socket) => {
    if (players[socket.id]) {
        socket.broadcast.emit('playerDisconnected', socket.id);
        delete players[socket.id];
    }
};

// Exportar controlador
module.exports = playerController;
